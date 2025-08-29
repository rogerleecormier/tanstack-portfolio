import React from "react";
import { NodeViewWrapper } from "@tiptap/react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { logger } from "@/utils/logger";

interface ChartRendererProps {
  node: {
    attrs: {
      chartType: string;
      data: string;
      xAxisLabel?: string;
      yAxisLabel?: string;
      width?: string;
      height?: string;
    };
  };
}

interface ChartDataPoint {
  [key: string]: string | number | undefined;
}

const ChartRenderer: React.FC<ChartRendererProps> = ({ node }) => {
  const { chartType, data, xAxisLabel, yAxisLabel } = node.attrs;

  logger.debug("ChartRenderer called with:", { chartType, data });

  // Parse chart data from string or use as-is if already parsed
  const parseChartData = (dataInput: string | unknown[]): ChartDataPoint[] => {
    if (Array.isArray(dataInput)) {
      return dataInput as ChartDataPoint[];
    }
    if (typeof dataInput === 'string') {
      try {
        return JSON.parse(dataInput);
      } catch (error) {
        logger.error("Failed to parse chart data:", error);
        return [];
      }
    }
    return [];
  };

  const chartData = parseChartData(data);

  if (!chartData || chartData.length === 0) {
    return (
      <NodeViewWrapper className="my-4">
        <div className="p-4 text-center text-gray-500 border border-gray-200 rounded-lg">
          Invalid chart data
        </div>
      </NodeViewWrapper>
    );
  }

  // Dynamic data key detection and label generation
  const getChartKeys = (data: ChartDataPoint[]) => {
    if (!data || data.length === 0) return { xKey: 'category', yKeys: ['value'] };
    
    const keys = Object.keys(data[0]);
    if (keys.length === 0) return { xKey: 'category', yKeys: ['value'] };
    
    // First key is typically the X-axis (category, date, etc.)
    const xKey = keys[0];
    // All other keys are Y-axis values (series)
    const yKeys = keys.slice(1);
    
    return { xKey, yKeys };
  };

  const generateLabels = (xKey: string, yKeys: string[]) => {
    // Use provided labels or generate meaningful ones
    const xLabel = xAxisLabel || (() => {
      const key = xKey.toLowerCase();
      if (key.includes('budget') || key.includes('tier')) return 'Budget Tier';
      if (key.includes('date') || key.includes('time') || key.includes('period')) return 'Date/Time';
      if (key.includes('category') || key.includes('group')) return 'Category';
      return xKey.charAt(0).toUpperCase() + xKey.slice(1);
    })();

    const yLabel = yAxisLabel || (() => {
      if (yKeys.length === 1) {
        const key = yKeys[0].toLowerCase();
        if (key.includes('count')) return 'Count';
        if (key.includes('value') || key.includes('amount')) return 'Value';
        if (key.includes('complexity') || key.includes('score')) return 'Complexity Score';
        if (key.includes('gap')) return 'Complexity Gap';
        return yKeys[0].charAt(0).toUpperCase() + yKeys[0].slice(1);
      }
      return 'Value';
    })();

    return { xLabel, yLabel };
  };

  const { xKey, yKeys } = getChartKeys(chartData);
  const { xLabel } = generateLabels(xKey, yKeys);

  // Color palette for multiple series
  const colors = ["#0d9488", "#0891b2", "#7c3aed", "#dc2626", "#059669", "#f59e0b"];

  // Calculate Y-axis domain with padding
  const getYDomain = (data: ChartDataPoint[], keys: string[]) => {
    if (!data || data.length === 0) return [0, 100];
    
    const allValues = data.flatMap(d => 
      keys.map(k => Number(d[k])).filter(v => !isNaN(v))
    );
    
    if (allValues.length === 0) return [0, 100];
    
    const min = Math.min(...allValues);
    const max = Math.max(...allValues);
    const padding = Math.max(1, (max - min) * 0.1);
    
    return [Math.max(0, min - padding), max + padding];
  };

  const yDomain = getYDomain(chartData, yKeys);

  // Generate chart configuration for shadcn charts
  const generateChartConfig = () => {
    const config: Record<string, { label: string; color: string }> = {};
    
    // Add X-axis key
    config[xKey] = {
      label: xLabel,
      color: colors[0]
    };
    
    // Add Y-axis keys
    yKeys.forEach((key, index) => {
      config[key] = {
        label: key.charAt(0).toUpperCase() + key.slice(1),
        color: colors[index % colors.length]
      };
    });
    
    return config;
  };

  const chartConfig = generateChartConfig();

  const renderChart = () => {
    switch (chartType) {
      case "barchart":
        return (
          <div className="my-6 p-4 rounded-lg w-full h-80 border border-gray-200 bg-white">
            <ChartContainer config={chartConfig} className="w-full h-full">
              <BarChart data={chartData} margin={{ left: 20, right: 20, bottom: 50, top: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey={xKey}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  domain={yDomain}
                  tickLine={false}
                  axisLine={false}
                />
                <ChartTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <ChartTooltipContent
                          active={active}
                          payload={payload}
                          className="bg-white border border-gray-200 shadow-lg"
                        />
                      );
                    }
                    return null;
                  }}
                />
                <ChartLegend
                  content={({ payload }) => (
                    <ChartLegendContent
                      payload={payload}
                      className="justify-start"
                    />
                  )}
                />
                {yKeys.map((key, index) => (
                  <Bar 
                    key={key}
                    dataKey={key} 
                    fill={colors[index % colors.length]}
                    radius={[4, 4, 0, 0]}
                  />
                ))}
              </BarChart>
            </ChartContainer>
          </div>
        );

      case "linechart":
        return (
          <div className="my-6 p-4 rounded-lg w-full h-80 border border-gray-200 bg-white">
            <ChartContainer config={chartConfig} className="w-full h-full">
              <LineChart data={chartData} margin={{ left: 20, right: 20, bottom: 50, top: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey={xKey}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  domain={yDomain}
                  tickLine={false}
                  axisLine={false}
                />
                <ChartTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <ChartTooltipContent
                          active={active}
                          payload={payload}
                          className="bg-white border border-gray-200 shadow-lg"
                        />
                      );
                    }
                    return null;
                  }}
                />
                <ChartLegend
                  content={({ payload }) => (
                    <ChartLegendContent
                      payload={payload}
                      className="justify-start"
                    />
                  )}
                />
                {yKeys.map((key, index) => (
                  <Line 
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={colors[index % colors.length]}
                    strokeWidth={2}
                    dot={{ fill: colors[index % colors.length], r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                ))}
              </LineChart>
            </ChartContainer>
          </div>
        );

      case "scatterplot":
        return (
          <div className="my-6 p-4 rounded-lg w-full h-80 border border-gray-200 bg-white">
            <ChartContainer config={chartConfig} className="w-full h-full">
              <ScatterChart data={chartData} margin={{ left: 20, right: 20, bottom: 50, top: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey={xKey}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  domain={yDomain}
                  tickLine={false}
                  axisLine={false}
                />
                <ChartTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <ChartTooltipContent
                          active={active}
                          payload={payload}
                          className="bg-white border border-gray-200 shadow-lg"
                        />
                      );
                    }
                    return null;
                  }}
                />
                <ChartLegend
                  content={({ payload }) => (
                    <ChartLegendContent
                      payload={payload}
                      className="justify-start"
                    />
                  )}
                />
                {yKeys.map((key, index) => (
                  <Scatter 
                    key={key}
                    dataKey={key} 
                    fill={colors[index % colors.length]}
                    r={6}
                  />
                ))}
              </ScatterChart>
            </ChartContainer>
          </div>
        );

      case "histogram":
        return (
          <div className="my-6 p-4 rounded-lg w-full h-80 border border-gray-200 bg-white">
            <ChartContainer config={chartConfig} className="w-full h-full">
              <BarChart data={chartData} margin={{ left: 20, right: 20, bottom: 50, top: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey={xKey}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  domain={yDomain}
                  tickLine={false}
                  axisLine={false}
                />
                <ChartTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <ChartTooltipContent
                          active={active}
                          payload={payload}
                          className="bg-white border border-gray-200 shadow-lg"
                        />
                      );
                    }
                    return null;
                  }}
                />
                <ChartLegend
                  content={({ payload }) => (
                    <ChartLegendContent
                      payload={payload}
                      className="justify-start"
                    />
                  )}
                />
                {yKeys.map((key, index) => (
                  <Bar 
                    key={key}
                    dataKey={key} 
                    fill={colors[index % colors.length]}
                    radius={[4, 4, 0, 0]}
                  />
                ))}
              </BarChart>
            </ChartContainer>
          </div>
        );

      default:
        return (
          <div className="p-4 text-center text-gray-500 border border-gray-200 rounded-lg">
            Unsupported chart type: {chartType}
          </div>
        );
    }
  };

  return (
    <NodeViewWrapper className="my-4 mb-6">
      {renderChart()}
    </NodeViewWrapper>
  );
};

export default ChartRenderer;
