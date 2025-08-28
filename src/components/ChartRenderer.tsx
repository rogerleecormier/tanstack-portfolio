import React from "react";
import { NodeViewWrapper } from "@tiptap/react";
// Shadcn chart components
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
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
  ResponsiveContainer,
  Tooltip,
} from "recharts";

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
  const { chartType, data, xAxisLabel, yAxisLabel, width = '100%', height = '320px' } = node.attrs;

  console.log("ChartRenderer called with:", { chartType, data });

  // Chart configuration for Shadcn components
  const chartConfig = {
    value: {
      label: "Value",
      color: "#0d9488", // teal-600
    },
    date: {
      label: "Date",
      color: "#0891b2", // blue-600
    },
  };

  const parseChartData = (dataString: string) => {
    try {
      return JSON.parse(dataString);
    } catch (error) {
      console.error("Failed to parse chart data:", error);
      return [];
    }
  };

  const chartData = parseChartData(data);

  // Convert height string to number for ResponsiveContainer
  const parseHeight = (heightStr: string): number => {
    if (heightStr.endsWith('px')) {
      return parseInt(heightStr.replace('px', ''), 10);
    }
    // Default to 320 if no valid height
    return 320;
  };

  const chartHeight = parseHeight(height);

  if (!chartData || chartData.length === 0) {
    return (
      <NodeViewWrapper className="my-4">
        <div className="p-4 text-center text-gray-500 border border-gray-200 rounded-lg">
          Invalid chart data
        </div>
      </NodeViewWrapper>
    );
  }

  const renderChart = () => {
    switch (chartType) {
                    case "barchart":
         return (
           <div className="my-6 brand-card p-4 rounded-lg" style={{ width, height: chartHeight }}>
             {/* Shadcn Chart Implementation */}
                           <ChartContainer config={chartConfig} className="w-full" style={{ height: chartHeight }}>
                <BarChart
                  data={chartData}
                  margin={{ left: 0, right: 0, bottom: 50 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e6fffa" />
                  <XAxis
                    dataKey="date"
                    label={
                      xAxisLabel
                        ? { value: xAxisLabel, position: "bottom", offset: 5 }
                        : undefined
                    }
                  />
                 <YAxis
                   label={
                     yAxisLabel
                       ? {
                           value: yAxisLabel,
                           angle: -90,
                           position: "left",
                           offset: -10,
                         }
                       : undefined
                   }
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

             {/* Original Recharts Implementation (commented out for potential reversion)
             <ResponsiveContainer width="100%" height={chartHeight}>
               <BarChart
                 data={chartData}
                 margin={{ left: 0, right: 0, bottom: 25 }}
               >
                 <CartesianGrid strokeDasharray="3 3" stroke="#e6fffa" />
                 <XAxis
                   dataKey="date"
                   label={
                     xAxisLabel
                       ? { value: xAxisLabel, position: "bottom", offset: 10 }
                       : undefined
                   }
                 />
                 <YAxis
                   label={
                     yAxisLabel
                       ? {
                           value: yAxisLabel,
                           angle: -90,
                           position: "left",
                           offset: -10,
                         }
                       : undefined
                   }
                 />
                 <Tooltip />
                 <Bar dataKey="value" fill="#0d9488" />
               </BarChart>
             </ResponsiveContainer>
             */}
           </div>
         );

                                                                                                                                                                                                                               case "linechart":
             // Get all keys except 'date' for multiple series
             const seriesKeys = Object.keys(chartData[0] || {}).filter(
               (key) => key !== "date"
             );

                                                                       return (
                 <div className="my-6 brand-card p-4 rounded-lg" style={{ width, height: chartHeight }}>
                   {/* Shadcn Chart Implementation */}
                                       <ChartContainer config={chartConfig} className="w-full" style={{ height: chartHeight }}>
                      <LineChart
                        data={chartData}
                        margin={{ left: 20, right: 20, bottom: 50 }}
                      >
                 <CartesianGrid strokeDasharray="3 3" stroke="#e6fffa" />
                 <XAxis
                   dataKey="date"
                   label={
                     xAxisLabel
                       ? { value: xAxisLabel, position: "bottom", offset: 5 }
                       : undefined
                   }
                 />
                <YAxis
                  label={
                    yAxisLabel
                      ? {
                          value: yAxisLabel,
                          angle: -90,
                          position: "left",
                          offset: -10,
                        }
                      : undefined
                  }
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
                   strokeWidth={2}
                   dot={{ fill: index === 0 ? "#0d9488" : "#0891b2" }}
                 />
                              ))}
                                          </LineChart>
                   </ChartContainer>

                   {/* Original Recharts Implementation (commented out for potential reversion)
                   <ResponsiveContainer width="100%" height={chartHeight}>
                     <LineChart
                       data={chartData}
                       margin={{ left: 20, right: 20, bottom: 40 }}
                     >
                <CartesianGrid strokeDasharray="3 3" stroke="#e6fffa" />
                <XAxis
                  dataKey="date"
                  label={
                    xAxisLabel
                      ? { value: xAxisLabel, position: "bottom", offset: 10 }
                      : undefined
                  }
                />
                <YAxis
                  label={
                    yAxisLabel
                      ? {
                          value: yAxisLabel,
                          angle: -90,
                          position: "left",
                          offset: -10,
                        }
                      : undefined
                  }
                />
                <Tooltip />
               {seriesKeys.map((key, index) => (
                 <Line
                   key={key}
                   type="monotone"
                   dataKey={key}
                   stroke={index === 0 ? "#0d9488" : "#0891b2"}
                   strokeWidth={2}
                   dot={{ fill: index === 0 ? "#0d9488" : "#0891b2" }}
                 />
                              ))}
                                          </LineChart>
              </ResponsiveContainer>
                   */}
            </div>
          );

                                                                                                                                                                                                                                                                                                                                                                                                                                                              case "scatterplot":
                        return (
                 <div className="my-6 brand-card p-4 rounded-lg" style={{ width, height: chartHeight }}>
                  {/* Shadcn Chart Implementation */}
                                     <ChartContainer config={chartConfig} className="w-full" style={{ height: chartHeight }}>
                    <ScatterChart
                      data={chartData}
                      margin={{ left: 20, right: 20, bottom: 50 }}
                    >
                <CartesianGrid strokeDasharray="3 3" stroke="#e6fffa" />
                <XAxis
                  dataKey="x"
                  label={
                    xAxisLabel
                      ? { value: xAxisLabel, position: "bottom", offset: 5 }
                      : undefined
                  }
                />
                              <YAxis
                  dataKey="y"
                  label={
                    yAxisLabel
                      ? {
                          value: yAxisLabel,
                          angle: -90,
                          position: "left",
                          offset: -10,
                        }
                      : undefined
                  }
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

                 {/* Original Recharts Implementation (commented out for potential reversion)
                 <ResponsiveContainer width="100%" height={chartHeight}>
                   <ScatterChart
                     data={chartData}
                     margin={{ left: 20, right: 20, bottom: 40 }}
                   >
               <CartesianGrid strokeDasharray="3 3" stroke="#e6fffa" />
               <XAxis
                 dataKey="x"
                 label={
                   xAxisLabel
                     ? { value: xAxisLabel, position: "bottom", offset: 10 }
                     : undefined
                 }
               />
                              <YAxis
                  dataKey="y"
                  label={
                    yAxisLabel
                      ? {
                          value: yAxisLabel,
                          angle: -90,
                          position: "left",
                          offset: -10,
                        }
                      : undefined
                  }
                />
                <Tooltip />
                                                           <Scatter dataKey="y" fill="#0d9488" />
             </ScatterChart>
             </ResponsiveContainer>
                 */}
           </div>
         );

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              case "histogram":
               return (
                 <div className="my-6 brand-card p-4 rounded-lg" style={{ width, height: chartHeight }}>
                  {/* Shadcn Chart Implementation */}
                                     <ChartContainer config={chartConfig} className="w-full" style={{ height: chartHeight }}>
                    <BarChart
                      data={chartData}
                      margin={{ left: 20, right: 20, bottom: 50 }}
                    >
                <CartesianGrid strokeDasharray="3 3" stroke="#e6fffa" />
                <XAxis
                  dataKey="date"
                  label={
                    xAxisLabel
                      ? { value: xAxisLabel, position: "bottom", offset: 5 }
                      : undefined
                  }
                />
               <YAxis
                 label={
                   yAxisLabel
                     ? {
                         value: yAxisLabel,
                         angle: -90,
                         position: "left",
                         offset: -10,
                       }
                     : undefined
                 }
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

                 {/* Original Recharts Implementation (commented out for potential reversion)
                 <ResponsiveContainer width="100%" height={chartHeight}>
                   <BarChart
                     data={chartData}
                     margin={{ left: 20, right: 20, bottom: 40 }}
                 >
               <CartesianGrid strokeDasharray="3 3" stroke="#e6fffa" />
               <XAxis
                 dataKey="date"
                 label={
                   xAxisLabel
                     ? { value: xAxisLabel, position: "bottom", offset: 10 }
                     : undefined
                 }
               />
               <YAxis
                 label={
                   yAxisLabel
                     ? {
                         value: yAxisLabel,
                         angle: -90,
                         position: "left",
                         offset: -10,
                       }
                     : undefined
                 }
               />
                              <Tooltip />
                                                            <Bar dataKey="value" fill="#0d9488" />
             </BarChart>
               </ResponsiveContainer>
                 */}
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
