import { z } from 'zod';

export const contactInput = z.object({
  body: z
    .object({
      name: z.string().trim().min(2).max(100),
      email: z.string().trim().email().max(254),
      subject: z.string().trim().min(3).max(160),
      message: z.string().trim().min(20).max(5_000),
    })
    .strict(),
});

export type ContactInput = z.infer<typeof contactInput>['body'];

export const contactListQuery = z.object({
  query: z
    .object({
      cursor: z.string().cuid().optional(),
      limit: z.coerce.number().int().min(1).max(50).default(20),
    })
    .strict(),
});

export const contactIdParams = z.object({
  params: z.object({ id: z.string().cuid() }),
});

export type ContactListQuery = z.infer<typeof contactListQuery>['query'];
