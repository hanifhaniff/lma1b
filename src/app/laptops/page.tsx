"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { DataTable } from "./data-table";
import { Laptop as LaptopType } from "./types";
import { getLaptops } from "./laptop-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, Laptop as LaptopIcon, Plus } from "lucide-react";
import { LaptopDialog } from "./laptop-dialog";
import { ConfirmDialog } from "./confirm-dialog";
import { toast } from "sonner";

export default function LaptopsPage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const [laptops, setLaptops] = useState<LaptopType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for dialogs
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingLaptop, setEditingLaptop] = useState<LaptopType | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [laptopToDelete, setLaptopToDelete] = useState<LaptopType | null>(null);

  // Load data
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const laptopsData = await getLaptops();
      
      // Convert string dates to Date objects
      const laptopsWithDates = laptopsData.map((laptop) => ({
        ...laptop,
        date_received: new Date(laptop.date_received),
        created_at: new Date(laptop.created_at),
      }));
      setLaptops(laptopsWithDates);
    } catch (error: unknown) {
      console.error("Error fetching laptops:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch laptops. Please check that the database table exists.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Action handlers
  const handleEdit = (laptop: LaptopType) => {
    setEditingLaptop(laptop);
  };

  const handleDelete = (laptop: LaptopType) => {
    setLaptopToDelete(laptop);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!laptopToDelete) return;
    
    try {
      // Assuming there's a deleteLaptop function in laptop-service
      await import('./laptop-service').then(module => {
        module.deleteLaptop(laptopToDelete.id);
      });
      toast.success("Laptop deleted successfully!");
      setIsDeleteDialogOpen(false);
      setLaptopToDelete(null);
      fetchData(); // Refresh the data after successful deletion
    } catch (error) {
      console.error("Error deleting laptop:", error);
      toast.error("Failed to delete laptop");
    }
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <LaptopIcon className="h-12 w-12 mx-auto text-blue-500" />
            <CardTitle className="text-2xl">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
              Please sign in to access the laptop management system.
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

  return (
    <div className="bg-gray-50/50 dark:bg-gray-900/50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Laptop Management</h1>
              <p className="text-muted-foreground mt-1">
                Track and manage company laptops
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                onClick={fetchData} 
                variant="outline" 
                size="sm"
                disabled={loading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                {loading ? "Refreshing..." : "Refresh"}
              </Button>
            </div>
          </div>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="text-red-800 font-medium flex items-center gap-2">
                <span className="text-lg">⚠️</span> Error Loading Data
              </h3>
              <p className="text-red-600 text-sm mt-1">{error}</p>
              <p className="text-red-600 text-sm mt-2">
                Please make sure you have created the &apos;laptops&apos; table in your Supabase database.
              </p>
            </div>
          )}
          
          <Card>
            <CardHeader className="border-b">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <LaptopIcon className="h-5 w-5 text-blue-500" />
                    Asset Inventory
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {loading ? "Loading laptops..." : `Showing ${laptops.length} laptops`}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {!error && <DataTable data={laptops} onRefresh={fetchData} onEdit={handleEdit} onDelete={handleDelete} />}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Add/Edit Laptop Dialog */}
      <LaptopDialog
        open={isAddDialogOpen || !!editingLaptop}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddDialogOpen(false);
            setEditingLaptop(null);
          }
        }}
        laptop={editingLaptop as any || undefined}
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
  );
}