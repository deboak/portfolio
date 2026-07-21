import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';
import { env } from '../../config/env.js';
import { prisma } from '../../lib/prisma.js';
import { analyticsService } from '../analytics/index.js';
import { r2 } from '../media/media.storage.js';
import { publishNotification } from '../notifications/index.js';
import { emailService } from './email.module.js';

const escapeHtml = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!,
  );

export async function processContact(submissionId: string) {
  const item = await prisma.contactSubmission.update({
    where: { id: submissionId },
    data: { status: 'PROCESSING', error: null },
  });
  try {
    if (env.ADMIN_NOTIFICATION_EMAIL)
      await emailService.send({
        to: env.ADMIN_NOTIFICATION_EMAIL,
        subject: `Portfolio contact: ${item.subject}`,
        html: `<p><strong>${escapeHtml(item.name)}</strong> (${escapeHtml(item.email)})</p><p>${escapeHtml(item.message).replaceAll('\n', '<br>')}</p>`,
      });
    await emailService.send({
      to: item.email,
      subject: 'Thanks for getting in touch',
      html: `<p>Hi ${escapeHtml(item.name)},</p><p>Your message was received. I'll respond as soon as I can.</p>`,
    });
    await prisma.contactSubmission.update({
      where: { id: item.id },
      data: { status: 'DELIVERED' },
    });
    await publishNotification({
      id: `contact-delivered-${item.id}`,
      type: 'contact.updated',
      title: 'Contact email delivered',
      message: `Delivery completed for ${item.name}`,
      createdAt: new Date().toISOString(),
      data: { submissionId: item.id, status: 'DELIVERED' },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown email error';
    await prisma.contactSubmission.update({
      where: { id: item.id },
      data: { status: 'FAILED', error: message },
    });
    await publishNotification({
      id: `contact-failed-${item.id}`,
      type: 'contact.updated',
      title: 'Contact delivery failed',
      message,
      createdAt: new Date().toISOString(),
      data: { submissionId: item.id, status: 'FAILED' },
    });
    throw error;
  }
}

export async function processImage(assetId: string) {
  const asset = await prisma.mediaAsset.update({
    where: { id: assetId },
    data: { status: 'PROCESSING', error: null },
  });
  const { client, bucket } = r2();
  try {
    const original = await client.send(
      new GetObjectCommand({ Bucket: bucket, Key: asset.originalKey }),
    );
    const bytes = Buffer.from(await original.Body!.transformToByteArray());
    const variants: Record<string, string> = {};
    for (const width of [320, 768, 1440]) {
      const key = `processed/${asset.id}/${width}.webp`;
      const body = await sharp(bytes)
        .rotate()
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: 82 })
        .toBuffer();
      await client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: body,
          ContentType: 'image/webp',
          CacheControl: 'public, max-age=31536000, immutable',
        }),
      );
      variants[String(width)] = key;
    }
    await prisma.mediaAsset.update({
      where: { id: asset.id },
      data: { status: 'READY', variants },
    });
    await publishNotification({
      id: `media-ready-${asset.id}`,
      type: 'media.updated',
      title: 'Image processing complete',
      message: 'Responsive image variants are ready.',
      createdAt: new Date().toISOString(),
      data: { assetId: asset.id, status: 'READY' },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown image error';
    await prisma.mediaAsset.update({
      where: { id: asset.id },
      data: { status: 'FAILED', error: message },
    });
    await publishNotification({
      id: `media-failed-${asset.id}`,
      type: 'media.updated',
      title: 'Image processing failed',
      message,
      createdAt: new Date().toISOString(),
      data: { assetId: asset.id, status: 'FAILED' },
    });
    throw error;
  }
}

export async function processDigest() {
  if (!env.ADMIN_NOTIFICATION_EMAIL) return;
  await analyticsService.flushViews();
  const since = new Date(Date.now() - 7 * 86_400_000);
  const [contacts, stats] = await Promise.all([
    prisma.contactSubmission.count({ where: { createdAt: { gte: since } } }),
    analyticsService.topContent() as Promise<{
      projects: { title: string; viewCount: number }[];
      posts: { title: string; viewCount: number }[];
    }>,
  ]);
  await emailService.send({
    to: env.ADMIN_NOTIFICATION_EMAIL,
    subject: 'Weekly portfolio digest',
    html: `<h1>Weekly digest</h1><p>${contacts} new contact submissions.</p><h2>Top projects</h2><ul>${stats.projects.map((x) => `<li>${x.title}: ${x.viewCount}</li>`).join('')}</ul><h2>Top posts</h2><ul>${stats.posts.map((x) => `<li>${x.title}: ${x.viewCount}</li>`).join('')}</ul>`,
  });
}
