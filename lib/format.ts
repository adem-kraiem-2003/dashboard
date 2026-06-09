/**
 * Shared formatting utilities for the admin dashboard.
 * Centralizes number and date formatting to avoid duplicated Intl boilerplate.
 */

const priceFormatter = new Intl.NumberFormat('fr-TN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Format a monetary amount in Tunisian Dinars. */
export function formatPrice(amount: number): string {
  return `${priceFormatter.format(amount)} DT`;
}

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

/** Format an ISO date string to a human-readable French date+time. */
export function formatDate(dateStr: string): string {
  try {
    return dateFormatter.format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}
