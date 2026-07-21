import type { PrismaClient } from '@prisma/client';
export class AuthRepository {
  constructor(private readonly prisma: PrismaClient) {}
  findAdmin(email: string) {
    return this.prisma.admin.findUnique({ where: { email } });
  }
  updateFailures(id: string, failedLoginAttempts: number, lockedUntil: Date | null) {
    return this.prisma.admin.update({
      where: { id },
      data: { failedLoginAttempts, lockedUntil },
    });
  }
  resetFailures(id: string) {
    return this.prisma.admin.update({
      where: { id },
      data: { failedLoginAttempts: 0, lockedUntil: null },
    });
  }
  createSession(data: { id: string; adminId: string; tokenHash: string; expiresAt: Date }) {
    return this.prisma.refreshSession.create({ data });
  }
  findSession(id: string) {
    return this.prisma.refreshSession.findUnique({
      where: { id },
      include: { admin: true },
    });
  }
  revokeSession(id: string) {
    return this.prisma.refreshSession.update({
      where: { id },
      data: { revokedAt: new Date() },
    });
  }
  revokeAdminSessions(adminId: string) {
    return this.prisma.refreshSession.updateMany({
      where: { adminId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
  revokeByHash(tokenHash: string) {
    return this.prisma.refreshSession.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
}
export class AdminRepository {
  private readonly select = { id: true, email: true, createdAt: true } as const;
  constructor(private readonly prisma: PrismaClient) {}
  list() {
    return this.prisma.admin.findMany({
      select: this.select,
      orderBy: { createdAt: 'asc' },
    });
  }
  create(email: string, passwordHash: string) {
    return this.prisma.admin.create({
      data: { email, passwordHash },
      select: this.select,
    });
  }
}
