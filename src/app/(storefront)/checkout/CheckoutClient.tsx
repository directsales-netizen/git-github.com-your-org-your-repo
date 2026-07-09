'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/cart/CartContext';
import { buttonVariants, cardVariants, cn, inputVariants, spacing } from '@/design';
import EmptyState from '@/components/admin/EmptyState';

interface Props {
  isAuthenticated: boolean;
  prefillEmail?: string;
  requireAccount: boolean;
  ordersPaused: boolean;
  supportEmail: string;
}

export default function CheckoutClient({ isAuthenticated, prefillEmail, requireAccount, ordersPaused, supportEmail }: Props) {
  const { items, subtotal } = useCart();
  const [email, setEmail] = useState(prefillEmail ?? '');
  const [address, setAddress] = useState({ line1: '', line2: '', city: '', state: '', zip: '' });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const response = await fetch('/api/checkout/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
        email,
        shippingAddress: address,
      }),
    });

    const data = (await response.json().catch(() => null)) as { url?: string; error?: string } | null;

    if (!response.ok || !data?.url) {
      setError(data?.error ?? 'Something went wrong starting checkout.');
      setIsSubmitting(false);
      return;
    }

    window.location.href = data.url;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className={cn(cardVariants.base, 'flex flex-col gap-2')}>
        <h2 className="text-h6 font-heading font-semibold text-neutral-white">Order Summary</h2>
        {items.map((item) => (
          <div key={item.productId} className="flex justify-between text-body-sm font-body text-neutral-light-gray">
            <span>{item.title} × {item.quantity}</span>
            <span>${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        <div className="mt-2 flex justify-between border-t border-neutral-titanium/20 pt-2 font-heading font-semibold text-neutral-white">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <p className="text-caption font-body text-neutral-silver">Final price and stock are re-verified on the server before payment.</p>
      </div>

      <div className={cn(cardVariants.base, 'grid grid-cols-1 gap-4')}>
        <h2 className="text-h6 font-heading font-semibold text-neutral-white">Contact & Shipping</h2>
        <div>
          <label htmlFor="checkout-email" className="mb-1.5 block text-label-md font-body text-neutral-light-gray">Email</label>
          <input
            id="checkout-email"
            type="email"
            required
            disabled={isAuthenticated}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputVariants.base}
          />
        </div>
        <div>
          <label htmlFor="checkout-line1" className="mb-1.5 block text-label-md font-body text-neutral-light-gray">Address line 1</label>
          <input id="checkout-line1" required value={address.line1} onChange={(e) => setAddress((a) => ({ ...a, line1: e.target.value }))} className={inputVariants.base} />
        </div>
        <div>
          <label htmlFor="checkout-line2" className="mb-1.5 block text-label-md font-body text-neutral-light-gray">Address line 2 (optional)</label>
          <input id="checkout-line2" value={address.line2} onChange={(e) => setAddress((a) => ({ ...a, line2: e.target.value }))} className={inputVariants.base} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <input aria-label="City" required placeholder="City" value={address.city} onChange={(e) => setAddress((a) => ({ ...a, city: e.target.value }))} className={inputVariants.base} />
          <input aria-label="State" required placeholder="State" value={address.state} onChange={(e) => setAddress((a) => ({ ...a, state: e.target.value }))} className={inputVariants.base} />
          <input aria-label="ZIP" required placeholder="ZIP" value={address.zip} onChange={(e) => setAddress((a) => ({ ...a, zip: e.target.value }))} className={inputVariants.base} />
        </div>
      </div>

      {error && <p role="alert" className="text-body-sm font-body text-error">{error}</p>}

      <button type="submit" disabled={isSubmitting} className={cn(buttonVariants.primary, spacing.buttonPadding, 'text-body-md')}>
        {isSubmitting ? 'Redirecting to payment…' : 'Continue to Payment'}
      </button>
    </form>
  );
}
