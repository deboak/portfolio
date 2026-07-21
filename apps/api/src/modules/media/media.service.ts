import crypto from 'node:crypto';
import type { Queue } from 'bullmq';
import { AppError } from '../../lib/errors.js';
import type { MediaRepository } from './media.repository.js';
type Upload = (key: string, file: Express.Multer.File) => Promise<void>;
type Sign = (
  key: string,
  filename: string,
  disposition?: 'inline' | 'attachment',
) => Promise<string>;
export class MediaService {
  constructor(
    private readonly repository: MediaRepository,
    private readonly imageQueue: Pick<Queue, 'add'>,
    private readonly uploadOriginal: Upload,
    private readonly signDownload: Sign,
    private readonly resumeKey: string | undefined,
    private readonly signedUrlTtl: number,
  ) {}
  async upload(file?: Express.Multer.File) {
    if (!file) throw new AppError(400, 'An image file is required', 'FILE_REQUIRED');
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype))
      throw new AppError(
        415,
        'Only JPEG, PNG, and WebP images are supported',
        'UNSUPPORTED_MEDIA_TYPE',
      );
    const key = `originals/${crypto.randomUUID()}`;
    await this.uploadOriginal(key, file);
    const asset = await this.repository.create(key, file.mimetype);
    try {
      await this.imageQueue.add('resize-image', { assetId: asset.id });
      return asset;
    } catch {
      await this.repository.markQueueFailed(asset.id);
      throw new AppError(503, 'Image stored, but processing is unavailable', 'QUEUE_UNAVAILABLE');
    }
  }
  list() {
    return this.repository.list();
  }
  async resume() {
    if (!this.resumeKey) throw new AppError(404, 'Resume is not available', 'NOT_FOUND');
    const [viewUrl, downloadUrl] = await Promise.all([
      this.signDownload(this.resumeKey, 'Akinode-Resume.pdf', 'inline'),
      this.signDownload(this.resumeKey, 'Akinode-Resume.pdf', 'attachment'),
    ]);
    return { viewUrl, downloadUrl, expiresIn: this.signedUrlTtl };
  }
}
