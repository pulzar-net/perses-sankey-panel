import type { FormatOptions } from '@perses-dev/components';
import { CURRENCY_UNIT_CONFIG, formatValue } from '@perses-dev/components';
import type { TimeSeries, TimeSeriesData } from '@perses-dev/spec';

import type { PulzrSankeyPanelOptions } from './pulzr-sankey-panel-types';

export interface FlowNode {
  name: string;
  /** The larger of what flows in and what flows out. */
  value: number;
  color: string;
  /** `left` has nothing flowing in, `right` nothing flowing out; `middle` has both and goes unlabelled. */
  side: 'left' | 'middle' | 'right';
}

export interface FlowLink {
  source: string;
  target: string;
  value: number;
}

export interface Flow {
  nodes: FlowNode[];
  links: FlowLink[];
}

/** A series' last value that is a number. */
function lastValue(series: TimeSeries): number | undefined {
  for (let i = series.values.length - 1; i >= 0; i--) {
    const v = series.values[i]![1];
    if (v !== null && Number.isFinite(v)) return v;
  }
  return undefined;
}

/**
 * The flow the spec declares, valued from the query: each link is the last value of the series
 * named as its `series` (by formatted name). Series labelled `compare` are left out, so is a link
 * with no value, or zero or less, and so is a node left with no links. Nodes are in the order they
 * first appear; one without a color in `colors` takes the next of `palette`.
 */
export function flowOf(
  results: Array<{ data?: TimeSeriesData }>,
  spec: Pick<PulzrSankeyPanelOptions, 'links' | 'colors'>,
  palette: string[],
): Flow {
  const values = new Map<string, number>();
  for (const series of results.flatMap((r) => r.data?.series ?? [])) {
    if (series.labels?.compare) continue;
    const value = lastValue(series);
    if (value !== undefined) values.set(series.formattedName ?? series.name, value);
  }

  const links: FlowLink[] = [];
  for (const link of spec.links ?? []) {
    const value = values.get(link.series);
    if (value !== undefined && value > 0) links.push({ source: link.from, target: link.to, value });
  }

  const flows = new Map<string, { in: number; out: number }>();
  const at = (name: string): { in: number; out: number } => {
    if (!flows.has(name)) flows.set(name, { in: 0, out: 0 });
    return flows.get(name)!;
  };
  for (const link of links) {
    at(link.source).out += link.value;
    at(link.target).in += link.value;
  }

  let next = 0;
  const nodes = [...flows].map(([name, f]): FlowNode => {
    const color = spec.colors?.[name] ?? palette[next++ % Math.max(1, palette.length)] ?? '#888';
    let side: FlowNode['side'] = 'middle';
    if (f.in === 0) side = 'left';
    else if (f.out === 0) side = 'right';
    return { name, value: Math.max(f.in, f.out), color, side };
  });
  return { nodes, links };
}

/**
 * A value short enough for a label: currency and decimals as `$840`, `$8.3k`, `$12k`;
 * other units as `format` gives them.
 */
export function compact(value: number, format?: FormatOptions): string {
  const unit = format?.unit ?? 'decimal';
  const currency = unit in CURRENCY_UNIT_CONFIG;
  if (!currency && unit !== 'decimal') return formatValue(value, format);
  const as = (v: number, decimalPlaces: number): string =>
    formatValue(
      v,
      currency ? ({ unit, decimalPlaces } as FormatOptions) : { unit: 'decimal', decimalPlaces, shortValues: false },
    );
  const size = Math.abs(value);
  if (size < 1000) return as(Math.round(value), 0);
  return `${as(value / 1000, size >= 10_000 ? 0 : 1)}k`;
}

/** About how wide a label draws at 11px, for the room beside the nodes it needs. */
export function labelWidth(text: string): number {
  return Math.ceil(text.length * 6.4) + 14;
}
