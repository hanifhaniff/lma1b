import { NextRequest } from 'next/server';
import getSupabaseClient from '@/lib/supabase-client';
import { ensureFileSharesTable } from '@/lib/setup-file-shares';
import { ensureFilesTable } from '@/lib/setup-files';

// Required table structure:
// CREATE TABLE file_shares (
//   id TEXT PRIMARY KEY,
//   file_key TEXT NOT NULL REFERENCES files(file_key),
//   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
//   expires_at TIMESTAMP WITH TIME ZONE
// );

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filekey: string }> }
) {
  // For backward compatibility, handle GET requests with default expiration
  return handleShareRequest(request, params, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)); // 7 days default
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ filekey: string }> }
) {
  try {
    const { expiresAt } = await request.json();
    return handleShareRequest(request, params, expiresAt ? new Date(expiresAt) : null);
  } catch (error) {
    console.error('Error parsing POST request:', error);
    return new Response(
      JSON.stringify({ error: 'Invalid request format', details: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

async function handleShareRequest(
  request: NextRequest,
  params: Promise<{ filekey: string }>,
  expiresAt: Date | null
) {
  try {
    const { filekey } = await params;
    console.log('Sharing file with key:', filekey);
    const supabase = getSupabaseClient();
    
    // Ensure the files table exists
    const filesTableExists = await ensureFilesTable();
    if (!filesTableExists) {
      return new Response(
        JSON.stringify({
          error: 'File management is not properly set up',
          details: 'The files table does not exist in the database. Please see FILE_MANAGEMENT_SETUP.md for instructions on how to set up the file management feature.',
          setupRequired: true
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Ensure the file_shares table exists
    const sharesTableExists = await ensureFileSharesTable();
    if (!sharesTableExists) {
      return new Response(
        JSON.stringify({
          error: 'File sharing is not properly set up',
          details: 'The file_shares table does not exist in the database. Please see FILE_MANAGEMENT_SETUP.md for instructions on how to set up the file sharing feature.',
          setupRequired: true
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Verify that the file exists and get its details
    const { data: fileRecord, error } = await supabase
      .from('files')
      .select('file_key, nama_file, password')
      .eq('file_key', filekey)
      .single();

    if (error || !fileRecord) {
      console.error('File not found error:', error);
      return new Response(
        JSON.stringify({ error: 'File not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate that filekey parameter exists
    if (!filekey) {
      return new Response(
        JSON.stringify({ error: 'File key parameter is missing' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Generate a unique shareable link for the file
    const shareableLinkId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    console.log('Generated shareable link ID:', shareableLinkId);
    
    // Store the shareable link in the database
    const { data: shareData, error: insertError } = await supabase
      .from('file_shares')
      .insert({
        id: shareableLinkId,
        file_key: filekey,
        expires_at: expiresAt ? expiresAt.toISOString() : null, // Use the provided expiration date or null if not provided
        created_at: new Date().toISOString()
      })
      .select();

    if (insertError) {
      console.error('Failed to create shareable link:', insertError);
      
      // Check if the error is because the table doesn't exist
      if (insertError.code === 'PGRST205' && insertError.message?.includes('file_shares')) {
        return new Response(
          JSON.stringify({
            error: 'File sharing is not properly set up',
            details: 'The file_shares table does not exist in the database. Please see FILE_MANAGEMENT_SETUP.md for instructions on how to set up the file sharing feature.',
            setupRequired: true
          }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Failed to create shareable link', details: insertError.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Return the shareable link
    const shareUrl = `${request.nextUrl.origin}/share/${shareableLinkId}`;
    
    return new Response(
      JSON.stringify({ 
        shareUrl,
        fileName: fileRecord.nama_file,
        requiresPassword: !!fileRecord.password
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error generating shareable link:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}