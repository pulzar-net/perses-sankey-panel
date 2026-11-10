import { Button, Stack, TextField } from '@mui/material';
import { FormatControls, OptionsEditorColumn, OptionsEditorGrid, OptionsEditorGroup } from '@perses-dev/components';
import type { OptionsEditorProps } from '@perses-dev/plugin-system';
import type { ReactElement } from 'react';

import type { PulzrSankeyPanelOptions, SankeyLink } from './pulzr-sankey-panel-types';

export function PulzrSankeyPanelSettingsEditor({
  value,
  onChange,
}: OptionsEditorProps<PulzrSankeyPanelOptions>): ReactElement {
  const links = value.links ?? [];
  const setLink = (i: number, change: Partial<SankeyLink>): void =>
    onChange({ ...value, links: links.map((l, j) => (j === i ? { ...l, ...change } : l)) });
  const names = [...new Set(links.flatMap((l) => [l.from, l.to]).filter(Boolean))];
  const setColor = (name: string, color: string): void => {
    const colors = { ...value.colors };
    if (color.trim()) colors[name] = color;
    else delete colors[name];
    onChange({ ...value, colors: Object.keys(colors).length ? colors : undefined });
  };
  return (
    <OptionsEditorGrid>
      <OptionsEditorColumn>
        <OptionsEditorGroup title="Links">
          {links.map((link, i) => (
            // oxlint-disable-next-line react/no-array-index-key -- rows have no identity but their place
            <Stack key={i} direction="row" gap={1} alignItems="center">
              <TextField
                size="small"
                label="From"
                value={link.from}
                onChange={(e) => setLink(i, { from: e.target.value })}
              />
              <TextField size="small" label="To" value={link.to} onChange={(e) => setLink(i, { to: e.target.value })} />
              <TextField
                size="small"
                label="Series"
                value={link.series}
                onChange={(e) => setLink(i, { series: e.target.value })}
              />
              <Button size="small" onClick={() => onChange({ ...value, links: links.filter((_, j) => j !== i) })}>
                Remove
              </Button>
            </Stack>
          ))}
          <Button
            size="small"
            onClick={() => onChange({ ...value, links: [...links, { from: '', to: '', series: '' }] })}
          >
            Add link
          </Button>
        </OptionsEditorGroup>
      </OptionsEditorColumn>
      <OptionsEditorColumn>
        <OptionsEditorGroup title="Format">
          <FormatControls
            value={value.format ?? { unit: 'decimal' }}
            onChange={(format) => onChange({ ...value, format })}
          />
        </OptionsEditorGroup>
        <OptionsEditorGroup title="Colors">
          {names.map((name) => (
            <TextField
              key={name}
              size="small"
              label={name}
              helperText="Any CSS color. Empty: the next series color."
              value={value.colors?.[name] ?? ''}
              onChange={(e) => setColor(name, e.target.value)}
            />
          ))}
        </OptionsEditorGroup>
      </OptionsEditorColumn>
    </OptionsEditorGrid>
  );
}
