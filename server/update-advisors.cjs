const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function update() {
  await prisma.advisor.updateMany({
    where: { department: { contains: 'Faculty of Computer Science' } },
    data: { department: 'FCSE' }
  });
  console.log("Updated advisors");
}

update().catch(console.error).finally(() => prisma.$disconnect());
