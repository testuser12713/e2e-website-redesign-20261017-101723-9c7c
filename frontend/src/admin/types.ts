import type { InquiryStatus } from "../components/StatusBadge";

export type { InquiryStatus };

export interface InquirySummary {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  message_excerpt: string;
  created_at: string;
  status: InquiryStatus;
}

export interface InquiryDetail {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  message: string;
  created_at: string;
  status: InquiryStatus;
}

export interface InquiryList {
  items: InquirySummary[];
}
