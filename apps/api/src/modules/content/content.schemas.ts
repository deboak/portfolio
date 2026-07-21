import { z } from 'zod';

const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
export const idParams = z.object({
  params: z.object({ id: z.string().cuid() }),
});
export const slugParams = z.object({ params: z.object({ slug }) });
export const listQuery = z.object({
  query: z
    .object({
      cursor: z.string().cuid().optional(),
      limit: z.coerce.number().int().min(1).max(50).default(20),
    })
    .strict(),
});

export const projectInput = z.object({
  body: z
    .object({
      title: z.string().trim().min(2).max(120),
      slug,
      summary: z.string().trim().min(10).max(300),
      description: z.string().trim().min(20),
      technologies: z.array(z.string().trim().min(1)).max(20),
      repositoryUrl: z.string().url().nullable().optional(),
      liveUrl: z.string().url().nullable().optional(),
      featured: z.boolean().default(false),
      published: z.boolean().default(false),
    })
    .strict(),
});

export const postInput = z.object({
  body: z
    .object({
      title: z.string().trim().min(2).max(160),
      slug,
      excerpt: z.string().trim().min(10).max(300),
      content: z.string().trim().min(20),
      published: z.boolean().default(false),
      publishedAt: z.coerce.date().nullable().optional(),
    })
    .strict(),
});

export type ProjectInput = z.infer<typeof projectInput>['body'];
export type PostInput = z.infer<typeof postInput>['body'];
export type ListQuery = z.infer<typeof listQuery>['query'];
