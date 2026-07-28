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
      bannerUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80',
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
      bannerUrl: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=1200&auto=format&fit=crop&q=80',
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
      bannerUrl: 'https://images.unsplash.com/photo-1526676037777-05a232554f77?w=1200&auto=format&fit=crop&q=80',
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
      email: 'topi@giki.edu.pk',
      fullName: 'Project Topi Leadership',
      name: 'Project Topi Society',
      shortDescription: 'Community welfare, blood drives, and social development',
      longDescription: 'Project Topi is a student-led welfare society dedicated to healthcare, education access, and emergency relief in local communities.',
      logoUrl: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb0?w=150&auto=format&fit=crop&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1593113580332-ceb4081c7ee2?w=1200&auto=format&fit=crop&q=80',
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
          registrationLink: 'https://forms.gle/topi-blood-drive',
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
    {
      email: 'naqsh@giki.edu.pk',
      fullName: 'NAQSH Arts Executive Committee',
      name: 'NAQSH Arts Society',
      shortDescription: 'Fine arts, calligraphy, speed painting, and creative visual design',
      longDescription: 'NAQSH Arts Society is GIKI\'s creative powerhouse organizing national art exhibitions, live murals, calligraphy workshops, and digital art contests.',
      logoUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=200&auto=format&fit=crop&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1200&auto=format&fit=crop&q=80',
      categorySlug: 'arts-and-culture',
      events: [
        {
          title: 'NAQSH National Arts & Calligraphy Exhibition 2026',
          description: 'A 3-day national exhibition showcasing fine art, Arabic calligraphy, speed painting competitions, and digital art galleries.',
          eventDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), // +12 days
          startTime: '10:00 AM',
          endTime: '06:00 PM',
          venue: 'AHA Auditorium Gallery',
          coverImageUrl: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1200&auto=format&fit=crop&q=80',
          registrationLink: 'https://forms.gle/naqsh-arts-2026',
        },
      ],
      posts: [
        {
          content: '🎨 Registrations for NAQSH National Arts Exhibition 2026 are officially open! Submit your artwork entries before the deadline.',
          imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80',
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
      ],
    },
    {
      email: 'webteam@giki.edu.pk',
      fullName: 'GIK WebTeam Executive Team',
      name: 'GIK WebTeam',
      shortDescription: 'Student team designing and managing the official GIK website and web services',
      longDescription: 'The GIK Webteam is an in-house team of students that voluntarily design and manage the GIK website and its related affairs, with their services being officially recognized by the Institute. Everything from engineering, design, development and infrastructure to multimedia, photography and content is handled by this very team of students.',
      logoUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=150&auto=format&fit=crop&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&auto=format&fit=crop&q=80',
      categorySlug: 'technology',
      events: [
        {
          title: 'GIK Portal UI/UX Redesign Hackathon',
          description: 'Join WebTeam for an exciting 12-hour session to re-imagine the student portal user interface.',
          eventDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
          startTime: '10:00 AM',
          endTime: '10:00 PM',
          venue: 'WebTeam Development Lab',
          coverImageUrl: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=800&auto=format&fit=crop&q=80',
          registrationLink: 'https://forms.gle/webteam-redesign-2026',
        },
      ],
      posts: [
        {
          content: '💻 The official GIK portal has been updated with brand new features for the upcoming semester! Check out the updated layout.',
          imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
      ],
    },
    {
      email: 'netronix@giki.edu.pk',
      fullName: 'NETRONiX Society Council',
      name: 'NETRONiX',
      shortDescription: 'Caretaker of campus network, server infrastructure, and host of Über.GameX',
      longDescription: 'GIK Institute computer network is one of the largest in the country. This society is the caretaker of the hostel network which consists of over 600 workstations. NETRONiX is the organizer of the first ever all Pakistan network gaming marathon named Über.GameX.',
      logoUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=150&auto=format&fit=crop&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&auto=format&fit=crop&q=80',
      categorySlug: 'technology',
      events: [
        {
          title: 'Über.GameX 2026 - All-Pakistan Gaming Marathon',
          description: 'The premier national network gaming tournament featuring Valorant, CS:GO, FIFA, and Tekken 7.',
          eventDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
          startTime: '11:00 AM',
          endTime: '11:00 PM',
          venue: 'GIKI Hostels & Central Gaming Hub',
          coverImageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80',
          registrationLink: 'https://forms.gle/uber-gamex-2026',
        },
      ],
      posts: [
        {
          content: '🎮 Gear up gamers! Über.GameX returns this year bigger and better. Stay tuned for rulebooks and registration dates.',
          imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop&q=80',
          createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        },
      ],
    },
    {
      email: 'spie@giki.edu.pk',
      fullName: 'SPIE GIK Executive Council',
      name: 'SPIE GIK Chapter',
      shortDescription: 'Advancing optics, photonics, photo-optics, and organizing the GIKI Open House',
      longDescription: 'SPIE GIK chapter is the growing legacy of those who seek to learn, discover and innovate by creating, promoting and sustaining a multifaceted platform for Photonics, Photo-optics and Instrumentation. Working in conjunction with the administration, the SPIE GIK chapter also manages and hosts the Open House.',
      logoUrl: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=150&auto=format&fit=crop&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&auto=format&fit=crop&q=80',
      categorySlug: 'technology',
      events: [
        {
          title: 'GIKI Annual Open House & Career Fair 2026',
          description: 'Showcasing final year projects to industry leaders and connecting students with top national employers.',
          eventDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          startTime: '09:00 AM',
          endTime: '05:00 PM',
          venue: 'AHA Auditorium & Central Lawns',
          coverImageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80',
          registrationLink: 'https://forms.gle/spie-open-house-2026',
        },
      ],
      posts: [
        {
          content: '🔬 SPIE GIK is excited to announce an upcoming workshop on Laser Photonics and Optical Fiber Communication systems.',
          imageUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&auto=format&fit=crop&q=80',
          createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        },
      ],
    },
    {
      email: 'sciencesociety@giki.edu.pk',
      fullName: 'Science Society Executive Committee',
      name: 'Science Society',
      shortDescription: 'Promoting scientific curiosity, contemporary research, and student science projects',
      longDescription: 'Provides opportunities to students to nurture their scientific talents. It arranges video shows on contemporary developments in various scientific fields and encourages and financially backs scientific projects undertaken by students on their own initiative.',
      logoUrl: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=150&auto=format&fit=crop&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1200&auto=format&fit=crop&q=80',
      categorySlug: 'academics',
      events: [
        {
          title: 'All-Pakistan Science & Innovation Fair',
          description: 'Exhibition of innovative research projects and scientific models created by university students.',
          eventDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
          startTime: '10:00 AM',
          endTime: '04:00 PM',
          venue: 'FCSE Main Lobby',
          coverImageUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&auto=format&fit=crop&q=80',
          registrationLink: 'https://forms.gle/science-fair-2026',
        },
      ],
      posts: [
        {
          content: '🌌 Join us this Friday for a screening on quantum computing and its future impact on software engineering!',
          imageUrl: null,
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        },
      ],
    },
    {
      email: 'aiaa@giki.edu.pk',
      fullName: 'AIAA GIK Chapter Leadership',
      name: 'AIAA GIK Chapter',
      shortDescription: 'Aerospace, radio-controlled aircraft, and aviation technology platform',
      longDescription: 'The American Institute of Aeronautics and Astronautics (AIAA) is a prominent technical society at GIK Institute. Formerly known as the GIK Aerotech Club, it provides a platform for Aerospace enthusiasts and maintains a fleet of Radio Controlled Aircraft.',
      logoUrl: 'https://images.unsplash.com/photo-1517976487492-5750f3195933?w=150&auto=format&fit=crop&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&auto=format&fit=crop&q=80',
      categorySlug: 'technology',
      events: [
        {
          title: 'RC Plane Design & Flight Dynamics Workshop',
          description: 'Learn aerodynamics fundamentals and build your own mini RC Glider from scratch.',
          eventDate: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000),
          startTime: '02:00 PM',
          endTime: '06:00 PM',
          venue: 'FME Mechanical Workshop',
          coverImageUrl: 'https://images.unsplash.com/photo-1519074069444-1ba4eae16748?w=800&auto=format&fit=crop&q=80',
          registrationLink: 'https://forms.gle/aiaa-rc-workshop',
        },
      ],
      posts: [
        {
          content: '✈️ The flight testing phase for our team entry in the Design, Build, Fly contest has officially begun at GIKI Helipad!',
          imageUrl: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=800&auto=format&fit=crop&q=80',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        },
      ],
    },
    {
      email: 'gss_postgrad@giki.edu.pk',
      fullName: 'Graduate Students Society Directorate',
      name: 'Graduate Students Society',
      shortDescription: 'Postgraduate research, academia, and professional networking hub',
      longDescription: 'GIK Graduate Students Society (GSS) provides postgraduate students a platform for educational development, healthy activities and entertainment. GSS organizes seminars, workshops, research exchanges, outdoor tours, and sports galas.',
      logoUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=150&auto=format&fit=crop&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&auto=format&fit=crop&q=80',
      categorySlug: 'academics',
      events: [
        {
          title: 'Postgraduate Research Colloquium & BBQ Night',
          description: 'Interactive session featuring research lightning talks followed by networking over barbecue.',
          eventDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
          startTime: '06:00 PM',
          endTime: '10:00 PM',
          venue: 'Faculty Club Lawns',
          coverImageUrl: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=800&auto=format&fit=crop&q=80',
          registrationLink: 'https://forms.gle/gss-research-night',
        },
      ],
      posts: [
        {
          content: '🎓 Welcome to all newly enrolled MS and PhD scholars! Reach out to GSS executive team for research support and campus guidance.',
          imageUrl: null,
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      ],
    },
    {
      email: 'ashrae@giki.edu.pk',
      fullName: 'ASHRAE GIK Chapter Leadership',
      name: 'ASHRAE GIK Chapter',
      shortDescription: 'HVAC systems, energy efficiency, and thermal engineering',
      longDescription: 'ASHRAE is the global leader and foremost source of technical and educational information in heating, ventilating, air conditioning and refrigerating. The GIK chapter organizes conferences, workshops, and industrial exposure sessions.',
      logoUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=150&auto=format&fit=crop&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=1200&auto=format&fit=crop&q=80',
      categorySlug: 'technology',
      events: [
        {
          title: 'Green HVAC & Sustainable Building Seminar',
          description: 'Expert lecture on energy-efficient climate control technologies and modern refrigeration systems.',
          eventDate: new Date(Date.now() + 19 * 24 * 60 * 60 * 1000),
          startTime: '03:00 PM',
          endTime: '05:00 PM',
          venue: 'FME Seminar Hall',
          coverImageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=80',
          registrationLink: 'https://forms.gle/ashrae-hvac-2026',
        },
      ],
      posts: [
        {
          content: '❄️ Registration is open for the ASHRAE HVAC Industrial Certification preparation seminar. Don\'t miss out!',
          imageUrl: null,
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        },
      ],
    },
    {
      email: 'asme@giki.edu.pk',
      fullName: 'ASME GIK Chapter Board',
      name: 'ASME GIK Chapter',
      shortDescription: 'Mechanical engineering advancement, design competitions, and technical growth',
      longDescription: 'GIK has an approved student chapter of ASME International. This society aims at the professional development of the students so that they are better equipped to meet mechanical engineering challenges in modern times.',
      logoUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=150&auto=format&fit=crop&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1537462715879-360eeb61a0ad?w=1200&auto=format&fit=crop&q=80',
      categorySlug: 'technology',
      events: [
        {
          title: 'CAD Modelling & 3D Printing Challenge',
          description: 'A 6-hour mechanical design contest using SolidWorks with 3D prototype printing.',
          eventDate: new Date(Date.now() + 24 * 24 * 60 * 60 * 1000),
          startTime: '10:00 AM',
          endTime: '04:00 PM',
          venue: 'FME CAD/CAM Lab',
          coverImageUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&auto=format&fit=crop&q=80',
          registrationLink: 'https://forms.gle/asme-cad-2026',
        },
      ],
      posts: [
        {
          content: '⚙️ Monthly ASME Mechanical Engineering magazine digital digests have been emailed to all active members.',
          imageUrl: null,
          createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
        },
      ],
    },
    {
      email: 'cdes@giki.edu.pk',
      fullName: 'CDES Executive Committee',
      name: 'Cultural Dramatics & Entertainment Society',
      shortDescription: 'Concerts, theatrical plays, movie screenings, and cultural bonfires',
      longDescription: 'CDES adds color to campus life by organizing musical concerts, drama competitions, skit competitions, picnics, bonfires, and weekly big-screen movie shows to nourish artistic talent.',
      logoUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=150&auto=format&fit=crop&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&auto=format&fit=crop&q=80',
      categorySlug: 'arts-and-culture',
      events: [
        {
          title: 'Annual Campus Cultural Night & Bonfire',
          description: 'A memorable outdoor musical night with live student band performances and food stalls.',
          eventDate: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000),
          startTime: '08:00 PM',
          endTime: '11:59 PM',
          venue: 'Hostel 1 Ground',
          coverImageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=80',
          registrationLink: 'https://forms.gle/cdes-cultural-night',
        },
      ],
      posts: [
        {
          content: '🎬 Weekend movie night alert! Join us at the AHA Auditorium this Saturday at 8 PM for an exclusive screening.',
          imageUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80',
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
      ],
    },
    {
      email: 'iet@giki.edu.pk',
      fullName: 'IET GIK Chapter Council',
      name: 'Institute of Engineering And Technology',
      shortDescription: 'Engineering development, technical lectures, and IET Free Book Bank',
      longDescription: 'IET is an international organization aiming at improving capabilities of engineers. The IET GIK Chapter implements these aims at university level through lectures, workshops, and maintaining the IET Book Bank which issues textbooks free of cost.',
      logoUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=150&auto=format&fit=crop&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&auto=format&fit=crop&q=80',
      categorySlug: 'technology',
      events: [
        {
          title: 'IET Book Bank Textbook Distribution Drive',
          description: 'Semester textbook issuance drive for undergraduate students free of cost.',
          eventDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          startTime: '02:00 PM',
          endTime: '05:00 PM',
          venue: 'IET Student Center Office',
          coverImageUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80',
          registrationLink: null,
        },
      ],
      posts: [
        {
          content: '📚 Need reference books for this semester? The IET Book Bank inventory has been replenished. Drop by our office!',
          imageUrl: null,
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
      ],
    },
    {
      email: 'gss_sports@giki.edu.pk',
      fullName: 'GIK Sports Society Council',
      name: 'GIK Sports Society',
      shortDescription: 'Inter-university sports tournaments, athletics, and physical fitness',
      longDescription: 'The GIK Sports Society (GSS) was established to provide students an opportunity to strike a balance between academics and physical fitness. GSS regularly holds indoor/outdoor events and competes with universities nationwide.',
      logoUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=150&auto=format&fit=crop&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266010b?w=1200&auto=format&fit=crop&q=80',
      categorySlug: 'sports',
      events: [
        {
          title: 'All-Pakistan Inter-University Sports Gala',
          description: 'Hosting athletic teams from LUMS, FAST, and AKU for basketball, volleyball, and tennis fixtures.',
          eventDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
          startTime: '08:00 AM',
          endTime: '08:00 PM',
          venue: 'GIKI Sports Complex & Basketball Courts',
          coverImageUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&auto=format&fit=crop&q=80',
          registrationLink: 'https://forms.gle/gss-sports-gala-2026',
        },
      ],
      posts: [
        {
          content: '🏆 Trials for the GIKI Varsity Basketball and Volleyball teams begin this Wednesday at 6 PM!',
          imageUrl: null,
          createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        },
      ],
    },
    {
      email: 'ieee@giki.edu.pk',
      fullName: 'IEEE GIK Branch Committee',
      name: 'IEEE GIK Chapter',
      shortDescription: 'Electrical engineering, electronics, robotics, and industrial exposure',
      longDescription: 'The Institute of Electrical and Electronic Engineers GIK Chapter advances electrical engineering, electronics, and computing theories and practice through industrial visits, robotics contests, and skill workshops.',
      logoUrl: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=150&auto=format&fit=crop&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80',
      categorySlug: 'technology',
      events: [
        {
          title: 'RoboWars & Embedded Hardware Expo',
          description: 'A national robotics competition featuring line-following and combat bots built by engineering teams.',
          eventDate: new Date(Date.now() + 17 * 24 * 60 * 60 * 1000),
          startTime: '09:00 AM',
          endTime: '05:00 PM',
          venue: 'FEE Labs & Open Canopy',
          coverImageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=80',
          registrationLink: 'https://forms.gle/ieee-robowars-2026',
        },
      ],
      posts: [
        {
          content: '⚡ Registration for the IEEE Circuit Simulation & PCB Design Workshop is now open!',
          imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
      ],
    },
    {
      email: 'lds@giki.edu.pk',
      fullName: 'Literary & Debating Society Cabinet',
      name: 'Literary And Debating Society',
      shortDescription: 'Debates, declamation contests, mushairas, and critical discussions',
      longDescription: 'LDS holds debates, declamation contests, and literary evenings including poetry recitations. It manages GIKI parliamentary debate contingents and organizes student-teacher discussions in the auditorium.',
      logoUrl: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=150&auto=format&fit=crop&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200&auto=format&fit=crop&q=80',
      categorySlug: 'arts-and-culture',
      events: [
        {
          title: 'All-Pakistan Parliamentary Debating Championship',
          description: '3-day national parliamentary debate competition featuring top debating societies across Pakistan.',
          eventDate: new Date(Date.now() + 13 * 24 * 60 * 60 * 1000),
          startTime: '09:00 AM',
          endTime: '07:00 PM',
          venue: 'AHA Auditorium & Lecture Halls',
          coverImageUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&auto=format&fit=crop&q=80',
          registrationLink: 'https://forms.gle/lds-debates-2026',
        },
      ],
      posts: [
        {
          content: '🎙️ Announcing auditions for the GIKI Parliamentary Debating Contingent this Thursday at 5:00 PM.',
          imageUrl: null,
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        },
      ],
    },
    {
      email: 'mediaclub@giki.edu.pk',
      fullName: 'Media Club Management',
      name: 'Media Club',
      shortDescription: 'Photography, video editing, desktop publishing, and campus journalism',
      longDescription: 'Media Club consists of the Photography Club, Desktop Publishing, and Vision Club. It holds photography workshops, movie competitions, game shows, and publishes the official student magazine.',
      logoUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=150&auto=format&fit=crop&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=1200&auto=format&fit=crop&q=80',
      categorySlug: 'arts-and-culture',
      events: [
        {
          title: 'DSLR & Visual Storytelling Masterclass',
          description: 'Hands-on photography workshop covering framing, lighting, and post-processing techniques.',
          eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          startTime: '04:00 PM',
          endTime: '07:00 PM',
          venue: 'FCSE Video Conferencing Room',
          coverImageUrl: 'https://images.unsplash.com/photo-1471341971476-ae15ff5dd4ea?w=800&auto=format&fit=crop&q=80',
          registrationLink: 'https://forms.gle/mediaclub-photo-2026',
        },
      ],
      posts: [
        {
          content: '📸 Submissions are open for the Campus Photo of the Month contest! Tag Media Club in your photos.',
          imageUrl: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&auto=format&fit=crop&q=80',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
      ],
    },
    {
      email: 'sophep@giki.edu.pk',
      fullName: 'SOPHEP Directorate',
      name: 'Society for the Promotion of Higher Education in Pakistan',
      shortDescription: 'Communication skills, corporate bridge building, and alumni mentorship',
      longDescription: 'SOPHEP forms a bridge between Pakistan\'s academic and professional communities. It conducts alumni-led soft-skills workshops, CV building sessions, and industry projects for students.',
      logoUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=150&auto=format&fit=crop&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=1200&auto=format&fit=crop&q=80',
      categorySlug: 'academics',
      events: [
        {
          title: 'Corporate Skills & Resume Building Bootcamp',
          description: 'Interactive session hosted by GIKI Alumni working in tech and engineering management.',
          eventDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
          startTime: '05:00 PM',
          endTime: '07:30 PM',
          venue: 'AHA Seminar Room',
          coverImageUrl: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&auto=format&fit=crop&q=80',
          registrationLink: 'https://forms.gle/sophep-bootcamp-2026',
        },
      ],
      posts: [
        {
          content: '💼 Learn how to tailor your resume for corporate leadership roles in our upcoming interactive session!',
          imageUrl: null,
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        },
      ],
    },
    {
      email: 'asmtms@giki.edu.pk',
      fullName: 'ASM/TMS GIK Chapter Leadership',
      name: 'The Mineral, Metal & Material Society/American Society of Materials',
      shortDescription: 'Materials science engineering, metallurgical innovation, and industrial application',
      longDescription: 'Promotes science and engineering professions concerned with minerals, metals, and materials. Makes students aware of the role of materials and metallurgical engineering in today’s international marketplace.',
      logoUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=150&auto=format&fit=crop&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=1200&auto=format&fit=crop&q=80',
      categorySlug: 'technology',
      events: [
        {
          title: 'Nanomaterials & Modern Metallurgy Seminar',
          description: 'Exploring advanced composite materials and modern manufacturing applications.',
          eventDate: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000),
          startTime: '03:00 PM',
          endTime: '05:00 PM',
          venue: 'FMME Auditorium',
          coverImageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
          registrationLink: 'https://forms.gle/asmtms-seminar-2026',
        },
      ],
      posts: [
        {
          content: '🔬 ASM/TMS Chapter welcomes all freshman engineers interested in materials research and engineering!',
          imageUrl: null,
          createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        },
      ],
    },
    {
      email: 'wes@giki.edu.pk',
      fullName: 'Women Engineers Society Council',
      name: 'Women Engineers Society',
      shortDescription: 'Empowering female engineers, technical skill development, and self-advancement',
      longDescription: 'Women Engineers Society (WES GIK Chapter) aspires to educate, equip, and empower female students with new technical skills and career guidance for productive engineering careers.',
      logoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=1200&auto=format&fit=crop&q=80',
      categorySlug: 'community-service',
      events: [
        {
          title: 'Women in Tech & Engineering Summit 2026',
          description: 'Keynotes, panel discussions, and career workshops led by successful female engineering professionals.',
          eventDate: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000),
          startTime: '10:00 AM',
          endTime: '04:00 PM',
          venue: 'AHA Auditorium',
          coverImageUrl: 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=800&auto=format&fit=crop&q=80',
          registrationLink: 'https://forms.gle/wes-summit-2026',
        },
      ],
      posts: [
        {
          content: '✨ Join WES for our upcoming mentorship circle pairing junior students with graduating seniors!',
          imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=80',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
      ],
    },
    {
      email: 'mathsociety@giki.edu.pk',
      fullName: 'GIKI Mathematics Society Cabinet',
      name: 'GIKI Mathematics Society',
      shortDescription: 'Appreciation of mathematics, logic competitions, and international collaboration',
      longDescription: 'GIK Institute Mathematics Society is an established society encouraging the study and appreciation of Mathematics among prospective engineers. Recognized by the American Mathematics Society (AMS), it runs quizzes, seminars, and logic events.',
      logoUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=150&auto=format&fit=crop&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=1200&auto=format&fit=crop&q=80',
      categorySlug: 'academics',
      events: [
        {
          title: 'MathMania 2026: Speed Logic & Math Olympiad',
          description: 'Campus-wide speed math challenge testing problem-solving, calculus, and logical puzzles.',
          eventDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          startTime: '04:00 PM',
          endTime: '07:00 PM',
          venue: 'FES Lecture Hall 1',
          coverImageUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&auto=format&fit=crop&q=80',
          registrationLink: 'https://forms.gle/gms-mathmania-2026',
        },
      ],
      posts: [
        {
          content: '📐 Check out the GMS reference section at the Central Library featuring Rs. 0.5M worth of donated AMS books!',
          imageUrl: null,
          createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        },
      ],
    },
    {
      email: 'aiche@giki.edu.pk',
      fullName: 'AIChE GIK Student Chapter Board',
      name: 'GIK Student Chapter of AIChE',
      shortDescription: 'Chemical engineering, industrial visits, and process industry technical seminars',
      longDescription: 'AIChE student chapter at GIK is involved in organizing workshops, special courses, introductory seminars, and arranging industrial visits to foster strong student-industrial relationships.',
      logoUrl: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=150&auto=format&fit=crop&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=1200&auto=format&fit=crop&q=80',
      categorySlug: 'technology',
      events: [
        {
          title: 'Chemical Process Safety & Industrial Design Seminar',
          description: 'Technical lecture by industrial process engineers on plant safety and chemical synthesis.',
          eventDate: new Date(Date.now() + 27 * 24 * 60 * 60 * 1000),
          startTime: '02:30 PM',
          endTime: '05:00 PM',
          venue: 'FCSE Auditorium',
          coverImageUrl: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&auto=format&fit=crop&q=80',
          registrationLink: 'https://forms.gle/aiche-seminar-2026',
        },
      ],
      posts: [
        {
          content: '🧪 AIChE is organizing an industrial plant visit next month! Registrations opening soon for chemical engineering students.',
          imageUrl: null,
          createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        },
      ],
    },
    {
      email: 'cbs@giki.edu.pk',
      fullName: 'Character Building Society Directorate',
      name: 'Character Building Society',
      shortDescription: 'Ethics, leadership traits, personality development, and soft skills',
      longDescription: 'Character Building Society (C.B.S.) intends to nurture knowledge, skills, attitude & behavior that will help the student body in leading a better quality life, instilling technical and personality trait developments.',
      logoUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=150&auto=format&fit=crop&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&auto=format&fit=crop&q=80',
      categorySlug: 'community-service',
      events: [
        {
          title: 'Ethics, Leadership & Personal Mastery Workshop',
          description: 'Interactive session on personal growth, conflict resolution, and leadership development.',
          eventDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
          startTime: '05:00 PM',
          endTime: '07:00 PM',
          venue: 'Student Center Conference Room',
          coverImageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80',
          registrationLink: 'https://forms.gle/cbs-leadership-2026',
        },
      ],
      posts: [
        {
          content: '🌟 "Character is doing the right thing when nobody is looking." Join CBS sessions for personal development!',
          imageUrl: null,
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
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
        bannerUrl: (sData as any).bannerUrl || null,
        categoryId: categoryId || null,
        isSetupComplete: true,
      },
      create: {
        name: sData.name,
        shortDescription: sData.shortDescription,
        longDescription: sData.longDescription,
        logoUrl: sData.logoUrl,
        bannerUrl: (sData as any).bannerUrl || null,
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
      } else {
        await prisma.event.update({
          where: { id: existingEvent.id },
          data: {
            coverImageUrl: e.coverImageUrl,
          },
        });
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