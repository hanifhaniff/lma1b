'use client';

import { useState, useEffect } from 'react';
import StarlinkUsageChart from '@/components/starlink-usage-chart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Define the data type for when we group by date and unit
interface StarlinkUsageByDateAndUnit {
  tanggal: string;
  [unit: string]: string | number; // Dynamic keys for each unit
}

// Helper function to format data with appropriate units (GB/TB)
const formatDataSize = (gbValue: number): string => {
  if (gbValue >= 1000) { // 1000 GB = 1 TB
    return `${(gbValue / 1000).toFixed(2)} TB`;
  } else {
    return `${gbValue.toFixed(2)} GB`;
  }
};

const StarlinkUsagePage = () => {
  const [data, setData] = useState<StarlinkUsageByDateAndUnit[]>([]);
  const [unitKeys, setUnitKeys] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartType, setChartType] = useState<'line' | 'bar'>('bar'); // Changed to bar as default

  // Get current month as default (YYYY-MM format)
  const getCurrentMonth = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
    return `${year}-${month}`;
  };

  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonth());
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [rawUsageData, setRawUsageData] = useState<any[]>([]);

  // Helper function to get the last day of a month
  const getLastDayOfMonth = (year: number, month: number): number => {
    return new Date(year, month, 0).getDate();
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch available months from the API
        const monthsResponse = await fetch('/api/starlink?groupBy=month');
        let availableMonthsFromApi: string[] = [];
        if (monthsResponse.ok) {
          const monthsData = await monthsResponse.json();
          // Extract unique months from the data
          availableMonthsFromApi = monthsData.map((item: any) => item.month);
        }

        // Use only the months that have actual data
        setAvailableMonths(availableMonthsFromApi.sort());

        // Fetch the raw data for monthly summary calculation
        const rawResponse = await fetch('/api/starlink');
        if (rawResponse.ok) {
          const rawResult = await rawResponse.json();
          setRawUsageData(rawResult);
        }

        let url = '';
        if (selectedMonth) {
          // If a specific month is selected, show daily data for that month
          const [year, month] = selectedMonth.split('-').map(Number);
          const lastDay = getLastDayOfMonth(year, month);
          url = `/api/starlink?groupBy=dateAndUnit&startDate=${selectedMonth}-01&endDate=${selectedMonth}-${lastDay.toString().padStart(2, '0')}`;
        } else {
          // Otherwise, show all daily data
          url = '/api/starlink?groupBy=dateAndUnit';
        }

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const result = await response.json();
        setData(result);

        // Extract the unit keys from the first data point (excluding 'tanggal')
        if (result.length > 0) {
          const keys = Object.keys(result[0]).filter(key => key !== 'tanggal');
          setUnitKeys(keys);
        }
      } catch (err) {
        console.error('Error fetching Starlink usage data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedMonth]);

  if (loading) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Pemakaian Starlink</h1>
          <p>Loading chart data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Pemakaian Starlink</h1>
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Pemakaian Starlink</h1>
      </div>

      {/* Chart Card with Controls */}
      <Card className="mb-8 shadow-lg border-0 bg-white">
        <CardHeader className="border-b border-gray-100 pb-4">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <CardTitle className="text-xl font-semibold">Grafik Pemakaian</CardTitle>
              <CardDescription className="mt-1">
                Visualisasi penggunaan Starlink secara harian
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <label htmlFor="month-filter" className="text-sm font-medium text-gray-700">Filter Bulan:</label>
                <select
                  id="month-filter"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Semua Bulan</option>
                  {availableMonths.map((month) => {
                    const [year, monthNum] = month.split('-');
                    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
                    return (
                      <option key={month} value={month}>
                        {monthNames[parseInt(monthNum, 10) - 1]} {year}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="flex gap-1 bg-gray-100 rounded-md p-1">
                <button
                  className={`px-3 py-1.5 rounded-sm text-sm font-medium transition-colors ${
                    chartType === 'line'
                      ? 'bg-blue-500 text-white shadow-sm'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setChartType('line')}
                >
                  Garis
                </button>
                <button
                  className={`px-3 py-1.5 rounded-sm text-sm font-medium transition-colors ${
                    chartType === 'bar'
                      ? 'bg-blue-500 text-white shadow-sm'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setChartType('bar')}
                >
                  Batang
                </button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="py-6">
          {data.length > 0 ? (
            <StarlinkUsageChart
              data={data}
              chartType={chartType}
              unitKeys={unitKeys}
            />
          ) : (
            <div className="text-center py-12">
              <div className="bg-gray-50 rounded-lg p-8 max-w-md mx-auto">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Belum ada data</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Tidak ada data pemakaian Starlink yang tersedia untuk periode ini.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Cards - Updated to show per unit if data exists */}
      {data.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 justify-items-center">
          <Card className="shadow-md border-0 bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="rounded-full bg-blue-100 p-3 mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">Total Pemakaian</h3>
                  <p className="text-3xl font-bold text-blue-600 mt-1">
                    {formatDataSize(data.reduce((sum, item) => {
                      // Sum all numeric values except 'tanggal' or 'month'
                      const values = Object.values(item).filter(value => typeof value === 'number') as number[];
                      return sum + values.reduce((a, b) => a + b, 0);
                    }, 0))}
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-3">
                {selectedMonth ? `Bulan ${selectedMonth}` : 'Seluruh periode dan unit'}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-md border-0 bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="rounded-full bg-green-100 p-3 mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">Jumlah Unit</h3>
                  <p className="text-3xl font-bold text-green-600 mt-1">
                    {unitKeys.length}
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-3">
                {selectedMonth ? `Bulan ${selectedMonth}` : 'Seluruh periode dan unit'}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-md border-0 bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="rounded-full bg-purple-100 p-3 mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">Jumlah Hari</h3>
                  <p className="text-3xl font-bold text-purple-600 mt-1">
                    {data.length}
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-3">
                {selectedMonth ? `Bulan ${selectedMonth}` : 'Seluruh periode dan unit'}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Total Usage Per Unit - Only show if there's data */}
      {data.length > 0 && unitKeys.length > 0 && (
        <div className="mb-8">
          <Card className="shadow-lg border-0 bg-white">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="text-xl font-semibold">Total Pemakaian per Unit</CardTitle>
              <CardDescription>
                {selectedMonth
                  ? `Menampilkan total penggunaan Starlink untuk setiap unit pada bulan ${selectedMonth}`
                  : 'Menampilkan total penggunaan Starlink untuk setiap unit secara keseluruhan'}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 flex justify-center">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 place-items-center w-full max-w-6xl">
                {unitKeys.map((unit) => {
                  const total = data.reduce((sum, item) => {
                    const value = item[unit];
                    return sum + (typeof value === 'number' ? value : 0);
                  }, 0);

                  // Calculate average daily usage for this unit
                  const averageDaily = data.length > 0 ? total / data.length : 0;

                  return (
                    <div key={unit} className="border border-gray-200 rounded-xl p-5 text-center hover:shadow-md transition-shadow duration-200 bg-white w-full max-w-xs">
                      <div className="mx-auto w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                        </svg>
                      </div>
                      <h4 className="font-semibold text-gray-900 text-lg mb-1">{unit}</h4>
                      <p className="text-2xl font-bold text-blue-600 mb-1">{formatDataSize(total)}</p>
                      <p className="text-sm text-gray-500">Total Pemakaian</p>
                      <p className="text-xs text-gray-400 mt-1">Rata-rata: {formatDataSize(averageDaily)}/hari</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Monthly Usage Summary - Only show if there's data */}
      {rawUsageData.length > 0 && (
        <div>
          <Card className="shadow-lg border-0 bg-white">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="text-xl font-semibold">Ringkasan Pemakaian per Bulan</CardTitle>
              <CardDescription>Menampilkan total penggunaan Starlink untuk bulan-bulan tertentu</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {availableMonths.map((month) => {
                  // Calculate total usage for this specific month
                  const monthData = rawUsageData.filter(item => {
                    const itemDate = new Date(item.tanggal);
                    const [year, monthNum] = month.split('-').map(Number);
                    return itemDate.getFullYear() === year && (itemDate.getMonth() + 1) === monthNum;
                  });

                  const totalForMonth = monthData.reduce((sum, item) => sum + item.total_pemakaian, 0);

                  const [year, monthNum] = month.split('-');
                  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
                  const monthName = monthNames[parseInt(monthNum, 10) - 1];

                  return (
                    <div key={month} className="border border-gray-200 rounded-xl p-5 text-center hover:shadow-md transition-shadow duration-200 bg-white">
                      <div className="mx-auto w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <h4 className="font-semibold text-gray-900 text-lg mb-1">{monthName} {year}</h4>
                      <p className="text-2xl font-bold text-blue-600 mb-1">{formatDataSize(totalForMonth)}</p>
                      <p className="text-sm text-gray-500">Total Pemakaian</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default StarlinkUsagePage;