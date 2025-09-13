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
      chartTitle={attrs.chartTitle}
      xAxisLabel={attrs.xAxisLabel}
      yAxisLabel={attrs.yAxisLabel}
      width={attrs.width}
      height={attrs.height}
    />
  );
};

export default ChartRenderer;
