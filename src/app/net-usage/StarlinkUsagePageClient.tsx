'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { StarlinkUsage } from './types';
import StarlinkUsageClient from './StarlinkUsageClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, Network, Plus, Activity, Hash, BarChart3, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface StarlinkUsagePageClientProps {
  initialUsages: StarlinkUsage[];
}

export default function StarlinkUsagePageClient({ initialUsages }: StarlinkUsagePageClientProps) {
  const { user, isLoaded, isSignedIn } = useUser();
  const [usages, setUsages] = useState<StarlinkUsage[]>(initialUsages);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load data
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Use the server action directly
      const response = await fetch('/api/starlink');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      const usagesData = await response.json();
      setUsages(usagesData);
    } catch (error: unknown) {
      console.error('Error fetching starlink usage records:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch starlink usage records. Please check that the database table exists.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      // Data is already loaded from server component
      setUsages(initialUsages);
    }
  }, [isLoaded, isSignedIn, initialUsages]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-500" />
          <p className="text-gray-600 dark:text-gray-400 mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <Network className="h-12 w-12 mx-auto text-gray-400 mb-3" />
            <CardTitle className="text-xl">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Please sign in to access the starlink usage management system.
            </p>
            <Button
              onClick={() => window.location.href = '/'}
              className="w-full"
            >
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto py-10">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5" />
                Starlink Usage Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-10">
                <p className="text-red-500 mb-4">{error}</p>
                <Button onClick={fetchData} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Calculate stats
  const totalRecords = usages.length;
  const totalPemakaian = usages.reduce((sum, usage) => sum + usage.total_pemakaian, 0);
  const averagePemakaian = totalRecords > 0 ? totalPemakaian / totalRecords : 0;
  const uniqueUnits = new Set(usages.map(usage => usage.unit_starlink)).size;

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Starlink Network Usage</h1>
              <p className="text-muted-foreground">
                Monitor and manage starlink usage data across different units.
              </p>
            </div>
          </div>
          {/* Additional Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-blue-500/10">
                    <TrendingUp className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Average Usage</p>
                    <p className="text-xl font-bold">{averagePemakaian.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <StarlinkUsageClient initialUsages={usages} loading={loading} />
        </div>
      </div>
    </div>
  );
}