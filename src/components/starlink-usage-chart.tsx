'use client';

import React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface StarlinkUsageData {
  tanggal?: string;
  month?: string;
  [key: string]: number | string | undefined; // Allow dynamic keys for different units
}

interface StarlinkUsageChartProps {
  data: StarlinkUsageData[];
  chartType?: 'line' | 'bar';
  title?: string;
  unitKeys?: string[]; // Keys for different Starlink units
}

const StarlinkUsageChart: React.FC<StarlinkUsageChartProps> = ({
  data,
  chartType = 'bar', // Changed to 'bar' as default
  title = 'Pemakaian Starlink',
  unitKeys = []
}) => {
  // Format dates to be more readable
  const formattedData = data.map(item => {
    if (item.month) {
      // If it's month data, format it as "Month Year"
      const [year, month] = (item.month as string).split('-');
      const monthNames = [
        'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
        'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
      ];
      const monthName = monthNames[parseInt(month, 10) - 1];
      return {
        ...item,
        formatted_period: `${monthName} ${year}`
      };
    } else {
      // If it's date data, format it as before
      return {
        ...item,
        formatted_period: new Date(item.tanggal as string).toLocaleDateString('id-ID', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        })
      };
    }
  });

  const ChartComponent = chartType === 'bar' ? BarChart : LineChart;

  // Colors for different units
  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff00ff'];

  // Determine which key to use for XAxis
  const xAxisDataKey = data.length > 0 && (data[0] as any).month ? 'formatted_period' : 'formatted_period';
  const tooltipLabelFormatter = data.length > 0 && (data[0] as any).month
    ? (label: string) => `Bulan: ${label}`
    : (label: string) => `Tanggal: ${label}`;

  return (
    <div className="w-full h-[400px]">
      <h3 className="text-lg font-semibold mb-4 text-center">{title}</h3>
      <ResponsiveContainer width="100%" height="100%">
        <ChartComponent
          data={formattedData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 50,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="formatted_period"
            angle={-45}
            textAnchor="end"
            height={60}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            label={{
              value: 'Total Pemakaian',
              angle: -90,
              position: 'insideLeft',
              style: { textAnchor: 'middle' }
            }}
          />
          <Tooltip
            formatter={(value, name) => [`${value}`, typeof name === 'string' ? name.replace('_', ' ') : name]}
            labelFormatter={tooltipLabelFormatter}
          />
          <Legend />
          {unitKeys.map((unitKey, index) => {
            if (chartType === 'bar') {
              return (
                <Bar
                  key={unitKey}
                  type="monotone"
                  dataKey={unitKey}
                  stroke={colors[index % colors.length]}
                  fill={colors[index % colors.length]}
                  name={unitKey.replace('_', ' ')}
                  strokeWidth={2}
                />
              );
            } else {
              return (
                <Line
                  key={unitKey}
                  type="monotone"
                  dataKey={unitKey}
                  stroke={colors[index % colors.length]}
                  fill={colors[index % colors.length]}
                  name={unitKey.replace('_', ' ')}
                  strokeWidth={2}
                />
              );
            }
          })}
        </ChartComponent>
      </ResponsiveContainer>
    </div>
  );
};

export default StarlinkUsageChart;