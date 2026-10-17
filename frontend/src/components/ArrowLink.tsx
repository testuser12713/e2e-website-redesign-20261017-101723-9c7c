import { Link } from "react-router-dom";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { cn } from "../lib/cn";
import "./ArrowLink.css";

export interface ArrowLinkProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  to?: string;
  href?: string;
  variant?: "arrow" | "text";
  children: ReactNode;
}

function ArrowGlyph() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M4 10h12M11 5l5 5-5 5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ArrowLink({
  to,
  href,
  variant = "arrow",
  className,
  children,
  ...rest
}: ArrowLinkProps) {
  const classes = cn(
    variant === "text" ? "text-link" : "link-arrow",
    className,
  );
  const content = (
    <>
      {children}
      {variant === "arrow" ? <ArrowGlyph /> : null}
    </>
  );

  if (to) {
    return (
      <Link to={to} {...rest} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <a href={href} {...rest} className={classes}>
      {content}
    </a>
  );
}
