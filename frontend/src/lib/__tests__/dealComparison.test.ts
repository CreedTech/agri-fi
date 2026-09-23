import { describe, expect, it } from 'vitest';
import type { Deal } from '../api';
import {
  buildDealComparisonCsv,
  formatDuration,
  formatFundingProgress,
  formatRoi,
} from '../dealComparison';

function makeDeal(overrides: Partial<Deal> = {}): Deal {
  return {
    id: 'deal-1',
    title: 'Maize harvest',
    commodity: 'maize',
    quantity: 100,
    quantity_unit: 'kg',
    total_value: 1000,
    funded_amount: 250,
    total_invested: 250,
    token_count: 100,
    tokens_remaining: 75,
    token_symbol: 'MAIZE',
    status: 'open',
    delivery_date: '2026-12-01',
    created_at: '2026-09-23T00:00:00.000Z',
    expected_roi: 12.345,
    duration_days: 90,
    risk_rating: 'Medium',
    ...overrides,
  };
}

describe('deal comparison formatting', () => {
  it('formats optional values consistently with the comparison table', () => {
    expect(formatRoi(12.345)).toBe('12.3%');
    expect(formatRoi(null)).toBe('Not specified');
    expect(formatDuration(90)).toBe('90 days');
    expect(formatDuration(undefined)).toBe('Not specified');
  });

  it('caps funding progress at 100 percent and handles zero-value deals', () => {
    expect(
      formatFundingProgress(makeDeal({ total_value: 100, total_invested: 150 })),
    ).toBe('100.0%');
    expect(
      formatFundingProgress(makeDeal({ total_value: 0, total_invested: 20 })),
    ).toBe('0.0%');
  });
});

describe('buildDealComparisonCsv', () => {
  it('exports the same metrics shown in the comparison table', () => {
    const csv = buildDealComparisonCsv([makeDeal()]);

    expect(csv).toBe(
      [
        'Metric,Maize harvest',
        'Expected ROI,12.3%',
        'Duration,90 days',
        'Funding progress,25.0%',
        'Risk rating,Medium',
        'Commodity,maize',
      ].join('\r\n'),
    );
  });

  it('escapes commas and quotes according to CSV rules', () => {
    const csv = buildDealComparisonCsv([
      makeDeal({ title: 'Rice, premium "Grade A"', commodity: 'rice' }),
    ]);

    expect(csv.split('\r\n')[0]).toBe(
      'Metric,"Rice, premium ""Grade A"""',
    );
  });

  it('falls back to commodity when the deal title is blank', () => {
    const csv = buildDealComparisonCsv([
      makeDeal({ title: '   ', commodity: 'cocoa' }),
    ]);

    expect(csv.split('\r\n')[0]).toBe('Metric,cocoa');
  });
});
