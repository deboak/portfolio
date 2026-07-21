import { describe, expect, it } from 'vitest';
import { signWebhook, verifyWebhookSignature } from '../src/modules/webhooks/webhook.signature.js';

const secret = 'test-webhook-secret-that-is-at-least-32-characters';
const timestamp = '1';
const rawBody = Buffer.from('{"id":"evt_1","type":"example.created","data":{}}');

describe('webhook signatures', () => {
  it('accepts an authentic payload within the allowed time window', () => {
    const signature = signWebhook(secret, timestamp, rawBody);
    expect(
      verifyWebhookSignature({
        secret,
        timestamp,
        rawBody,
        signature,
        now: 1_000,
        toleranceSeconds: 300,
      }),
    ).toBe(true);
  });
  it('rejects payload tampering', () => {
    const signature = signWebhook(secret, timestamp, rawBody);
    expect(
      verifyWebhookSignature({
        secret,
        timestamp,
        rawBody: Buffer.from('{}'),
        signature,
        now: 1_000,
        toleranceSeconds: 300,
      }),
    ).toBe(false);
  });
  it('rejects expired deliveries to limit replay attacks', () => {
    const signature = signWebhook(secret, timestamp, rawBody);
    expect(
      verifyWebhookSignature({
        secret,
        timestamp,
        rawBody,
        signature,
        now: 1_000_000,
        toleranceSeconds: 300,
      }),
    ).toBe(false);
  });
});
