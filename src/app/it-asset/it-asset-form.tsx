"use client";

import { useState, useEffect, useMemo } from "react";
import { ITAsset, ITAssetFormData } from "./types";
import { createITAsset, updateITAsset } from "./it-asset-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

interface ITAssetFormProps {
  asset?: ITAsset;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const KATEGORI_OPTIONS = [
  { value: "Laptop", label: "Laptop", code: "NB" },
  { value: "Storage", label: "Storage", code: "SR" },
  { value: "Printer", label: "Printer", code: "PR" },
  { value: "Dokumentasi", label: "Dokumentasi", code: "DKV" },
  { value: "Other", label: "Other", code: "OT" },
];

// Helper function to get category code
const getCategoryCode = (kategori: string): string => {
  const option = KATEGORI_OPTIONS.find(opt => opt.value === kategori);
  return option?.code || "";
};

// Helper function to generate asset number prefix
const generateAssetPrefix = (kategori: string, date: Date | string): string => {
  const categoryCode = getCategoryCode(kategori);
  if (!categoryCode) return "";
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = String(dateObj.getFullYear()).slice(-2);
  
  return `LMA.1B/IT-${categoryCode}/${month}.${year}/`;
};

export function ITAssetForm({ asset, onSuccess, onCancel }: ITAssetFormProps) {
  const [loading, setLoading] = useState(false);
  const [assetNumberSuffix, setAssetNumberSuffix] = useState("");
  const [isManualInput, setIsManualInput] = useState(false); // Local state, not saved to DB
  const [formData, setFormData] = useState<ITAssetFormData>({
    nama: asset?.nama || "",
    pic: asset?.pic || "",
    serial_number: asset?.serial_number || "",
    tanggal_diterima: asset?.tanggal_diterima
      ? format(new Date(asset.tanggal_diterima), "yyyy-MM-dd")
      : format(new Date(), "yyyy-MM-dd"),
    kategori: asset?.kategori || "",
    nomor_asset: asset?.nomor_asset || "",
    nomor_bast: asset?.nomor_bast || "",
    keterangan: asset?.keterangan || "",
  });

  // Initialize asset number suffix from existing asset
  useEffect(() => {
    if (asset?.nomor_asset) {
      // Extract the suffix from existing asset number
      const parts = asset.nomor_asset.split('/');
      if (parts.length > 0) {
        setAssetNumberSuffix(parts[parts.length - 1]);
      }
    }
  }, [asset]);

  // Generate asset prefix based on kategori and date
  const assetPrefix = useMemo(() => {
    if (!formData.kategori || !formData.tanggal_diterima) return "";
    return generateAssetPrefix(formData.kategori, formData.tanggal_diterima);
  }, [formData.kategori, formData.tanggal_diterima]);

  // Fetch next number when kategori changes (skip if manual input)
  useEffect(() => {
    const fetchNextNumber = async () => {
      if (!formData.kategori || asset || isManualInput) return; // Skip if editing existing asset or manual input

      try {
        const response = await fetch(`/api/it-assets/next-number?kategori=${encodeURIComponent(formData.kategori)}`);
        if (response.ok) {
          const data = await response.json();
          setAssetNumberSuffix(data.nextNumber);
        }
      } catch (error) {
        console.error("Error fetching next number:", error);
        // Set default if error
        setAssetNumberSuffix("001");
      }
    };

    fetchNextNumber();
  }, [formData.kategori, asset, isManualInput]);

  // Update full asset number when prefix or suffix changes (skip if manual input)
  useEffect(() => {
    if (isManualInput) {
      // For manual input, keep as is
      return;
    }
    
    if (assetPrefix && assetNumberSuffix) {
      setFormData(prev => ({
        ...prev,
        nomor_asset: assetPrefix + assetNumberSuffix
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        nomor_asset: ""
      }));
    }
  }, [assetPrefix, assetNumberSuffix, isManualInput]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.nama || !formData.pic || !formData.serial_number || 
          !formData.tanggal_diterima || !formData.kategori || !formData.nomor_asset) {
        toast.error("Please fill in all required fields");
        setLoading(false);
        return;
      }

      if (asset) {
        await updateITAsset(asset.id, formData);
        toast.success("IT asset updated successfully!");
      } else {
        await createITAsset(formData);
        toast.success("IT asset created successfully!");
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error saving IT asset:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to save IT asset";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof ITAssetFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nama */}
        <div className="space-y-2">
          <Label htmlFor="nama">
            Nama <span className="text-red-500">*</span>
          </Label>
          <Input
            id="nama"
            value={formData.nama}
            onChange={(e) => handleChange("nama", e.target.value)}
            placeholder="Masukkan nama asset"
            required
            disabled={loading}
          />
        </div>

        {/* PIC */}
        <div className="space-y-2">
          <Label htmlFor="pic">
            PIC (Person in Charge) <span className="text-red-500">*</span>
          </Label>
          <Input
            id="pic"
            value={formData.pic}
            onChange={(e) => handleChange("pic", e.target.value)}
            placeholder="Masukkan nama PIC"
            required
            disabled={loading}
          />
        </div>

        {/* Kategori - Dropdown */}
        <div className="space-y-2">
          <Label htmlFor="kategori">
            Kategori <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.kategori}
            onValueChange={(value) => handleChange("kategori", value)}
            disabled={loading}
            required
          >
            <SelectTrigger id="kategori">
              <SelectValue placeholder="Pilih kategori" />
            </SelectTrigger>
            <SelectContent>
              {KATEGORI_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Checkbox Manual Input */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2 pt-6">
            <Checkbox
              id="manual_input"
              checked={isManualInput}
              onCheckedChange={(checked) => {
                setIsManualInput(checked as boolean);
                setFormData(prev => ({
                  ...prev,
                  nomor_asset: "" // Reset nomor asset when toggling
                }));
                setAssetNumberSuffix(""); // Reset suffix
              }}
              disabled={loading}
            />
            <Label 
              htmlFor="manual_input" 
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              ASSET HO
            </Label>
          </div>
          <p className="text-xs text-muted-foreground">
            Centang jika asset dari Head Office (nomor diisi manual)
          </p>
        </div>

        {/* Serial Number */}
        <div className="space-y-2">
          <Label htmlFor="serial_number">
            Serial Number <span className="text-red-500">*</span>
          </Label>
          <Input
            id="serial_number"
            value={formData.serial_number}
            onChange={(e) => handleChange("serial_number", e.target.value)}
            placeholder="Masukkan serial number"
            required
            disabled={loading}
          />
        </div>

        {/* Tanggal Diterima */}
        <div className="space-y-2">
          <Label htmlFor="tanggal_diterima">
            Tanggal Diterima <span className="text-red-500">*</span>
          </Label>
          <Input
            id="tanggal_diterima"
            type="date"
            value={formData.tanggal_diterima as string}
            onChange={(e) => handleChange("tanggal_diterima", e.target.value)}
            required
            disabled={loading}
          />
          <p className="text-xs text-muted-foreground">
            Tanggal ini digunakan untuk generate prefix nomor asset
          </p>
        </div>

        {/* Nomor Asset */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="nomor_asset">
            Nomor Asset <span className="text-red-500">*</span>
          </Label>
          
          {isManualInput ? (
            // Manual input for HO asset
            <div>
              <Input
                id="nomor_asset"
                value={formData.nomor_asset}
                onChange={(e) => handleChange("nomor_asset", e.target.value)}
                placeholder="Masukkan nomor asset HO secara manual"
                required
                disabled={loading}
                className="font-mono"
              />
              <p className="text-xs text-amber-600 mt-2">
                ⚠ ASSET HO: Input nomor asset secara manual
              </p>
            </div>
          ) : (
            // Auto-generated with prefix
            <div>
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2">
                  {assetPrefix && (
                    <div className="px-3 py-2 bg-muted rounded-md font-mono text-sm text-muted-foreground border">
                      {assetPrefix}
                    </div>
                  )}
                  <Input
                    id="nomor_asset"
                    value={assetNumberSuffix}
                    onChange={(e) => setAssetNumberSuffix(e.target.value)}
                    placeholder={assetPrefix ? "Auto-generated..." : "Pilih kategori terlebih dahulu"}
                    required
                    disabled={loading || !assetPrefix}
                    className="font-mono"
                  />
                </div>
              </div>
              {formData.nomor_asset && (
                <p className="text-xs text-muted-foreground mt-2">
                  Full nomor: <span className="font-mono font-medium text-green-600">{formData.nomor_asset}</span>
                </p>
              )}
              {assetPrefix && assetNumberSuffix && (
                <p className="text-xs text-blue-600 mt-1">
                  ✓ Nomor otomatis ter-generate dari kategori {formData.kategori} terakhir. Anda bisa edit manual jika perlu.
                </p>
              )}
              {!formData.kategori && (
                <p className="text-xs text-amber-600 mt-2">
                  Pilih kategori dan tanggal diterima untuk generate prefix nomor asset
                </p>
              )}
            </div>
          )}
        </div>

        {/* Nomor BAST */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="nomor_bast">Nomor BAST</Label>
          <Input
            id="nomor_bast"
            value={formData.nomor_bast}
            onChange={(e) => handleChange("nomor_bast", e.target.value)}
            placeholder="Masukkan nomor BAST (opsional)"
            disabled={loading}
          />
        </div>

        {/* Keterangan */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="keterangan">Keterangan</Label>
          <textarea
            id="keterangan"
            value={formData.keterangan}
            onChange={(e) => handleChange("keterangan", e.target.value)}
            placeholder="Masukkan keterangan atau catatan tambahan (opsional)"
            disabled={loading}
            rows={3}
            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {asset ? "Updating..." : "Creating..."}
            </>
          ) : (
            <>{asset ? "Update" : "Create"} IT Asset</>
          )}
        </Button>
      </div>
    </form>
  );
}
