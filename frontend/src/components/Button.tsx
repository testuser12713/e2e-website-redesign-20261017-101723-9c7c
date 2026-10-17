import { Link } from "react-router-dom";
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  MouseEventHandler,
  ReactNode,
} from "react";
import { cn } from "../lib/cn";
import "./Button.css";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "on-dark";
export type ButtonSize = "md" | "sm";

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  loading?: boolean;
  loadingLabel?: ReactNode;
  icon?: ReactNode;
  iconPosition?: "start" | "end";
  to?: string;
  href?: string;
  type?: "button" | "submit" | "reset";
}

export default function Button({
  variant = "primary",
  size = "md",
  block = false,
  loading = false,
  loadingLabel,
  icon,
  iconPosition = "end",
  to,
  href,
  disabled = false,
  className,
  children,
  type = "button",
  onClick,
  ...rest
}: ButtonProps) {
  const classes = cn(
    "btn",
    `btn-${variant}`,
    size === "sm" && "btn-sm",
    block && "btn-block",
    loading && "is-loading",
    className,
  );

  const showIcon = icon !== undefined && icon !== null && !loading;
  const content = (
    <>
      {loading ? <span className="btn__spinner" aria-hidden="true" /> : null}
      {showIcon && iconPosition === "start" ? (
        <span className="btn__icon" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span>{loading ? (loadingLabel ?? children) : children}</span>
      {showIcon && iconPosition === "end" ? (
        <span className="btn__icon" aria-hidden="true">
          {icon}
        </span>
      ) : null}
    </>
  );

  const anchorState = {
    "aria-disabled": disabled || undefined,
    "aria-busy": loading || undefined,
    "data-loading": loading || undefined,
  };
  const buttonClick = onClick as unknown as
    | MouseEventHandler<HTMLAnchorElement>
    | undefined;

  if (to) {
    return (
      <Link
        to={to}
        {...(rest as unknown as AnchorHTMLAttributes<HTMLAnchorElement>)}
        className={classes}
        {...anchorState}
        onClick={(event) => {
          if (disabled || loading) {
            event.preventDefault();
            return;
          }
          buttonClick?.(event);
        }}
      >
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a
        href={href}
        {...(rest as unknown as AnchorHTMLAttributes<HTMLAnchorElement>)}
        className={classes}
        {...anchorState}
        onClick={(event) => {
          if (disabled || loading) {
            event.preventDefault();
            return;
          }
          buttonClick?.(event);
        }}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      {...rest}
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      data-loading={loading || undefined}
      onClick={onClick as MouseEventHandler<HTMLButtonElement> | undefined}
    >
      {content}
    </button>
  );
}
