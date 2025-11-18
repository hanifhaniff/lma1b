'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StarlinkUsage, NewStarlinkUsage } from './types';
import { createStarlinkUsage, updateStarlinkUsage, checkDuplicateUsage } from './actions';

interface StarlinkUsageFormProps {
  usage?: StarlinkUsage;
  onSubmit: (action: 'create' | 'update') => Promise<void> | void;
  onCancel: () => void;
}

export default function StarlinkUsageForm({ usage, onSubmit, onCancel }: StarlinkUsageFormProps) {
  const [inputValues, setInputValues] = useState({
    total_pemakaian: '',
  });
  const [formData, setFormData] = useState<NewStarlinkUsage>({
    tanggal: '',
    unit_starlink: '',
    total_pemakaian: 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (usage) {
      const totalPemakaianValue = typeof usage.total_pemakaian === 'number' ? usage.total_pemakaian : 0;
      setFormData({
        tanggal: usage.tanggal || '',
        unit_starlink: usage.unit_starlink || '',
        total_pemakaian: totalPemakaianValue,
      });
      setInputValues({
        total_pemakaian: totalPemakaianValue.toString(),
      });
    } else {
      setFormData({
        tanggal: '',
        unit_starlink: '',
        total_pemakaian: 0,
      });
      setInputValues({
        total_pemakaian: '0',
      });
    }
  }, [usage]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'total_pemakaian') {
      // Update the input value state to maintain the text representation
      setInputValues({
        ...inputValues,
        [name]: value,
      });

      // Parse the value but handle empty or just decimal point specially
      let parsedValue = 0;
      if (value === '' || value === '.') {
        parsedValue = 0;
      } else if (value.endsWith('.')) {
        // If value ends with a dot, use what we have so far without the dot for the form data
        // but keep the string representation for display
        const withoutTrailingDot = value.slice(0, -1);
        parsedValue = withoutTrailingDot === '' ? 0 : parseFloat(withoutTrailingDot) || 0;
      } else {
        parsedValue = parseFloat(value) || 0;
      }

      setFormData({
        ...formData,
        [name]: parsedValue,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.tanggal.trim()) {
      newErrors.tanggal = 'Tanggal is required';
    }

    if (!formData.unit_starlink.trim()) {
      newErrors.unit_starlink = 'Unit starlink is required';
    }

    if (isNaN(formData.total_pemakaian) || formData.total_pemakaian < 0) {
      newErrors.total_pemakaian = 'Total pemakaian must be a non-negative number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Check for duplicate before creating or updating
      const isDuplicate = await checkDuplicateUsage(
        formData.tanggal,
        formData.unit_starlink,
        usage?.id // exclude current record when updating
      );

      if (isDuplicate) {
        setErrors({
          unit_starlink: `A record already exists for unit ${formData.unit_starlink} on date ${formData.tanggal}. Please select a different date or unit.`
        });
        setIsSubmitting(false);
        return;
      }

      if (usage) {
        // Update existing record
        await updateStarlinkUsage(usage.id, formData);
        await onSubmit('update');
      } else {
        // Create new record
        await createStarlinkUsage(formData);
        await onSubmit('create');
      }
    } catch (error) {
      console.error('Error submitting starlink usage:', error);
      setErrors({ submit: `Failed to ${usage ? 'update' : 'create'} record: ${(error as Error).message}` });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{usage ? 'Edit Starlink Usage' : 'Create New Starlink Usage'}</CardTitle>
        <CardDescription>
          {usage
            ? 'Update the starlink usage details below.'
            : 'Fill in the details to create a new starlink usage record.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tanggal">Tanggal *</Label>
              <Input
                id="tanggal"
                name="tanggal"
                type="date"
                value={formData.tanggal}
                onChange={handleChange}
              />
              {errors.tanggal && (
                <p className="text-sm text-red-500">{errors.tanggal}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit_starlink">Unit Starlink *</Label>
              <select
                id="unit_starlink"
                name="unit_starlink"
                value={formData.unit_starlink}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select unit starlink</option>
                <option value="OFFICE1">OFFICE1</option>
                <option value="OFFICE2">OFFICE2</option>
                <option value="MESS1">MESS1</option>
              </select>
              {errors.unit_starlink && (
                <p className="text-sm text-red-500">{errors.unit_starlink}</p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="total_pemakaian">Total Pemakaian *</Label>
              <Input
                id="total_pemakaian"
                name="total_pemakaian"
                type="text"
                value={inputValues.total_pemakaian}
                onChange={handleChange}
                placeholder="Enter total pemakaian"
              />
              {errors.total_pemakaian && (
                <p className="text-sm text-red-500">{errors.total_pemakaian}</p>
              )}
            </div>
          </div>

          {(errors.submit || errors.tanggal || errors.unit_starlink || errors.total_pemakaian) && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-800">
                {errors.submit || 'Please fix the errors above.'}
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : usage ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
