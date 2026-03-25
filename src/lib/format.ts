/**
 * MORIX V2 — Shared Formatting Utilities
 * All Thai Baht and number formatting in one place
 */

// ─────────────────────────────────────────
// Thai Baht
// ─────────────────────────────────────────
export function formatTHB(amount: number, compact = false): string {
  if (compact) {
    if (amount >= 1_000_000) return `฿${(amount / 1_000_000).toFixed(1)}M`;
    if (amount >= 1_000)     return `฿${(amount / 1_000).toFixed(0)}K`;
    return `฿${amount.toLocaleString('th-TH')}`;
  }
  return `฿${amount.toLocaleString('th-TH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function formatTHBFull(amount: number): string {
  return `฿${amount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ─────────────────────────────────────────
// USD / Foreign Currency
// ─────────────────────────────────────────
export function formatUSD(amount: number): string {
  return `$ ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ─────────────────────────────────────────
// Percentage change badge colors
// ─────────────────────────────────────────
export type ChangeDirection = 'positive' | 'negative' | 'neutral';

export type MetricPolarity = 'higher_is_better' | 'lower_is_better';

export function getChangeColor(
  changeStr: string,
  polarity: MetricPolarity = 'higher_is_better'
): { bg: string; text: string; label: string } {
  const isPositive = changeStr.startsWith('+');
  const isNegative = changeStr.startsWith('-');
  const isNeutral  = !isPositive && !isNegative;

  if (isNeutral) return { bg: 'bg-[var(--surface-container-high)]', text: 'text-[var(--on-surface-variant)]', label: changeStr };

  const good = polarity === 'higher_is_better' ? isPositive : isNegative;

  if (good) {
    return { bg: 'bg-[var(--success-container)]', text: 'text-[var(--success)]', label: changeStr };
  } else {
    return { bg: 'bg-[var(--error-container)]', text: 'text-[var(--error)]', label: changeStr };
  }
}

// ─────────────────────────────────────────
// KPI card semantic color
// Lower is better: Pending Orders, Low Stock, Out of Stock
// ─────────────────────────────────────────
export function getKPIColor(metricKey: string, changeStr: string): { bg: string; text: string } {
  const lowerIsBetter: Record<string, boolean> = {
    'Pending Orders': true,
    'Low Stock':      true,
    'Out of Stock':   true,
    'Expenses':       true,
  };
  const polarity = lowerIsBetter[metricKey] ? 'lower_is_better' : 'higher_is_better';
  return getChangeColor(changeStr, polarity) as { bg: string; text: string };
}

// ─────────────────────────────────────────
// Date formatting
// ─────────────────────────────────────────
export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatRelativeTime(dateStr: string): string {
  const now = new Date();
  const then = new Date(dateStr);
  const diffMs = now.getTime() - then.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7)  return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return formatDate(dateStr);
}

// ─────────────────────────────────────────
// Currency mix display (for Purchase Order)
// ─────────────────────────────────────────
export function formatPriceWithCurrency(amount: number, currency: 'THB' | 'USD' | 'CNY'): string {
  if (currency === 'THB') return formatTHB(amount);
  if (currency === 'USD') return formatUSD(amount);
  return `¥ ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
