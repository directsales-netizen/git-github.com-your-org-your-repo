import { accessibility, buttonVariants, cn } from '@/design';

interface SuggestedQuestionsProps {
  options: string[];
  onSelect: (option: string) => void;
  disabled?: boolean;
}

export default function SuggestedQuestions({ options, onSelect, disabled }: SuggestedQuestionsProps) {
  if (options.length === 0) return null;

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(option)}
          className={cn(buttonVariants.ghost, accessibility.focusRing, 'px-3 py-1.5 text-caption')}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
