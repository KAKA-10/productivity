import { twMerge } from 'tailwind-merge';

export function cn(...inputs: Array<string | false | null | undefined>) {
  return twMerge(inputs.filter(Boolean).join(' '));
}

export function nextRef(prefix: string, count: number) {
  return `${prefix}-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;
}

export function formatDate(value: string) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-KE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
