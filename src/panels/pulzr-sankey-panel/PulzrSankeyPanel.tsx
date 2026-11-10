import type { PanelPlugin } from '@perses-dev/plugin-system';

import type { PulzrSankeyPanelOptions, PulzrSankeyPanelProps } from './pulzr-sankey-panel-types';
import { PulzrSankeyPanelComponent } from './PulzrSankeyPanelComponent';
import { PulzrSankeyPanelSettingsEditor } from './PulzrSankeyPanelSettingsEditor';

export const PulzrSankeyPanel: PanelPlugin<PulzrSankeyPanelOptions, PulzrSankeyPanelProps> = {
  PanelComponent: PulzrSankeyPanelComponent,
  panelOptionsEditorComponents: [{ label: 'Settings', content: PulzrSankeyPanelSettingsEditor }],
  supportedQueryTypes: ['TimeSeriesQuery'],
  createInitialOptions: () => ({ links: [] }),
};
