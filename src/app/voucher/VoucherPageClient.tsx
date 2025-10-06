'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Voucher } from './types';
import { Ticket, RefreshCw } from 'lucide-react';
import VoucherClient from './VoucherClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Format date for display
const formatDate = (dateString: string | null) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Status badge variant
const getStatusVariant = (status: string) => {
  switch (status) {
    case 'aktif':
      return 'default';
    case 'digunakan':
      return 'secondary';
    case 'kadaluarsa':
      return 'destructive';
    default:
      return 'default';
  }
};

interface VoucherPageClientProps {
  initialVouchers: Voucher[];
}

export default function VoucherPageClient({ initialVouchers }: VoucherPageClientProps) {
  const { user, isLoaded, isSignedIn } = useUser();
  const [vouchers, setVouchers] = useState<Voucher[]>(initialVouchers);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load data
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Use the server action directly
      const vouchersData = await fetch('/api/vouchers').then(res => res.json());
      setVouchers(vouchersData);
    } catch (error: unknown) {
      console.error('Error fetching vouchers:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch vouchers. Please check that the database table exists.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      // Data is already loaded from server component
      setVouchers(initialVouchers);
    }
  }, [isLoaded, isSignedIn, initialVouchers]);

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
            <Ticket className="h-12 w-12 mx-auto text-gray-400 mb-3" />
            <CardTitle className="text-xl">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Please sign in to access the voucher management system.
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
              <Ticket className="h-5 w-5" />
              Voucher Management
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
    <VoucherClient initialVouchers={vouchers} loading={loading} />
  );
}