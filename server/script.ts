import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    include: { society: true },
    where: {
      OR: [
        { email: 'naqsh@giki.edu.pk' },
        { email: 'acm@giki.edu.pk' }
      ]
    }
  });
  console.log('Users:');
  console.log(JSON.stringify(users, null, 2));

  const naqshSoc = await prisma.society.findFirst({
    where: { name: 'Naqsh Art Society' }
  });
  console.log('Naqsh Society:', naqshSoc);
  
  const acmSoc = await prisma.society.findFirst({
    where: { name: { contains: 'ACM' } }
  });
  console.log('ACM Society:', acmSoc);
}

main().catch(console.error);
