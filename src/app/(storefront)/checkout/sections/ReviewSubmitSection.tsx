import { buttonVariants, cn, spacing } from '@/design';

interface Props {
  onSubmit: () => void;
  isSubmitting: boolean;
}

/** Shown instead of PaymentSection when the store is in inquiry-only mode — no card is collected here, an admin reviews and emails a payment link later. */
export default function ReviewSubmitSection({ onSubmit, isSubmitting }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-body-sm font-body text-neutral-light-gray">
        Direct payment is disabled right now. Submitting this request sends it to our team for review — you&apos;ll
        receive a secure payment link by email once it&apos;s approved.
      </p>
      <button
        type="button"
        disabled={isSubmitting}
        onClick={onSubmit}
        className={cn(buttonVariants.primary, spacing.buttonPadding, 'self-start text-body-md')}
      >
        {isSubmitting ? 'Submitting…' : 'Submit Purchase Request'}
      </button>
    </div>
  );
}
