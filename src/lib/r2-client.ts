import { S3Client } from '@aws-sdk/client-s3';

// Create S3 client configured for Cloudflare R2
const s3Client = new S3Client({
  region: 'auto', // Cloudflare R2 uses 'auto' region
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY!,
  },
});

export default s3Client;