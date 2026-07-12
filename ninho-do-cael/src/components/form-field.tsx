import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type FormFieldProps = {
  id: string;
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
  placeholder?: string;
  autoComplete?: string;
  error?: string;
  hint?: string;
  disabled?: boolean;
};

/** Campo de formulário com rótulo e erro associados (SDD, seção 31). */
export function FormField({
  id,
  name,
  label,
  type = "text",
  required = false,
  defaultValue,
  placeholder,
  autoComplete,
  error,
  hint,
  disabled,
}: FormFieldProps) {
  const errorId = `${id}-erro`;
  const hintId = `${id}-dica`;
  const describedBy =
    [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(" ") ||
    undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>
        {label}
        {required ? (
          <span aria-hidden="true" className="text-danger-strong">
            {" "}
            *
          </span>
        ) : null}
      </Label>
      <Input
        id={id}
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        disabled={disabled}
      />
      {hint ? (
        <p id={hintId} className="text-xs text-text-secondary">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="text-sm text-danger-strong">
          {error}
        </p>
      ) : null}
    </div>
  );
}
