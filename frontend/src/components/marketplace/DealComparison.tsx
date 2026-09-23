import Link from 'next/link';
import { Deal } from '@/lib/api';
import {
  DEAL_COMPARISON_ROWS,
  downloadDealComparisonCsv,
} from '@/lib/dealComparison';

export default function DealComparison({
  deals,
  onRemove,
  onClear,
}: {
  deals: Deal[];
  onRemove: (dealId: string) => void;
  onClear: () => void;
}) {
  if (deals.length === 0) return null;

  return (
    <section
      className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 shadow-[0_-8px_30px_rgba(15,23,42,0.12)] backdrop-blur"
      aria-label="Deal comparison"
    >
      <div className="mx-auto max-w-7xl overflow-x-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-bold text-slate-900">
            Compare deals ({deals.length}/3)
          </h2>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => downloadDealComparisonCsv(deals)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
            >
              Export comparison
            </button>
            <button
              type="button"
              onClick={onClear}
              className="text-sm font-semibold text-slate-500 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
            >
              Clear all
            </button>
          </div>
        </div>
        <table className="w-full min-w-[640px] table-fixed text-left text-sm">
          <thead>
            <tr>
              <th className="w-36 pb-2 font-semibold text-slate-400">Metric</th>
              {deals.map((deal) => (
                <th
                  key={deal.id}
                  className="pb-2 pr-4 align-top font-semibold text-slate-900"
                >
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      href={`/marketplace/${deal.id}`}
                      className="capitalize hover:text-brand-700"
                    >
                      {deal.commodity}
                    </Link>
                    <button
                      type="button"
                      onClick={() => onRemove(deal.id)}
                      aria-label={`Remove ${deal.commodity} from comparison`}
                      className="text-slate-400 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                    >
                      ×
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DEAL_COMPARISON_ROWS.map(([label, value]) => (
              <tr key={label} className="border-t border-slate-100">
                <th className="py-2 font-medium text-slate-500">{label}</th>
                {deals.map((deal) => (
                  <td
                    key={deal.id}
                    className="py-2 pr-4 font-semibold text-slate-800"
                  >
                    {value(deal)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
