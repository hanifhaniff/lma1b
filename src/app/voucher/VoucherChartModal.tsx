"use client";

import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface Voucher {
  voucherCode: string;
  status: string;
  packageName: string;
  firstName: string;
  comment: string;
  usedQuota: number;
  userGroupId?: string | number;
  maxClients?: number;
  currentClients?: number;
}

interface VoucherChartModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  vouchers: Voucher[];
}

export function VoucherChartModal({
  isOpen,
  onOpenChange,
  vouchers,
}: VoucherChartModalProps) {
  // Define the specific filters for OFFICE and NON OFFICE
  const userGroupFilters = [
    { id: 'All', name: 'All User Groups' },
    { id: '372545', name: 'OFFICE' },
    { id: '373468', name: 'NON OFFICE' },
  ];

  // State to track selected filter
  const [selectedFilter, setSelectedFilter] = useState<string>('All');

  // Filter and sort vouchers based on selected filter
  const filteredVouchers = selectedFilter === 'All'
    ? vouchers
    : vouchers.filter(voucher =>
        voucher.userGroupId !== undefined &&
        voucher.userGroupId !== null &&
        voucher.userGroupId.toString() === selectedFilter
      );

  // Sort vouchers by usedQuota in descending order and get top 10
  const topVouchers = filteredVouchers
    .filter(voucher => 
      voucher.usedQuota !== undefined && 
      voucher.usedQuota !== null && 
      typeof voucher.usedQuota === 'number' // Ensure it's a number
    )
    .sort((a, b) => b.usedQuota - a.usedQuota)
    .slice(0, 15);

  const chartData = topVouchers.map((v) => ({
    name: v.firstName || v.voucherCode,
    quota: v.usedQuota,
    packageName: v.packageName,
    voucherCode: v.voucherCode,
    userGroupId: v.userGroupId,
  }));

  const chartConfig = {
    quota: {
      label: "Used Quota (MB)",
      color: "#2563eb",
    },
  };

  // Debug logging to help identify issues
  console.log('VoucherChartModal - Total vouchers:', vouchers.length);
  console.log('VoucherChartModal - Selected filter:', selectedFilter);
  console.log('VoucherChartModal - Filtered vouchers:', filteredVouchers.length);
  console.log('VoucherChartModal - Top vouchers:', topVouchers.length);
  
  // Log specific user group counts for debugging
  if (selectedFilter === 'All') {
    const officeCount = vouchers.filter(v => v.userGroupId && v.userGroupId.toString() === '372545').length;
    const nonOfficeCount = vouchers.filter(v => v.userGroupId && v.userGroupId.toString() === '373468').length;
    console.log('VoucherChartModal - OFFICE vouchers count:', officeCount);
    console.log('VoucherChartModal - NON OFFICE vouchers count:', nonOfficeCount);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] w-[95%] max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Top 10 Vouchers by Quota Usage</DialogTitle>
          <DialogDescription>
            Top 10 Pemakaian Voc
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Card>
            <CardContent>
              <div className="mb-4">
                <label className="text-sm font-medium mb-2 block">Filter by User Group</label>
                <Select 
                  value={selectedFilter} 
                  onValueChange={(value) => setSelectedFilter(value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select User Group" />
                  </SelectTrigger>
                  <SelectContent>
                    {userGroupFilters.map((filter) => (
                      <SelectItem key={filter.id} value={filter.id}>
                        {filter.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {topVouchers.length > 0 ? (
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                  <BarChart
                    data={chartData}
                    margin={{
                      top: 20,
                      right: 5,
                      left: 0,
                      bottom: 25, // Reduced bottom margin for longer labels
                    }}
                    barSize={25} // Set a slightly larger bar width
                    barGap={0} // Reduce the gap between bars to make them closer
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="name"
                      tickLine={false}
                      tickMargin={5}
                      axisLine={false}
                      angle={-45}
                      textAnchor="end"
                      height={50}
                      tick={{ fontSize: 10 }}
                    />
                    <YAxis
                      tickFormatter={(value) => `${value} MB`}
                      tick={{ fontSize: 10 }}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<CustomTooltip />}
                    />
                    <Bar
                      dataKey="quota"
                      fill="var(--color-quota)"
                      radius={[2, 2, 0, 0]}
                      maxBarSize={30} // Set a maximum bar width to ensure they don't get too large
                    />
                  </BarChart>
                </ChartContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-[300px] text-center">
                  <p className="text-muted-foreground">No data available to display</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {selectedFilter === 'All' 
                      ? 'There are no vouchers with quota usage data to show in the chart' 
                      : `No vouchers found for the selected user group: ${selectedFilter === '372545' ? 'OFFICE' : selectedFilter === '373468' ? 'NON OFFICE' : selectedFilter}`}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Custom tooltip component for more detailed information
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-background border p-3 rounded-md shadow-md">
        <p className="font-medium">{label}</p>
        <p className="text-sm text-muted-foreground">Package: {data.packageName}</p>
        <p className="text-primary font-semibold">
          Used Quota: <span className="font-mono">{data.quota} MB</span>
        </p>
      </div>
    );
  }
  return null;
};
