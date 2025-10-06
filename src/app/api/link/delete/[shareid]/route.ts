import { NextRequest } from 'next/server';
import getSupabaseClient from '@/lib/supabase-client';
import { ensureFileSharesTable } from '@/lib/setup-file-shares';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ shareid: string }> }
) {
  try {
    const { shareid } = await params;
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
    
    // Delete the shared link
    const { error } = await supabase
      .from('file_shares')
      .delete()
      .eq('id', shareid);

    if (error) {
      console.error('Error deleting shared link:', error);
      
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
        JSON.stringify({ error: 'Failed to delete shared link', details: error.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ message: 'Shared link deleted successfully' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in DELETE /api/link/delete/[shareid]:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}