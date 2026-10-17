import type { TextareaHTMLAttributes } from "react";
import { cn } from "../lib/cn";
import "./TextArea.css";

export interface TextAreaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export default function TextArea({
  invalid = false,
  className,
  "aria-invalid": ariaInvalid,
  rows = 6,
  ...rest
}: TextAreaProps) {
  return (
    <textarea
      {...rest}
      rows={rows}
      className={cn("textarea", className)}
      aria-invalid={invalid || ariaInvalid === true ? true : ariaInvalid}
    />
  );
}
