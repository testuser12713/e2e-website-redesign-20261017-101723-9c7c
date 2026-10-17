import { cloneElement, useId } from "react";
import type { ReactElement, ReactNode } from "react";
import { cn } from "../lib/cn";
import "./FormField.css";

interface FieldControlProps {
  id?: string;
  required?: boolean;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean | "false" | "true" | "grammar" | "spelling";
}

export interface FormFieldProps {
  label: ReactNode;
  htmlFor?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  fullWidth?: boolean;
  className?: string;
  children: ReactElement<FieldControlProps>;
}

export default function FormField({
  label,
  htmlFor,
  error,
  hint,
  required = false,
  fullWidth = false,
  className,
  children,
}: FormFieldProps) {
  const generatedId = useId().replace(/:/g, "");
  const controlId = htmlFor ?? children.props.id ?? `field-${generatedId}`;
  const errorId = `${controlId}-error`;
  const hintId = hint ? `${controlId}-hint` : undefined;
  const describedBy = [
    hintId,
    error ? errorId : undefined,
    children.props["aria-describedby"],
  ]
    .filter(Boolean)
    .join(" ");

  const control = cloneElement(children, {
    id: controlId,
    required: required || children.props.required,
    "aria-describedby": describedBy || undefined,
    "aria-invalid": error ? true : children.props["aria-invalid"],
  });

  return (
    <div
      className={cn(
        "field",
        fullWidth && "field-full",
        error && "has-error",
        className,
      )}
    >
      <label htmlFor={controlId}>
        {label}
        {required ? (
          <>
            {" "}
            <span className="required" aria-hidden="true">
              *
            </span>
          </>
        ) : null}
      </label>
      {control}
      {hint ? (
        <span className="field-hint" id={hintId}>
          {hint}
        </span>
      ) : null}
      <span className="field-error" id={errorId} aria-live="polite">
        {error ?? ""}
      </span>
    </div>
  );
}
