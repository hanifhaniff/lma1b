'use server';

import { supabase } from '@/lib/supabase';
import { StarlinkUsage, NewStarlinkUsage } from './types';

// Fetch all starlink usage records
export async function getStarlinkUsages(): Promise<StarlinkUsage[]> {
  try {
    const { data, error } = await supabase
      .from('starlink_usage')
      .select('*')
      .order('tanggal', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      throw new Error(`Failed to fetch starlink usage records: ${error.message}`);
    }

    return (data as unknown as StarlinkUsage[]) || [];
  } catch (error) {
    console.error('Error fetching starlink usage records:', error);
    throw error;
  }
}

// Fetch a single starlink usage record by id
export async function getStarlinkUsageById(id: number): Promise<StarlinkUsage | null> {
  try {
    const { data, error } = await supabase
      .from('starlink_usage')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      console.error('Database error:', error);
      throw new Error(`Failed to fetch starlink usage record: ${error.message}`);
    }

    return data as unknown as StarlinkUsage;
  } catch (error) {
    console.error('Error fetching starlink usage record:', error);
    throw error;
  }
}

// Create a new starlink usage record
export async function createStarlinkUsage(usageData: NewStarlinkUsage): Promise<StarlinkUsage> {
  try {
    const { data, error } = await supabase
      .from('starlink_usage')
      .insert([usageData as unknown as Record<string, unknown>])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      throw new Error(`Failed to create starlink usage record: ${error.message}`);
    }

    return data as unknown as StarlinkUsage;
  } catch (error) {
    console.error('Error creating starlink usage record:', error);
    throw error;
  }
}

// Update an existing starlink usage record
export async function updateStarlinkUsage(id: number, updateData: Partial<StarlinkUsage>): Promise<StarlinkUsage> {
  try {
    const { data, error } = await supabase
      .from('starlink_usage')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      throw new Error(`Failed to update starlink usage record: ${error.message}`);
    }

    return data as unknown as StarlinkUsage;
  } catch (error) {
    console.error('Error updating starlink usage record:', error);
    throw error;
  }
}

// Check if a record already exists for the same date and unit
export async function checkDuplicateUsage(tanggal: string, unit_starlink: string, excludeId?: number): Promise<boolean> {
  try {
    let query = supabase
      .from('starlink_usage')
      .select('id', { count: 'exact', head: true })
      .eq('tanggal', tanggal)
      .eq('unit_starlink', unit_starlink);

    if (excludeId !== undefined) {
      query = query.neq('id', excludeId);
    }

    const { count, error } = await query;

    if (error) {
      console.error('Database error:', error);
      throw new Error(`Failed to check duplicate usage: ${error.message}`);
    }

    return count !== null && count > 0;
  } catch (error) {
    console.error('Error checking duplicate usage:', error);
    throw error;
  }
}

// Delete a starlink usage record
export async function deleteStarlinkUsage(id: number): Promise<void> {
  try {
    const { error } = await supabase
      .from('starlink_usage')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Database error:', error);
      throw new Error(`Failed to delete starlink usage record: ${error.message}`);
    }
  } catch (error) {
    console.error('Error deleting starlink usage record:', error);
    throw error;
  }
}