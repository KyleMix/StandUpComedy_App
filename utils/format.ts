const weekdayFormatter = new Intl.DateTimeFormat("en-US", { weekday: "short" });
const monthFormatter = new Intl.DateTimeFormat("en-US", { month: "short" });
const dayFormatter = new Intl.DateTimeFormat("en-US", { day: "2-digit" });

export function formatDateShort(dateISO: string): string {
  const date = new Date(dateISO);

  if (Number.isNaN(date.getTime())) {
    return dateISO;
  }

  const weekday = weekdayFormatter.format(date);
  const month = monthFormatter.format(date);
  const day = dayFormatter.format(date);

  return `${weekday} • ${month} ${Number.parseInt(day, 10)}`;
}
