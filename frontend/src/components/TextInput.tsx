import type { InputHTMLAttributes } from "react";
import { cn } from "../lib/cn";
import "./TextInput.css";

export interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export default function TextInput({
  invalid = false,
  className,
  "aria-invalid": ariaInvalid,
  ...rest
}: TextInputProps) {
  return (
    <input
      {...rest}
      className={cn("input", className)}
      aria-invalid={invalid || ariaInvalid === true ? true : ariaInvalid}
    />
  );
}
