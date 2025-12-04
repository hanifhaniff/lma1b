"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { DataTable } from "./data-table";
import { ITAsset } from "./types";
import { deleteITAsset, getITAssets } from "./it-asset-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, Package, Plus, Laptop, HardDrive, Printer, FileText } from "lucide-react";
import { ITAssetDialog } from "./it-asset-dialog";
import { ConfirmDialog } from "./confirm-dialog";
import { ITAssetViewModal } from "./ITAssetViewModal";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { createColumns } from "./columns";

export default function ITAssetPage() {
  const { user, loading: authLoading } = useAuth();
  const [assets, setAssets] = useState<ITAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for dialogs
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<ITAsset | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<ITAsset | null>(null);
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

  // Action handlers
  const handleEdit = (asset: ITAsset) => {
    setEditingAsset(asset);
  };

  const handleDelete = (asset: ITAsset) => {
    setAssetToDelete(asset);
    setIsDeleteDialogOpen(true);
  };

  const handleView = (asset: ITAsset) => {
    setViewingAsset(asset);
    setIsViewModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!assetToDelete) return;

    try {
      await deleteITAsset(assetToDelete.id);
      toast.success("IT asset deleted successfully!");
      setIsDeleteDialogOpen(false);
      setAssetToDelete(null);
      fetchData();
    } catch (error) {
      console.error("Error deleting IT asset:", error);
      toast.error("Failed to delete IT asset");
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  // Stats calculations
  const totalAssets = assets.length;
  const laptopCount = assets.filter(a => a.kategori === "Laptop").length;
  const storageCount = assets.filter(a => a.kategori === "Storage").length;
  const printerCount = assets.filter(a => a.kategori === "Printer").length;
  const dokumentasiCount = assets.filter(a => a.kategori === "Dokumentasi").length;

  const columns = createColumns(handleEdit, handleDelete, handleView);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-500" />
          <p className="text-gray-600 dark:text-gray-400 mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <Package className="h-12 w-12 mx-auto text-gray-400 mb-3" />
            <CardTitle className="text-xl">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Please sign in to access the IT asset management system.
            </p>
            <Button
              onClick={() => window.location.href = '/sign-in'}
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
      <div className="max-w-7xl mx-auto py-10">
        <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                IT Asset Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-10">
                <p className="text-red-500 mb-4">{error}</p>
                <Button onClick={fetchData} variant="outline" disabled={loading}>
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Retry
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">IT Asset Management</h1>
              <p className="text-muted-foreground">
                Manage your IT asset inventory with detailed tracking.
              </p>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Assets</p>
                    <p className="text-2xl font-bold mt-1">{totalAssets}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-blue-500/10">
                    <Package className="h-6 w-6 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Laptops</p>
                    <p className="text-2xl font-bold mt-1">{laptopCount}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-green-500/10">
                    <Laptop className="h-6 w-6 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Storage</p>
                    <p className="text-2xl font-bold mt-1">{storageCount}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-yellow-500/10">
                    <HardDrive className="h-6 w-6 text-yellow-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Printers</p>
                    <p className="text-2xl font-bold mt-1">{printerCount}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-purple-500/10">
                    <Printer className="h-6 w-6 text-purple-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Dokumentasi</p>
                    <p className="text-2xl font-bold mt-1">{dokumentasiCount}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-red-500/10">
                    <FileText className="h-6 w-6 text-red-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-500" />
                IT Asset Inventory
                <Badge variant="secondary" className="ml-2">{totalAssets}</Badge>
              </CardTitle>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Button onClick={() => setIsAddDialogOpen(true)} className="w-full sm:w-auto">
                  <Plus className="mr-2 h-4 w-4" /> Add IT Asset
                </Button>
                <Button
                  onClick={fetchData}
                  variant="outline"
                  disabled={loading}
                  className="w-full sm:w-auto"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Refreshing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Refresh
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={assets}
                loading={loading}
              />
            </CardContent>
          </Card>

          {/* Add/Edit IT Asset Dialog */}
          <ITAssetDialog
            open={isAddDialogOpen || !!editingAsset}
            onOpenChange={(open) => {
              if (!open) {
                setIsAddDialogOpen(false);
                setEditingAsset(null);
              }
            }}
            asset={editingAsset || undefined}
            onSuccess={() => {
              fetchData();
            }}
          />

          {/* View IT Asset Modal */}
          <ITAssetViewModal
            open={isViewModalOpen}
            onOpenChange={setIsViewModalOpen}
            asset={viewingAsset}
          />

          {/* Delete Confirmation Dialog */}
          <ConfirmDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            title="Delete IT Asset"
            description={`Are you sure you want to delete the asset "${assetToDelete?.nama}" (${assetToDelete?.nomor_asset})? This action cannot be undone.`}
            onConfirm={confirmDelete}
            confirmText="Delete"
            cancelText="Cancel"
          />
        </div>
    </div>
  );
}
