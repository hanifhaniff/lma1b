"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent } from "@/components/ui/card";
import {
  Package,
  Laptop,
  HardDrive,
  Printer,
  FileText,
  Ticket,
  Activity,
  Download,
} from "lucide-react";

// Import services and types
import { getITAssets, ITAsset } from "@/app/it-asset/it-asset-service";

// Locally defined types based on other modules
interface Voucher {
  voucherCode: string;
  status: string;
  usedQuota: number;
}

interface StarlinkUsage {
  id: number;
  tanggal: string;
  unit_starlink: string;
  total_pemakaian: number;
  created_at: string;
  updated_at: string;
}

// Helper function from starlink page to format data size
const formatDataSize = (gbValue: number): string => {
  if (gbValue >= 1000) { // 1000 GB = 1 TB
    return `${(gbValue / 1000).toFixed(2)} TB`;
  } else {
    return `${gbValue.toFixed(2)} GB`;
  }
};

// A reusable summary card component, safe for Tailwind JIT
const InfoCard = ({ title, value, icon: Icon, href, color, loading }: { title: string; value: string | number; icon: React.ComponentType<{ className?: string }>; href: string, color: 'blue' | 'green' | 'yellow' | 'purple' | 'red', loading?: boolean }) => {
  
  const colorVariants = {
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-500' },
    green: { bg: 'bg-green-500/10', text: 'text-green-500' },
    yellow: { bg: 'bg-yellow-500/10', text: 'text-yellow-500' },
    purple: { bg: 'bg-purple-500/10', text: 'text-purple-500' },
    red: { bg: 'bg-red-500/10', text: 'text-red-500' },
  };

  const currentClasses = colorVariants[color];

  return (
    <Link href={href} className="hover:shadow-lg transition-shadow rounded-lg">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{title}</p>
              {loading ? (
                <div className="animate-pulse bg-muted h-8 w-20 rounded-md mt-1"></div>
              ) : (
                <p className="text-2xl font-bold mt-1">{value}</p>
              )}
            </div>
            <div className={`p-3 rounded-lg ${currentClasses.bg}`}>
              <Icon className={`h-6 w-6 ${currentClasses.text}`} />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};


export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  
  // Data states
  const [itAssets, setItAssets] = useState<ITAsset[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [starlinkData, setStarlinkData] = useState<StarlinkUsage[]>([]);

  // Global loading state
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchAllData = async () => {
        setLoading(true);
        try {
          // Import server action for starlink
          const { getStarlinkUsages } = await import('@/app/net-usage/actions');
          
          const [assetsData, vouchersData, starlinkRawData] = await Promise.all([
            getITAssets(),
            fetch('/api/vouchers?listId=6435153').then(res => {
              if (!res.ok) return [];
              return res.json();
            }).catch(() => []),
            getStarlinkUsages().catch(() => []),
          ]);

          setItAssets(assetsData || []);
          setVouchers(Array.isArray(vouchersData) ? vouchersData : []);
          setStarlinkData(starlinkRawData || []);

        } catch (error) {
          console.error("Failed to fetch dashboard data:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchAllData();
    }
  }, [user]);

  // --- Stats Calculations ---
  const itAssetStats = {
    total: itAssets.length,
    laptops: itAssets.filter(a => a.kategori === "Laptop").length,
    storage: itAssets.filter(a => a.kategori === "Storage").length,
    printers: itAssets.filter(a => a.kategori === "Printer").length,
    docs: itAssets.filter(a => a.kategori === "Dokumentasi").length,
  };

  const voucherStats = {
    total: vouchers.length,
    active: vouchers.filter(v => v.status.toLowerCase() === 'active').length,
    used: vouchers.filter(v => v.usedQuota > 0).length,
  };

  const starlinkStats = {
    totalUsage: starlinkData.reduce((sum, item) => sum + (item.total_pemakaian || 0), 0),
    unitCount: new Set(starlinkData.map(item => item.unit_starlink)).size,
    daysWithData: new Set(starlinkData.map(item => item.tanggal.split('T')[0])).size,
  };


  if (authLoading) {
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
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back, {user?.name || user?.username}! Here's a summary of your systems.
        </p>
      </div>

      {/* IT Asset Summary */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold tracking-tight mb-4">IT Asset Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <InfoCard title="Total Assets" value={itAssetStats.total} icon={Package} href="/it-asset" color="blue" loading={loading} />
          <InfoCard title="Laptops" value={itAssetStats.laptops} icon={Laptop} href="/it-asset" color="green" loading={loading} />
          <InfoCard title="Storage" value={itAssetStats.storage} icon={HardDrive} href="/it-asset" color="yellow" loading={loading} />
          <InfoCard title="Printers" value={itAssetStats.printers} icon={Printer} href="/it-asset" color="purple" loading={loading} />
          <InfoCard title="Dokumentasi" value={itAssetStats.docs} icon={FileText} href="/it-asset" color="red" loading={loading} />
        </div>
      </section>

      {/* Voucher Summary */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold tracking-tight mb-4">Voucher Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <InfoCard title="Total Vouchers" value={voucherStats.total} icon={Ticket} href="/voucher" color="blue" loading={loading} />
           <InfoCard title="Active Vouchers" value={voucherStats.active} icon={Activity} href="/voucher" color="green" loading={loading} />
           <InfoCard title="Used Vouchers" value={voucherStats.used} icon={Download} href="/voucher" color="yellow" loading={loading} />
        </div>
      </section>

      {/* Starlink Usage Summary */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold tracking-tight mb-4">Starlink Usage</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Usage Card */}
          <Link href="/net-usage" className="hover:shadow-lg transition-shadow rounded-xl">
            <Card className="shadow-md border-0 bg-gradient-to-br from-blue-50 to-blue-100 h-full">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="rounded-full bg-blue-100 p-3 mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700">Total Pemakaian</h3>
                    {loading ? (
                        <div className="animate-pulse bg-blue-200 h-9 w-24 rounded-md mt-1"></div>
                    ) : (
                      <p className="text-3xl font-bold text-blue-600 mt-1">
                        {formatDataSize(starlinkStats.totalUsage)}
                      </p>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  Total usage across all units.
                </p>
              </CardContent>
            </Card>
          </Link>

          {/* Total Units Card */}
          <Link href="/net-usage" className="hover:shadow-lg transition-shadow rounded-xl">
            <Card className="shadow-md border-0 bg-gradient-to-br from-green-50 to-green-100 h-full">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="rounded-full bg-green-100 p-3 mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700">Jumlah Unit</h3>
                    {loading ? (
                      <div className="animate-pulse bg-green-200 h-9 w-16 rounded-md mt-1"></div>
                    ) : (
                      <p className="text-3xl font-bold text-green-600 mt-1">
                        {starlinkStats.unitCount}
                      </p>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  Total active Starlink units.
                </p>
              </CardContent>
            </Card>
          </Link>

          {/* Days with Data Card */}
          <Link href="/net-usage" className="hover:shadow-lg transition-shadow rounded-xl">
            <Card className="shadow-md border-0 bg-gradient-to-br from-purple-50 to-purple-100 h-full">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="rounded-full bg-purple-100 p-3 mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700">Jumlah Hari</h3>
                     {loading ? (
                      <div className="animate-pulse bg-purple-200 h-9 w-16 rounded-md mt-1"></div>
                    ) : (
                      <p className="text-3xl font-bold text-purple-600 mt-1">
                        {starlinkStats.daysWithData}
                      </p>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  Days with recorded usage data.
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>
    </>
  );
}