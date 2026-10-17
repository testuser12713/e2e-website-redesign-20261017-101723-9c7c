import { Link } from "react-router-dom";
import { cn } from "../lib/cn";
import "./Brand.css";

export interface BrandProps {
  to?: string;
  subtitle?: string;
  tone?: "light" | "dark";
  className?: string;
}

export default function Brand({
  to = "/",
  subtitle = "smart energy",
  tone = "light",
  className,
}: BrandProps) {
  return (
    <Link
      to={to}
      className={cn("brand", tone === "dark" && "brand--dark", className)}
      aria-label="equicrew smart energy – Startseite"
    >
      <img
        className="brand-mark"
        src="/equicrew-mark.svg"
        width={31}
        height={31}
        alt=""
      />
      <span className="brand-text">
        <span className="brand-word">equicrew</span>
        <span className="brand-sub">{subtitle}</span>
      </span>
    </Link>
  );
}
