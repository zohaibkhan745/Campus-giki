import { PrismaClient, Role, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

export async function seedUsers(
  prisma: PrismaClient,
  defaultPasswordHash: string,
): Promise<{ admin: User; student: User }> {
  console.log('  -> Seeding DSA Admin user...');
  const admin = await prisma.user.upsert({
    where: { email: 'admin.dsa@giki.edu.pk' },
    update: { dsaRole: 'DIRECTOR' },
    create: {
      email: 'admin.dsa@giki.edu.pk',
      password: defaultPasswordHash,
      fullName: 'Dean Student Affair',
      role: Role.DSA_ADMIN,
      dsaRole: 'DIRECTOR',
    },
  });

  console.log('  -> Seeding Student user...');
  const student = await prisma.user.upsert({
    where: { email: 'student.test@giki.edu.pk' },
    update: {},
    create: {
      email: 'student.test@giki.edu.pk',
      password: defaultPasswordHash,
      fullName: 'Muhammad Student',
      role: Role.STUDENT,
    },
  });

  return { admin, student };
}
