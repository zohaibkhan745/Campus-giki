import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('naqsh123', 10);
  await prisma.user.update({
    where: { email: 'naqsh@giki.edu.pk' },
    data: { password: hash }
  });
  console.log("Updated naqsh@giki.edu.pk password to naqsh123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
