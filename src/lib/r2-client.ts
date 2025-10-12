import { S3Client } from '@aws-sdk/client-s3';

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const accessKeyId = process.env.CLOUDFLARE_ACCESS_KEY_ID;
const secretAccessKey = process.env.CLOUDFLARE_SECRET_ACCESS_KEY;

if (!accountId || !accessKeyId || !secretAccessKey) {
  throw new Error('Cloudflare R2 environment variables are not properly configured.');
}

// Create S3 client configured for Cloudflare R2
const s3Client = new S3Client({
  region: 'auto', // Cloudflare R2 uses 'auto' region
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: accessKeyId!,
    secretAccessKey: secretAccessKey!,
  },
});

export default s3Client;