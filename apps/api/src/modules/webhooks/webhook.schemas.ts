import { z } from 'zod';

export const webhookInput = z.object({
  params: z.object({ provider: z.string().regex(/^[a-z0-9-]{2,40}$/) }),
  body: z
    .object({
      id: z.string().min(1).max(200),
      type: z.string().min(1).max(100),
      data: z.record(z.unknown()),
    })
    .strict(),
  query: z.object({}).passthrough(),
});
