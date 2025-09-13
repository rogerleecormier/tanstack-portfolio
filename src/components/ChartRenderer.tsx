import React from 'react';
import UnifiedChartRenderer from './UnifiedChartRenderer';

interface ChartRendererProps {
  node: {
    attrs: {
      chartType: string;
      data: string;
      chartTitle?: string;
      xAxisLabel?: string;
      yAxisLabel?: string;
      width?: string;
      height?: string;
    };
  };
}

const ChartRenderer: React.FC<ChartRendererProps> = ({ node }) => {
  const { attrs } = node;

  return (
    <UnifiedChartRenderer
      chartType={attrs.chartType}
      data={attrs.data}
      {...(attrs.chartTitle && { chartTitle: attrs.chartTitle })}
      {...(attrs.xAxisLabel && { xAxisLabel: attrs.xAxisLabel })}
      {...(attrs.yAxisLabel && { yAxisLabel: attrs.yAxisLabel })}
      {...(attrs.width && { width: attrs.width })}
      {...(attrs.height && { height: attrs.height })}
    />
  );
};

export default ChartRenderer;
