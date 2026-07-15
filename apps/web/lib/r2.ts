import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const bucketName = process.env.R2_BUCKET_NAME || 'bglaundry-bucket';
const publicUrl = process.env.R2_PUBLIC_URL || 'https://pub-mock.r2.dev';

const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT || 'https://mock.r2.cloudflarestorage.com',
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || 'mock-access-key',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || 'mock-secret-key',
  },
});

export async function uploadFile(
  fileBuffer: Buffer,
  fileName: string,
  contentType: string,
): Promise<string> {
  if (
    !process.env.R2_ACCESS_KEY_ID ||
    process.env.R2_ACCESS_KEY_ID === 'mock-access-key'
  ) {
    console.log(`[Cloudflare R2 Mock] Uploading file "${fileName}" (${contentType})...`);
    return `${publicUrl}/${fileName}`;
  }

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: fileName,
    Body: fileBuffer,
    ContentType: contentType,
  });

  await s3Client.send(command);
  return `${publicUrl}/${fileName}`;
}
