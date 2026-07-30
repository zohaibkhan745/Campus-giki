import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  console.log(posts);
}

check().catch(console.error).finally(() => prisma.$disconnect());
