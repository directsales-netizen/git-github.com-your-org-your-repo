import { inputVariants, cn } from '@/design';

interface FieldWrapperProps {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
}

function FieldWrapper({ label, htmlFor, error, children }: FieldWrapperProps) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-label-md font-body text-neutral-light-gray">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${htmlFor}-error`} className="mt-1 text-caption font-body text-error">
          {error}
        </p>
      )}
    </div>
  );
}

interface TextFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
}

export function TextField({ id, label, value, onChange, type = 'text', placeholder, required, error }: TextFieldProps) {
  return (
    <FieldWrapper label={label} htmlFor={id} error={error}>
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={error ? inputVariants.error : inputVariants.base}
      />
    </FieldWrapper>
  );
}

interface TextareaFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  error?: string;
}

export function TextareaField({ id, label, value, onChange, rows = 3, error }: TextareaFieldProps) {
  return (
    <FieldWrapper label={label} htmlFor={id} error={error}>
      <textarea
        id={id}
        value={value}
        rows={rows}
        onChange={(event) => onChange(event.target.value)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(error ? inputVariants.error : inputVariants.base, 'resize-none')}
      />
    </FieldWrapper>
  );
}

interface SelectFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  error?: string;
}

export function SelectField({ id, label, value, onChange, options, error }: SelectFieldProps) {
  return (
    <FieldWrapper label={label} htmlFor={id} error={error}>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={error ? inputVariants.error : inputVariants.base}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldWrapper>
  );
}

interface ToggleFieldProps {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function ToggleField({ id, label, description, checked, onChange }: ToggleFieldProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-1">
      <div>
        <label htmlFor={id} className="text-label-md font-body text-neutral-light-gray">
          {label}
        </label>
        {description && <p className="text-caption font-body text-neutral-silver">{description}</p>}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-6 w-11 shrink-0 rounded-full transition-colors duration-300',
          checked ? 'bg-accent-primary' : 'bg-neutral-titanium/40'
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            'absolute top-0.5 h-5 w-5 rounded-full bg-neutral-white transition-transform duration-300',
            checked ? 'translate-x-5' : 'translate-x-0.5'
          )}
        />
      </button>
    </div>
  );
}
