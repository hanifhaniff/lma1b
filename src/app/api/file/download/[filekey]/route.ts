import { NextRequest, NextResponse } from 'next/server';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import supabase from '@/lib/supabase-client';
import s3Client from '@/lib/r2-client';

export async function POST(
  request: NextRequest,
  { params }: { params: { filekey: string } }
) {
  try {
    const { filekey } = params;
    const { password } = await request.json();
    const bucketName = process.env.R2_BUCKET_NAME!;

    // Get file information from the database
    const { data, error } = await supabase
      .from('files')
      .select('nama_file, password')
      .eq('file_key', filekey)
      .single();

    if (error || !data) {
      return Response.json({ error: 'File not found' }, { status: 404 });
    }

    // Check if the provided password matches the stored password
    if (data.password && data.password !== password) {
      return Response.json({ error: 'Incorrect password' }, { status: 401 });
    }

    // Get object from R2 using the stored filename
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: data.nama_file, // Use the original filename
    });

    const response = await s3Client.send(command);

    // Get the file content as a buffer
    const bodyContents = await response.Body?.transformToByteArray();
    if (!bodyContents) {
      return Response.json({ error: 'File not found' }, { status: 404 });
    }

    // Get the content type, defaulting to octet-stream if not available
    const contentType = response.ContentType || 'application/octet-stream';

    // Return the file content with appropriate headers
    return new NextResponse(Buffer.from(bodyContents), {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${data.nama_file}"`,
      },
    });
  } catch (error) {
    console.error('Download error:', error);
    return Response.json({ error: 'Download failed' }, { status: 500 });
  }
}

// Handle GET request for files without passwords
export async function GET(
  request: NextRequest,
  { params }: { params: { filekey: string } }
) {
  try {
    const { filekey } = params;
    const bucketName = process.env.R2_BUCKET_NAME!;

    // Get file information from the database
    const { data, error } = await supabase
      .from('files')
      .select('nama_file, password')
      .eq('file_key', filekey)
      .single();

    if (error || !data) {
      return Response.json({ error: 'File not found' }, { status: 404 });
    }

    // For GET requests, only allow if the file doesn't have a password
    if (data.password) {
      return Response.json({ error: 'This file is password protected. Use POST with password.' }, { status: 401 });
    }

    // Get object from R2 using the stored filename
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: data.nama_file, // Use the original filename
    });

    const response = await s3Client.send(command);

    // Get the file content as a buffer
    const bodyContents = await response.Body?.transformToByteArray();
    if (!bodyContents) {
      return Response.json({ error: 'File not found' }, { status: 404 });
    }

    // Get the content type, defaulting to octet-stream if not available
    const contentType = response.ContentType || 'application/octet-stream';

    // Return the file content with appropriate headers
    return new NextResponse(Buffer.from(bodyContents), {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${data.nama_file}"`,
      },
    });
  } catch (error) {
    console.error('Download error:', error);
    return Response.json({ error: 'Download failed' }, { status: 500 });
  }
}