import React from "react";
import { NodeViewWrapper } from "@tiptap/react";
// Shadcn chart components
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart";
// Recharts components (keeping for potential reversion)
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  Scatter,
  ScatterChart,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
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

const ChartRenderer: React.FC<ChartRendererProps> = ({ node }) => {
  const { chartType, data, xAxisLabel, yAxisLabel } = node.attrs;

  // Use logger instead of console.log
  logger.debug("ChartRenderer called with:", { chartType, data });

  // Enhanced chart configuration that always provides meaningful labels
  const getChartConfig = () => {
    const baseConfig = {
      value: {
        label: "Value",
        color: "#0d9488",
      },
      date: {
        label: xAxisLabel || "Date",
      },
      x: {
        label: xAxisLabel || "X Axis",
      },
      y: {
        label: yAxisLabel || "Y Axis",
      },
    };

    // Add dynamic series keys for line charts
    if (chartType === "linechart" && Array.isArray(data)) {
      try {
        const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
        if (parsedData.length > 0) {
          const seriesKeys = Object.keys(parsedData[0] || {}).filter(
            (key) => key !== "date"
          );
          
          seriesKeys.forEach((key, index) => {
            baseConfig[key] = {
              label: key.charAt(0).toUpperCase() + key.slice(1), // Capitalize first letter
              color: index === 0 ? "#0d9488" : "#0891b2",
            };
          });
        }
      } catch (error) {
        logger.warn("Failed to parse data for dynamic series labels:", error);
      }
    }

    return baseConfig;
  };

  const chartConfig = getChartConfig();

  // Handle data that might be a string or already parsed
  const parseChartData = (dataInput: string | unknown[]) => {
    if (Array.isArray(dataInput)) {
      return dataInput;
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

  // Helper function to get default labels based on chart type and data
  const getDefaultLabels = () => {
    const defaultXLabel = xAxisLabel || (chartType === "scatterplot" ? "X Value" : "Date");
    const defaultYLabel = yAxisLabel || (chartType === "scatterplot" ? "Y Value" : "Value");
    
    return { defaultXLabel, defaultYLabel };
  };

  const { defaultXLabel, defaultYLabel } = getDefaultLabels();

  const renderChart = () => {
    switch (chartType) {
      case "barchart":
        return (
          <div className="my-6 brand-card p-4 rounded-lg w-full h-80">
            <ChartContainer config={chartConfig} className="w-full h-full !aspect-auto">
              <BarChart
                data={chartData}
                margin={{ left: 20, right: 20, bottom: 50 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e6fffa" />
                <XAxis
                  dataKey="date"
                  label={{
                    value: defaultXLabel,
                    position: "bottom",
                    offset: 5,
                  }}
                />
                <YAxis
                  label={{
                    value: defaultYLabel,
                    angle: -90,
                    position: "left",
                    offset: -10,
                  }}
                />
                <ChartTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <ChartTooltipContent
                          active={active}
                          payload={payload}
                          className="bg-white brand-border-primary shadow-lg"
                        />
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="value" fill="#0d9488" />
              </BarChart>
            </ChartContainer>
          </div>
        );

      case "linechart": {
        // Get all keys except 'date' for multiple series
        const seriesKeys = Object.keys(chartData[0] || {}).filter(
          (key) => key !== "date"
        );

        return (
          <div className="my-6 brand-card p-4 rounded-lg w-full h-80">
            <ChartContainer config={chartConfig} className="w-full h-full !aspect-auto">
              <LineChart
                data={chartData}
                margin={{ left: 20, right: 20, bottom: 50 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e6fffa" />
                <XAxis
                  dataKey="date"
                  label={{
                    value: defaultXLabel,
                    position: "bottom",
                    offset: 5,
                  }}
                />
                <YAxis
                  label={{
                    value: defaultYLabel,
                    angle: -90,
                    position: "left",
                    offset: -10,
                  }}
                />
                <ChartTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <ChartTooltipContent
                          active={active}
                          payload={payload}
                          className="bg-white brand-border-primary shadow-lg"
                        />
                      );
                    }
                    return null;
                  }}
                />
                {seriesKeys.map((key, index) => (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={index === 0 ? "#0d9488" : "#0891b2"}
                    dot={{ fill: index === 0 ? "#0d9488" : "#0891b2" }}
                  />
                ))}
              </LineChart>
            </ChartContainer>
          </div>
        );
      }

      case "scatterplot":
        return (
          <div className="my-6 brand-card p-4 rounded-lg w-full h-80">
            <ChartContainer config={chartConfig} className="w-full h-full !aspect-auto">
              <ScatterChart
                data={chartData}
                margin={{ left: 20, right: 20, bottom: 50 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e6fffa" />
                <XAxis
                  dataKey="x"
                  label={{
                    value: defaultXLabel,
                    position: "bottom",
                    offset: 5,
                  }}
                />
                <YAxis
                  dataKey="y"
                  label={{
                    value: defaultYLabel,
                    angle: -90,
                    position: "left",
                    offset: -10,
                  }}
                />
                <ChartTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <ChartTooltipContent
                          active={active}
                          payload={payload}
                          className="bg-white brand-border-primary shadow-lg"
                        />
                      );
                    }
                    return null;
                  }}
                />
                <Scatter dataKey="y" fill="#0d9488" />
              </ScatterChart>
            </ChartContainer>
          </div>
        );

      case "histogram":
        return (
          <div className="my-6 brand-card p-4 rounded-lg w-full h-80">
            <ChartContainer config={chartConfig} className="w-full h-full !aspect-auto">
              <BarChart
                data={chartData}
                margin={{ left: 20, right: 20, bottom: 50 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e6fffa" />
                <XAxis
                  dataKey="date"
                  label={{
                    value: defaultXLabel,
                    position: "bottom",
                    offset: 5,
                  }}
                />
                <YAxis
                  label={{
                    value: defaultYLabel,
                    angle: -90,
                    position: "left",
                    offset: -10,
                  }}
                />
                <ChartTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <ChartTooltipContent
                          active={active}
                          payload={payload}
                          className="bg-white brand-border-primary shadow-lg"
                        />
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="value" fill="#0d9488" />
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
