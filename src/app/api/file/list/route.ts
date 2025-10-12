import { NextRequest, NextResponse } from 'next/server';
import s3Client from '@/lib/r2-client';
import { ListObjectsV2Command } from '@aws-sdk/client-s3';
import getSupabaseClient from '@/lib/supabase-client';
import { ensureFilesTable } from '@/lib/setup-files';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const prefix = searchParams.get('prefix') || '';

  const bucketName = process.env.R2_BUCKET_NAME;
  if (!bucketName) {
    console.error('R2_BUCKET_NAME environment variable is not set.');
    return NextResponse.json({ error: 'Server configuration error: Bucket name is not set.' }, { status: 500 });
  }

  try {
    // Ensure the files table exists
    const tableExists = await ensureFilesTable();
    if (!tableExists) {
      return NextResponse.json({
        error: 'File management is not properly set up',
        details: 'The files table does not exist in the database. Please see FILE_MANAGEMENT_SETUP.md for instructions on how to set up the file management feature.',
        setupRequired: true
      }, { status: 500 });
    }

    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: prefix,
      Delimiter: '/',
    });

    const response = await s3Client.send(command);

    const folders = response.CommonPrefixes?.map(commonPrefix => ({
      type: 'folder',
      name: commonPrefix.Prefix?.replace(prefix, '').replace(/\/$/, ''),
      prefix: commonPrefix.Prefix,
    })) || [];

    // Get file information from the database
    const supabase = getSupabaseClient();
    const { data: filesData, error: filesError } = await supabase
      .from('files')
      .select('file_key, nama_file, password')
      .like('nama_file', `${prefix}%`);

    if (filesError) {
      console.error('Database error:', filesError);
      return NextResponse.json({ error: 'Failed to fetch file information' }, { status: 500 });
    }

    // Create a map of file paths to database records
    const fileMap = new Map();
    filesData?.forEach(file => {
      fileMap.set(file.nama_file, file);
    });

    const files = response.Contents?.filter(content => !content.Key?.endsWith('/')).map(content => {
      const dbRecord = fileMap.get(content.Key);
      // Extract just the filename from the full path
      const fileName = content.Key?.split('/').pop() || content.Key?.replace(prefix, '');
      return {
        type: 'file',
        name: fileName,
        file_key: dbRecord?.file_key || content.Key,
        size: content.Size,
        last_modified: content.LastModified,
        password_protected: !!dbRecord?.password,
      };
    }) || [];

    return NextResponse.json({ items: [...folders, ...files] });
  } catch (error) {
    console.error('List error:', error);
    return NextResponse.json({ error: 'Failed to list files' }, { status: 500 });
  }
}