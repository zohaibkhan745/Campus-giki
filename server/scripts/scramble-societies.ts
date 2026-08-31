import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const societies = await prisma.society.findMany({
    where: {
      NOT: {
        name: {
          contains: 'ACM',
        }
      }
    },
    include: {
      user: true
    }
  });

  console.log(`Found ${societies.length} non-ACM societies to scramble.`);

  for (const society of societies) {
    if (society.user) {
      await prisma.user.update({
        where: { id: society.user.id },
        data: {
          isActive: false,
          password: 'DELETED_CREDENTIALS',
          email: `deleted_${society.user.id}@giki.edu.pk`
        }
      });
      console.log(`Scrambled credentials for ${society.name} (${society.user.id})`);
    }
  }

  console.log('Finished scrambling credentials.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
