import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../lib/cn";
import "./EmptyState.css";

export interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export default function EmptyState({
  title,
  description,
  icon,
  action,
  className,
  ...rest
}: EmptyStateProps) {
  return (
    <div {...rest} className={cn("empty-state", className)}>
      <span className="empty-state-icon" aria-hidden="true">
        {icon ?? (
          <svg viewBox="0 0 20 20" fill="none">
            <path
              d="M3 5.5A1.5 1.5 0 0 1 4.5 4h11A1.5 1.5 0 0 1 17 5.5v9a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 3 14.5v-9Z"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="m3.6 6 6.4 4.5L16.4 6"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
      <h2>{title}</h2>
      {description ? <p>{description}</p> : null}
      {action ? <div className="empty-state__action">{action}</div> : null}
    </div>
  );
}
