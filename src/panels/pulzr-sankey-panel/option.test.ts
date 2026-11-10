import type { Flow } from './flow';
import { chartOption } from './option';

const flow: Flow = {
  nodes: [
    { name: 'Parking', value: 8312, color: '#2563eb', side: 'left' },
    { name: 'Gross', value: 8312, color: '#64748b', side: 'middle' },
    { name: 'Processor fees', value: 300, color: '#94a3b8', side: 'right' },
    { name: 'Net', value: 8012, color: '#10b981', side: 'right' },
  ],
  links: [
    { source: 'Parking', target: 'Gross', value: 8312 },
    { source: 'Gross', target: 'Processor fees', value: 300 },
    { source: 'Gross', target: 'Net', value: 8012 },
  ],
};
type Sankey = {
  left: number;
  right: number;
  data: Array<{ name: string; itemStyle: { color: string }; label: { position: string } }>;
  label: { formatter: (p: { name: string }) => string };
};
const sankeyOf = (option: ReturnType<typeof chartOption>): Sankey => (option.series as Sankey[])[0]!;

describe('chartOption', () => {
  const option = chartOption(flow, { format: { unit: 'usd' } }, '#666');
  const sankey = sankeyOf(option);

  it('draws the nodes and links as the original did', () => {
    expect(sankey).toMatchObject({
      type: 'sankey',
      top: 8,
      bottom: 8,
      nodeWidth: 12,
      nodeGap: 12,
      itemStyle: { borderRadius: 2 },
      lineStyle: { color: 'gradient', opacity: 0.3 },
      emphasis: { lineStyle: { opacity: 0.6 } },
      blur: { lineStyle: { opacity: 0.1 } },
      label: { fontSize: 11, distance: 8, color: '#666' },
      links: flow.links,
    });
    expect(sankey.data[0]).toEqual({ name: 'Parking', itemStyle: { color: '#2563eb' }, label: { position: 'left' } });
  });

  it('labels the ends outside with name and compact value, the middle not at all', () => {
    expect(sankey.data.map((d) => d.label.position)).toEqual(['left', 'right', 'right', 'right']);
    expect(['Parking', 'Gross', 'Net'].map((name) => sankey.label.formatter({ name }))).toEqual([
      'Parking $8.3k',
      '',
      'Net $8.0k',
    ]);
  });

  it('leaves room for the longest label on each side, 170 at most', () => {
    expect(sankey.left).toBe(98); // 'Parking $8.3k'
    expect(sankey.right).toBe(136); // 'Processor fees $300'
    const long = chartOption(
      { ...flow, nodes: [{ ...flow.nodes[0]!, name: 'x'.repeat(40) }, ...flow.nodes.slice(1)] },
      {},
      '#666',
    );
    expect(sankeyOf(long).left).toBe(170);
  });

  it('says the full value in a tooltip, escaped', () => {
    const formatter = (option.tooltip as { formatter: (p: object) => string }).formatter;
    expect(formatter({ dataType: 'edge', value: 300, data: { source: 'Gross', target: 'Processor fees' } })).toBe(
      '<div style="font-weight:600">Gross → Processor fees</div><div>$300</div>',
    );
    expect(formatter({ dataType: 'node', name: '<b>', value: 1 })).toContain('&#60;b&#62;');
  });
});
