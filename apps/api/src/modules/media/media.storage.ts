import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '../../config/env.js';
import { AppError } from '../../lib/errors.js';
export function r2() {
  if (!env.R2_ENDPOINT || !env.R2_ACCESS_KEY_ID || !env.R2_SECRET_ACCESS_KEY || !env.R2_BUCKET)
    throw new AppError(503, 'R2 storage is not configured', 'STORAGE_UNAVAILABLE');
  return {
    bucket: env.R2_BUCKET,
    client: new S3Client({
      region: 'auto',
      endpoint: env.R2_ENDPOINT,
      credentials: {
        accessKeyId: env.R2_ACCESS_KEY_ID,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY,
      },
    }),
  };
}
export async function uploadOriginal(key: string, file: Express.Multer.File) {
  const { client, bucket } = r2();
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    }),
  );
}
export async function signedDownload(
  key: string,
  filename: string,
  disposition: 'inline' | 'attachment' = 'attachment',
  contentType = 'application/pdf',
) {
  const { client, bucket } = r2();
  return getSignedUrl(
    client,
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
      ResponseContentDisposition: `${disposition}; filename="${filename}"`,
      ResponseContentType: contentType,
    }),
    { expiresIn: env.SIGNED_URL_TTL_SECONDS },
  );
}
