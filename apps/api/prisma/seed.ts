import { fileURLToPath } from 'node:url';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { config as loadEnv } from 'dotenv';

loadEnv({ path: fileURLToPath(new URL('../../../.env', import.meta.url)) });

const prisma = new PrismaClient();

await prisma.project.upsert({
  where: { slug: 'portfolio-platform' },
  update: {},
  create: {
    title: 'Portfolio Practice Platform', slug: 'portfolio-platform',
    summary: 'A polished portfolio backed by production-grade engineering patterns.',
    description: 'Built with Next.js, Express, PostgreSQL, Prisma, and a deliberately layered architecture.',
    technologies: ['Next.js', 'Express', 'PostgreSQL', 'Prisma'], featured: true, published: true
  }
});

await prisma.post.upsert({
  where: { slug: 'building-in-public' }, update: {},
  create: {
    title: 'Building in Public', slug: 'building-in-public',
    excerpt: 'Why this portfolio is also a backend engineering laboratory.',
    content: '# Building in Public\n\nThis project turns a portfolio into a place to practice real production concerns.',
    published: true, publishedAt: new Date()
  }
});

const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
const adminPassword = process.env.ADMIN_PASSWORD;
if (adminEmail && adminPassword) {
  if (adminPassword.length < 12) throw new Error('ADMIN_PASSWORD must contain at least 12 characters');
  await prisma.admin.upsert({
    where: { email: adminEmail },
    update: { passwordHash: await bcrypt.hash(adminPassword, 12) },
    create: { email: adminEmail, passwordHash: await bcrypt.hash(adminPassword, 12) }
  });
  console.info(`Admin account seeded for ${adminEmail}`);
} else {
  console.warn('ADMIN_EMAIL/ADMIN_PASSWORD not set; skipped admin seed');
}

await prisma.$disconnect();
