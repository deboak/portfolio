import { z } from 'zod';

export const loginInput = z.object({
  body: z
    .object({
      email: z
        .string()
        .trim()
        .email()
        .transform((value) => value.toLowerCase()),
      password: z.string().min(12).max(128),
    })
    .strict(),
});

export type LoginInput = z.infer<typeof loginInput>['body'];

export const createAdminInput = z.object({
  body: z
    .object({
      email: z
        .string()
        .trim()
        .email()
        .transform((value) => value.toLowerCase()),
      password: z.string().min(12).max(128),
    })
    .strict(),
});
export type CreateAdminInput = z.infer<typeof createAdminInput>['body'];
