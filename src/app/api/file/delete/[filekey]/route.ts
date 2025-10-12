import { NextRequest, NextResponse } from 'next/server';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import s3Client from '@/lib/r2-client';
import getSupabaseClient from '@/lib/supabase-client';
import { ensureFilesTable } from '@/lib/setup-files';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ filekey: string }> }
) {
  try {
    const { filekey } = await params; // This is the file_key now
    const bucketName = process.env.R2_BUCKET_NAME!;
    
    // Ensure the files table exists
    const tableExists = await ensureFilesTable();
    if (!tableExists) {
      return new NextResponse(
        JSON.stringify({
          error: 'File management is not properly set up',
          details: 'The files table does not exist in the database. Please see FILE_MANAGEMENT_SETUP.md for instructions on how to set up the file management feature.',
          setupRequired: true
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const supabase = getSupabaseClient();

    // Get file information from the database to get the actual filename
    const { data, error } = await supabase
      .from('files')
      .select('nama_file')
      .eq('file_key', filekey)
      .single();

    if (error || !data) {
      return new NextResponse('File not found in database', { status: 404 });
    }

    // Delete object from R2 using the actual filename
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: data.nama_file as string, // Use the actual filename stored in the database
    });

    await s3Client.send(command);

    // Delete the record from the database
    const { error: deleteError } = await supabase
      .from('files')
      .delete()
      .eq('file_key', filekey);

    if (deleteError) {
      console.error('Database delete error:', deleteError);
      // Note: The file was deleted from R2 but not from the database
      return new NextResponse('File deleted from storage but failed to remove from database', { status: 500 });
    }

    return new NextResponse('File deleted successfully', { status: 200 });
  } catch (error) {
    console.error('Delete error:', error);
    return new NextResponse('Delete failed', { status: 500 });
  }
}