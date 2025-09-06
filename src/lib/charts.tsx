import { BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartData } from '../schemas/chart';

interface ChartRendererProps {
  data: ChartData;
}

export function ChartRenderer({ data }: ChartRendererProps) {
  const { type, data: chartData, xKey, yKeys } = data;

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return (
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xKey} />
            <YAxis />
            <Tooltip />
            {yKeys.map((key, index) => (
              <Bar key={key} dataKey={key} fill={`hsl(${index * 60}, 70%, 50%)`} />
            ))}
          </BarChart>
        );
      case 'line':
        return (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xKey} />
            <YAxis />
            <Tooltip />
            {yKeys.map((key, index) => (
              <Line key={key} type="monotone" dataKey={key} stroke={`hsl(${index * 60}, 70%, 50%)`} />
            ))}
          </LineChart>
        );
      case 'area':
        return (
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xKey} />
            <YAxis />
            <Tooltip />
            {yKeys.map((key, index) => (
              <Area key={key} type="monotone" dataKey={key} stackId="1" stroke={`hsl(${index * 60}, 70%, 50%)`} fill={`hsl(${index * 60}, 70%, 50%)`} />
            ))}
          </AreaChart>
        );
      default:
        return <div>Unsupported chart type: {type}</div>;
    }
  };

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
}
