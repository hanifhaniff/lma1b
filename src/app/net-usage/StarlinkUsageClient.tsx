'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { deleteStarlinkUsage } from './actions';
import { StarlinkUsage } from './types';
import StarlinkUsageForm from './StarlinkUsageForm';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from './confirm-dialog';
import { SuccessDialog } from './success-dialog';
import { Search, MoreHorizontal, Plus, Edit, Trash2, ChevronLeft, ChevronRight, RefreshCw, Network, Activity } from 'lucide-react';

// Format date for display
const formatDate = (dateString: string | null) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Group usage data by date
const groupByDate = (usages: StarlinkUsage[]) => {
  const grouped = new Map<string, StarlinkUsage[]>();

  usages.forEach(usage => {
    const dateKey = usage.tanggal; // Use the date string as the key
    if (!grouped.has(dateKey)) {
      grouped.set(dateKey, []);
    }
    grouped.get(dateKey)!.push(usage);
  });

  // Sort groups by date (newest first)
  return new Map([...grouped.entries()].sort((a, b) =>
    new Date(b[0]).getTime() - new Date(a[0]).getTime()
  ));
};

interface StarlinkUsageClientProps {
  initialUsages: StarlinkUsage[];
  loading: boolean;
}

export default function StarlinkUsageClient({ initialUsages, loading }: StarlinkUsageClientProps) {
  const [usages, setUsages] = useState<StarlinkUsage[]>(initialUsages);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentUsage, setCurrentUsage] = useState<StarlinkUsage | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsages, setFilteredUsages] = useState<StarlinkUsage[]>(initialUsages);
  const [groupedUsages, setGroupedUsages] = useState<Map<string, StarlinkUsage[]>>(groupByDate(initialUsages));

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Default 10 items per page

  // Dialog states
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [usageToDelete, setUsageToDelete] = useState<StarlinkUsage | null>(null);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [successTitle, setSuccessTitle] = useState('');

  const fetchUsageData = async (term: string) => {
    const trimmedTerm = term.trim();
    const searchQuery = trimmedTerm ? `?search=${encodeURIComponent(trimmedTerm)}` : '';
    const response = await fetch(`/api/starlink-usage${searchQuery}`);

    if (!response.ok) {
      throw new Error('Failed to fetch starlink usage data');
    }

    const updatedUsages = (await response.json()) as StarlinkUsage[];

    if (!trimmedTerm) {
      setUsages(updatedUsages);
    }

    setFilteredUsages(updatedUsages);
    setGroupedUsages(groupByDate(updatedUsages)); // Update grouped data as well
  };

  // Handle search term changes
  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page when searching

    try {
      await fetchUsageData(term);
    } catch (error) {
      console.error('Error loading usage records:', error);
      setSuccessTitle('Load Failed');
      setSuccessMessage('Failed to load starlink usage data');
      setIsSuccessDialogOpen(true);
    }
  };

  // Calculate pagination values for grouped data
  const flattenedUsages = Array.from(groupedUsages.values()).flat();
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  // Determine which groups and items should be shown on current page
  const getPaginatedGroups = () => {
    const itemsToShow = flattenedUsages.slice(indexOfFirstItem, indexOfLastItem);
    const visibleGrouped = new Map<string, StarlinkUsage[]>();

    itemsToShow.forEach(usage => {
      const dateKey = usage.tanggal;
      if (!visibleGrouped.has(dateKey)) {
        visibleGrouped.set(dateKey, []);
      }
      visibleGrouped.get(dateKey)!.push(usage);
    });

    return visibleGrouped;
  };

  const paginatedGroups = getPaginatedGroups();
  const totalPages = Math.ceil(flattenedUsages.length / itemsPerPage);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Change items per page
  const handleItemsPerPageChange = (value: string) => {
    const newItemsPerPage = parseInt(value);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page
  };

  const handleDelete = (usage: StarlinkUsage) => {
    setUsageToDelete(usage);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!usageToDelete) return;

    try {
      await deleteStarlinkUsage(usageToDelete.id);
      setIsDeleteDialogOpen(false);
      setUsageToDelete(null);
      setSuccessTitle('Delete Successful');
      setSuccessMessage('Starlink usage record deleted successfully!');
      setIsSuccessDialogOpen(true);
    } catch (error) {
      console.error('Error deleting usage record:', error);
      setIsDeleteDialogOpen(false);
      setUsageToDelete(null);
      setSuccessTitle('Delete Failed');
      setSuccessMessage('Failed to delete usage record');
      setIsSuccessDialogOpen(true);
    }
  };

  const handleFormSubmit = async (action: 'create' | 'update') => {
    setIsFormOpen(false);
    setCurrentUsage(null);

    setSuccessTitle(
      action === 'create' ? 'Create Successful' : 'Update Successful'
    );
    setSuccessMessage(
      action === 'create'
        ? 'Starlink usage record created successfully!'
        : 'Starlink usage record updated successfully!'
    );
    setIsSuccessDialogOpen(true);
  };

  const handleSuccessDialogClose = async () => {
    setIsSuccessDialogOpen(false);
    await handleSearch(searchTerm);
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setCurrentUsage(null);
  };

  const handleEdit = (usage: StarlinkUsage) => {
    setCurrentUsage(usage);
    setIsFormOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5 text-blue-500" />
            Starlink Network Usage
            <Badge variant="secondary" className="ml-2">{usages.length}</Badge>
          </CardTitle>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by unit starlink..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    setCurrentUsage(null);
                    setIsFormOpen(true);
                  }}
                  className="w-full sm:w-auto"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Record
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{currentUsage ? 'Edit Record' : 'Add New Record'}</DialogTitle>
                  <DialogDescription>
                    {currentUsage
                      ? 'Update the starlink usage details below.'
                      : 'Fill in the details to create a new starlink usage record.'}
                  </DialogDescription>
                </DialogHeader>
                <StarlinkUsageForm
                  usage={currentUsage || undefined}
                  onSubmit={handleFormSubmit}
                  onCancel={handleFormCancel}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">No</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Unit Starlink</TableHead>
                      <TableHead>Total Pemakaian</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {flattenedUsages.length > 0 ? (
                      // Group by date and render accordingly for current page
                      Array.from(paginatedGroups.entries()).map(([dateKey, usagesForDate]) => {
                        // Calculate starting index for serial numbers within this group
                        const groupStartIndex = flattenedUsages.findIndex(usage => usage.tanggal === dateKey);

                        return (
                          <React.Fragment key={dateKey}>
                            <TableRow className="bg-muted/30">
                              <TableCell colSpan={5} className="font-bold py-3">
                                {formatDate(dateKey)}
                              </TableCell>
                            </TableRow>
                            {usagesForDate.map((usage) => {
                              // Calculate the actual index for the serial number
                              const actualIndex = flattenedUsages.findIndex(u => u.id === usage.id);
                              const serialNumber = actualIndex + 1;

                              return (
                                <TableRow key={usage.id}>
                                  <TableCell className="font-medium">{serialNumber}</TableCell>
                                  <TableCell>{formatDate(usage.tanggal)}</TableCell>
                                  <TableCell>{usage.unit_starlink}</TableCell>
                                  <TableCell>{usage.total_pemakaian}</TableCell>
                                  <TableCell className="text-right">
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                          <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => handleEdit(usage)}>
                                          <Edit className="h-4 w-4 mr-2" />
                                          Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          className="text-red-600 focus:text-red-600"
                                          onClick={() => handleDelete(usage)}
                                        >
                                          <Trash2 className="h-4 w-4 mr-2" />
                                          Delete
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </React.Fragment>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          {searchTerm ? 'No records found for your search' : 'No starlink usage records found'}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination controls */}
              <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-4">
                <div className="text-sm text-muted-foreground">
                  Showing {Math.min(indexOfFirstItem + 1, flattenedUsages.length)} to{' '}
                  {Math.min(indexOfLastItem, flattenedUsages.length)} of {flattenedUsages.length} records
                </div>
                
                <div className="flex items-center gap-2">
                  <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                    <SelectTrigger className="w-[90px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 per page</SelectItem>
                      <SelectItem value="10">10 per page</SelectItem>
                      <SelectItem value="20">20 per page</SelectItem>
                      <SelectItem value="50">50 per page</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => paginate(page)}
                      >
                        {page}
                      </Button>
                    ))}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Starlink Usage"
        description={`Are you sure you want to delete the usage record for unit "${usageToDelete?.unit_starlink}" on ${formatDate(usageToDelete?.tanggal || '')}? This action cannot be undone.`}
        onConfirm={confirmDelete}
        confirmText="Delete"
        cancelText="Cancel"
      />

      {/* Success Dialog */}
      <SuccessDialog
        open={isSuccessDialogOpen}
        onOpenChange={setIsSuccessDialogOpen}
        title={successTitle}
        description={successMessage}
        onConfirm={handleSuccessDialogClose}
        confirmText="OK"
      />
    </>
  );
}
