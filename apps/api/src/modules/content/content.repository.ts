import { prisma } from '../../lib/prisma.js';
import type { ListQuery, PostInput, ProjectInput } from './content.schemas.js';

export const projectRepository = {
  list: (publishedOnly = true,page:ListQuery={limit:20}) => prisma.project.findMany({ where: publishedOnly ? { published: true } : {}, orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],take:page.limit+1,...(page.cursor?{cursor:{id:page.cursor},skip:1}:{}) }),
  bySlug: (slug: string) => prisma.project.findFirst({ where: { slug, published: true } }),
  create: (data: ProjectInput) => prisma.project.create({ data: { ...data, repositoryUrl: data.repositoryUrl ?? null, liveUrl: data.liveUrl ?? null } }),
  update: (id: string, data: ProjectInput) => prisma.project.update({ where: { id }, data: { ...data, repositoryUrl: data.repositoryUrl ?? null, liveUrl: data.liveUrl ?? null } }),
  remove: (id: string) => prisma.project.delete({ where: { id } })
};

export const postRepository = {
  list: (publishedOnly = true,page:ListQuery={limit:20}) => prisma.post.findMany({ where: publishedOnly ? { published: true } : {}, orderBy: { publishedAt: 'desc' },take:page.limit+1,...(page.cursor?{cursor:{id:page.cursor},skip:1}:{}) }),
  bySlug: (slug: string) => prisma.post.findFirst({ where: { slug, published: true } }),
  create: (data: PostInput) => prisma.post.create({ data: { ...data, publishedAt: data.published ? (data.publishedAt ?? new Date()) : (data.publishedAt ?? null) } }),
  update: (id: string, data: PostInput) => prisma.post.update({ where: { id }, data: { ...data, publishedAt: data.published ? (data.publishedAt ?? new Date()) : (data.publishedAt ?? null) } }),
  remove: (id: string) => prisma.post.delete({ where: { id } })
};
