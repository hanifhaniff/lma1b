'use server';

import { supabase } from '@/lib/supabase';
import { Radio, NewRadio } from './types';

// Fetch all radios
export async function getRadios(): Promise<Radio[]> {
  try {
    const { data, error } = await supabase
      .from('radio')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      throw new Error(`Failed to fetch radios: ${error.message}`);
    }

    return (data as unknown as Radio[]) || [];
  } catch (error) {
    console.error('Error fetching radios:', error);
    throw error;
  }
}

// Fetch a single radio by id
export async function getRadioById(id: number): Promise<Radio | null> {
  try {
    const { data, error } = await supabase
      .from('radio')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      console.error('Database error:', error);
      throw new Error(`Failed to fetch radio: ${error.message}`);
    }

    return data as unknown as Radio;
  } catch (error) {
    console.error('Error fetching radio:', error);
    throw error;
  }
}

// Create a new radio
export async function createRadio(radioData: NewRadio): Promise<Radio> {
  try {
    const { data, error } = await supabase
      .from('radio')
      .insert([radioData as unknown as Record<string, unknown>])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      throw new Error(`Failed to create radio: ${error.message}`);
    }

    return data as unknown as Radio;
  } catch (error) {
    console.error('Error creating radio:', error);
    throw error;
  }
}

// Update an existing radio
export async function updateRadio(id: number, updateData: Partial<Radio>): Promise<Radio> {
  try {
    const { data, error } = await supabase
      .from('radio')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      throw new Error(`Failed to update radio: ${error.message}`);
    }

    return data as unknown as Radio;
  } catch (error) {
    console.error('Error updating radio:', error);
    throw error;
  }
}

// Delete a radio
export async function deleteRadio(id: number): Promise<void> {
  try {
    const { error } = await supabase
      .from('radio')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Database error:', error);
      throw new Error(`Failed to delete radio: ${error.message}`);
    }
  } catch (error) {
    console.error('Error deleting radio:', error);
    throw error;
  }
}