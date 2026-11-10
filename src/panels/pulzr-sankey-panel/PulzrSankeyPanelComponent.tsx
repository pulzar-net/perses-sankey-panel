import { Stack, Typography, useTheme } from '@mui/material';
import { EChart, useChartsTheme } from '@perses-dev/components';
import { SankeyChart } from 'echarts/charts';
import { TooltipComponent } from 'echarts/components';
import { use as registerECharts } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import type { ReactElement } from 'react';
import { useMemo } from 'react';

import { flowOf } from './flow';
import { chartOption } from './option';
import type { PulzrSankeyPanelProps } from './pulzr-sankey-panel-types';

registerECharts([SankeyChart, TooltipComponent, CanvasRenderer]);

/** How amounts flow from where they came from to where they went. */
export function PulzrSankeyPanelComponent({
  queryResults,
  spec,
  contentDimensions,
}: PulzrSankeyPanelProps): ReactElement {
  const theme = useTheme();
  const chartsTheme = useChartsTheme();
  const palette = chartsTheme.echartsTheme.color;
  const colors = useMemo(
    () => (Array.isArray(palette) ? palette.filter((c): c is string => typeof c === 'string') : []),
    [palette],
  );
  const flow = useMemo(() => flowOf(queryResults, spec, colors), [queryResults, spec, colors]);
  const option = useMemo(
    () => chartOption(flow, spec, theme.palette.text.secondary),
    [flow, spec, theme.palette.text.secondary],
  );

  if (flow.links.length === 0) {
    return (
      <Stack height="100%" alignItems="center" justifyContent="center">
        <Typography color="text.secondary">No data</Typography>
      </Stack>
    );
  }
  return (
    <EChart
      option={option}
      theme={chartsTheme.echartsTheme}
      sx={{ width: contentDimensions?.width ?? '100%', height: contentDimensions?.height ?? '100%' }}
    />
  );
}
