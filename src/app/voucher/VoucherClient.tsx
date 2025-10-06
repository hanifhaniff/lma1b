'use client';

import { useState } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { deleteVoucher, updateVoucherStatus } from './actions';
import { Voucher } from './types';
import VoucherForm from './VoucherForm';
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
import { Search, MoreHorizontal, Plus, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

// Format date for display
const formatDate = (dateString: string | null) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Format currency for display
const formatCurrency = (value: number | null) => {
  if (value === null) return '-';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
  }).format(value);
};



// Status badge variant
const getStatusVariant = (status: string) => {
  switch (status) {
    case 'aktif':
      return 'default';
    case 'digunakan':
      return 'secondary';
    case 'kadaluarsa':
      return 'destructive';
    default:
      return 'default';
  }
};

interface VoucherClientProps {
  initialVouchers: Voucher[];
  loading: boolean;
}

export default function VoucherClient({ initialVouchers, loading }: VoucherClientProps) {
  const [vouchers, setVouchers] = useState<Voucher[]>(initialVouchers);
  const [originalVouchers, setOriginalVouchers] = useState<Voucher[]>(initialVouchers); // Store original vouchers
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentVoucher, setCurrentVoucher] = useState<Voucher | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredVouchers, setFilteredVouchers] = useState<Voucher[]>(initialVouchers);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Default 10 items per page

  // Handle search term changes
  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page when searching
    
    if (term.trim() === '') {
      // If search is empty, show all original vouchers
      setFilteredVouchers(originalVouchers);
    } else {
      // Search on the server
      const response = await fetch(`/api/vouchers?searchNamaUser=${encodeURIComponent(term)}`);
      if (response.ok) {
        const results = await response.json();
        setFilteredVouchers(results);
      } else {
        console.error('Search failed');
      }
    }
  };

  // Calculate pagination values
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentVouchers = filteredVouchers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredVouchers.length / itemsPerPage);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Change items per page
  const handleItemsPerPageChange = (value: string) => {
    const newItemsPerPage = parseInt(value);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page
  };

  const handleDelete = async (kode_voucher: string) => {
    if (confirm('Are you sure you want to delete this voucher?')) {
      try {
        await deleteVoucher(kode_voucher);
        // Refresh the list by fetching from server to maintain search state
        const searchQuery = searchTerm ? `?searchNamaUser=${encodeURIComponent(searchTerm)}` : '';
        const response = await fetch(`/api/vouchers${searchQuery}`);
        if (response.ok) {
          const updatedVouchers = await response.json();
          setVouchers(updatedVouchers);
          setFilteredVouchers(updatedVouchers);
          
          // Also update original vouchers if we're not in a filtered state
          if (searchTerm.trim() === '') {
            setOriginalVouchers(updatedVouchers);
          }
          
          // Reset to first page after deletion
          setCurrentPage(1);
        }
      } catch (error) {
        console.error('Error deleting voucher:', error);
        alert('Failed to delete voucher');
      }
    }
  };

  const handleUpdateStatus = async (kode_voucher: string, status: 'aktif' | 'digunakan' | 'kadaluarsa') => {
    try {
      await updateVoucherStatus(kode_voucher, status);
      // Refresh the list by fetching from server to maintain search state
      const searchQuery = searchTerm ? `?searchNamaUser=${encodeURIComponent(searchTerm)}` : '';
      const response = await fetch(`/api/vouchers${searchQuery}`);
      if (response.ok) {
        const updatedVouchers = await response.json();
        setVouchers(updatedVouchers);
        setFilteredVouchers(updatedVouchers);
        
        // Also update original vouchers if we're not in a filtered state
        if (searchTerm.trim() === '') {
          setOriginalVouchers(updatedVouchers);
        }
        
        // Reset to first page after status update
        setCurrentPage(1);
      }
    } catch (error) {
      console.error('Error updating voucher status:', error);
      alert('Failed to update voucher status');
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Voucher Management</h1>
        <p className="text-muted-foreground">
          Manage your vouchers, track usage, and monitor expiration dates.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <CardTitle>Voucher List</CardTitle>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by nama user..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-8 w-full sm:w-64"
              />
            </div>
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { setCurrentVoucher(null); setIsFormOpen(true); }}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Voucher
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{currentVoucher ? 'Edit Voucher' : 'Create New Voucher'}</DialogTitle>
                  <DialogDescription>
                    {currentVoucher
                      ? 'Modify the voucher details below.'
                      : 'Fill in the details to create a new voucher.'}
                  </DialogDescription>
                </DialogHeader>
                <VoucherForm
                  voucher={currentVoucher || undefined}
                  onSubmit={async () => {
                    setIsFormOpen(false);
                    // Refresh the list by fetching from server
                    const searchQuery = searchTerm ? `?searchNamaUser=${encodeURIComponent(searchTerm)}` : '';
                    const response = await fetch(`/api/vouchers${searchQuery}`);
                    if (response.ok) {
                      const updatedVouchers = await response.json();
                      setVouchers(updatedVouchers);
                      setFilteredVouchers(updatedVouchers);
                      
                      // Also update original vouchers if we're not in a filtered state
                      if (searchTerm.trim() === '') {
                        setOriginalVouchers(updatedVouchers);
                      }
                      
                      // Reset to first page after updating data
                      setCurrentPage(1);
                    }
                  }}
                  onCancel={() => setIsFormOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode Voucher</TableHead>
                <TableHead>Nama User</TableHead>
                <TableHead>Tipe Voucher</TableHead>
                <TableHead>Divisi</TableHead>
                <TableHead>Tanggal Kadaluarsa</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Dibuat Pada</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentVouchers.map((voucher) => (
                <TableRow key={voucher.kode_voucher}>
                  <TableCell className="font-medium">{voucher.kode_voucher}</TableCell>
                  <TableCell>{voucher.nama_user}</TableCell>
                  <TableCell>{voucher.tipe_voucher}</TableCell>
                  <TableCell>{voucher.divisi || '-'}</TableCell>
                  <TableCell>{formatDate(voucher.tanggal_kadaluarsa)}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(voucher.status)}>
                      {voucher.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(voucher.dibuat_pada)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setCurrentVoucher(voucher);
                            setIsFormOpen(true);
                          }}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleUpdateStatus(voucher.kode_voucher, 'aktif')}
                          disabled={voucher.status === 'aktif'}
                        >
                          Set Aktif
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleUpdateStatus(voucher.kode_voucher, 'digunakan')}
                          disabled={voucher.status === 'digunakan'}
                        >
                          Set Digunakan
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleUpdateStatus(voucher.kode_voucher, 'kadaluarsa')}
                          disabled={voucher.status === 'kadaluarsa'}
                        >
                          Set Kadaluarsa
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(voucher.kode_voucher)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredVouchers.length === 0 && (
            <div className="text-center py-10 text-muted-foreground">
              {vouchers.length === 0 
                ? 'No vouchers found. Create your first voucher!' 
                : 'No vouchers match your search.'}
            </div>
          )}
          
          {/* Pagination Controls */}
          {filteredVouchers.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredVouchers.length)} of {filteredVouchers.length} results
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Items per page:</span>
                <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                  <SelectTrigger className="w-[70px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                
                {/* Page numbers */}
                <div className="flex items-center space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => paginate(page)}
                      className={currentPage === page ? "bg-primary" : ""}
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}