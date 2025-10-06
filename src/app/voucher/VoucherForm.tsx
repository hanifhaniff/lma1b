'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Voucher, NewVoucher } from './types';
import { createVoucher, updateVoucher } from './actions';

interface VoucherFormProps {
  voucher?: Voucher;
  onSubmit: () => void;
  onCancel: () => void;
}

export default function VoucherForm({ voucher, onSubmit, onCancel }: VoucherFormProps) {
  const [formData, setFormData] = useState<NewVoucher>({
    kode_voucher: voucher?.kode_voucher || '',
    nama_user: voucher?.nama_user || '',
    tipe_voucher: voucher?.tipe_voucher || '',
    divisi: voucher?.divisi || '',
    status: voucher?.status || 'aktif',
    tanggal_kadaluarsa: voucher?.tanggal_kadaluarsa || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (voucher) {
      setFormData({
        kode_voucher: voucher.kode_voucher || '',
        nama_user: voucher.nama_user || '',
        tipe_voucher: voucher.tipe_voucher || '',
        divisi: voucher.divisi || '',
        status: voucher.status,
        tanggal_kadaluarsa: voucher.tanggal_kadaluarsa || '',
      });
    } else {
      setFormData({
        kode_voucher: '',
        nama_user: '',
        tipe_voucher: '',
        divisi: '',
        status: 'aktif',
        tanggal_kadaluarsa: '',
      });
    }
  }, [voucher]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.kode_voucher.trim()) {
      newErrors.kode_voucher = 'Kode voucher is required';
    }

    if (!formData.nama_user.trim()) {
      newErrors.nama_user = 'Nama user is required';
    }

    if (!formData.tipe_voucher.trim()) {
      newErrors.tipe_voucher = 'Tipe voucher is required';
    }

    // Tanggal kadaluarsa is now optional, so no validation needed

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (voucher) {
        // Update existing voucher
        await updateVoucher(voucher.kode_voucher, formData);
      } else {
        // Create new voucher
        await createVoucher(formData);
      }
      onSubmit();
    } catch (error) {
      console.error('Error submitting voucher:', error);
      setErrors({ submit: `Failed to ${voucher ? 'update' : 'create'} voucher: ${(error as Error).message}` });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{voucher ? 'Edit Voucher' : 'Create New Voucher'}</CardTitle>
        <CardDescription>
          {voucher 
            ? 'Update the voucher details below.' 
            : 'Fill in the details to create a new voucher.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="kode_voucher">Kode Voucher *</Label>
              <Input
                id="kode_voucher"
                name="kode_voucher"
                value={formData.kode_voucher}
                onChange={handleChange}
                placeholder="Enter kode voucher"
                disabled={!!voucher} // Don't allow changing the primary key
              />
              {errors.kode_voucher && (
                <p className="text-sm text-red-500">{errors.kode_voucher}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="nama_user">Nama User *</Label>
              <Input
                id="nama_user"
                name="nama_user"
                value={formData.nama_user}
                onChange={handleChange}
                placeholder="Enter nama user"
              />
              {errors.nama_user && (
                <p className="text-sm text-red-500">{errors.nama_user}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipe_voucher">Tipe Voucher *</Label>
              <Input
                id="tipe_voucher"
                name="tipe_voucher"
                value={formData.tipe_voucher}
                onChange={handleChange}
                placeholder="Enter tipe voucher"
              />
              {errors.tipe_voucher && (
                <p className="text-sm text-red-500">{errors.tipe_voucher}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="divisi">Divisi</Label>
              <Input
                id="divisi"
                name="divisi"
                value={formData.divisi || ''}
                onChange={handleChange}
                placeholder="Enter divisi (optional)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => handleSelectChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aktif">Aktif</SelectItem>
                  <SelectItem value="digunakan">Digunakan</SelectItem>
                  <SelectItem value="kadaluarsa">Kadaluarsa</SelectItem>
                </SelectContent>
              </Select>
            </div>



            <div className="space-y-2">
              <Label htmlFor="tanggal_kadaluarsa">Tanggal Kadaluarsa</Label>
              <Input
                id="tanggal_kadaluarsa"
                name="tanggal_kadaluarsa"
                type="date"
                value={formData.tanggal_kadaluarsa || ''}
                onChange={handleChange}
              />
              {errors.tanggal_kadaluarsa && (
                <p className="text-sm text-red-500">{errors.tanggal_kadaluarsa}</p>
              )}
            </div>
          </div>

          {errors.submit && (
            <div className="text-sm text-red-500">{errors.submit}</div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting 
                ? (voucher ? 'Updating...' : 'Creating...') 
                : (voucher ? 'Update Voucher' : 'Create Voucher')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}