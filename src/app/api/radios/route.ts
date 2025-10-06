import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get('search');

    let query = supabase.from('radio').select('*').order('created_at', { ascending: false });

    if (searchTerm) {
      // Search across multiple fields: nama_radio, serial_number, user_radio, tipe_radio, nomor_bast
      // Using textSearch for better multi-field search
      const searchPattern = `%${searchTerm}%`;
      query = query.or(
        `nama_radio.ilike.${searchPattern},serial_number.ilike.${searchPattern},user_radio.ilike.${searchPattern},tipe_radio.ilike.${searchPattern},nomor_bast.ilike.${searchPattern}`
      );
    }

    const { data, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ error: `Failed to fetch radios: ${error.message}` }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(JSON.stringify(data || []), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching radios:', error);
    return new Response(
      JSON.stringify({ error: `Failed to fetch radios: ${(error as Error).message}` }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}