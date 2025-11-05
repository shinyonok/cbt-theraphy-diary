export function formatDateTimeISO(date: Date): string {
  return date.toISOString();
}

export function formatHuman(date: string): string {
  const parsed = new Date(date);
  return parsed.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function randomId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)}`;
}
