'use client';

import { useState, useEffect } from 'react';
import VoucherPageClient from './VoucherPageClient';
import { Voucher } from './types';

export default function VoucherPage() {
  const [initialVouchers, setInitialVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        const response = await fetch('/api/vouchers');
        const data = await response.json();
        setInitialVouchers(data);
      } catch (error) {
        console.error('Error fetching vouchers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVouchers();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <VoucherPageClient initialVouchers={initialVouchers} />
  );
}