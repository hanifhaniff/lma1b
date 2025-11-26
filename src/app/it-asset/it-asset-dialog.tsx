"use client";

import { ITAsset } from "./types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ITAssetForm } from "./it-asset-form";

interface ITAssetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset?: ITAsset;
  onSuccess?: () => void;
}

export function ITAssetDialog({
  open,
  onOpenChange,
  asset,
  onSuccess,
}: ITAssetDialogProps) {
  const handleSuccess = () => {
    onOpenChange(false);
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {asset ? "Edit IT Asset" : "Add New IT Asset"}
          </DialogTitle>
          <DialogDescription>
            {asset
              ? "Update the IT asset information below."
              : "Fill in the information to add a new IT asset to the inventory."}
          </DialogDescription>
        </DialogHeader>
        <ITAssetForm
          asset={asset}
          onSuccess={handleSuccess}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
