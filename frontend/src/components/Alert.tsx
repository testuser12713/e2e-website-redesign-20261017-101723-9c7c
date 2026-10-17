import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../lib/cn";
import "./Alert.css";

export type AlertTone = "success" | "error";
export type AlertVariant = "default" | "inline";

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  tone: AlertTone;
  variant?: AlertVariant;
  title?: string;
  children?: ReactNode;
}

export default function Alert({
  tone,
  variant = "default",
  title,
  className,
  children,
  role,
  ...rest
}: AlertProps) {
  const inline = variant === "inline";
  return (
    <div
      {...rest}
      className={cn(
        "alert",
        `alert--${tone}`,
        inline && "alert--inline",
        className,
      )}
      role={role ?? (tone === "success" ? "status" : "alert")}
      aria-live={tone === "success" ? "polite" : "assertive"}
    >
      {inline ? null : (
        <span className="alert__icon" aria-hidden="true">
          {tone === "success" ? (
            <svg viewBox="0 0 20 20" fill="none">
              <path
                d="M4 10.5l3.6 3.5L16 5.8"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg viewBox="0 0 20 20" fill="none">
              <path
                d="M10 6.2v4.6M10 14.1v.2M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
            </svg>
          )}
        </span>
      )}
      <div className="alert__content">
        {title ? <strong>{title}</strong> : null}
        {children}
      </div>
    </div>
  );
}
