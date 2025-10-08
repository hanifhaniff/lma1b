"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { DataTable } from "./data-table";
import { Laptop } from "./laptop-service";
import { deleteLaptop, getLaptops } from "./laptop-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, Laptop as LaptopIcon, Plus } from "lucide-react";
import { LaptopDialog } from "./laptop-dialog";
import { ConfirmDialog } from "./confirm-dialog";
import { toast } from "sonner";

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
      <div className="container mx-auto py-10">
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
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Laptop Management</h1>
          <p className="text-muted-foreground">
            Manage your laptop inventory, track users, and monitor BAST numbers.
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Laptop
        </Button>
      </div>
      <Card>
        <CardContent className="p-6">
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
  );
}