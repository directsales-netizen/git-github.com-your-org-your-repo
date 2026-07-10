import { cardVariants, cn } from '@/design';

const MAX_LENGTH = 500;

interface Props {
  notes: string;
  onChange: (notes: string) => void;
}

export default function OrderNotesSection({ notes, onChange }: Props) {
  return (
    <div className={cn(cardVariants.base, 'flex flex-col gap-2')}>
      <label htmlFor="checkout-notes" className="text-body-md font-heading font-semibold text-neutral-white">
        Order notes <span className="font-body font-normal text-neutral-silver">(optional)</span>
      </label>
      <textarea
        id="checkout-notes"
        rows={3}
        maxLength={MAX_LENGTH}
        placeholder="Delivery instructions, gift note, or anything else we should know."
        value={notes}
        onChange={(e) => onChange(e.target.value.slice(0, MAX_LENGTH))}
        className="w-full resize-none rounded-md border border-neutral-titanium bg-bg-primary px-4 py-3 text-body-sm font-body text-neutral-white placeholder-neutral-silver/60 transition-colors duration-300 focus-visible:border-2 focus-visible:border-accent-primary focus-visible:outline-none"
      />
      <p className="self-end text-caption font-body text-neutral-silver">{notes.length}/{MAX_LENGTH}</p>
    </div>
  );
}
