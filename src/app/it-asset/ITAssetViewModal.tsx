"use client";

import { ITAsset } from "./types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";

interface ITAssetViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: ITAsset | null;
}

export function ITAssetViewModal({
  open,
  onOpenChange,
  asset,
}: ITAssetViewModalProps) {
  if (!asset) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>IT Asset Details</DialogTitle>
          <DialogDescription>
            Complete information for asset {asset.nomor_asset}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nomor Asset */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Nomor Asset</p>
              <p className="text-base font-semibold font-mono">{asset.nomor_asset}</p>
            </div>

            {/* Kategori */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Kategori</p>
              <Badge variant="outline" className="text-sm font-normal">
                {asset.kategori}
              </Badge>
            </div>

            {/* Nama */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Nama</p>
              <p className="text-base">{asset.nama}</p>
            </div>

            {/* PIC */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">PIC</p>
              <p className="text-base">{asset.pic}</p>
            </div>

            {/* Serial Number */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Serial Number</p>
              <p className="text-base font-mono text-sm">{asset.serial_number}</p>
            </div>

            {/* Tanggal Diterima */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Tanggal Diterima</p>
              <p className="text-base">
                {format(new Date(asset.tanggal_diterima), "dd MMMM yyyy")}
              </p>
            </div>

            {/* Nomor BAST */}
            <div className="space-y-2 md:col-span-2">
              <p className="text-sm font-medium text-muted-foreground">Nomor BAST</p>
              <p className="text-base">{asset.nomor_bast || "-"}</p>
            </div>

            {/* Keterangan */}
            <div className="space-y-2 md:col-span-2">
              <p className="text-sm font-medium text-muted-foreground">Keterangan</p>
              <p className="text-base whitespace-pre-wrap">{asset.keterangan || "-"}</p>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Created At */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Created At</p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(asset.created_at), "dd MMM yyyy, HH:mm")}
              </p>
            </div>

            {/* Updated At */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(asset.updated_at), "dd MMM yyyy, HH:mm")}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
