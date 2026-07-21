import crypto from 'node:crypto';

export function signWebhook(secret: string, timestamp: string, rawBody: Buffer | string) {
  return `sha256=${crypto.createHmac('sha256', secret).update(timestamp).update('.').update(rawBody).digest('hex')}`;
}

export function verifyWebhookSignature(input: {
  secret: string;
  timestamp: string;
  rawBody: Buffer;
  signature: string;
  now?: number;
  toleranceSeconds: number;
}) {
  const timestampSeconds = Number(input.timestamp);
  if (!Number.isInteger(timestampSeconds)) return false;
  const nowSeconds = Math.floor((input.now ?? Date.now()) / 1000);
  if (Math.abs(nowSeconds - timestampSeconds) > input.toleranceSeconds) return false;
  const expected = signWebhook(input.secret, input.timestamp, input.rawBody);
  const actualBuffer = Buffer.from(input.signature);
  const expectedBuffer = Buffer.from(expected);
  return (
    actualBuffer.length === expectedBuffer.length &&
    crypto.timingSafeEqual(actualBuffer, expectedBuffer)
  );
}
