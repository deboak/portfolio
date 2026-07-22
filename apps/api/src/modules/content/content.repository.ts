import type { PrismaClient } from '@prisma/client';
import type { AboutInput, ListQuery, PostInput, ProjectInput } from './content.schemas.js';

export class ProjectRepository {
  constructor(private readonly prisma: PrismaClient) {}
  list(publishedOnly = true, page: ListQuery = { limit: 20 }) {
    return this.prisma.project.findMany({
      where: publishedOnly ? { published: true } : {},
      orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
      take: page.limit + 1,
      ...(page.cursor ? { cursor: { id: page.cursor }, skip: 1 } : {}),
    });
  }
  bySlug(slug: string) {
    return this.prisma.project.findFirst({ where: { slug, published: true } });
  }
  create(data: ProjectInput) {
    return this.prisma.project.create({
      data: {
        ...data,
        repositoryUrl: data.repositoryUrl ?? null,
        liveUrl: data.liveUrl ?? null,
      },
    });
  }
  update(id: string, data: ProjectInput) {
    return this.prisma.project.update({
      where: { id },
      data: {
        ...data,
        repositoryUrl: data.repositoryUrl ?? null,
        liveUrl: data.liveUrl ?? null,
      },
    });
  }
  remove(id: string) {
    return this.prisma.project.delete({ where: { id } });
  }
}
export class PostRepository {
  constructor(private readonly prisma: PrismaClient) {}
  list(publishedOnly = true, page: ListQuery = { limit: 20 }) {
    return this.prisma.post.findMany({
      where: publishedOnly ? { published: true } : {},
      orderBy: { publishedAt: 'desc' },
      take: page.limit + 1,
      ...(page.cursor ? { cursor: { id: page.cursor }, skip: 1 } : {}),
    });
  }
  bySlug(slug: string) {
    return this.prisma.post.findFirst({ where: { slug, published: true } });
  }
  create(data: PostInput) {
    return this.prisma.post.create({
      data: {
        ...data,
        publishedAt: data.published ? (data.publishedAt ?? new Date()) : (data.publishedAt ?? null),
      },
    });
  }
  update(id: string, data: PostInput) {
    return this.prisma.post.update({
      where: { id },
      data: {
        ...data,
        publishedAt: data.published ? (data.publishedAt ?? new Date()) : (data.publishedAt ?? null),
      },
    });
  }
  remove(id: string) {
    return this.prisma.post.delete({ where: { id } });
  }
}

export class AboutRepository {
  constructor(private readonly prisma: PrismaClient) {}

  get() {
    return this.prisma.aboutContent.findUnique({ where: { id: 'main' } });
  }

  save(data: AboutInput) {
    return this.prisma.aboutContent.upsert({
      where: { id: 'main' },
      create: { id: 'main', ...data },
      update: data,
    });
  }
}
