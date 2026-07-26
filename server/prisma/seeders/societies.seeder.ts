import { PrismaClient, Role, Society, Category, Event, Post } from '@prisma/client';

export async function seedSocietiesAndFeed(
  prisma: PrismaClient,
  defaultPasswordHash: string,
  advisorId: string,
  categories: Category[],
): Promise<{ societies: Society[]; events: Event[]; posts: Post[] }> {
  console.log('  -> Seeding Societies, Events, and Posts feed data...');

  const catMap = new Map(categories.map((c) => [c.slug, c.id]));

  const societyDataList = [
    {
      email: 'acm@giki.edu.pk',
      fullName: 'ACM GIKI Executive Team',
      name: 'ACM GIKI Student Chapter',
      shortDescription: 'Computing and software innovation society',
      longDescription: 'Association for Computing Machinery GIKI Chapter promoting software innovation, competitive programming, and technical excellence.',
      logoUrl: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=150&auto=format&fit=crop&q=80',
      categorySlug: 'technology',
      events: [
        {
          title: 'Hackathon 2026: Code for Impact',
          description: 'A 24-hour hackathon focused on building AI and web solutions for real-world campus and social challenges.',
          eventDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // +10 days
          startTime: '09:00 AM',
          endTime: '09:00 AM (Next Day)',
          venue: 'AHA Auditorium & CS Lab 1',
          coverImageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=80',
          registrationLink: 'https://forms.gle/acm-hackathon-2026',
        },
        {
          title: 'Intro to AI & Deep Learning Workshop',
          description: 'Hands-on workshop introducing Python, PyTorch, and foundation neural networks for beginners.',
          eventDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000), // +18 days
          startTime: '05:30 PM',
          endTime: '07:30 PM',
          venue: 'FCSE Video Conferencing Room',
          coverImageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
          registrationLink: 'https://forms.gle/acm-ai-workshop',
        },
        {
          title: 'Competitive Programming Sprint #4',
          description: 'A 3-hour speed coding contest hosted on Codeforces with prizes for top 3 rankers.',
          eventDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), // -12 days
          startTime: '06:00 PM',
          endTime: '09:00 PM',
          venue: 'CS Lab 3',
          coverImageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80',
          registrationLink: null,
        },
      ],
      posts: [
        {
          content: '🚀 Registration for Hackathon 2026 is officially open! Form teams of up to 4 and register before spots fill up. Exciting cash prizes and mentorship await.',
          imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80',
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        },
        {
          content: 'Recruitment results for ACM 2025-2026 batch have been dispatched! Check your GIKI student emails for onboarding details.',
          imageUrl: null,
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        },
      ],
    },
    {
      email: 'gads@giki.edu.pk',
      fullName: 'GADS Executive Council',
      name: 'GIKI Arts & Dramatic Society',
      shortDescription: 'Fostering theater, music, visual arts, and performance art',
      longDescription: 'GADS is GIKI\'s premier cultural society bringing plays, live acoustic nights, and art exhibitions to the student body.',
      logoUrl: 'https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?w=150&auto=format&fit=crop&q=80',
      categorySlug: 'arts-and-culture',
      events: [
        {
          title: 'Annual Performing Arts & Drama Fest',
          description: 'A three-day extravaganza of theatrical plays, stand-up comedy, and live band performances.',
          eventDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // +14 days
          startTime: '07:00 PM',
          endTime: '11:00 PM',
          venue: 'Central Open Air Theater',
          coverImageUrl: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=800&auto=format&fit=crop&q=80',
          registrationLink: 'https://forms.gle/gads-drama-fest',
        },
        {
          title: 'Acoustic Sunset Session',
          description: 'Relaxed outdoor musical evening featuring student singers and instrumentalists.',
          eventDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // -20 days
          startTime: '06:00 PM',
          endTime: '08:30 PM',
          venue: 'Lawn near GIKI Library',
          coverImageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
          registrationLink: null,
        },
      ],
      posts: [
        {
          content: '🎭 Auditions for our upcoming Annual Drama Festival are happening this Thursday & Friday at the Student Center! All talents welcome.',
          imageUrl: 'https://images.unsplash.com/photo-1469488865564-c2de10f69f96?w=800&auto=format&fit=crop&q=80',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        },
        {
          content: 'Here is a quick throwback to our Acoustic Sunset Session! Thank you to everyone who performed and made it magical.',
          imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80',
          createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
        },
      ],
    },
    {
      email: 'gsc@giki.edu.pk',
      fullName: 'GSC Sports Directorate',
      name: 'GIKI Sports Club',
      shortDescription: 'Promoting athletic fitness, inter-departmental tournaments, and sportsmanship',
      longDescription: 'GIKI Sports Club organizes inter-faculty tournaments, marathons, futsal leagues, and table tennis championships.',
      logoUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266010b?w=150&auto=format&fit=crop&q=80',
      categorySlug: 'sports',
      events: [
        {
          title: 'Inter-Faculty Futsal Tournament',
          description: 'Fast-paced 5v5 futsal tournament featuring teams from all engineering and science departments.',
          eventDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // +5 days
          startTime: '05:00 PM',
          endTime: '10:00 PM',
          venue: 'Sports Complex Futsal Court',
          coverImageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=80',
          registrationLink: 'https://forms.gle/gsc-futsal-2026',
        },
        {
          title: 'Campus Table Tennis Championship',
          description: 'Single-elimination table tennis singles and doubles competition.',
          eventDate: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000), // +22 days
          startTime: '04:00 PM',
          endTime: '08:00 PM',
          venue: 'Indoor Sports Gymnasium',
          coverImageUrl: 'https://images.unsplash.com/photo-1534158914592-062992fbe900?w=800&auto=format&fit=crop&q=80',
          registrationLink: null,
        },
      ],
      posts: [
        {
          content: '⚽ Futsal fixtures are officially published! Matches kick off this Monday at 5:00 PM. Come support your faculty team!',
          imageUrl: null,
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        },
        {
          content: 'Congratulations to the Department of Electrical Engineering for winning the 2026 Inter-Batch Cricket Trophy! 🏆',
          imageUrl: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&auto=format&fit=crop&q=80',
          createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
        },
      ],
    },
    {
      email: 'naqeeb@giki.edu.pk',
      fullName: 'Project Naqeeb Leadership',
      name: 'Project Naqeeb Society',
      shortDescription: 'Community welfare, blood drives, and social development',
      longDescription: 'Project Naqeeb is a student-led welfare society dedicated to healthcare, education access, and emergency relief in local communities.',
      logoUrl: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb0?w=150&auto=format&fit=crop&q=80',
      categorySlug: 'community-service',
      events: [
        {
          title: 'Bi-Annual Campus Blood Donation Drive',
          description: 'Collaborating with Shaukat Khanum & Red Crescent to collect blood donations for thalassemias and oncology patients.',
          eventDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000), // +8 days
          startTime: '10:00 AM',
          endTime: '05:00 PM',
          venue: 'GIKI Medical Center Grounds',
          coverImageUrl: 'https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=800&auto=format&fit=crop&q=80',
          registrationLink: 'https://forms.gle/naqeeb-blood-drive',
        },
      ],
      posts: [
        {
          content: '🩸 One donation can save up to 3 lives. Join us at the GIKI Medical Center this coming Wednesday for the Blood Drive!',
          imageUrl: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&auto=format&fit=crop&q=80',
          createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
        },
        {
          content: 'Over 450 winter packages containing coats and blankets were distributed across Swabi and Topi region this winter. Thank you GIKI donors!',
          imageUrl: null,
          createdAt: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000), // 16 days ago
        },
      ],
    },
  ];

  const seededSocieties: Society[] = [];
  const seededEvents: Event[] = [];
  const seededPosts: Post[] = [];

  for (const sData of societyDataList) {
    const user = await prisma.user.upsert({
      where: { email: sData.email },
      update: { fullName: sData.fullName },
      create: {
        email: sData.email,
        password: defaultPasswordHash,
        fullName: sData.fullName,
        role: Role.SOCIETY,
      },
    });

    const categoryId = catMap.get(sData.categorySlug);

    const society = await prisma.society.upsert({
      where: { userId: user.id },
      update: {
        name: sData.name,
        shortDescription: sData.shortDescription,
        longDescription: sData.longDescription,
        logoUrl: sData.logoUrl,
        categoryId: categoryId || null,
        isSetupComplete: true,
      },
      create: {
        name: sData.name,
        shortDescription: sData.shortDescription,
        longDescription: sData.longDescription,
        logoUrl: sData.logoUrl,
        userId: user.id,
        advisorId: sData.email === 'acm@giki.edu.pk' ? advisorId : null,
        categoryId: categoryId || null,
        isSetupComplete: true,
      },
    });

    seededSocieties.push(society);

    // Seed Events for this society
    for (const e of sData.events) {
      const existingEvent = await prisma.event.findFirst({
        where: { societyId: society.id, title: e.title },
      });

      if (!existingEvent) {
        const createdEvent = await prisma.event.create({
          data: {
            title: e.title,
            description: e.description,
            eventDate: e.eventDate,
            startTime: e.startTime,
            endTime: e.endTime,
            venue: e.venue,
            coverImageUrl: e.coverImageUrl,
            registrationLink: e.registrationLink,
            societyId: society.id,
            isPublished: true,
          },
        });
        seededEvents.push(createdEvent);
      }
    }

    // Seed Posts for this society
    for (const p of sData.posts) {
      const existingPost = await prisma.post.findFirst({
        where: { societyId: society.id, content: p.content },
      });

      if (!existingPost) {
        const createdPost = await prisma.post.create({
          data: {
            content: p.content,
            imageUrl: p.imageUrl,
            societyId: society.id,
            createdAt: p.createdAt,
          },
        });
        seededPosts.push(createdPost);
      }
    }
  }

  return { societies: seededSocieties, events: seededEvents, posts: seededPosts };
}
