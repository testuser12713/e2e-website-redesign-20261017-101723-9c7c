import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../lib/cn";
import "./Kicker.css";

export type KickerTone = "default" | "light";

export interface KickerProps extends HTMLAttributes<HTMLElement> {
  as?: "p" | "span";
  tone?: KickerTone;
  children?: ReactNode;
}

export default function Kicker({
  as: Component = "p",
  tone = "default",
  className,
  children,
  ...rest
}: KickerProps) {
  return (
    <Component
      {...rest}
      className={cn(
        "kicker",
        tone === "light" && "kicker--light",
        className,
      )}
    >
      {children}
    </Component>
  );
}
