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
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { deleteRadio } from './actions';
import { Radio } from './types';
import RadioForm from './RadioForm';
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
import { Search, MoreHorizontal, Plus, Edit, Trash2, ChevronLeft, ChevronRight, RefreshCw, Radio as RadioIcon } from 'lucide-react';

// Format date for display
const formatDate = (dateString: string | null) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

interface RadioClientProps {
  initialRadios: Radio[];
  loading: boolean;
}

export default function RadioClient({ initialRadios, loading }: RadioClientProps) {
  const [radios, setRadios] = useState<Radio[]>(initialRadios);
  const [originalRadios, setOriginalRadios] = useState<Radio[]>(initialRadios); // Store original radios
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentRadio, setCurrentRadio] = useState<Radio | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredRadios, setFilteredRadios] = useState<Radio[]>(initialRadios);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Default 10 items per page

  // Handle search term changes
  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page when searching

    if (term.trim() === '') {
      // If search is empty, show all original radios
      setFilteredRadios(originalRadios);
    } else {
      // Search on the server
      const response = await fetch(`/api/radios?search=${encodeURIComponent(term)}`);
      if (response.ok) {
        const results = await response.json();
        setFilteredRadios(results);
      } else {
        console.error('Search failed');
      }
    }
  };

  // Calculate pagination values
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRadios = filteredRadios.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRadios.length / itemsPerPage);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Change items per page
  const handleItemsPerPageChange = (value: string) => {
    const newItemsPerPage = parseInt(value);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this radio?')) {
      try {
        await deleteRadio(id);
        // Refresh the list by fetching from server to maintain search state
        const searchQuery = searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : '';
        const response = await fetch(`/api/radios${searchQuery}`);
        if (response.ok) {
          const updatedRadios = await response.json();
          setRadios(updatedRadios);
          setFilteredRadios(updatedRadios);

          // Also update original radios if we're not in a filtered state
          if (searchTerm.trim() === '') {
            setOriginalRadios(updatedRadios);
          }

          // Reset to first page after deletion
          setCurrentPage(1);
        }
      } catch (error) {
        console.error('Error deleting radio:', error);
        alert('Failed to delete radio');
      }
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <CardTitle className="flex items-center gap-2">
          <RadioIcon className="h-5 w-5 text-blue-500" />
          Radio Inventory
          <Badge variant="secondary" className="ml-2">{radios.length}</Badge>
        </CardTitle>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, serial, user..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Radio
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <RadioIcon className="h-5 w-5" />
                  {currentRadio ? 'Edit Radio' : 'Create New Radio'}
                </DialogTitle>
                <DialogDescription>
                  {currentRadio
                    ? 'Modify the radio details below.'
                    : 'Fill in the details to create a new radio.'}
                </DialogDescription>
              </DialogHeader>
              <RadioForm
                radio={currentRadio || undefined}
                onSubmit={async () => {
                  setIsFormOpen(false);
                  // Refresh the list by fetching from server
                  const searchQuery = searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : '';
                  const response = await fetch(`/api/radios${searchQuery}`);
                  if (response.ok) {
                    const updatedRadios = await response.json();
                    setRadios(updatedRadios);
                    setFilteredRadios(updatedRadios);

                    // Also update original radios if we're not in a filtered state
                    if (searchTerm.trim() === '') {
                      setOriginalRadios(updatedRadios);
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
              <TableHead>Nama Radio</TableHead>
              <TableHead>Tipe Radio</TableHead>
              <TableHead>Serial Number</TableHead>
              <TableHead>User Radio</TableHead>
              <TableHead>Nomor BAST</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentRadios.map((radio) => (
              <TableRow key={radio.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <RadioIcon className="h-4 w-4 text-blue-500" />
                    {radio.nama_radio}
                  </div>
                </TableCell>
                <TableCell>{radio.tipe_radio || '-'}</TableCell>
                <TableCell>{radio.serial_number}</TableCell>
                <TableCell>{radio.user_radio || '-'}</TableCell>
                <TableCell>{radio.nomor_bast || '-'}</TableCell>
                <TableCell>{formatDate(radio.created_at)}</TableCell>
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
                          setCurrentRadio(radio);
                          setIsFormOpen(true);
                        }}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(radio.id)}
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

        {filteredRadios.length === 0 && (
          <div className="text-center py-12">
            <RadioIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-1">No Radios Found</h3>
            <p className="text-muted-foreground">
              {radios.length === 0
                ? 'Create your first radio to get started!'
                : 'No radios match your search criteria.'}
            </p>
          </div>
        )}

        {/* Pagination Controls */}
        {filteredRadios.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredRadios.length)} of {filteredRadios.length} results
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
  );
}