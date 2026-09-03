import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const controlClass =
  "w-full rounded-sheet border border-border bg-surface-sunken px-3 py-2 text-text " +
  "placeholder:text-text-subtle focus-visible:outline-2 focus-visible:outline-offset-1 " +
  "focus-visible:outline-focus disabled:opacity-50";

interface FieldMeta {
  label: string;
  error?: string;
  hint?: string;
}

function FieldWrapper({
  label,
  htmlFor,
  error,
  hint,
  children,
}: FieldMeta & { htmlFor: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="heading-smallcaps">
        {label}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-text-muted">{hint}</p>}
      {error && (
        <p className="text-xs text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function Field({
  label,
  error,
  hint,
  className,
  id,
  ...props
}: FieldMeta & Omit<InputHTMLAttributes<HTMLInputElement>, "id"> & { id: string }) {
  return (
    <FieldWrapper label={label} htmlFor={id} error={error} hint={hint}>
      <input
        id={id}
        className={cn(controlClass, className)}
        aria-invalid={!!error}
        {...props}
      />
    </FieldWrapper>
  );
}

export function TextAreaField({
  label,
  error,
  hint,
  className,
  id,
  ...props
}: FieldMeta & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id"> & { id: string }) {
  return (
    <FieldWrapper label={label} htmlFor={id} error={error} hint={hint}>
      <textarea
        id={id}
        className={cn(controlClass, "min-h-24 resize-y", className)}
        aria-invalid={!!error}
        {...props}
      />
    </FieldWrapper>
  );
}

export function SelectField({
  label,
  error,
  hint,
  className,
  id,
  children,
  ...props
}: FieldMeta & Omit<SelectHTMLAttributes<HTMLSelectElement>, "id"> & { id: string }) {
  return (
    <FieldWrapper label={label} htmlFor={id} error={error} hint={hint}>
      <select id={id} className={cn(controlClass, className)} aria-invalid={!!error} {...props}>
        {children}
      </select>
    </FieldWrapper>
  );
}
