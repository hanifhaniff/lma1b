"use client";

import { useState, useEffect, useCallback } from "react";
import { ShopDrawing, ShopDrawingFormData } from "@/lib/types/shop-drawing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatDateForInput } from "@/lib/date-utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DialogClose } from "@radix-ui/react-dialog";

const CONTRACT_CODES = [
  { value: "160", label: "160 - Semua Area" },
  { value: "161", label: "161 - Jembatan Loa Hulu" },
  { value: "162", label: "161 - Jembatan Long Jo" },
];

const DOCUMENT_TYPES = [
  { value: "AFM", label: "AFM - Approval For Material" },
  { value: "BAL", label: "BAL - Berita Acara Lapangan" },
  { value: "BAP", label: "BAP - Berita Acara Pembayaran" },
  { value: "CAL", label: "CAL - Calculation" },
  { value: "COM", label: "COM - Commercial" },
  { value: "DWG", label: "DWG - Drawing" },
];

const DISCIPLINES = [
  { value: "ARC", label: "ARC - Architectural Landscaping" },
  { value: "CIV", label: "CIV - Civil" },
  { value: "HYD", label: "HYD - Hydrology" },
  { value: "STR", label: "STR - Structural" },
];

const LOCATIONS = [
  { value: "0", label: "0 - General" },
  { value: "5", label: "5 - Section 1" },
  { value: "7", label: "7 - Section 2" },
];

interface ShopDrawingFormProps {
  shopDrawing?: ShopDrawing;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ShopDrawingFormData) => void;
  submitting: boolean;
}

export default function ShopDrawingForm({
  shopDrawing,
  isOpen,
  onClose,
  onSubmit,
  submitting,
}: ShopDrawingFormProps) {
  const [formData, setFormData] = useState<ShopDrawingFormData>({
    doc_number: "",
    contract_code: "",
    document_type: "",
    discipline: "",
    location: "",
    work_system: "",
    serial_number: "",
    title: "",
    pic: "",
    doc_received_date: "",
    revision_number: 0,
    doc_status: "",
    doc_type: "",
    quantity: 0,
    transmittal_number: "",
    delivery_status: "",
    notes: "",
    original_revision: "",
    revised_to: "",
    revision_status: "",
  });

  useEffect(() => {
    if (shopDrawing) {
      // Extract components from existing doc_number
      const docParts = shopDrawing.doc_number ? shopDrawing.doc_number.split('-') : [];
      const contractCode = docParts[0] || '';
      const docType = docParts[1] || '';
      const discipline = docParts[2] || '';
      let location = '';
      let workSystem = '';
      if (docParts[3]) {
        const locationWorkSystem = docParts[3].split('.');
        location = locationWorkSystem[0] || '';
        workSystem = locationWorkSystem[1] || '';
      }
      const serialNumber = docParts[4] || '';

      setFormData({
        doc_number: shopDrawing.doc_number || "",
        contract_code: contractCode,
        document_type: docType,
        discipline: discipline,
        location: location,
        work_system: workSystem,
        serial_number: serialNumber,
        title: shopDrawing.title || "",
        pic: shopDrawing.pic || "",
        doc_received_date: formatDateForInput(shopDrawing.doc_received_date),
        revision_number: shopDrawing.revision_number !== undefined ? shopDrawing.revision_number : 0,
        doc_status: shopDrawing.doc_status || "",
        doc_type: shopDrawing.doc_type || "",
        quantity: shopDrawing.quantity || 0,
        transmittal_number: shopDrawing.transmittal_number || "",
        delivery_status: shopDrawing.delivery_status || "",
        notes: shopDrawing.notes || "",
        original_revision: shopDrawing.original_revision || "",
        revised_to: shopDrawing.revised_to || "",
        revision_status: shopDrawing.revision_status || "",
      });
    } else {
      // Reset form for new entry
      setFormData({
        doc_number: "",
        contract_code: "",
        document_type: "",
        discipline: "",
        location: "",
        work_system: "",
        serial_number: "", // Don't auto-generate for new entries initially
        title: "",
        pic: "",
        doc_received_date: "",
        revision_number: 0,
        doc_status: "",
        doc_type: "",
        quantity: 0,
        transmittal_number: "",
        delivery_status: "",
        notes: "",
        original_revision: "",
        revised_to: "",
        revision_status: "",
      });
    }
  }, [shopDrawing, isOpen]);

  // Update doc_number whenever component fields change
  useEffect(() => {
    // If serial_number is empty and required components are selected, auto-generate it
    let finalSerialNumber = formData.serial_number;
    if (!formData.serial_number && formData.contract_code && formData.document_type && formData.discipline && formData.location) {
      // Generate a unique serial number based on the combination of other components
      // In a real implementation, you would query the database to find the next available number
      // For now, we'll default to '001' when empty and components are selected
      finalSerialNumber = '001';
    }

    // Always update doc_number based on current values, including revision number at the end
    const newDocNumber = `${formData.contract_code || ''}-${formData.document_type || ''}-${formData.discipline || ''}-${formData.location || ''}.${formData.work_system || ''}-${finalSerialNumber || ''}-${formData.revision_number || 0}`;
    setFormData(prev => ({
      ...prev,
      doc_number: newDocNumber,
      serial_number: finalSerialNumber // Ensure serial number is set to the generated value if needed
    }));
  }, [formData.contract_code, formData.document_type, formData.discipline, formData.location, formData.work_system, formData.serial_number, formData.revision_number]);

  // Debounced function to regenerate serial number when key components change
  const regenerateSerialNumber = useCallback(async () => {
    if (!shopDrawing && formData.contract_code && formData.document_type && formData.discipline && formData.location && formData.work_system) {
      const nextSerial = await getNextSerialNumber();
      setFormData(prev => ({
        ...prev,
        serial_number: nextSerial,
        doc_number: `${prev.contract_code || ''}-${prev.document_type || ''}-${prev.discipline || ''}-${prev.location || ''}.${prev.work_system || ''}-${nextSerial}-${prev.revision_number || 0}`
      }));
    }
  }, [formData.contract_code, formData.document_type, formData.discipline, formData.location, formData.work_system, shopDrawing]);

  // Effect to auto-generate serial number when document components change
  useEffect(() => {
    if (shopDrawing) {
      // When editing existing records, don't auto-generate but maintain the document number structure
      setFormData(prev => ({
        ...prev,
        doc_number: `${prev.contract_code || ''}-${prev.document_type || ''}-${prev.discipline || ''}-${prev.location || ''}.${prev.work_system || ''}-${prev.serial_number || ''}-${prev.revision_number || 0}`
      }));
    } else if (formData.contract_code && formData.document_type && formData.discipline && formData.location && formData.work_system) {
      // For new entries, auto-generate serial number when any key component changes
      if (!formData.serial_number) {
        // First time generating serial number
        const timeoutId = setTimeout(regenerateSerialNumber, 800);
        return () => clearTimeout(timeoutId);
      } else {
        // Check if any key component changed from previous values
        const shouldRegenerate = true; // Always regenerate when components change for new entries
        if (shouldRegenerate) {
          const timeoutId = setTimeout(regenerateSerialNumber, 800);
          return () => clearTimeout(timeoutId);
        } else {
          // Just update the doc_number to reflect any component changes
          setFormData(prev => ({
            ...prev,
            doc_number: `${prev.contract_code || ''}-${prev.document_type || ''}-${prev.discipline || ''}-${prev.location || ''}.${prev.work_system || ''}-${prev.serial_number}-${prev.revision_number || 0}`
          }));
        }
      }
    } else {
      // When components are incomplete for new entries, update doc_number with empty serial
      setFormData(prev => ({
        ...prev,
        doc_number: `${prev.contract_code || ''}-${prev.document_type || ''}-${prev.discipline || ''}-${prev.location || ''}.${prev.work_system || ''}-${prev.serial_number || ''}-${prev.revision_number || 0}`,
        serial_number: '' // Reset serial when components are incomplete
      }));
    }
  }, [formData.contract_code, formData.document_type, formData.discipline, formData.location, formData.work_system, formData.serial_number, formData.revision_number, shopDrawing, regenerateSerialNumber]);

  // Function to get the next available serial number based on document components
  const getNextSerialNumber = async () => {
    if (!formData.contract_code || !formData.document_type || !formData.discipline || !formData.location || !formData.work_system) {
      return '001';
    }

    try {
      // Query the API to find existing documents with the same components and get the next serial number
      const apiUrl = `/api/docon/monitorsd?contract_code=${formData.contract_code}&document_type=${formData.document_type}&discipline=${formData.discipline}&location=${formData.location}&work_system=${formData.work_system || ''}`;
      console.log('Form - Calling API URL:', apiUrl);
      const response = await fetch(apiUrl);

      if (response.ok) {
        const existingDrawings = await response.json();
        console.log('API Response - Existing drawings:', existingDrawings);
        console.log('Form data for comparison:', {
          contract_code: formData.contract_code,
          document_type: formData.document_type,
          discipline: formData.discipline,
          location: formData.location,
          work_system: formData.work_system || ''
        });
        
        if (Array.isArray(existingDrawings) && existingDrawings.length > 0) {
          // Filter existing drawings by the exact same combination including work system
          const sameCombinationDrawings = existingDrawings.filter(drawing =>
            drawing.contract_code === formData.contract_code &&
            drawing.document_type === formData.document_type &&
            drawing.discipline === formData.discipline &&
            drawing.location === formData.location &&
            drawing.work_system === (formData.work_system || '')
          );

          console.log('Same combination drawings (ignoring revision):', sameCombinationDrawings);

          if (sameCombinationDrawings.length > 0) {
            // Find the highest serial number for this exact combination and increment it
            const highestSerial = sameCombinationDrawings.reduce((max, drawing) => {
              const serialNum = drawing.serial_number ? parseInt(drawing.serial_number, 10) : 0;
              return Math.max(max, isNaN(serialNum) ? 0 : serialNum);
            }, 0);

            console.log('Highest serial found:', highestSerial);

            // Increment and pad with zeros to make it 3 digits
            const nextSerial = highestSerial + 1;
            const result = nextSerial.toString().padStart(3, '0');
            console.log('Next serial to return:', result);
            return result;
          } else {
            // No existing drawings with this exact combination, start with 001
            console.log('No same combination drawings found, returning 001');
            return '001';
          }
        } else {
          console.log('No existing drawings found, returning 001');
        }
      }
    } catch (error) {
      console.error('Error fetching existing drawings:', error);
      console.error('API URL:', `/api/docon/monitorsd?contract_code=${formData.contract_code}&document_type=${formData.document_type}&discipline=${formData.discipline}&location=${formData.location}&work_system=${formData.work_system || ''}`);
      // If there's an error, default to '001'
    }

    return '001'; // Default to '001' if no existing drawings found
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'quantity' || name === 'revision_number' ? Number(value) : value,
    }));
  };

  const handleSelectChange = (name: keyof ShopDrawingFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'quantity' || name === 'revision_number' ? Number(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields (excluding serial_number since it's auto-generated)
    if (!formData.contract_code || !formData.document_type || !formData.discipline || !formData.location) {
      alert('Please fill in all required fields: Contract Code, Document Type, Discipline, and Location');
      return;
    }

    // If editing an existing record, use the existing serial number
    if (shopDrawing) {
      const finalDocNumber = `${formData.contract_code}-${formData.document_type}-${formData.discipline}-${formData.location}.${formData.work_system || ''}-${formData.serial_number}-${formData.revision_number || 0}`;
      const finalData = {
        ...formData,
        doc_number: finalDocNumber
      };
      onSubmit(finalData);
    } else {
      // For new records, ensure we use the appropriate serial number based on components
      const serialNumber = formData.serial_number || '001';

      // Ensure doc_number is properly formatted before submitting with revision number
      const finalDocNumber = `${formData.contract_code}-${formData.document_type}-${formData.discipline}-${formData.location}.${formData.work_system || ''}-${serialNumber}-${formData.revision_number || 0}`;
      const finalData = {
        ...formData,
        serial_number: serialNumber, // Ensure we submit the final serial number
        doc_number: finalDocNumber
      };
      onSubmit(finalData);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {shopDrawing ? "Edit Shop Drawing" : "Add New Shop Drawing"}
          </DialogTitle>
          <DialogDescription>
            {shopDrawing
              ? "Update the shop drawing information"
              : "Enter the details for the new shop drawing"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Document Number Section */}
          <div className="border rounded-lg p-6 bg-gray-50">
            <h3 className="font-semibold text-lg mb-4 text-gray-800">Document Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contract_code" className="text-sm font-medium">Contract Code</Label>
                <Select
                  value={formData.contract_code}
                  onValueChange={(value) => handleSelectChange('contract_code', value)}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select Contract Code" />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTRACT_CODES.map((code) => (
                      <SelectItem key={code.value} value={code.value}>
                        {code.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="document_type" className="text-sm font-medium">Document Type</Label>
                <Select
                  value={formData.document_type}
                  onValueChange={(value) => handleSelectChange('document_type', value)}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select Document Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {DOCUMENT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="discipline" className="text-sm font-medium">Discipline</Label>
                <Select
                  value={formData.discipline}
                  onValueChange={(value) => handleSelectChange('discipline', value)}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select Discipline" />
                  </SelectTrigger>
                  <SelectContent>
                    {DISCIPLINES.map((disc) => (
                      <SelectItem key={disc.value} value={disc.value}>
                        {disc.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="text-sm font-medium">Location</Label>
                <Select
                  value={formData.location}
                  onValueChange={(value) => handleSelectChange('location', value)}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select Location" />
                  </SelectTrigger>
                  <SelectContent>
                    {LOCATIONS.map((loc) => (
                      <SelectItem key={loc.value} value={loc.value}>
                        {loc.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="work_system" className="text-sm font-medium">Work System</Label>
                <Input
                  id="work_system"
                  name="work_system"
                  value={formData.work_system}
                  onChange={handleChange}
                  placeholder="Enter Work System"
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="serial_number" className="text-sm font-medium">Serial Number</Label>
                <Input
                  id="serial_number"
                  name="serial_number"
                  value={formData.serial_number}
                  onChange={handleChange}
                  placeholder="Enter Serial Number (auto-generated if empty)"
                  pattern="\d{3}"
                  title="Please enter a 3-digit number (e.g., 001)"
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="revision_number" className="text-sm font-medium">Revisi Ke</Label>
                <Input
                  id="revision_number"
                  name="revision_number"
                  type="number"
                  value={formData.revision_number}
                  onChange={handleChange}
                  min="0"
                  className="h-10"
                />
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <Label htmlFor="doc_number" className="text-sm font-medium">Document Number (Auto-generated)</Label>
              <Input
                id="doc_number"
                name="doc_number"
                value={formData.doc_number}
                onChange={handleChange}
                required
                readOnly
                className="bg-gray-100 font-mono h-10 text-sm"
              />
            </div>
          </div>

          {/* Basic Information Section */}
          <div className="border rounded-lg p-6">
            <h3 className="font-semibold text-lg mb-4 text-gray-800">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">Judul</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pic" className="text-sm font-medium">PIC</Label>
                <Input
                  id="pic"
                  name="pic"
                  value={formData.pic}
                  onChange={handleChange}
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="doc_received_date" className="text-sm font-medium">Tanggal Penerimaan Dokumen</Label>
                <Input
                  id="doc_received_date"
                  name="doc_received_date"
                  type="date"
                  value={formData.doc_received_date}
                  onChange={handleChange}
                  className="h-10"
                />
              </div>


              <div className="space-y-2">
                <Label htmlFor="doc_status" className="text-sm font-medium">Status Dokumen</Label>
                <Input
                  id="doc_status"
                  name="doc_status"
                  value={formData.doc_status}
                  onChange={handleChange}
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="doc_type" className="text-sm font-medium">Tipe Dokumen</Label>
                <Input
                  id="doc_type"
                  name="doc_type"
                  value={formData.doc_type}
                  onChange={handleChange}
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity" className="text-sm font-medium">Jumlah</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={handleChange}
                  min="0"
                  className="h-10"
                />
              </div>
            </div>
          </div>

          {/* Additional Information Section */}
          <div className="border rounded-lg p-6">
            <h3 className="font-semibold text-lg mb-4 text-gray-800">Additional Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="transmittal_number" className="text-sm font-medium">Nomor Transmittal</Label>
                <Input
                  id="transmittal_number"
                  name="transmittal_number"
                  value={formData.transmittal_number}
                  onChange={handleChange}
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="delivery_status" className="text-sm font-medium">Status Pengiriman</Label>
                <Input
                  id="delivery_status"
                  name="delivery_status"
                  value={formData.delivery_status}
                  onChange={handleChange}
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="original_revision" className="text-sm font-medium">Revisi Semula</Label>
                <Input
                  id="original_revision"
                  name="original_revision"
                  value={formData.original_revision}
                  onChange={handleChange}
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="revised_to" className="text-sm font-medium">Revisi Menjadi</Label>
                <Input
                  id="revised_to"
                  name="revised_to"
                  value={formData.revised_to}
                  onChange={handleChange}
                  className="h-10"
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="revision_status" className="text-sm font-medium">Status Revisi</Label>
                <Input
                  id="revision_status"
                  name="revision_status"
                  value={formData.revision_status}
                  onChange={handleChange}
                  className="h-10"
                />
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium">Keterangan</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="min-h-[100px]"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Submitting..." : shopDrawing ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}