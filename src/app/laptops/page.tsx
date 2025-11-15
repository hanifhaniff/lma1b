"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { DataTable } from "./data-table";
import { Laptop } from "./laptop-service";
import { deleteLaptop, getLaptops } from "./laptop-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, Laptop as LaptopIcon, Plus, Search, Filter, MoreVertical } from "lucide-react";
import { LaptopDialog } from "./laptop-dialog";
import { ConfirmDialog } from "./confirm-dialog";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function LaptopsPage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const [laptops, setLaptops] = useState<Laptop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for dialogs
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingLaptop, setEditingLaptop] = useState<Laptop | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [laptopToDelete, setLaptopToDelete] = useState<Laptop | null>(null);

  // Load data
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const laptopsData = await getLaptops();

      // The data is already in the correct format from the service
      setLaptops(laptopsData);
    } catch (error: unknown) {
      console.error("Error fetching laptops:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch laptops. Please check that the database table exists.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Action handlers
  const handleEdit = (laptop: Laptop) => {
    setEditingLaptop(laptop);
  };

  const handleDelete = (laptop: Laptop) => {
    setLaptopToDelete(laptop);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!laptopToDelete) return;

    try {
      await deleteLaptop(laptopToDelete.id);
      toast.success("Laptop deleted successfully!");
      setIsDeleteDialogOpen(false);
      setLaptopToDelete(null);
      fetchData(); // Refresh the data after successful deletion
    } catch (error) {
      console.error("Error deleting laptop:", error);
      toast.error("Failed to delete laptop");
    }
  };

  // Action handler for viewing laptops
  const handleView = (laptop: Laptop) => {
    // This will be handled by the DataTable component's internal state
    // We don't need to do anything here as the modal is managed within the DataTable
  };

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchData();
    }
  }, [isLoaded, isSignedIn]);

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
            <LaptopIcon className="h-12 w-12 mx-auto text-gray-400 mb-3" />
            <CardTitle className="text-xl">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Please sign in to access the laptop management system.
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
      <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto py-10">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LaptopIcon className="h-5 w-5" />
                Laptop Management
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Laptop Management</h1>
              <p className="text-muted-foreground">
                Manage your laptop inventory, track users, and monitor BAST numbers.
              </p>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Laptops</p>
                    <p className="text-2xl font-bold mt-1">{laptops.length}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-blue-500/10">
                    <LaptopIcon className="h-6 w-6 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Assigned Laptops</p>
                    <p className="text-2xl font-bold mt-1">
                      {laptops.filter(laptop => laptop.assigned_user).length}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-green-500/10">
                    <LaptopIcon className="h-6 w-6 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Available Laptops</p>
                    <p className="text-2xl font-bold mt-1">
                      {laptops.filter(laptop => !laptop.assigned_user).length}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-yellow-500/10">
                    <LaptopIcon className="h-6 w-6 text-yellow-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CardTitle className="flex items-center gap-2">
                <LaptopIcon className="h-5 w-5 text-blue-500" />
                Laptop Inventory
                <Badge variant="secondary" className="ml-2">{laptops.length}</Badge>
              </CardTitle>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Button onClick={() => setIsAddDialogOpen(true)} className="w-full sm:w-auto">
                  <Plus className="mr-2 h-4 w-4" /> Add Laptop
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
                data={laptops}
                onRefresh={fetchData}
                onEdit={handleEdit}
                onDelete={handleDelete}
                loading={loading}
              />
            </CardContent>
          </Card>

          {/* Add/Edit Laptop Dialog */}
          <LaptopDialog
            open={isAddDialogOpen || !!editingLaptop}
            onOpenChange={(open) => {
              if (!open) {
                setIsAddDialogOpen(false);
                setEditingLaptop(null);
              }
            }}
            laptop={editingLaptop || undefined}
            onSuccess={() => {
              fetchData(); // Refresh data when a laptop is added/updated
            }}
          />

          {/* Delete Confirmation Dialog */}
          <ConfirmDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            title="Delete Laptop"
            description={`Are you sure you want to delete the laptop "${laptopToDelete?.name}"? This action cannot be undone.`}
            onConfirm={confirmDelete}
            confirmText="Delete"
            cancelText="Cancel"
          />
        </div>
      </div>
    </div>
  );
}