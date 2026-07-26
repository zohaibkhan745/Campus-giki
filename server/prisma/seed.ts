import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { seedCategories } from './seeders/categories.seeder';
import { seedUsers } from './seeders/users.seeder';
import { seedAdvisors } from './seeders/advisors.seeder';
import { seedSocietiesAndFeed } from './seeders/societies.seeder';

const prisma = new PrismaClient();

async function main() {
  console.log('==================================================');
  console.log('🌱 Starting Campus GIKI Database Seeding System...');
  console.log('==================================================');

  const rawPassword = process.env.SEED_DEFAULT_PASSWORD || 'Password@123';
  const defaultPasswordHash = await bcrypt.hash(rawPassword, 10);

  // 1. Seed Predefined Categories
  const categories = await seedCategories(prisma);

  // 2. Seed base users (DSA Admin & Student)
  const { admin, student } = await seedUsers(prisma, defaultPasswordHash);

  // 3. Seed Faculty Advisor account & profile
  const advisor = await seedAdvisors(prisma, defaultPasswordHash);

  // 4. Seed Societies, Events, and Posts Feed
  const { societies, events, posts } = await seedSocietiesAndFeed(
    prisma,
    defaultPasswordHash,
    advisor.id,
    categories,
  );

  console.log('==================================================');
  console.log('✅ Database Seeding Completed Successfully!');
  console.log('--------------------------------------------------');
  console.log(` 🏷️  Categories: ${categories.length} predefined categories`);
  console.log(` 👤 DSA Admin  : ${admin.email}`);
  console.log(` 👤 Advisor    : ${advisor.id} (Linked to User)`);
  console.log(` 🏢 Societies  : ${societies.length} societies created`);
  console.log(` 📅 Events     : ${events.length} events created`);
  console.log(` 📢 Posts      : ${posts.length} announcement posts created`);
  console.log(` 👤 Student    : ${student.email}`);
  console.log(` 🔑 Default Password: ${rawPassword}`);
  console.log('==================================================');
}

main()
  .catch((error) => {
    console.error('❌ Database seeding failed with error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

