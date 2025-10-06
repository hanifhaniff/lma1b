"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Laptop as ServiceLaptop } from "./laptop-service";
import { Laptop as FormLaptop } from "./types";
import { LaptopForm } from "./laptop-form";
import { createLaptop, updateLaptop } from "./laptop-service";
import { toast } from "sonner";

interface LaptopDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  laptop?: ServiceLaptop | undefined;
  onSuccess: () => void;
}

export function LaptopDialog({ open, onOpenChange, laptop, onSuccess }: LaptopDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      // Convert form data to service format
      const { image_url, date_received, ...laptopData } = data;
      
      const serviceData = {
        ...laptopData,
        image_url: image_url || null,
        // Convert Date to string for API
        date_received: date_received ? date_received.toISOString() : new Date().toISOString(),
        // Ensure required fields are present
        name: laptopData.name || '',
        serial_number: laptopData.serial_number || '',
        // Convert undefined optional fields to null
        assigned_user: laptopData.assigned_user || null,
        asset_number: laptopData.asset_number || null,
        model_type: laptopData.model_type || null,
        no_bast: laptopData.no_bast || null,
        condition: laptopData.condition || null,
        notes: laptopData.notes || null
      };
      
      if (laptop) {
        // Update existing laptop
        await updateLaptop(laptop.id, serviceData);
        toast.success("Laptop updated successfully!");
      } else {
        // Create new laptop
        await createLaptop(serviceData);
        toast.success("Laptop created successfully!");
      }
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving laptop:", error);
      toast.error(`Failed to ${laptop ? 'update' : 'create'} laptop. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to generate a temporary laptop ID for image uploads
  const generateLaptopId = () => {
    return 'temp_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {laptop ? "Edit Laptop" : "Add New Laptop"}
          </DialogTitle>
        </DialogHeader>
        <LaptopForm
          laptop={laptop as unknown as FormLaptop}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}