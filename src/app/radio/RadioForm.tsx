'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Radio, NewRadio } from './types';
import { createRadio, updateRadio } from './actions';

interface RadioFormProps {
  radio?: Radio;
  onSubmit: () => void;
  onCancel: () => void;
}

export default function RadioForm({ radio, onSubmit, onCancel }: RadioFormProps) {
  const [formData, setFormData] = useState<NewRadio>({
    nama_radio: radio?.nama_radio || '',
    tipe_radio: radio?.tipe_radio || '',
    serial_number: radio?.serial_number || '',
    user_radio: radio?.user_radio || '',
    nomor_bast: radio?.nomor_bast || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (radio) {
      setFormData({
        nama_radio: radio.nama_radio || '',
        tipe_radio: radio.tipe_radio || '',
        serial_number: radio.serial_number || '',
        user_radio: radio.user_radio || '',
        nomor_bast: radio.nomor_bast || '',
      });
    } else {
      setFormData({
        nama_radio: '',
        tipe_radio: '',
        serial_number: '',
        user_radio: '',
        nomor_bast: '',
      });
    }
  }, [radio]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nama_radio.trim()) {
      newErrors.nama_radio = 'Nama radio is required';
    }

    if (!formData.serial_number.trim()) {
      newErrors.serial_number = 'Serial number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (radio) {
        // Update existing radio
        await updateRadio(radio.id, formData);
      } else {
        // Create new radio
        await createRadio(formData);
      }
      onSubmit();
    } catch (error) {
      console.error('Error submitting radio:', error);
      setErrors({ submit: `Failed to ${radio ? 'update' : 'create'} radio: ${(error as Error).message}` });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{radio ? 'Edit Radio' : 'Create New Radio'}</CardTitle>
        <CardDescription>
          {radio 
            ? 'Update the radio details below.' 
            : 'Fill in the details to create a new radio.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nama_radio">Nama Radio *</Label>
              <Input
                id="nama_radio"
                name="nama_radio"
                value={formData.nama_radio}
                onChange={handleChange}
                placeholder="Enter nama radio"
              />
              {errors.nama_radio && (
                <p className="text-sm text-red-500">{errors.nama_radio}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipe_radio">Tipe Radio</Label>
              <Input
                id="tipe_radio"
                name="tipe_radio"
                value={formData.tipe_radio || ''}
                onChange={handleChange}
                placeholder="Enter tipe radio"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="serial_number">Serial Number *</Label>
              <Input
                id="serial_number"
                name="serial_number"
                value={formData.serial_number}
                onChange={handleChange}
                placeholder="Enter serial number"
                disabled={!!radio} // Don't allow changing the unique serial number
              />
              {errors.serial_number && (
                <p className="text-sm text-red-500">{errors.serial_number}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="user_radio">User Radio</Label>
              <Input
                id="user_radio"
                name="user_radio"
                value={formData.user_radio || ''}
                onChange={handleChange}
                placeholder="Enter user radio"
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="nomor_bast">Nomor BAST</Label>
              <Input
                id="nomor_bast"
                name="nomor_bast"
                value={formData.nomor_bast || ''}
                onChange={handleChange}
                placeholder="Enter nomor BAST"
              />
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
                ? (radio ? 'Updating...' : 'Creating...') 
                : (radio ? 'Update Radio' : 'Create Radio')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}