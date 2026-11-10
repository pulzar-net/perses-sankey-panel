import type { FormatOptions } from '@perses-dev/components';
import { formatValue } from '@perses-dev/components';
import type { EChartsCoreOption } from 'echarts/core';

import type { Flow, FlowNode } from './flow';
import { compact, labelWidth } from './flow';
import type { PulzrSankeyPanelOptions } from './pulzr-sankey-panel-types';

const escape = (s: string): string => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

interface TooltipParams {
  dataType?: 'node' | 'edge';
  name?: string;
  value?: number;
  data?: { source?: string; target?: string };
}

/**
 * The ECharts option for the flow: nodes 12px thick and 12px apart, in the order given, links
 * shaded from their source's color to their target's, the end nodes labelled outside with their
 * name and compact value, and as much room beside them as the longest label needs, 170px at most.
 */
export function chartOption(
  flow: Flow,
  spec: Pick<PulzrSankeyPanelOptions, 'format'>,
  textColor: string,
): EChartsCoreOption {
  const format: FormatOptions = spec.format ?? { unit: 'decimal' };
  // A node in the middle would sit on its own links; the ends say it already.
  const label = (n: FlowNode): string => (n.side === 'middle' ? '' : `${n.name} ${compact(n.value, format)}`);
  const labels = new Map(flow.nodes.map((n) => [n.name, label(n)]));
  const room = (side: FlowNode['side']): number =>
    Math.min(170, Math.max(0, ...flow.nodes.filter((n) => n.side === side).map((n) => labelWidth(label(n)))));
  const tip = (title: string, value = 0): string =>
    `<div style="font-weight:600">${escape(title)}</div><div>${escape(formatValue(value, format))}</div>`;

  return {
    tooltip: {
      trigger: 'item',
      formatter: (p: TooltipParams) =>
        p.dataType === 'edge'
          ? tip(`${p.data?.source ?? ''} → ${p.data?.target ?? ''}`, p.value)
          : tip(p.name ?? '', p.value),
    },
    series: [
      {
        type: 'sankey',
        top: 8,
        bottom: 8,
        left: room('left'),
        right: room('right'),
        nodeWidth: 12,
        nodeGap: 12,
        nodeAlign: 'justify',
        // Keep the nodes in the order given, as the links declare them.
        layoutIterations: 0,
        draggable: false,
        animation: false,
        data: flow.nodes.map((n) => ({
          name: n.name,
          itemStyle: { color: n.color },
          label: { position: n.side === 'left' ? 'left' : 'right' },
        })),
        links: flow.links,
        itemStyle: { borderWidth: 0, borderRadius: 2 },
        lineStyle: { color: 'gradient', opacity: 0.3, curveness: 0.5 },
        label: {
          fontSize: 11,
          distance: 8,
          color: textColor,
          formatter: (p: { name: string }) => labels.get(p.name) ?? '',
        },
        emphasis: { focus: 'adjacency', lineStyle: { opacity: 0.6 } },
        blur: { itemStyle: { opacity: 0.35 }, lineStyle: { opacity: 0.1 } },
      },
    ],
  };
}
