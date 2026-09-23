import type { Deal } from '@/lib/api';

export type DealComparisonRow = readonly [
  label: string,
  value: (deal: Deal) => string,
];

export function formatRoi(value: number | null | undefined): string {
  return value == null ? 'Not specified' : `${Number(value).toFixed(1)}%`;
}

export function formatDuration(value: number | null | undefined): string {
  return value == null ? 'Not specified' : `${value} days`;
}

export function formatFundingProgress(deal: Deal): string {
  const progress =
    deal.total_value > 0
      ? Math.min(
          (Number(deal.total_invested) / Number(deal.total_value)) * 100,
          100,
        )
      : 0;

  return `${progress.toFixed(1)}%`;
}

export const DEAL_COMPARISON_ROWS: readonly DealComparisonRow[] = [
  ['Expected ROI', (deal: Deal) => formatRoi(deal.expected_roi)],
  ['Duration', (deal: Deal) => formatDuration(deal.duration_days)],
  ['Funding progress', (deal: Deal) => formatFundingProgress(deal)],
  ['Risk rating', (deal: Deal) => deal.risk_rating ?? 'Not specified'],
  ['Commodity', (deal: Deal) => deal.commodity],
];

function escapeCsvCell(value: string): string {
  if (!/[",\r\n]/.test(value)) return value;
  return `"${value.replace(/"/g, '""')}"`;
}

function getDealLabel(deal: Deal): string {
  const title = deal.title?.trim();
  return title || deal.commodity;
}

export function buildDealComparisonCsv(deals: Deal[]): string {
  const header = ['Metric', ...deals.map(getDealLabel)];
  const rows = DEAL_COMPARISON_ROWS.map(([label, getValue]) => [
    label,
    ...deals.map(getValue),
  ]);

  return [header, ...rows]
    .map((row) => row.map((cell) => escapeCsvCell(String(cell))).join(','))
    .join('\r\n');
}

export function downloadDealComparisonCsv(
  deals: Deal[],
  filename = 'deal-comparison.csv',
): void {
  if (typeof window === 'undefined' || deals.length === 0) return;

  const csv = buildDealComparisonCsv(deals);
  const blob = new Blob([`\uFEFF${csv}`], {
    type: 'text/csv;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
