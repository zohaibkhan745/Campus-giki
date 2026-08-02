import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Deleting all events...');
  const result = await prisma.event.deleteMany({});
  console.log(`Successfully deleted ${result.count} events.`);
}

main()
  .catch((e) => {
    console.error('Error deleting events:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
