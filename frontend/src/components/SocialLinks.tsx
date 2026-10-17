import { cn } from "../lib/cn";
import "./SocialLinks.css";

export interface SocialLinksProps {
  className?: string;
}

export default function SocialLinks({ className }: SocialLinksProps) {
  return (
    <div className={cn("social-row", className)}>
      <a
        className="social-link"
        href="https://www.linkedin.com/company/equicrew/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="EquiCrew auf LinkedIn"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M6.94 8.5H3.56V20h3.38V8.5ZM5.25 3.5a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM20 13.27c0-3.53-1.88-5.17-4.4-5.17-2.03 0-2.94 1.12-3.45 1.9V8.5H8.77V20h3.38v-6.42c0-1.7.32-3.35 2.43-3.35 2.08 0 2.1 1.95 2.1 3.46V20H20v-6.73Z" />
        </svg>
      </a>
      <a
        className="social-link"
        href="https://www.instagram.com/equicrew_com/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="EquiCrew auf Instagram"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          aria-hidden="true"
        >
          <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.6" cy="6.5" r="1" fill="currentColor" stroke="none" />
        </svg>
      </a>
    </div>
  );
}
