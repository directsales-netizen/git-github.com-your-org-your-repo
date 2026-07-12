'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/cart/CartContext';
import { buttonVariants, cardVariants, cn, spacing } from '@/design';
import EmptyState from '@/components/admin/EmptyState';
import AccordionSection from './AccordionSection';
import OrderSummaryPanel from './OrderSummaryPanel';
import CheckoutFooterTrustBar from './CheckoutFooterTrustBar';
import ShippingSection from './sections/ShippingSection';
import BillingSection from './sections/BillingSection';
import PaymentSection, { type BillingDetails } from './sections/PaymentSection';
import PayPalSection from './sections/PayPalSection';
import ReviewSubmitSection from './sections/ReviewSubmitSection';
import OrderNotesSection from './sections/OrderNotesSection';
import { emptyAddress, formatAddress, isAddressComplete, type CheckoutAddress } from './checkoutTypes';

interface Props {
  isAuthenticated: boolean;
  prefillEmail?: string;
  prefillName?: string;
  requireAccount: boolean;
  ordersPaused: boolean;
  inquiryOnlyMode: boolean;
  supportEmail: string;
  supportPhone?: string;
  businessHours?: string;
}

type Step = 'shipping' | 'billing' | 'payment';

function toApiAddress(address: CheckoutAddress) {
  return { line1: address.line1, line2: address.line2 || undefined, city: address.city, state: address.state, zip: address.zip };
}

const currency = (value: number) => value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

export default function CheckoutClient({
  isAuthenticated,
  prefillEmail,
  prefillName,
  requireAccount,
  ordersPaused,
  inquiryOnlyMode,
  supportEmail,
  supportPhone,
  businessHours,
}: Props) {
  const { items, subtotal } = useCart();

  const [activeStep, setActiveStep] = useState<Step>('shipping');
  const [shippingDone, setShippingDone] = useState(false);
  const [billingDone, setBillingDone] = useState(false);

  const [address, setAddress] = useState<CheckoutAddress>(emptyAddress);
  const [phone, setPhone] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);
  const [billingAddress, setBillingAddress] = useState<CheckoutAddress>(emptyAddress);
  const [notes, setNotes] = useState('');

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoadingIntent, setIsLoadingIntent] = useState(false);
  const [intentError, setIntentError] = useState<string | null>(null);

  const [isSubmittingInquiry, setIsSubmittingInquiry] = useState(false);
  const [inquiryError, setInquiryError] = useState<string | null>(null);
  const [submittedInquiryId, setSubmittedInquiryId] = useState<string | null>(null);

  if (submittedInquiryId) {
    return (
      <EmptyState
        title="Purchase request submitted"
        description={`Reference ${submittedInquiryId}. Our team will review your request and email you a secure payment link once it's approved.`}
        action={<Link href="/account/purchase-inquiries" className={cn(buttonVariants.primary, spacing.buttonPadding, 'text-body-sm')}>View My Requests</Link>}
      />
    );
  }

  if (ordersPaused) {
    return (
      <EmptyState
        title="Online ordering is temporarily paused"
        description={`We're not able to process checkout right now. To place an order, email ${supportEmail} or chat with our AI assistant.`}
        action={<a href={`mailto:${supportEmail}`} className={cn(buttonVariants.primary, spacing.buttonPadding, 'text-body-sm')}>Email {supportEmail}</a>}
      />
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title="Your cart is empty"
        description="Add something from the shop before checking out."
        action={<Link href="/shop" className={cn(buttonVariants.primary, spacing.buttonPadding, 'text-body-sm')}>Shop Devices</Link>}
      />
    );
  }

  if (requireAccount && !isAuthenticated) {
    return (
      <EmptyState
        title="An account is required to check out"
        description="Log in or create a free account to complete your purchase."
        action={
          <div className="flex gap-3">
            <Link href="/login?from=/checkout" className={cn(buttonVariants.primary, spacing.buttonPadding, 'text-body-sm')}>Log In</Link>
            <Link href="/register" className={cn(buttonVariants.ghost, spacing.buttonPadding, 'text-body-sm')}>Create Account</Link>
          </div>
        }
      />
    );
  }

  const email = isAuthenticated ? (prefillEmail ?? '') : guestEmail;
  const name = isAuthenticated ? prefillName : guestName;
  const isGuestContactComplete = isAuthenticated || (guestName.trim() !== '' && guestEmail.trim() !== '');

  async function handleContinueToPayment() {
    setBillingDone(true);
    setActiveStep('payment');

    if (inquiryOnlyMode || clientSecret) return;

    setIsLoadingIntent(true);
    setIntentError(null);
    try {
      const response = await fetch('/api/checkout/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
          email,
          name: isAuthenticated ? undefined : name,
          shippingAddress: toApiAddress(address),
          notes,
          phone,
        }),
      });
      const data = (await response.json().catch(() => null)) as { clientSecret?: string; error?: string } | null;
      if (!response.ok || !data?.clientSecret) {
        setIntentError(data?.error ?? 'Something went wrong starting checkout.');
        return;
      }
      setClientSecret(data.clientSecret);
    } finally {
      setIsLoadingIntent(false);
    }
  }

  async function handleSubmitInquiry() {
    setIsSubmittingInquiry(true);
    setInquiryError(null);

    const response = await fetch('/api/checkout/inquiry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
        shippingAddress: toApiAddress(address),
        email: isAuthenticated ? undefined : email,
        name: isAuthenticated ? undefined : name,
      }),
    });

    const data = (await response.json().catch(() => null)) as { inquiry?: { id: string }; error?: string } | null;
    if (!response.ok || !data?.inquiry) {
      setInquiryError(data?.error ?? 'Something went wrong submitting your purchase request.');
      setIsSubmittingInquiry(false);
      return;
    }

    setSubmittedInquiryId(data.inquiry.id);
    setIsSubmittingInquiry(false);
  }

  const billingDetails: BillingDetails = {
    name: name || email,
    email,
    address: {
      line1: (billingSameAsShipping ? address : billingAddress).line1,
      line2: (billingSameAsShipping ? address : billingAddress).line2 || undefined,
      city: (billingSameAsShipping ? address : billingAddress).city,
      state: (billingSameAsShipping ? address : billingAddress).state,
      postal_code: (billingSameAsShipping ? address : billingAddress).zip,
      country: 'US',
    },
  };

  return (
    <div className="grid grid-cols-1 gap-8 desktop:grid-cols-[1.6fr_1fr] desktop:items-start">
      <div className="flex flex-col gap-4">
        {isAuthenticated ? (
          <div className={cn(cardVariants.minimal, 'text-body-sm font-body text-neutral-light-gray')}>
            Signed in as <span className="font-heading font-semibold text-neutral-white">{prefillName || email}</span>
            {prefillName && <span className="text-neutral-silver"> · {email}</span>}
          </div>
        ) : (
          <div className={cn(cardVariants.minimal, 'text-body-sm font-body text-neutral-light-gray')}>
            Checking out as a guest.{' '}
            <Link href="/login?from=/checkout" className="text-accent-primary hover:underline">
              Log in
            </Link>{' '}
            if you have an account.
          </div>
        )}

        <AccordionSection
          title="Shipping"
          stepNumber={1}
          isOpen={activeStep === 'shipping'}
          isComplete={shippingDone}
          summary={formatAddress(address)}
          onToggle={() => setActiveStep('shipping')}
        >
          <ShippingSection
            address={address}
            onChange={setAddress}
            phone={phone}
            onPhoneChange={setPhone}
            canContinue={isAddressComplete(address) && isGuestContactComplete}
            guestContact={
              isAuthenticated
                ? undefined
                : { name: guestName, email: guestEmail, onNameChange: setGuestName, onEmailChange: setGuestEmail }
            }
            onContinue={() => {
              setShippingDone(true);
              setActiveStep('billing');
            }}
          />
        </AccordionSection>

        <AccordionSection
          title="Billing"
          stepNumber={2}
          isOpen={activeStep === 'billing'}
          isComplete={billingDone}
          disabled={!shippingDone}
          summary={billingSameAsShipping ? 'Same as shipping address' : formatAddress(billingAddress)}
          onToggle={() => shippingDone && setActiveStep('billing')}
        >
          <BillingSection
            sameAsShipping={billingSameAsShipping}
            onSameAsShippingChange={setBillingSameAsShipping}
            address={billingAddress}
            onChange={setBillingAddress}
            canContinue={billingSameAsShipping || isAddressComplete(billingAddress)}
            isSubmitting={isLoadingIntent}
            onContinue={handleContinueToPayment}
          />
        </AccordionSection>

        <AccordionSection
          title="Payment"
          stepNumber={3}
          isOpen={activeStep === 'payment'}
          isComplete={false}
          disabled={!billingDone}
          onToggle={() => billingDone && setActiveStep('payment')}
        >
          {inquiryOnlyMode ? (
            <>
              {inquiryError && <p role="alert" className="mb-4 text-body-sm font-body text-error">{inquiryError}</p>}
              <ReviewSubmitSection onSubmit={handleSubmitInquiry} isSubmitting={isSubmittingInquiry} />
            </>
          ) : (
            <div className="flex flex-col gap-5">
              <PaymentSection
                clientSecret={clientSecret}
                isLoading={isLoadingIntent}
                error={intentError}
                billingDetails={billingDetails}
                totalLabel={currency(subtotal)}
              />
              <PayPalSection
                items={items.map((item) => ({ productId: item.productId, quantity: item.quantity }))}
                shippingAddress={address}
                notes={notes}
                phone={phone}
                guestEmail={isAuthenticated ? undefined : guestEmail}
                guestName={isAuthenticated ? undefined : guestName}
              />
            </div>
          )}
        </AccordionSection>

        <OrderNotesSection notes={notes} onChange={setNotes} />
      </div>

      <div>
        <OrderSummaryPanel items={items} subtotal={subtotal} supportEmail={supportEmail} supportPhone={supportPhone} businessHours={businessHours} />
        <CheckoutFooterTrustBar />
      </div>
    </div>
  );
}
