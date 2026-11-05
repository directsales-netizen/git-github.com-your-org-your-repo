import { NextResponse } from 'next/server';

/**
 * Server-side Authorize.net client — talks to the JSON transaction API
 * directly over fetch (no SDK dependency). Card data never passes through
 * here: the browser tokenizes via Accept.js (see
 * src/app/(storefront)/checkout/sections/PaymentSection.tsx) into an opaque
 * `dataDescriptor`/`dataValue` pair, and that's the only payment data this
 * server ever receives or forwards to Authorize.net.
 *
 * Endpoints and request/response shapes verified against Authorize.net's own
 * sample-code-node repo and published `authorizenet` npm package — not
 * reconstructed from memory:
 *   https://github.com/AuthorizeNet/sample-code-node
 *   npm:authorizenet (lib/constants.js)
 */

const SANDBOX_ENDPOINT = 'https://apitest.authorize.net/xml/v1/request.api';
const PRODUCTION_ENDPOINT = 'https://api2.authorize.net/xml/v1/request.api';

export function isAuthorizeNetConfigured(): boolean {
  return Boolean(process.env.AUTHORIZENET_API_LOGIN_ID && process.env.AUTHORIZENET_TRANSACTION_KEY);
}

export function requireAuthorizeNetConfigured(): { ok: true } | { ok: false; response: NextResponse } {
  if (!isAuthorizeNetConfigured()) {
    console.warn('[authorizenet] AUTHORIZENET_API_LOGIN_ID or AUTHORIZENET_TRANSACTION_KEY is not set — payments are disabled until configured.');
    return { ok: false, response: NextResponse.json({ error: 'Payments are not configured yet.' }, { status: 503 }) };
  }
  return { ok: true };
}

function endpoint(): string {
  // Defaults to sandbox — a missing/misspelled env var should never
  // accidentally start taking real production charges.
  return process.env.AUTHORIZENET_ENVIRONMENT === 'production' ? PRODUCTION_ENDPOINT : SANDBOX_ENDPOINT;
}

function merchantAuthentication() {
  return {
    name: process.env.AUTHORIZENET_API_LOGIN_ID,
    transactionKey: process.env.AUTHORIZENET_TRANSACTION_KEY,
  };
}

export interface AuthorizeNetLineItem {
  itemId: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
}

export interface AuthorizeNetAddress {
  firstName?: string;
  lastName?: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country?: string;
}

export interface ChargeOpaqueDataInput {
  amount: number;
  opaqueData: { dataDescriptor: string; dataValue: string };
  invoiceNumber: string;
  description?: string;
  lineItems: AuthorizeNetLineItem[];
  billTo: AuthorizeNetAddress;
  shipTo?: AuthorizeNetAddress;
  customerEmail: string;
  customerIp?: string;
}

export interface AuthorizeNetTransactionResult {
  ok: boolean;
  transId?: string;
  responseCode?: string;
  /** Last 4 digits only, e.g. "XXXX1234" — Authorize.net never returns the full number. */
  maskedAccountNumber?: string;
  avsResultCode?: string;
  cvvResultCode?: string;
  errorText?: string;
}

async function callAuthorizeNet<T>(body: Record<string, unknown>): Promise<T> {
  const response = await fetch(endpoint(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  // Authorize.net's JSON endpoint prefixes the body with a UTF-8 BOM.
  const text = (await response.text()).replace(/^﻿/, '');
  return JSON.parse(text) as T;
}

interface CreateTransactionApiResponse {
  transactionResponse?: {
    responseCode?: string;
    transId?: string;
    accountNumber?: string;
    avsResultCode?: string;
    cvvResultCode?: string;
    messages?: { message?: { code: string; description: string }[] };
    errors?: { error?: { errorCode: string; errorText: string }[] };
  };
  messages?: { resultCode?: string; message?: { code: string; text: string }[] };
}

/**
 * `authCaptureTransaction` against an Accept.js opaque payment nonce — the
 * sole payment path for the storefront cart checkout
 * (src/app/api/checkout/authorizenet/route.ts). Synchronous: the approve/
 * decline decision comes back in this same response, so fulfillment happens
 * directly off the result, the same pattern this codebase already used for
 * PayPal's order/capture flow — no webhook required for the primary flow.
 */
export async function chargeOpaqueData(input: ChargeOpaqueDataInput): Promise<AuthorizeNetTransactionResult> {
  const body = {
    createTransactionRequest: {
      merchantAuthentication: merchantAuthentication(),
      refId: input.invoiceNumber.slice(0, 20),
      transactionRequest: {
        transactionType: 'authCaptureTransaction',
        amount: input.amount.toFixed(2),
        payment: { opaqueData: input.opaqueData },
        order: { invoiceNumber: input.invoiceNumber.slice(0, 20), description: input.description?.slice(0, 255) },
        lineItems: { lineItem: input.lineItems.map((item) => ({ ...item, itemId: item.itemId.slice(0, 31), quantity: String(item.quantity), unitPrice: item.unitPrice.toFixed(2) })) },
        billTo: { ...input.billTo, country: input.billTo.country ?? 'US' },
        ...(input.shipTo ? { shipTo: { ...input.shipTo, country: input.shipTo.country ?? 'US' } } : {}),
        customerIP: input.customerIp,
        transactionSettings: { setting: [{ settingName: 'duplicateWindow', settingValue: '120' }] },
      },
    },
  };

  let json: CreateTransactionApiResponse;
  try {
    json = await callAuthorizeNet<CreateTransactionApiResponse>(body);
  } catch (error) {
    console.error('[authorizenet] Network/parse error calling createTransactionRequest:', error);
    return { ok: false, errorText: 'Could not reach the payment processor. Please try again.' };
  }

  const txResponse = json.transactionResponse;
  // responseCode: '1' = approved, '2' = declined, '3' = error, '4' = held for review.
  const approved = txResponse?.responseCode === '1';

  if (approved) {
    return {
      ok: true,
      transId: txResponse?.transId,
      responseCode: txResponse?.responseCode,
      maskedAccountNumber: txResponse?.accountNumber,
      avsResultCode: txResponse?.avsResultCode,
      cvvResultCode: txResponse?.cvvResultCode,
    };
  }

  const txError = txResponse?.errors?.error?.[0]?.errorText;
  const topError = json.messages?.message?.[0]?.text;
  return { ok: false, transId: txResponse?.transId, responseCode: txResponse?.responseCode, errorText: txError ?? topError ?? 'Payment was declined.' };
}

/**
 * `refundTransaction` referencing the original transaction id. Authorize.net
 * only requires (and only accepts) the last 4 digits of the original card —
 * never the full PAN — which is exactly what `maskedAccountNumber` from the
 * original charge response already gives us (see
 * AuthorizeNetTransactionResult.maskedAccountNumber, stored on the order at
 * fulfillment time).
 */
export async function refundTransaction(params: { transId: string; amount: number; maskedAccountNumber: string }): Promise<AuthorizeNetTransactionResult> {
  const last4 = params.maskedAccountNumber.replace(/\D/g, '').slice(-4);
  if (last4.length !== 4) {
    return { ok: false, errorText: 'Cannot refund — the original card’s last 4 digits are not on record.' };
  }

  const body = {
    createTransactionRequest: {
      merchantAuthentication: merchantAuthentication(),
      transactionRequest: {
        transactionType: 'refundTransaction',
        amount: params.amount.toFixed(2),
        payment: { creditCard: { cardNumber: last4, expirationDate: 'XXXX' } },
        refTransId: params.transId,
      },
    },
  };

  let json: CreateTransactionApiResponse;
  try {
    json = await callAuthorizeNet<CreateTransactionApiResponse>(body);
  } catch (error) {
    console.error('[authorizenet] Network/parse error calling refundTransaction:', error);
    return { ok: false, errorText: 'Could not reach the payment processor. Please try again.' };
  }

  const txResponse = json.transactionResponse;
  const approved = txResponse?.responseCode === '1';
  if (approved) return { ok: true, transId: txResponse?.transId, responseCode: txResponse?.responseCode };

  const txError = txResponse?.errors?.error?.[0]?.errorText;
  const topError = json.messages?.message?.[0]?.text;
  return { ok: false, errorText: txError ?? topError ?? 'Refund was declined.' };
}

/**
 * `voidTransaction` — cancels an authorization/capture that hasn't settled
 * yet. Authorize.net rejects `refundTransaction` for an unsettled
 * transaction (settlement runs on a nightly batch, typically ~24h after the
 * charge) with a "does not meet the criteria for issuing a credit" style
 * error; `refundOrVoid()` below tries the refund first and automatically
 * falls back to this for that specific case, so a same-day refund still
 * works correctly instead of just failing.
 */
export async function voidTransaction(transId: string): Promise<AuthorizeNetTransactionResult> {
  const body = {
    createTransactionRequest: {
      merchantAuthentication: merchantAuthentication(),
      transactionRequest: { transactionType: 'voidTransaction', refTransId: transId },
    },
  };

  let json: CreateTransactionApiResponse;
  try {
    json = await callAuthorizeNet<CreateTransactionApiResponse>(body);
  } catch (error) {
    console.error('[authorizenet] Network/parse error calling voidTransaction:', error);
    return { ok: false, errorText: 'Could not reach the payment processor. Please try again.' };
  }

  const txResponse = json.transactionResponse;
  const approved = txResponse?.responseCode === '1';
  if (approved) return { ok: true, transId: txResponse?.transId, responseCode: txResponse?.responseCode };

  const txError = txResponse?.errors?.error?.[0]?.errorText;
  const topError = json.messages?.message?.[0]?.text;
  return { ok: false, errorText: txError ?? topError ?? 'Void was declined.' };
}

/**
 * Tries `refundTransaction` first (the common case — most refunds happen
 * after settlement); if Authorize.net rejects it specifically because the
 * original charge hasn't settled yet, falls back to `voidTransaction`
 * automatically. A void cancels the full original amount rather than a
 * partial one, since there's nothing settled yet to partially return —
 * callers should surface that distinction to the admin when it happens.
 */
export async function refundOrVoid(params: { transId: string; amount: number; maskedAccountNumber: string }): Promise<AuthorizeNetTransactionResult & { usedVoid?: boolean }> {
  const refundResult = await refundTransaction(params);
  if (refundResult.ok) return refundResult;

  const notYetSettled = /does not meet the criteria|has not been settled|not.*settle/i.test(refundResult.errorText ?? '');
  if (!notYetSettled) return refundResult;

  const voidResult = await voidTransaction(params.transId);
  return { ...voidResult, usedVoid: true };
}

/**
 * `GetHostedPaymentPageRequest` — produces a one-time token for Authorize.net's
 * own hosted payment page. Used only for the purchase-inquiry "email the
 * customer a secure payment link" flow
 * (src/app/api/admin/purchase-inquiries/[id]/route.ts), the direct
 * equivalent of the old Stripe Checkout Session hosted-redirect. The
 * customer's card data goes straight to Authorize.net's page — this server
 * never sees it, same as the Accept.js flow.
 */
export async function getHostedPaymentPageToken(params: {
  amount: number;
  invoiceNumber: string;
  description?: string;
  /** This site's own origin, e.g. `https://www.premiumtechnoir.com` — used to point Authorize.net's hosted page at our IFrame communicator page (src/app/checkout/pay/communicator/page.tsx) so the parent window learns when payment completes. */
  origin: string;
}): Promise<{ ok: true; token: string } | { ok: false; errorText: string }> {
  const body = {
    getHostedPaymentPageRequest: {
      merchantAuthentication: merchantAuthentication(),
      transactionRequest: {
        transactionType: 'authCaptureTransaction',
        amount: params.amount.toFixed(2),
        order: { invoiceNumber: params.invoiceNumber.slice(0, 20), description: params.description?.slice(0, 255) },
      },
      hostedPaymentSettings: {
        setting: [
          { settingName: 'hostedPaymentButtonOptions', settingValue: JSON.stringify({ text: 'Pay' }) },
          { settingName: 'hostedPaymentReturnOptions', settingValue: JSON.stringify({ showReceipt: false, url: `${params.origin}/checkout/success`, urlText: 'Continue', cancelUrl: `${params.origin}/checkout/cancel`, cancelUrlText: 'Cancel' }) },
          { settingName: 'hostedPaymentIFrameCommunicatorUrl', settingValue: JSON.stringify({ url: `${params.origin}/checkout/pay/communicator` }) },
        ],
      },
    },
  };

  let json: { token?: string; messages?: { resultCode?: string; message?: { code: string; text: string }[] } };
  try {
    json = await callAuthorizeNet(body);
  } catch (error) {
    console.error('[authorizenet] Network/parse error calling getHostedPaymentPageRequest:', error);
    return { ok: false, errorText: 'Could not reach the payment processor. Please try again.' };
  }

  if (json.token) return { ok: true, token: json.token };
  return { ok: false, errorText: json.messages?.message?.[0]?.text ?? 'Could not create a payment link.' };
}

interface TransactionDetailsApiResponse {
  transaction?: {
    transactionStatus?: string;
    responseCode?: string;
    settleAmount?: string;
    authAmount?: string;
    avsResponse?: string;
    cardCodeResponse?: string;
    payment?: { creditCard?: { cardNumber?: string } };
  };
  messages?: { resultCode?: string; message?: { code: string; text: string }[] };
}

/**
 * `getTransactionDetailsRequest` — looks a transaction up by id. Used to
 * verify a hosted-payment-page completion server-side
 * (src/app/api/checkout/pay/[token]/complete/route.ts) before fulfilling the
 * order: the iframe communicator relay that reports "payment completed" runs
 * in the customer's browser, so its message is treated as a hint, never as
 * proof — we always re-confirm the real status and amount against
 * Authorize.net's own record before shipping anything.
 */
export async function getTransactionDetails(
  transId: string
): Promise<
  | { ok: true; approved: boolean; amount?: number; maskedAccountNumber?: string; avsResultCode?: string; cvvResultCode?: string }
  | { ok: false; errorText: string }
> {
  const body = {
    getTransactionDetailsRequest: { merchantAuthentication: merchantAuthentication(), transId },
  };

  let json: TransactionDetailsApiResponse;
  try {
    json = await callAuthorizeNet<TransactionDetailsApiResponse>(body);
  } catch (error) {
    console.error('[authorizenet] Network/parse error calling getTransactionDetailsRequest:', error);
    return { ok: false, errorText: 'Could not reach the payment processor. Please try again.' };
  }

  if (json.messages?.resultCode !== 'Ok' || !json.transaction) {
    return { ok: false, errorText: json.messages?.message?.[0]?.text ?? 'Could not look up the transaction.' };
  }

  // 'settledSuccessfully' / 'capturedPendingSettlement' are the two approved
  // states a freshly completed authCaptureTransaction can be in.
  const approved =
    json.transaction.responseCode === '1' &&
    (json.transaction.transactionStatus === 'capturedPendingSettlement' || json.transaction.transactionStatus === 'settledSuccessfully');
  const amount = json.transaction.authAmount ? Number(json.transaction.authAmount) : undefined;

  return {
    ok: true,
    approved,
    amount,
    maskedAccountNumber: json.transaction.payment?.creditCard?.cardNumber,
    avsResultCode: json.transaction.avsResponse,
    cvvResultCode: json.transaction.cardCodeResponse,
  };
}

export function hostedPaymentPageFormUrl(): string {
  return process.env.AUTHORIZENET_ENVIRONMENT === 'production'
    ? 'https://accept.authorize.net/payment/payment'
    : 'https://test.authorize.net/payment/payment';
}
