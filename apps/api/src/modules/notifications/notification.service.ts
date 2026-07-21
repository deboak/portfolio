import type { Response } from 'express';
import { Redis } from 'ioredis';

export type AdminNotification = {
  id: string;
  type: 'contact.submitted' | 'contact.updated' | 'media.updated' | 'system';
  title: string;
  message: string;
  createdAt: string;
  data?: Record<string, unknown>;
};
type Publisher = Pick<Redis, 'publish'>;

export class NotificationService {
  private readonly clients = new Set<Response>();
  private subscriber: Redis | null = null;
  private starting: Promise<void> | null = null;
  constructor(
    private readonly publisher: Publisher,
    private readonly redisUrl: string,
    private readonly environment: string,
    private readonly channel = 'admin:notifications',
  ) {}
  private async startSubscriber() {
    if (this.subscriber?.status === 'ready') return;
    if (this.starting) return this.starting;
    this.starting = (async () => {
      const connection = new Redis(this.redisUrl, {
        lazyConnect: true,
        connectTimeout: 1_500,
        maxRetriesPerRequest: null,
        enableOfflineQueue: false,
      });
      connection.on('error', (error) => {
        if (this.environment !== 'test')
          console.warn('Notification subscriber unavailable', error.message);
      });
      await connection.connect();
      await connection.subscribe(this.channel);
      connection.on('message', (_channel, message) => {
        for (const client of this.clients)
          client.write(`event: notification\ndata: ${message}\n\n`);
      });
      this.subscriber = connection;
    })().finally(() => {
      this.starting = null;
    });
    return this.starting;
  }
  async addClient(response: Response) {
    await this.startSubscriber();
    this.clients.add(response);
    return () => this.clients.delete(response);
  }
  async publish(notification: AdminNotification) {
    try {
      await this.publisher.publish(this.channel, JSON.stringify(notification));
    } catch (error) {
      if (this.environment !== 'test')
        console.warn('Live notification skipped', error instanceof Error ? error.message : error);
    }
  }
  async close() {
    for (const client of this.clients) client.end();
    this.clients.clear();
    if (this.subscriber) {
      const connection = this.subscriber;
      this.subscriber = null;
      await connection.quit().catch(() => connection.disconnect());
    }
  }
}
