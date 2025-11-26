"use client";

import { useState, useEffect } from "react";
import { DataTable } from "./data-table";
import { ITAsset } from "./types";
import { getITAssets } from "./it-asset-service";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RefreshCw, Package, Laptop, HardDrive, Printer, FileText } from "lucide-react";
import { ITAssetViewModal } from "./ITAssetViewModal";
import { Button } from "@/components/ui/button";
import { createColumns } from "./columns";

export default function MonitorAssetPage() {
  const [assets, setAssets] = useState<ITAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewingAsset, setViewingAsset] = useState<ITAsset | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Load data
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const assetsData = await getITAssets();
      setAssets(assetsData);
    } catch (error: unknown) {
      console.error("Error fetching IT assets:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch IT assets. Please check that the database table exists.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (asset: ITAsset) => {
    setViewingAsset(asset);
    setIsViewModalOpen(true);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Stats calculations
  const totalAssets = assets.length;
  const laptopCount = assets.filter(a => a.kategori === "Laptop").length;
  const storageCount = assets.filter(a => a.kategori === "Storage").length;
  const printerCount = assets.filter(a => a.kategori === "Printer").length;
  const dokumentasiCount = assets.filter(a => a.kategori === "Dokumentasi").length;

  const columns = createColumns(handleView);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-500" />
          <p className="text-gray-600 dark:text-gray-400 mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
            <CardDescription>Failed to load IT assets</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchData} variant="outline" className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Monitor Aset IT</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {/* Total Assets */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Aset</p>
                <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">{totalAssets}</p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        {/* Laptop */}
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Laptop</p>
                <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">{laptopCount}</p>
              </div>
              <Laptop className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        {/* Storage */}
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">Storage</p>
                <p className="text-3xl font-bold text-green-700 dark:text-green-300">{storageCount}</p>
              </div>
              <HardDrive className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        {/* Printer */}
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Printer</p>
                <p className="text-3xl font-bold text-orange-700 dark:text-orange-300">{printerCount}</p>
              </div>
              <Printer className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        {/* Dokumentasi */}
        <Card className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 border-pink-200 dark:border-pink-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-pink-600 dark:text-pink-400">Dokumentasi</p>
                <p className="text-3xl font-bold text-pink-700 dark:text-pink-300">{dokumentasiCount}</p>
              </div>
              <FileText className="h-8 w-8 text-pink-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Daftar Aset IT</CardTitle>
            </div>
            <Button onClick={fetchData} variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={assets} loading={loading} />
        </CardContent>
      </Card>

      {/* View Modal */}
      <ITAssetViewModal
        open={isViewModalOpen}
        onOpenChange={setIsViewModalOpen}
        asset={viewingAsset}
      />
    </div>
  );
}
