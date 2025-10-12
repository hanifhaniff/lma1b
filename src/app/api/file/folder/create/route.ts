import { NextRequest, NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import s3Client from '@/lib/r2-client';

export async function POST(request: NextRequest) {
  try {
    const { folderName, prefix } = await request.json();

    if (!folderName) {
      return NextResponse.json({ error: 'No folder name provided' }, { status: 400 });
    }

    const bucketName = process.env.R2_BUCKET_NAME;
    if (!bucketName) {
      console.error('R2_BUCKET_NAME environment variable is not set.');
      return NextResponse.json({ error: 'Server configuration error: Bucket name is not set.' }, { status: 500 });
    }

    const key = `${prefix || ''}${folderName}/`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: '',
    });

    await s3Client.send(command);

    return NextResponse.json({ message: 'Folder created successfully' });
  } catch (error) {
    console.error('Create folder error:', error);
    return NextResponse.json({ error: 'Failed to create folder' }, { status: 500 });
  }
}
