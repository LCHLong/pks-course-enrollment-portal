import { PrismaClient } from '@prisma/client';

// Đảm bảo Singleton instance của PrismaClient trong môi trường development,
// ngăn chặn việc tạo ra hàng chục connection mới khi máy chủ Express tự reload (tsx watch).
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
