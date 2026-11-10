import type { FormatOptions } from '@perses-dev/components';
import type { PanelProps } from '@perses-dev/plugin-system';
import type { TimeSeriesData } from '@perses-dev/spec';

/** A flow from one node to another, as much as the last value of the series named `series`. */
export interface SankeyLink {
  from: string;
  to: string;
  series: string;
}

export interface PulzrSankeyPanelOptions {
  links: SankeyLink[];
  /** Values in labels and tooltips; labels compact currency and decimals, `$8.3k`. */
  format?: FormatOptions;
  /** A color per node name, any CSS color. The others take the theme's series colors in turn. */
  colors?: Record<string, string>;
}

export type PulzrSankeyPanelProps = PanelProps<PulzrSankeyPanelOptions, TimeSeriesData>;
