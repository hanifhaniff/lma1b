'use server';

import { supabase } from '@/lib/supabase';
import { Voucher, NewVoucher } from './types';

// Fetch all vouchers
export async function getVouchers(): Promise<Voucher[]> {
  try {
    const { data, error } = await supabase
      .from('voucher')
      .select('*')
      .order('dibuat_pada', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      throw new Error(`Failed to fetch vouchers: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching vouchers:', error);
    throw error;
  }
}

// Fetch a single voucher by kode_voucher
export async function getVoucherById(kode_voucher: string): Promise<Voucher | null> {
  try {
    const { data, error } = await supabase
      .from('voucher')
      .select('*')
      .eq('kode_voucher', kode_voucher)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      console.error('Database error:', error);
      throw new Error(`Failed to fetch voucher: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error fetching voucher:', error);
    throw error;
  }
}

// Create a new voucher
export async function createVoucher(voucherData: NewVoucher): Promise<Voucher> {
  try {
    // Handle empty string for tanggal_kadaluarsa by converting to null
    const processedData = { ...voucherData };
    if (processedData.tanggal_kadaluarsa === '') {
      processedData.tanggal_kadaluarsa = null;
    }
    
    const { data, error } = await supabase
      .from('voucher')
      .insert([processedData])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      throw new Error(`Failed to create voucher: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error creating voucher:', error);
    throw error;
  }
}

// Update an existing voucher
export async function updateVoucher(kode_voucher: string, updateData: Partial<Voucher>): Promise<Voucher> {
  try {
    // Handle empty string for tanggal_kadaluarsa by converting to null
    const processedData = { ...updateData };
    if (processedData.tanggal_kadaluarsa === '') {
      processedData.tanggal_kadaluarsa = null;
    }
    
    const { data, error } = await supabase
      .from('voucher')
      .update(processedData)
      .eq('kode_voucher', kode_voucher)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      throw new Error(`Failed to update voucher: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error updating voucher:', error);
    throw error;
  }
}

// Delete a voucher
export async function deleteVoucher(kode_voucher: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('voucher')
      .delete()
      .eq('kode_voucher', kode_voucher);

    if (error) {
      console.error('Database error:', error);
      throw new Error(`Failed to delete voucher: ${error.message}`);
    }
  } catch (error) {
    console.error('Error deleting voucher:', error);
    throw error;
  }
}

// Update voucher status
export async function updateVoucherStatus(kode_voucher: string, status: 'aktif' | 'digunakan' | 'kadaluarsa'): Promise<Voucher> {
  try {
    const { data, error } = await supabase
      .from('voucher')
      .update({ status })
      .eq('kode_voucher', kode_voucher)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      throw new Error(`Failed to update voucher status: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error updating voucher status:', error);
    throw error;
  }
}