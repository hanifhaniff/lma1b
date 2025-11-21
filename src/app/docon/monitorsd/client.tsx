"use client";

import { useState, useEffect } from "react";
import { ShopDrawing, ShopDrawingFormData } from "@/lib/types/shop-drawing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { formatDate } from "@/lib/date-utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ShopDrawingForm from "./Form";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ShopDrawingClientProps {
  initialData: ShopDrawing[];
  loading: boolean;
}

export default function ShopDrawingClient({ initialData, loading }: ShopDrawingClientProps) {
  const [shopDrawings, setShopDrawings] = useState<ShopDrawing[]>(initialData);
  const [filteredShopDrawings, setFilteredShopDrawings] = useState<ShopDrawing[]>(initialData);
  const [searchTerm, setSearchTerm] = useState("");
  const [documentTypeFilter, setDocumentTypeFilter] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingShopDrawing, setEditingShopDrawing] = useState<ShopDrawing | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedDrawing, setSelectedDrawing] = useState<ShopDrawing | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Function to refresh data from server
  const refreshData = async () => {
    try {
      const response = await fetch('/api/docon/monitorsd');
      if (response.ok) {
        const data = await response.json();
        setShopDrawings(data);
      } else {
        console.error('Failed to refresh data');
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };

  // Initialize data with initialData and refresh if needed
  useEffect(() => {
    if (initialData.length === 0 && !loading) {
      // If initialData is empty and not loading, try to fetch data
      refreshData();
    }
  }, [initialData, loading]);

  // Filter shop drawings based on search term and document type
  useEffect(() => {
    let result = shopDrawings;

    // Apply search term filter
    if (searchTerm) {
      result = result.filter(drawing =>
        drawing.doc_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        drawing.contract_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        drawing.document_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        drawing.discipline?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        drawing.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        drawing.work_system?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        drawing.serial_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        drawing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (drawing.pic && drawing.pic.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (drawing.doc_type && drawing.doc_type.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply document type filter
    if (documentTypeFilter) {
      result = result.filter(drawing =>
        drawing.document_type?.toLowerCase() === documentTypeFilter.toLowerCase()
      );
    }

    setFilteredShopDrawings(result);
  }, [searchTerm, documentTypeFilter, shopDrawings]);

  const handleCreate = async (data: ShopDrawingFormData) => {
    setSubmitting(true);
    try {
      const response = await fetch('/api/docon/monitorsd', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const newDrawing = await response.json();
        setShopDrawings(prev => [newDrawing, ...prev]);
        setIsFormOpen(false);
        // Refresh data to ensure consistency
        await refreshData();
      } else {
        console.error('Failed to create shop drawing');
      }
    } catch (error) {
      console.error('Error creating shop drawing:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (data: ShopDrawingFormData) => {
    if (!editingShopDrawing) return;
    
    setSubmitting(true);
    try {
      const response = await fetch('/api/docon/monitorsd', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...data, id: editingShopDrawing.id }),
      });

      if (response.ok) {
        const updatedDrawing = await response.json();
        setShopDrawings(prev =>
          prev.map(d => d.id === updatedDrawing.id ? updatedDrawing : d)
        );
        setIsFormOpen(false);
        setEditingShopDrawing(null);
        // Refresh data to ensure consistency
        await refreshData();
      } else {
        console.error('Failed to update shop drawing');
      }
    } catch (error) {
      console.error('Error updating shop drawing:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this shop drawing?")) {
      return;
    }
    
    try {
      const response = await fetch('/api/docon/monitorsd', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        setShopDrawings(prev => prev.filter(d => d.id !== id));
        // Refresh data to ensure consistency
        await refreshData();
      } else {
        console.error('Failed to delete shop drawing');
      }
    } catch (error) {
      console.error('Error deleting shop drawing:', error);
    }
  };

  const handleFormSubmit = (data: ShopDrawingFormData) => {
    if (editingShopDrawing) {
      handleUpdate(data);
    } else {
      handleCreate(data);
    }
  };

  const handleEdit = (drawing: ShopDrawing) => {
    setEditingShopDrawing(drawing);
    setIsFormOpen(true);
  };

  const openDetailsModal = (drawing: ShopDrawing) => {
    setSelectedDrawing(drawing);
    setIsDetailsOpen(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading shop drawings...</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header with search, document type filter and add button */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search shop drawings..."
              className="pl-8 w-full sm:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Document Type Filter */}
          <div className="w-full sm:w-48">
            <select
              value={documentTypeFilter}
              onChange={(e) => setDocumentTypeFilter(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 h-10"
            >
              <option value="">All Document Types</option>
              <option value="AFM">AFM - Approval For Material</option>
              <option value="BAL">BAL - Berita Acara Lapangan</option>
              <option value="BAP">BAP - Berita Acara Pembayaran</option>
              <option value="CAL">CAL - Calculation</option>
              <option value="COM">COM - Commercial</option>
              <option value="DWG">DWG - Drawing</option>
            </select>
          </div>
        </div>

        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingShopDrawing(null);
                setIsFormOpen(true);
              }}
            >
              Add Shop Drawing
            </Button>
          </DialogTrigger>
          <ShopDrawingForm
            isOpen={isFormOpen}
            onClose={() => setIsFormOpen(false)}
            onSubmit={handleFormSubmit}
            submitting={submitting}
          />
        </Dialog>
      </div>

      {/* Data Table */}
      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold text-gray-700">Document Number</TableHead>
                <TableHead className="font-semibold text-gray-700">Title</TableHead>
                <TableHead className="font-semibold text-gray-700">PIC</TableHead>
                <TableHead className="font-semibold text-gray-700">Date Received</TableHead>
                <TableHead className="font-semibold text-gray-700">Rev #</TableHead>
                <TableHead className="font-semibold text-gray-700">Status</TableHead>
                <TableHead className="font-semibold text-gray-700">Qty</TableHead>
                <TableHead className="font-semibold text-gray-700">Transmittal #</TableHead>
                <TableHead className="font-semibold text-gray-700">Delivery</TableHead>
                <TableHead className="font-semibold text-gray-700">Rev Status</TableHead>
                <TableHead className="font-semibold text-gray-700">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredShopDrawings.length > 0 ? (
                filteredShopDrawings.map((drawing) => (
                  <TableRow
                    key={drawing.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <TableCell
                      className="font-mono text-sm cursor-pointer text-blue-600 hover:underline"
                      onClick={() => openDetailsModal(drawing)}
                    >
                      {drawing.doc_number}
                    </TableCell>
                    <TableCell className="max-w-xs truncate" title={drawing.title}>{drawing.title}</TableCell>
                    <TableCell>{drawing.pic || "-"}</TableCell>
                    <TableCell>
                      {formatDate(drawing.doc_received_date)}
                    </TableCell>
                    <TableCell className="text-center">{drawing.revision_number}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                        {drawing.doc_status || "-"}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">{drawing.quantity}</TableCell>
                    <TableCell>{drawing.transmittal_number || "-"}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        drawing.delivery_status === 'Delivered'
                          ? 'bg-green-100 text-green-800'
                          : drawing.delivery_status === 'Pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                      }`}>
                        {drawing.delivery_status || "-"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        drawing.revision_status === 'Approved'
                          ? 'bg-green-100 text-green-800'
                          : drawing.revision_status === 'Pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : drawing.revision_status === 'Rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                      }`}>
                        {drawing.revision_status || "-"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            Actions
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleEdit(drawing)}
                            className="cursor-pointer"
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(drawing.id)}
                            className="cursor-pointer text-red-600"
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-10 text-gray-500">
                    No shop drawings found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Document Details Modal */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Document Details</DialogTitle>
            <DialogDescription>
              Detailed information for the selected document
            </DialogDescription>
          </DialogHeader>
          {selectedDrawing && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Contract Code</p>
                <p className="text-base">{selectedDrawing.contract_code || "-"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Document Type</p>
                <p className="text-base">{selectedDrawing.document_type || "-"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Discipline</p>
                <p className="text-base">{selectedDrawing.discipline || "-"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Location</p>
                <p className="text-base">{selectedDrawing.location || "-"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Work System</p>
                <p className="text-base">{selectedDrawing.work_system || "-"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Serial Number</p>
                <p className="text-base font-mono">{selectedDrawing.serial_number || "-"}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm font-medium text-gray-500">Full Document Number</p>
                <p className="text-base font-mono">{selectedDrawing.doc_number}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm font-medium text-gray-500">Title</p>
                <p className="text-base">{selectedDrawing.title}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">PIC</p>
                <p className="text-base">{selectedDrawing.pic || "-"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Date Received</p>
                <p className="text-base">
                  {formatDate(selectedDrawing.doc_received_date)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Revision #</p>
                <p className="text-base">{selectedDrawing.revision_number}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Document Status</p>
                <p className="text-base">{selectedDrawing.doc_status || "-"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Quantity</p>
                <p className="text-base">{selectedDrawing.quantity}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Transmittal #</p>
                <p className="text-base">{selectedDrawing.transmittal_number || "-"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Delivery Status</p>
                <p className="text-base">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    selectedDrawing.delivery_status === 'Delivered'
                      ? 'bg-green-100 text-green-800'
                      : selectedDrawing.delivery_status === 'Pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedDrawing.delivery_status || "-"}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Revision Status</p>
                <p className="text-base">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    selectedDrawing.revision_status === 'Approved'
                      ? 'bg-green-100 text-green-800'
                      : selectedDrawing.revision_status === 'Pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : selectedDrawing.revision_status === 'Rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedDrawing.revision_status || "-"}
                  </span>
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm font-medium text-gray-500">Notes</p>
                <p className="text-base">{selectedDrawing.notes || "-"}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Form Dialog - Separate from header for better rendering */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <ShopDrawingForm
          shopDrawing={editingShopDrawing || undefined}
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleFormSubmit}
          submitting={submitting}
        />
      </Dialog>
    </div>
  );
}