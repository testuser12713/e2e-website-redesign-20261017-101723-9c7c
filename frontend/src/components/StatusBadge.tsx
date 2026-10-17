import { cn } from "../lib/cn";
import "./StatusBadge.css";

export type InquiryStatus = "new" | "read" | "done";

const STATUS_LABELS: Record<InquiryStatus, string> = {
  new: "Neu",
  read: "Gelesen",
  done: "Erledigt",
};

export interface StatusBadgeProps {
  status: InquiryStatus;
  className?: string;
}

export default function StatusBadge({
  status,
  className,
}: StatusBadgeProps) {
  return (
    <span className={cn("badge", `badge-${status}`, className)}>
      {STATUS_LABELS[status]}
    </span>
  );
}
