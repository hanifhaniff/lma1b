"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Laptop } from "./laptop-service";
import { format } from "date-fns";
import { X } from "lucide-react";

interface LaptopViewModalProps {
  laptop: Laptop;
  onClose?: () => void;
}

export function LaptopViewModal({ laptop, onClose }: LaptopViewModalProps) {
  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <Dialog open={true} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl">Laptop Details</DialogTitle>
          </div>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Name</h3>
              <p className="text-lg font-semibold">{laptop.name}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Serial Number</h3>
              <p className="font-mono">{laptop.serial_number}</p>
            </div>
            
            {laptop.asset_number && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Asset Number</h3>
                <p className="font-mono">{laptop.asset_number}</p>
              </div>
            )}
            
            {laptop.model_type && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Model Type</h3>
                <p>{laptop.model_type}</p>
              </div>
            )}
            
            {laptop.no_bast && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">No. BAST</h3>
                <p className="font-mono">{laptop.no_bast}</p>
              </div>
            )}
          </div>
          
          {/* Right Column */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Assigned User</h3>
              {laptop.assigned_user ? (
                <Badge variant="secondary" className="mt-1">
                  {laptop.assigned_user}
                </Badge>
              ) : (
                <Badge variant="outline" className="mt-1">
                  Unassigned
                </Badge>
              )}
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Date Received</h3>
              <p>{format(new Date(laptop.date_received), "MMM dd, yyyy")}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Created At</h3>
              <p>{format(new Date(laptop.created_at), "MMM dd, yyyy")}</p>
            </div>
            
            {laptop.condition && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Condition</h3>
                <Badge variant="outline" className="mt-1">
                  {laptop.condition}
                </Badge>
              </div>
            )}
          </div>
        </div>
        
        {/* Image Section */}
        {laptop.image_url && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Image</h3>
            <div className="border rounded-md overflow-hidden">
              <img
                src={laptop.image_url}
                alt={laptop.name}
                className="w-full h-auto object-cover max-h-64"
              />
            </div>
          </div>
        )}
        
        {/* Notes Section */}
        {laptop.notes && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-500">Notes</h3>
            <div className="mt-1 p-3 bg-gray-50 rounded-md">
              <p className="whitespace-pre-wrap">{laptop.notes}</p>
            </div>
          </div>
        )}
        
        {/* Actions */}
        <div className="flex justify-end mt-6">
          <Button onClick={handleClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}