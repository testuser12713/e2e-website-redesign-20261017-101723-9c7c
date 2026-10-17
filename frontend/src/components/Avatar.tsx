import { cn } from "../lib/cn";
import "./Avatar.css";

export type AvatarSize = "sm" | "md" | "lg";

export interface AvatarProps {
  initials: string;
  size?: AvatarSize;
  tone?: "default" | "dark";
  label?: string;
  className?: string;
}

export default function Avatar({
  initials,
  size = "md",
  tone = "default",
  label,
  className,
}: AvatarProps) {
  return (
    <span
      className={cn(
        "avatar",
        size === "sm" && "avatar--sm",
        size === "lg" && "avatar--lg",
        tone === "dark" && "avatar--dark",
        className,
      )}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {initials}
    </span>
  );
}
