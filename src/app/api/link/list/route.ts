import { NextRequest } from 'next/server';
import getSupabaseClient from '@/lib/supabase-client';
import { ensureFileSharesTable } from '@/lib/setup-file-shares';

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    
    // Ensure the file_shares table exists
    const tableExists = await ensureFileSharesTable();
    if (!tableExists) {
      return new Response(
        JSON.stringify({
          error: 'File sharing is not properly set up',
          details: 'The file_shares table does not exist in the database. Please run the SQL script in src/lib/setup-file-shares-table.sql in your Supabase database to enable file sharing.',
          setupRequired: true
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Fetch shared links with file information
    const { data: shares, error } = await supabase
      .from('file_shares')
      .select(`
        id,
        file_key,
        created_at,
        expires_at,
        files!inner (nama_file)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching shared links:', error);
      
      // Check if the error is because the table doesn't exist
      if (error.code === 'PGRST205' && error.message?.includes('file_shares')) {
        return new Response(
          JSON.stringify({
            error: 'File sharing is not properly set up',
            details: 'The file_shares table does not exist in the database. Please run the SQL script in src/lib/setup-file-shares-table.sql in your Supabase database to enable file sharing.',
            setupRequired: true
          }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Failed to fetch shared links', details: error.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Format the data to include file names
    const formattedShares = shares.map((share: any) => ({
      id: share.id,
      file_key: share.file_key,
      created_at: share.created_at,
      expires_at: share.expires_at,
      file_name: share.files?.nama_file || 'Unknown File',
    }));

    return new Response(
      JSON.stringify({ sharedLinks: formattedShares }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in GET /api/link/list:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}