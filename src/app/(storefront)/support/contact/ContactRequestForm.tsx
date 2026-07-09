'use client';

import { useState, type FormEvent } from 'react';
import { buttonVariants, cardVariants, cn, inputVariants, spacing } from '@/design';

const REQUEST_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: 'general_inquiry', label: 'General Inquiry' },
  { value: 'sales', label: 'Sales Inquiry' },
  { value: 'quote', label: 'Quote Request' },
  { value: 'callback', label: 'Callback Request' },
  { value: 'appointment', label: 'Appointment Request' },
  { value: 'consultation', label: 'Consultation Request' },
  { value: 'order_question', label: 'Order-Related Question' },
  { value: 'support', label: 'Customer Support' },
  { value: 'technical_support', label: 'Technical Support' },
  { value: 'service', label: 'Service Request' },
  { value: 'warranty_repair', label: 'Warranty or Repair Request' },
  { value: 'complaint', label: 'Customer Complaint' },
  { value: 'partnership', label: 'Partnership or Vendor Inquiry' },
  { value: 'other', label: 'Other' },
];

export default function ContactRequestForm() {
  const [kind, setKind] = useState(REQUEST_TYPE_OPTIONS[0].value);
  const [clientName, setClientName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind, clientName, companyName, email, phone, message }),
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(data?.error ?? 'Something went wrong. Please try again.');
      setIsSubmitting(false);
      return;
    }

    const data: { id: string } = await response.json();
    setSubmittedId(data.id);
    setIsSubmitting(false);
  }

  if (submittedId) {
    return (
      <div className={cn(cardVariants.base, 'text-center')}>
        <h2 className="text-h5 font-heading font-semibold text-neutral-white">Request received</h2>
        <p className="mt-2 text-body-sm font-body text-neutral-light-gray">
          Thanks — your reference number is <strong>{submittedId}</strong>. Our team has been notified and will get back to
          you shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={cn(cardVariants.base, 'flex flex-col gap-4')} noValidate>
      <h2 className="text-h5 font-heading font-semibold text-neutral-white">Send us a request</h2>

      <div>
        <label htmlFor="contact-kind" className="mb-1.5 block text-label-md font-body text-neutral-light-gray">
          What can we help with?
        </label>
        <select id="contact-kind" value={kind} onChange={(e) => setKind(e.target.value)} className={inputVariants.base}>
          {REQUEST_TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className="mb-1.5 block text-label-md font-body text-neutral-light-gray">Name</label>
          <input id="contact-name" autoComplete="name" value={clientName} onChange={(e) => setClientName(e.target.value)} className={inputVariants.base} />
        </div>
        <div>
          <label htmlFor="contact-company" className="mb-1.5 block text-label-md font-body text-neutral-light-gray">Company (optional)</label>
          <input id="contact-company" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className={inputVariants.base} />
        </div>
        <div>
          <label htmlFor="contact-email" className="mb-1.5 block text-label-md font-body text-neutral-light-gray">Email</label>
          <input id="contact-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputVariants.base} />
        </div>
        <div>
          <label htmlFor="contact-phone" className="mb-1.5 block text-label-md font-body text-neutral-light-gray">Phone</label>
          <input id="contact-phone" type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputVariants.base} />
        </div>
      </div>
      <p className="-mt-2 text-caption font-body text-neutral-silver">Please provide at least an email or phone number so we can reach you.</p>

      <div>
        <label htmlFor="contact-message" className="mb-1.5 block text-label-md font-body text-neutral-light-gray">Message</label>
        <textarea
          id="contact-message"
          required
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={cn(inputVariants.base, 'resize-none')}
        />
      </div>

      {error && <p className="text-body-sm font-body text-error">{error}</p>}

      <button type="submit" disabled={isSubmitting} className={cn(buttonVariants.primary, spacing.buttonPadding, 'text-body-md')}>
        {isSubmitting ? 'Sending…' : 'Send Request'}
      </button>
    </form>
  );
}
