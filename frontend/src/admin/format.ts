const DATE_FORMATTER = new Intl.DateTimeFormat("de-AT", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "Europe/Vienna",
});

const TIME_FORMATTER = new Intl.DateTimeFormat("de-AT", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "Europe/Vienna",
});

function parseDate(value: string): Date | null {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(value: string): string {
  const date = parseDate(value);
  return date ? DATE_FORMATTER.format(date) : "—";
}

export function formatTime(value: string): string {
  const date = parseDate(value);
  return date ? TIME_FORMATTER.format(date) : "—";
}

export function formatDateTime(value: string): string {
  const date = parseDate(value);
  if (!date) {
    return "—";
  }
  return `${DATE_FORMATTER.format(date)} · ${TIME_FORMATTER.format(date)} Uhr`;
}

export function initials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "?";
}
