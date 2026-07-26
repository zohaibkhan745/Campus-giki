import { PrismaClient, Role, Advisor } from '@prisma/client';

export async function seedAdvisors(
  prisma: PrismaClient,
  defaultPasswordHash: string,
): Promise<Advisor> {
  console.log('  -> Seeding Advisor account & profile...');

  const advisorUser = await prisma.user.upsert({
    where: { email: 'advisor.fcse@giki.edu.pk' },
    update: {},
    create: {
      email: 'advisor.fcse@giki.edu.pk',
      password: defaultPasswordHash,
      fullName: 'Dr. Ahsan Khan',
      role: Role.ADVISOR,
    },
  });

  const advisor = await prisma.advisor.upsert({
    where: { userId: advisorUser.id },
    update: {},
    create: {
      userId: advisorUser.id,
      department: 'Faculty of Computer Science & Engineering',
      designation: 'Associate Professor',
    },
  });

  return advisor;
}
