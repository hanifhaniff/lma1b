import { NextRequest } from 'next/server';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import s3Client from '@/lib/r2-client';
import getSupabaseClient from '@/lib/supabase-client';
import { ensureFileSharesTable } from '@/lib/setup-file-shares';

// Required table structure:
// CREATE TABLE file_shares (
//   id TEXT PRIMARY KEY,
//   file_key TEXT NOT NULL REFERENCES files(file_key),
//   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
//   expires_at TIMESTAMP WITH TIME ZONE
// );

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shareid: string }> }
) {
  try {
    const { shareid } = await params;
    console.log('Download request for share ID:', shareid);
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
    
    // Get the file key using the share ID
    const { data: shareData, error: shareError } = await supabase
      .from('file_shares')
      .select(`
        id,
        file_key,
        created_at,
        expires_at,
        files!inner (file_key, nama_file, password)
      `)
      .eq('id', shareid)
      .maybeSingle();

    console.log('Share data query result:', { shareData, shareError });

    if (shareError || !shareData) {
      // Check if the error is because the table doesn't exist
      if (shareError?.code === 'PGRST205' && shareError?.message?.includes('file_shares')) {
        return new Response(
          JSON.stringify({
            error: 'File sharing is not properly set up',
            details: 'The file_shares table does not exist in the database. Please run the SQL script in src/lib/setup-file-shares-table.sql in your Supabase database to enable file sharing.',
            setupRequired: true
          }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }
      
      console.log('Share not found, error:', shareError);
      return new Response(
        JSON.stringify({ error: 'Invalid share link', details: shareError?.message }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if the share has expired
    const now = new Date();
    const expiresAt = shareData.expires_at ? new Date(shareData.expires_at as string) : null;
    
    // Only check expiration if expires_at is not null (unlimited)
    if (expiresAt && now > expiresAt) {
      // Delete expired share
      await supabase.from('file_shares').delete().eq('id', shareid);
      return new Response(
        JSON.stringify({ error: 'Share link has expired' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Type assertion for the files relation
    const filesData = shareData.files as any;
    const fileName = filesData?.nama_file;
    const filePassword = filesData?.password;

    // Check if password is required 
    if (filePassword) {
      // Check if password was provided in the query params
      const providedPassword = request.nextUrl.searchParams.get('password');
      
      if (!providedPassword) {
        return new Response(
          JSON.stringify({ error: 'Password required for this file' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      }
      
      if (providedPassword !== filePassword) {
        return new Response(
          JSON.stringify({ error: 'Invalid password' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // Get the file from R2
    const bucketName = process.env.R2_BUCKET_NAME!;
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: fileName,
    });

    // Generate a presigned URL for the file
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1 hour expiry

    // Redirect to the signed URL to initiate download
    return Response.redirect(signedUrl);
  } catch (error) {
    console.error('Error downloading shared file:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function POST(
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
    
    // Get the file key using the share ID
    const { data: shareData, error: shareError } = await supabase
      .from('file_shares')
      .select(`
        id,
        file_key,
        created_at,
        expires_at,
        files!inner (file_key, nama_file, password)
      `)
      .eq('id', shareid)
      .maybeSingle();

    if (shareError || !shareData) {
      // Check if the error is because the table doesn't exist
      if (shareError?.code === 'PGRST205' && shareError?.message?.includes('file_shares')) {
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
        JSON.stringify({ error: 'Invalid share link' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if the share has expired
    const now = new Date();
    const expiresAt = shareData.expires_at ? new Date(shareData.expires_at as string) : null;
    
    // Only check expiration if expires_at is not null (unlimited)
    if (expiresAt && now > expiresAt) {
      // Delete expired share
      await supabase.from('file_shares').delete().eq('id', shareid);
      return new Response(
        JSON.stringify({ error: 'Share link has expired' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();
    const providedPassword = body.password;

    // Type assertion for the files relation
    const filesData = shareData.files as any;
    
    // Check if password is required
    if (filesData?.password) {
      if (!providedPassword) {
        return new Response(
          JSON.stringify({ error: 'Password required for this file' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      }
      
      if (providedPassword !== filesData.password) {
        return new Response(
          JSON.stringify({ error: 'Invalid password' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      }
      
      // Password verified successfully
      return new Response(
        JSON.stringify({ message: 'Password verified' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } else {
      // No password required
      return new Response(
        JSON.stringify({ message: 'No password required' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error verifying password for shared file:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}