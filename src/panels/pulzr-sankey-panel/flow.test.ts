import type { TimeSeriesData } from '@perses-dev/spec';

import { compact, flowOf, labelWidth } from './flow';

const at = (name: string, value: number | null, extra: object = {}): TimeSeriesData['series'][number] => ({
  name,
  values: [
    [0, 1],
    [1, value],
  ],
  ...extra,
});
const data = (...series: TimeSeriesData['series']): { data: TimeSeriesData } => ({ data: { series } });

const links = [
  { from: 'Parking', to: 'Gross', series: 'parking' },
  { from: 'Permits', to: 'Gross', series: 'permits' },
  { from: 'Gross', to: 'Refunds', series: 'refunds' },
  { from: 'Gross', to: 'Net', series: 'net' },
];
const palette = ['#p1', '#p2', '#p3', '#p4'];

describe('flowOf', () => {
  it('values each link by the last value of its series, by formatted name', () => {
    const results = [data(at('a', 800, { formattedName: 'parking' }), at('permits', 200), at('net', 1000))];
    expect(flowOf(results, { links }, palette).links).toEqual([
      { source: 'Parking', target: 'Gross', value: 800 },
      { source: 'Permits', target: 'Gross', value: 200 },
      { source: 'Gross', target: 'Net', value: 1000 },
    ]);
  });

  it('leaves out links with no value, zero or less, and the nodes they leave alone', () => {
    const results = [
      data(at('parking', 800), at('permits', 0), at('refunds', -5), { name: 'net', values: [[1, null]] }),
    ];
    const flow = flowOf(results, { links }, palette);
    expect(flow.links).toEqual([{ source: 'Parking', target: 'Gross', value: 800 }]);
    expect(flow.nodes.map((n) => n.name)).toEqual(['Parking', 'Gross']);
  });

  it('skips the period compared', () => {
    const results = [data(at('parking', 800), at('parking', 9000, { labels: { compare: 'previous' } }))];
    expect(flowOf(results, { links }, palette).links).toEqual([{ source: 'Parking', target: 'Gross', value: 800 }]);
  });

  it('colors nodes by name, the rest from the palette in order of first appearance', () => {
    const results = [data(at('parking', 800), at('permits', 200), at('refunds', 50), at('net', 950))];
    const flow = flowOf(results, { links, colors: { Gross: '#64748b', Net: '#10b981' } }, palette);
    expect(flow.nodes.map((n) => [n.name, n.color])).toEqual([
      ['Parking', '#p1'],
      ['Gross', '#64748b'],
      ['Permits', '#p2'],
      ['Refunds', '#p3'],
      ['Net', '#10b981'],
    ]);
  });

  it('values a node by the larger of what flows in and out, and knows its side', () => {
    const results = [data(at('parking', 800), at('permits', 200), at('refunds', 50), at('net', 950))];
    const flow = flowOf(results, { links }, palette);
    expect(flow.nodes.map((n) => [n.name, n.value, n.side])).toEqual([
      ['Parking', 800, 'left'],
      ['Gross', 1000, 'middle'],
      ['Permits', 200, 'left'],
      ['Refunds', 50, 'right'],
      ['Net', 950, 'right'],
    ]);
  });

  it('has nothing without data', () => {
    expect(flowOf([], { links }, palette)).toEqual({ nodes: [], links: [] });
    expect(flowOf([{ data: undefined }], { links }, palette).links).toEqual([]);
  });
});

describe('compact', () => {
  it('shortens currency as the original did', () => {
    const usd = { unit: 'usd' } as const;
    expect(compact(8312.4, usd)).toBe('$8.3k');
    expect(compact(12_400, usd)).toBe('$12k');
    expect(compact(840.6, usd)).toBe('$841');
  });

  it('shortens decimals, and leaves other units to their format', () => {
    expect(compact(8312)).toBe('8.3k');
    expect(compact(42)).toBe('42');
    expect(compact(0.25, { unit: 'percent-decimal', decimalPlaces: 0 })).toBe('25%');
  });
});

describe('labelWidth', () => {
  it('is about 6.4px a character and 14 more', () => {
    expect(labelWidth('Parking $8.3k')).toBe(98);
  });
});
