import { NextRequest } from 'next/server';
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import s3Client from '@/lib/r2-client';
import getSupabaseClient from '@/lib/supabase-client';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const password = formData.get('password') as string | null;

    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 });
    }

    // Convert File to Buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Generate a unique file key for internal reference
    const fileKey = uuidv4();
    // Use only the original filename for R2 storage (without any prefixes)
    const fileName = file.name;
    const bucketName = process.env.R2_BUCKET_NAME!;

    // Upload to R2 using only the filename (without key prefix)
    const uploadParams = {
      Bucket: bucketName,
      Key: fileName,
      Body: buffer,
      ContentType: file.type || 'application/octet-stream',
    };

    const command = new PutObjectCommand(uploadParams);
    await s3Client.send(command);

    // Store file information in the database
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('files')
      .insert([
        {
          file_key: fileKey,
          nama_file: fileName,
          password: password || null,
        }
      ])
      .select();

    if (error) {
      console.error('Database error:', error);
      // Clean up the file from R2 if database insertion fails
      try {
        // Delete the uploaded file from R2
        const deleteCommand = new DeleteObjectCommand({
          Bucket: bucketName,
          Key: fileName,
        });
        await s3Client.send(deleteCommand);
      } catch (cleanupError) {
        console.error('Failed to clean up file from R2:', cleanupError);
      }
      
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ 
      message: 'File uploaded successfully', 
      file_key: fileKey,
      filename: fileName,
      originalName: file.name,
      size: file.size
    });
  } catch (error) {
    console.error('Upload error:', error);
    return Response.json({ error: 'Upload failed' }, { status: 500 });
  }
}