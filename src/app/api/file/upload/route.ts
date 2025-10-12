import { NextRequest, NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import s3Client from '@/lib/r2-client';
import getSupabaseClient from '@/lib/supabase-client';
import { auth } from '@clerk/nextjs/server';
import { ensureFilesTable } from '@/lib/setup-files';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const password = formData.get('password') as string | null;
    const prefix = formData.get('prefix') as string | null || '';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = file.name;
    const key = `${prefix}${fileName}`;

    // Upload to R2
    const uploadParams = {
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      Body: buffer,
      ContentType: file.type || 'application/octet-stream',
    };

    const command = new PutObjectCommand(uploadParams);
    await s3Client.send(command);

    // Ensure the files table exists
    const tableExists = await ensureFilesTable();
    if (!tableExists) {
      return NextResponse.json({
        error: 'File management is not properly set up',
        details: 'The files table does not exist in the database. Please see FILE_MANAGEMENT_SETUP.md for instructions on how to set up the file management feature.',
        setupRequired: true
      }, { status: 500 });
    }

    // Generate a unique file key for database reference
    const fileKey = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    // Store file information in database
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('files')
      .insert({
        file_key: fileKey,
        nama_file: key, // Store the full path including prefix
        password: password || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to save file information' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'File uploaded successfully',
      fileName: fileName,
      fileKey: fileKey,
      originalName: fileName,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}