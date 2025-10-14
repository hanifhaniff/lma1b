'use client';

import { useEffect, useState } from 'react';
import { Search, ChevronLeft, ChevronRight, Plus, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface Voucher {
  voucherCode: string;
  status: string;
  packageName: string;
  firstName: string;
  comment: string;
  usedQuota: number;
}

// Define profile options
const profileOptions = [
  {
    userGroupId: '373468',
    profile: '45847432291523557488679810815966',
    showName: 'NON OFFICE'
  },
  {
    userGroupId: '372545',
    profile: '78099627166375397547204316304798',
    showName: 'OFFICE'
  },
  {
    userGroupId: '310900',
    profile: '74982068157927252714531358117370',
    showName: 'VIP_GUEST'
  },
  {
    userGroupId: '306213',
    profile: '96616229157126588697627330017147',
    showName: 'LMA_GUEST'
  },
  {
    userGroupId: '301097',
    profile: '19800825815838878381481282505680',
    showName: 'WORKLOAD'
  },
  {
    userGroupId: '294268',
    profile: '80086006291093442640481709466748',
    showName: 'LMA_KP'
  }
];

export default function RuijiePage() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [filteredVouchers, setFilteredVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchFirstName, setSearchFirstName] = useState('');
  const [searchVoucherCode, setSearchVoucherCode] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Default 10 items per page
  
  // Create voucher state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);
  
  // Form state
  const [quantity, setQuantity] = useState(1);
  const [profile, setProfile] = useState('');
  const [userGroupId, setUserGroupId] = useState('');
  const [firstName, setFirstName] = useState('');
  const [comment, setComment] = useState('');

  // Handle authentication
  const handleAuthenticate = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '123Bekasi321') {
      setIsAuthenticated(true);
      setAuthError(null);
    } else {
      setAuthError('Invalid password. Please try again.');
    }
  };

  // Fetch vouchers from API
  useEffect(() => {
    if (!isAuthenticated) return; // Don't fetch if not authenticated
    
    const fetchVouchers = async () => {
      setLoading(true); // Set loading to true when starting to fetch
      try {
        const response = await fetch('/api/ruijie');
        if (!response.ok) {
          throw new Error(`Failed to fetch vouchers: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        
        // Handle different potential response structures
        let vouchersData: Voucher[] = [];
        if (Array.isArray(data)) {
          vouchersData = data;
        } else if (data && typeof data === 'object') {
          // If the API returns data in a nested format, check common property names
          if (Array.isArray(data.vouchers)) {
            vouchersData = data.vouchers;
          } else if (Array.isArray(data.data)) {
            vouchersData = data.data;
          } else if (Array.isArray(data.list)) {
            vouchersData = data.list;
          } else {
            // If none of the common structures match, try to use the data directly if it's an object with required fields
            console.warn('Unexpected API response structure:', data);
            throw new Error('API returned unexpected data structure');
          }
        }
        
        setVouchers(vouchersData);
        setFilteredVouchers(vouchersData);
      } catch (err) {
        console.error('Error fetching vouchers:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchVouchers();
  }, [isAuthenticated]); // Add isAuthenticated as a dependency

  // Handle search
  useEffect(() => {
    const applyFilters = async () => {
      try {
        // Build query parameters
        const params = new URLSearchParams();
        if (searchFirstName.trim()) {
          params.append('searchFirstName', searchFirstName.trim());
        }
        if (searchVoucherCode.trim()) {
          params.append('searchVoucherCode', searchVoucherCode.trim());
        }
        
        // Fetch filtered data from API
        const response = await fetch(`/api/ruijie?${params.toString()}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch filtered vouchers: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        
        // Update filtered vouchers
        setFilteredVouchers(Array.isArray(data) ? data : []);
        setCurrentPage(1); // Reset to first page when filtering
      } catch (err) {
        console.error('Error filtering vouchers:', err);
        // If API filter fails, fallback to client-side filtering
        let filtered = vouchers;
        
        if (searchFirstName.trim()) {
          filtered = filtered.filter(voucher =>
            voucher.firstName.toLowerCase().includes(searchFirstName.toLowerCase())
          );
        }
        
        if (searchVoucherCode.trim()) {
          filtered = filtered.filter(voucher =>
            voucher.voucherCode.toLowerCase().includes(searchVoucherCode.toLowerCase())
          );
        }
        
        setFilteredVouchers(filtered);
        setCurrentPage(1); // Reset to first page when filtering
      }
    };
    
    // Apply filters with debounce
    const timer = setTimeout(() => {
      applyFilters();
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchFirstName, searchVoucherCode, vouchers]);

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

  // Handle create voucher
  const handleCreateVoucher = async () => {
    setCreateLoading(true);
    setCreateError(null);
    setCreateSuccess(null);
    
    try {
      const response = await fetch('/api/ruijie', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quantity,
          profile,
          userGroupId,
          firstName,
          comment,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create voucher');
      }
      
      const data = await response.json();
      
      // Extract codeNo from the response if available
      let successMessage = 'Voucher created successfully!';
      if (data && data.voucherData && data.voucherData.list && data.voucherData.list.length > 0) {
        const codeNo = data.voucherData.list[0].codeNo;
        if (codeNo) {
          successMessage = `Voucher created successfully! Code: ${codeNo}`;
        }
      }
      
      setCreateSuccess(successMessage);
      
      // Reset form
      setQuantity(1);
      setProfile('');
      setUserGroupId('');
      setFirstName('');
      setComment('');
      
      // Close dialog after a short delay
      setTimeout(() => {
        setIsCreateDialogOpen(false);
        setCreateSuccess(null);
      }, 2000);
      
      // Refresh the voucher list
      const fetchVouchers = async () => {
        try {
          const response = await fetch('/api/ruijie');
          if (response.ok) {
            const data = await response.json();
            
            // Handle different potential response structures
            let vouchersData: Voucher[] = [];
            if (Array.isArray(data)) {
              vouchersData = data;
            } else if (data && typeof data === 'object') {
              // Check for nested structure: data.voucherData.list
              if (data.voucherData && data.voucherData.list && Array.isArray(data.voucherData.list)) {
                vouchersData = data.voucherData.list;
              } else if (Array.isArray(data.vouchers)) {
                vouchersData = data.vouchers;
              } else if (Array.isArray(data.data)) {
                vouchersData = data.data;
              } else if (Array.isArray(data.list)) {
                vouchersData = data.list;
              }
            }
            
            setVouchers(vouchersData);
            setFilteredVouchers(vouchersData);
          }
        } catch (err) {
          console.error('Error refreshing vouchers:', err);
        }
      };
      
      fetchVouchers();
      
    } catch (err) {
      console.error('Error creating voucher:', err);
      setCreateError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setCreateLoading(false);
    }
  };

  // Status badge variant
  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'default';
      case 'inactive':
        return 'secondary';
      case 'expired':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  // Show authentication form if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-2">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl text-center">Authentication Required</CardTitle>
            <p className="text-sm text-muted-foreground text-center">
              Enter the password to access the Ruijie Voucher Management System
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuthenticate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
              {authError && (
                <div className="text-sm text-red-500 bg-red-50 p-2 rounded">
                  {authError}
                </div>
              )}
              <Button type="submit" className="w-full">
                Sign In
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading vouchers...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="p-4 text-red-500 bg-red-50 rounded-md max-w-md">
          <h2 className="font-bold text-lg mb-2">Error</h2>
          <p>{error}</p>
          <p className="mt-2 text-sm">Please check the console for more details and ensure your ACCESS_TOKEN_RUIJIE is properly configured in your .env.local file.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-2 sm:p-4 max-w-6xl">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Ruijie Vouchers</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Manage and create ruijie Voucher.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-lg sm:text-xl mb-1">Voucher List</CardTitle>
              <p className="text-sm text-muted-foreground">
                Manage and create ruijie Voucher.
              </p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Voucher
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] w-[95%] max-w-[425px]">
                <DialogHeader>
                  <DialogTitle className="text-lg">Create New Voucher</DialogTitle>
                  <DialogDescription className="text-sm">
                    Fill in the details to create a new voucher. Click save when you're done.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                    <Label htmlFor="quantity" className="sm:text-right text-sm">
                      Quantity
                    </Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                      className="col-span-1 sm:col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                    <Label htmlFor="profile" className="sm:text-right text-sm">
                      Profile
                    </Label>
                    <Select
                      value={profile}
                      onValueChange={(value) => {
                        setProfile(value);
                        // Auto-populate userGroupId when profile is selected
                        const selectedOption = profileOptions.find(option => option.profile === value);
                        if (selectedOption) {
                          setUserGroupId(selectedOption.userGroupId);
                        }
                      }}
                    >
                      <SelectTrigger className="col-span-1 sm:col-span-3">
                        <SelectValue placeholder="Select a profile" />
                      </SelectTrigger>
                      <SelectContent>
                        {profileOptions.map((option) => (
                          <SelectItem key={option.profile} value={option.profile}>
                            {option.showName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                    <Label htmlFor="userGroupId" className="sm:text-right text-sm">
                      Group ID
                    </Label>
                    <Input
                      id="userGroupId"
                      value={userGroupId}
                      onChange={(e) => setUserGroupId(e.target.value)}
                      className="col-span-1 sm:col-span-3"
                      placeholder="Auto-populated when profile is selected"
                      readOnly
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                    <Label htmlFor="firstName" className="sm:text-right text-sm">
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="col-span-1 sm:col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                    <Label htmlFor="comment" className="sm:text-right text-sm">
                      Comment
                    </Label>
                    <Input
                      id="comment"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="col-span-1 sm:col-span-3"
                    />
                  </div>
                </div>
                {createError && (
                  <div className="text-sm text-red-500 bg-red-50 p-2 rounded">
                    {createError}
                  </div>
                )}
                {createSuccess && (
                  <div className="text-sm text-green-500 bg-green-50 p-2 rounded">
                    {createSuccess}
                  </div>
                )}
                <DialogFooter>
                  <Button
                    type="button"
                    onClick={handleCreateVoucher}
                    disabled={createLoading || !profile || !userGroupId || !firstName}
                    className="w-full sm:w-auto"
                  >
                    {createLoading ? 'Creating...' : 'Create Voucher'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        
        <div className="px-6 pb-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <h3 className="text-sm font-medium mb-3">Search Vouchers</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by first name..."
                  value={searchFirstName}
                  onChange={(e) => setSearchFirstName(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by voucher code..."
                  value={searchVoucherCode}
                  onChange={(e) => setSearchVoucherCode(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </div>
        
        <CardContent className="p-2 sm:p-6">
          {/* Mobile-friendly table with horizontal scroll */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">Voucher Code</TableHead>
                  <TableHead className="whitespace-nowrap">Status</TableHead>
                  <TableHead className="whitespace-nowrap">Package Name</TableHead>
                  <TableHead className="whitespace-nowrap">First Name</TableHead>
                  <TableHead className="whitespace-nowrap">Comment</TableHead>
                  <TableHead className="whitespace-nowrap">Used Quota/Mb</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentVouchers.map((voucher, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium whitespace-nowrap">{voucher.voucherCode}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Badge variant={getStatusVariant(voucher.status)}>
                        {voucher.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{voucher.packageName}</TableCell>
                    <TableCell className="whitespace-nowrap">{voucher.firstName}</TableCell>
                    <TableCell className="max-w-[120px] sm:max-w-xs truncate" title={voucher.comment}>
                      {voucher.comment}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{voucher.usedQuota}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredVouchers.length === 0 && (
            <div className="text-center py-10 text-muted-foreground">
              {vouchers.length === 0
                ? 'No vouchers found.'
                : 'No vouchers match your search criteria.'}
            </div>
          )}
          
          {/* Mobile-friendly Pagination Controls */}
          {filteredVouchers.length > 0 && (
            <div className="flex flex-col gap-4 mt-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xs sm:text-sm text-muted-foreground">
                    Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredVouchers.length)} of {filteredVouchers.length} results
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-xs sm:text-sm text-muted-foreground">Items per page:</span>
                  <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                    <SelectTrigger className="w-[60px] sm:w-[70px] h-8">
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
              </div>
              
              <div className="flex items-center justify-center sm:justify-end space-x-1 sm:space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="h-8 px-2 sm:px-3"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline ml-1">Previous</span>
                </Button>
                
                {/* Mobile-friendly page numbers */}
                <div className="flex items-center space-x-1 overflow-x-auto max-w-[200px] sm:max-w-none">
                  {(() => {
                    const pages = [];
                    const maxVisiblePages = 3; // Show fewer pages on mobile
                    
                    if (totalPages <= maxVisiblePages) {
                      // Show all pages if total is less than or equal to max visible
                      for (let i = 1; i <= totalPages; i++) {
                        pages.push(i);
                      }
                    } else {
                      // Show first page
                      pages.push(1);
                      
                      if (currentPage <= 2) {
                        // Show pages 2, 3 when current page is near the start
                        for (let i = 2; i <= Math.min(3, totalPages - 1); i++) {
                          pages.push(i);
                        }
                        if (totalPages > 3) {
                          pages.push('...');
                          pages.push(totalPages);
                        }
                      } else if (currentPage >= totalPages - 1) {
                        // Show pages near the end
                        pages.push('...');
                        for (let i = Math.max(totalPages - 2, 2); i <= totalPages; i++) {
                          pages.push(i);
                        }
                      } else {
                        // Show pages around current page
                        pages.push('...');
                        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                          pages.push(i);
                        }
                        pages.push('...');
                        pages.push(totalPages);
                      }
                    }
                    
                    return pages.map((page, index) => {
                      if (page === '...') {
                        return (
                          <span key={`ellipsis-${index}`} className="px-2 py-1 text-xs sm:text-sm text-muted-foreground">
                            ...
                          </span>
                        );
                      }
                      
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => paginate(page as number)}
                          className={`h-8 w-8 sm:w-auto sm:px-3 text-xs ${currentPage === page ? "bg-primary" : ""}`}
                        >
                          {page}
                        </Button>
                      );
                    });
                  })()}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="h-8 px-2 sm:px-3"
                >
                  <span className="hidden sm:inline mr-1">Next</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}