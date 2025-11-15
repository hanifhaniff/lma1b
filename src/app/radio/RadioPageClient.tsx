'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Radio } from './types';
import RadioClient from './RadioClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, Radio as RadioIcon, Plus, Signal, User, Hash, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

interface RadioPageClientProps {
  initialRadios: Radio[];
}

export default function RadioPageClient({ initialRadios }: RadioPageClientProps) {
  const { user, isLoaded, isSignedIn } = useUser();
  const [radios, setRadios] = useState<Radio[]>(initialRadios);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load data
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Use the server action directly
      const response = await fetch('/api/radios');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      const radiosData = await response.json();
      setRadios(radiosData);
    } catch (error: unknown) {
      console.error('Error fetching radios:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch radios. Please check that the database table exists.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      // Data is already loaded from server component
      setRadios(initialRadios);
    }
  }, [isLoaded, isSignedIn, initialRadios]);

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
            <RadioIcon className="h-12 w-12 mx-auto text-gray-400 mb-3" />
            <CardTitle className="text-xl">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Please sign in to access the radio management system.
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
                <RadioIcon className="h-5 w-5" />
                Radio Management
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
  const totalRadios = radios.length;
  const assignedRadios = radios.filter(radio => radio.user_radio).length;
  const unassignedRadios = totalRadios - assignedRadios;

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Radio Management</h1>
              <p className="text-muted-foreground">
                Manage your radio inventory, track users, and monitor assignments.
              </p>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Radios</p>
                    <p className="text-2xl font-bold mt-1">{totalRadios}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-blue-500/10">
                    <RadioIcon className="h-6 w-6 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Assigned Radios</p>
                    <p className="text-2xl font-bold mt-1">{assignedRadios}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-green-500/10">
                    <User className="h-6 w-6 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Available Radios</p>
                    <p className="text-2xl font-bold mt-1">{unassignedRadios}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-yellow-500/10">
                    <Signal className="h-6 w-6 text-yellow-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <RadioClient initialRadios={radios} loading={loading} />
        </div>
      </div>
    </div>
  );
}