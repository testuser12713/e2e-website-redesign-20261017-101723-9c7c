import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../lib/cn";
import "./Section.css";

export type SectionElement = "section" | "div";
export type SectionContainer = "default" | "narrow" | "none";

export interface SectionProps extends HTMLAttributes<HTMLElement> {
  as?: SectionElement;
  size?: "default" | "sm";
  tint?: boolean;
  container?: SectionContainer;
  children?: ReactNode;
}

export default function Section({
  as: Component = "section",
  size = "default",
  tint = false,
  container = "default",
  className,
  children,
  ...rest
}: SectionProps) {
  return (
    <Component
      {...rest}
      className={cn(
        "section",
        size === "sm" && "section--sm",
        tint && "section--tint",
        className,
      )}
    >
      {container === "none" ? (
        children
      ) : (
        <div
          className={
            container === "narrow"
              ? "section__container section__container--narrow"
              : "container"
          }
        >
          {children}
        </div>
      )}
    </Component>
  );
}
