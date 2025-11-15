'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import Swal from 'sweetalert2';
import { StarlinkUsage } from '@/lib/starlink-usage';
import {
  useUser,
  useClerk,
  SignInButton,
  UserButton
} from '@clerk/nextjs';
import {
  SignedIn,
  SignedOut,
  RedirectToSignIn
} from '@clerk/nextjs';

// Helper function to format data with appropriate units (GB/TB)
const formatDataSize = (gbValue: number): string => {
  if (gbValue >= 1000) { // 1000 GB = 1 TB
    return `${(gbValue / 1000).toFixed(2)} TB`;
  } else {
    return `${gbValue.toFixed(2)} GB`;
  }
};

const StarlinkUsageCRUD = () => {
  const [usageData, setUsageData] = useState<StarlinkUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<Partial<StarlinkUsage> | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form state
  const [tanggal, setTanggal] = useState('');
  const [unitStarlink, setUnitStarlink] = useState('');
  const [totalPemakaian, setTotalPemakaian] = useState('');

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/starlink');
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const data = await response.json();
      setUsageData(data);
    } catch (err) {
      console.error('Error fetching Starlink usage data:', err);
      setError('Failed to load data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const payload = {
        tanggal,
        unit_starlink: unitStarlink,
        total_pemakaian: Number(totalPemakaian),
      };

      let response;
      let isCreatingNew = false;
      if (isEditing && currentRecord?.id) {
        // Update existing record
        response = await fetch(`/api/starlink/${currentRecord.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
      } else {
        // Create new record
        isCreatingNew = true;
        response = await fetch('/api/starlink', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        throw new Error('Failed to save data');
      }

      // Refresh data
      await fetchData();
      resetForm();
      setIsDialogOpen(false);

      // Show success message based on whether we created or updated
      if (isCreatingNew) {
        Swal.fire({
          title: 'Berhasil!',
          text: 'Data berhasil ditambahkan!',
          icon: 'success',
          confirmButtonText: 'OK',
          confirmButtonColor: '#3b82f6',
        });
      } else {
        Swal.fire({
          title: 'Berhasil!',
          text: 'Data berhasil diperbarui!',
          icon: 'success',
          confirmButtonText: 'OK',
          confirmButtonColor: '#3b82f6',
        });
      }
    } catch (err) {
      console.error('Error saving Starlink usage data:', err);
      Swal.fire({
        title: 'Gagal!',
        text: 'Gagal menyimpan data. Silakan coba lagi.',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#ef4444',
      });
    }
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: 'Anda yakin?',
      text: "Data yang dihapus tidak dapat dikembalikan!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#ef4444',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/starlink/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete data');
        }

        // Refresh data
        await fetchData();

        Swal.fire({
          title: 'Terhapus!',
          text: 'Data berhasil dihapus.',
          icon: 'success',
          confirmButtonText: 'OK',
          confirmButtonColor: '#3b82f6',
        });
      } catch (err) {
        console.error('Error deleting Starlink usage data:', err);
        Swal.fire({
          title: 'Gagal!',
          text: 'Gagal menghapus data. Silakan coba lagi.',
          icon: 'error',
          confirmButtonText: 'OK',
          confirmButtonColor: '#ef4444',
        });
      }
    }
  };

  const handleEdit = (record: StarlinkUsage) => {
    setCurrentRecord(record);
    setTanggal(record.tanggal);
    setUnitStarlink(record.unit_starlink);
    setTotalPemakaian(String(record.total_pemakaian));
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setTanggal('');
    setUnitStarlink('');
    setTotalPemakaian('');
    setCurrentRecord(null);
    setIsEditing(false);
  };

  const openAddDialog = () => {
    resetForm();
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10 px-4">
        {/* Header Skeleton */}
        <div className="mb-8">
          <Skeleton className="h-8 w-64 mx-auto" />
          <Skeleton className="h-4 w-80 mx-auto mt-4" />
        </div>

        {/* Table Card Skeleton */}
        <Card className="shadow-lg border-0 bg-white">
          <CardHeader className="border-b border-gray-100 pb-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64 mt-2" />
              </div>
              <Skeleton className="h-10 w-32" />
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow className="border-b border-gray-100 hover:bg-transparent">
                    <TableHead className="text-gray-700 font-semibold">
                      <Skeleton className="h-4 w-16" />
                    </TableHead>
                    <TableHead className="text-gray-700 font-semibold">
                      <Skeleton className="h-4 w-24" />
                    </TableHead>
                    <TableHead className="text-gray-700 font-semibold">
                      <Skeleton className="h-4 w-28" />
                    </TableHead>
                    <TableHead className="text-gray-700 font-semibold">
                      <Skeleton className="h-4 w-16" />
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <TableRow key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <TableCell className="py-4">
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell className="py-4">
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                      <TableCell className="py-4">
                        <Skeleton className="h-4 w-16" />
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex gap-2">
                          <Skeleton className="h-8 w-16" />
                          <Skeleton className="h-8 w-16" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">CRUD Pemakaian Starlink</h1>
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">CRUD Pemakaian Starlink</h1>
        <p className="text-gray-600 mt-2">
          Tambah, edit, atau hapus data pemakaian Starlink
        </p>
      </div>

      <Card className="shadow-lg border-0 bg-white">
        <CardHeader className="border-b border-gray-100 pb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-xl font-semibold">Data Pemakaian Starlink</CardTitle>
              <CardDescription className="mt-1">
                Daftar semua data penggunaan Starlink
              </CardDescription>
            </div>
            <Button
              onClick={openAddDialog}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-md"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Tambah Data
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow className="border-b border-gray-100 hover:bg-transparent">
                  <TableHead className="text-gray-700 font-semibold">Tanggal</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Unit Starlink</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Total Pemakaian</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usageData.length > 0 ? (
                  usageData.map((record) => (
                    <TableRow key={record.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <TableCell className="py-4">
                        {new Date(record.tanggal).toLocaleDateString('id-ID')}
                      </TableCell>
                      <TableCell className="py-4 font-medium">{record.unit_starlink}</TableCell>
                      <TableCell className="py-4 font-semibold text-blue-600">{formatDataSize(Number(record.total_pemakaian))}</TableCell>
                      <TableCell className="py-4">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(record)}
                            className="border-gray-300 text-gray-700 hover:bg-gray-50"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(record.id)}
                            className="hover:bg-red-600"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Hapus
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-12 text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h3 className="mt-4 text-lg font-medium text-gray-900">Tidak ada data</h3>
                        <p className="mt-2 text-sm text-gray-500">
                          Belum ada data pemakaian Starlink yang tersedia.
                        </p>
                        <Button
                          onClick={openAddDialog}
                          variant="outline"
                          className="mt-4 border-blue-500 text-blue-600 hover:bg-blue-50"
                        >
                          Tambah Data Pertama
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog for Add/Edit */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-xl shadow-2xl border-0">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold flex items-center">
              {isEditing ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Data
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Tambah Data Baru
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Edit data pemakaian Starlink'
                : 'Tambah data pemakaian Starlink baru'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label htmlFor="tanggal" className="text-gray-700">Tanggal</Label>
              <div className="relative">
                <Input
                  id="tanggal"
                  type="date"
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  className="pl-10 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="unitStarlink" className="text-gray-700">Unit Starlink</Label>
              <Select value={unitStarlink} onValueChange={setUnitStarlink} required>
                <SelectTrigger className="border-gray-300 focus:ring-blue-500 focus:border-blue-500">
                  <SelectValue placeholder="Pilih unit Starlink" />
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OFFICE1">OFFICE1</SelectItem>
                  <SelectItem value="OFFICE2">OFFICE2</SelectItem>
                  <SelectItem value="MESS1">MESS1</SelectItem>
                  <SelectItem value="MESS2">MESS2</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalPemakaian" className="text-gray-700">Total Pemakaian</Label>
              <div className="relative">
                <Input
                  id="totalPemakaian"
                  type="number"
                  value={totalPemakaian}
                  onChange={(e) => setTotalPemakaian(e.target.value)}
                  placeholder="Masukkan total pemakaian"
                  className="pl-10 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Batal
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isEditing ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Simpan Perubahan
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Tambah Data
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};


// Wrapper component for authentication
const StarlinkUsageCRUDWithAuth = () => {
  return (
    <SignedIn>
      <StarlinkUsageCRUD />
    </SignedIn>
  );
};

const AuthWrapper = () => {
  return (
    <div className="min-h-screen bg-background">
      <SignedIn>
        <StarlinkUsageCRUD />
      </SignedIn>
      <SignedOut>
        <div className="container mx-auto py-10 px-4 flex flex-col items-center justify-center min-h-[60vh]">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
            <div className="mx-auto bg-blue-50 rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Akses Dibatasi</h2>
            <p className="text-gray-600 mb-6">Silakan login untuk mengakses halaman CRUD Starlink</p>
            <SignInButton mode="modal">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Login untuk Melanjutkan
              </Button>
            </SignInButton>
          </div>
        </div>
      </SignedOut>
    </div>
  );
};

export default AuthWrapper;