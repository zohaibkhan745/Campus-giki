import { PrismaClient, Category } from '@prisma/client';

export const INITIAL_CATEGORIES = [
  { name: 'Technology', slug: 'technology' },
  { name: 'Sports', slug: 'sports' },
  { name: 'Arts & Culture', slug: 'arts-and-culture' },
  { name: 'Community Service', slug: 'community-service' },
  { name: 'Academic', slug: 'academic' },
  { name: 'Media', slug: 'media' },
  { name: 'Entrepreneurship', slug: 'entrepreneurship' },
  { name: 'Religious', slug: 'religious' },
  { name: 'Other', slug: 'other' },
];

export async function seedCategories(prisma: PrismaClient): Promise<Category[]> {
  console.log('  -> Seeding Predefined Society Categories...');
  const seededCategories: Category[] = [];

  for (const cat of INITIAL_CATEGORIES) {
    const category = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name },
      create: {
        name: cat.name,
        slug: cat.slug,
      },
    });
    seededCategories.push(category);
  }

  return seededCategories;
}
