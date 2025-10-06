'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Radio } from './types';
import RadioClient from './RadioClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, Radio as RadioIcon, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

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
      <div className="container mx-auto py-10">
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
    );
  }

  return (
    <RadioClient initialRadios={radios} loading={loading} />
  );
}