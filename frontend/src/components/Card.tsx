import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../lib/cn";
import "./Card.css";

export type CardVariant =
  | "default"
  | "form"
  | "feature"
  | "founder"
  | "message"
  | "side"
  | "panel"
  | "legal";

export type CardElement = "div" | "article" | "section" | "aside";

export interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: CardElement;
  variant?: CardVariant;
  children?: ReactNode;
}

export default function Card({
  as: Component = "div",
  variant = "default",
  className,
  children,
  ...rest
}: CardProps) {
  return (
    <Component
      {...rest}
      className={cn("card", `card--${variant}`, className)}
    >
      {children}
    </Component>
  );
}
