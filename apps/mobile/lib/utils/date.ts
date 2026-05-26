// date.ts - date formatting utilities using date-fns
import {
  format,
  formatDistanceToNow,
  isToday,
  isYesterday,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subDays,
} from 'date-fns';

export function formatTransactionDate(dateStr: string): string {
  const date = new Date(dateStr);
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'MMM d, yyyy');
}

export function formatShortDate(dateStr: string): string {
  return format(new Date(dateStr), 'MMM d');
}

export function formatFullDate(dateStr: string): string {
  return format(new Date(dateStr), 'EEEE, MMMM d, yyyy');
}

export function formatTime(dateStr: string): string {
  return format(new Date(dateStr), 'h:mm a');
}

export function timeAgo(dateStr: string): string {
  return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
}

export type Period = 'week' | 'month' | 'year';

export function getPeriodRange(period: Period): { start: Date; end: Date } {
  const now = new Date();
  switch (period) {
    case 'week':
      return { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) };
    case 'month':
      return { start: startOfMonth(now), end: endOfMonth(now) };
    case 'year':
      return { start: startOfYear(now), end: endOfYear(now) };
  }
}

export function getDayLabels(period: Period): string[] {
  switch (period) {
    case 'week':
      return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    case 'month':
      return Array.from({ length: 4 }, (_, i) => `W${i + 1}`);
    case 'year':
      return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  }
}
