import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { QueryFeedDto } from './dto/query-feed.dto';
import { FeedItemDto, PaginatedFeedResponseDto } from './dto/feed-response.dto';

interface CacheEntry {
  data: PaginatedFeedResponseDto;
  expiresAt: number;
}

@Injectable()
export class FeedService {
  private readonly logger = new Logger(FeedService.name);
  private readonly cache = new Map<string, CacheEntry>();
  private readonly CACHE_TTL_MS = 20_000; // 20s micro-cache

  constructor(private readonly prisma: PrismaService) {}

  public invalidateCache(): void {
    this.cache.clear();
  }

  async getMergedFeed(query: QueryFeedDto): Promise<PaginatedFeedResponseDto> {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 10));
    const skip = (page - 1) * limit;
    const cacheKey = `feed_${page}_${limit}`;

    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() < cached.expiresAt) {
      return cached.data;
    }

    // Parallel bounded queries + counts for true $O(1)$ memory scalability
    const fetchLimit = Math.min(skip + limit, 200);

    const [eventsCount, postsCount, events, posts] = await Promise.all([
      this.prisma.event.count({
        where: {
          isPublished: true,
          approvalStatus: { in: ['APPROVED', 'PUBLISHED'] },
        },
      }),
      this.prisma.post.count(),
      this.prisma.event.findMany({
        where: {
          isPublished: true,
          approvalStatus: { in: ['APPROVED', 'PUBLISHED'] },
        },
        take: fetchLimit,
        include: {
          society: {
            select: {
              id: true,
              name: true,
              logoUrl: true,
              category: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.post.findMany({
        take: fetchLimit,
        include: {
          author: {
            select: {
              role: true,
              society: {
                select: {
                  id: true,
                  name: true,
                  logoUrl: true,
                  category: {
                    select: {
                      id: true,
                      name: true,
                      slug: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    // Map into unified FeedItemDto format with discriminant 'type'
    const eventItems: FeedItemDto[] = events.map((event) => ({
      type: 'event',
      id: event.id,
      createdAt: event.createdAt,
      society: event.society,
      title: event.title,
      description: event.description,
      eventDate: event.eventDate,
      startTime: event.startTime,
      endTime: event.endTime,
      venue: event.venue,
      coverImageUrl: event.coverImageUrl,
      videoUrl: event.videoUrl,
      registrationLink: event.registrationLink,
    }));

    const postItems: FeedItemDto[] = posts.map((post) => {
      const isAdminPost = post.author.role === 'DSA_ADMIN';

      const societyInfo = isAdminPost
        ? {
            id: 'giki-admin',
            name: 'Dean Student Affairs',
            logoUrl: null,
            category: { id: 'admin', name: 'Administration', slug: 'administration' },
          }
        : (post.author.society || {
            id: post.authorId,
            name: 'Campus Announcement',
            logoUrl: null,
            category: null,
          });

      return {
        type: 'post',
        id: post.id,
        createdAt: post.createdAt,
        society: societyInfo,
        title: post.title,
        content: post.content,
        imageUrl: post.imageUrl,
        videoUrl: post.videoUrl,
        isAdminPost,
      } as FeedItemDto;
    });

    // Merge and sort chronologically (most recent createdAt first)
    const combined = [...eventItems, ...postItems].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    const total = eventsCount + postsCount;
    const items = combined.slice(skip, skip + limit);
    const totalPages = Math.ceil(total / limit) || 1;

    const result: PaginatedFeedResponseDto = {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };

    // Cache page result with micro-TTL
    this.cache.set(cacheKey, {
      data: result,
      expiresAt: Date.now() + this.CACHE_TTL_MS,
    });

    // Housekeeping: prevent unbounded map size
    if (this.cache.size > 100) {
      const now = Date.now();
      for (const [key, entry] of this.cache.entries()) {
        if (entry.expiresAt < now) {
          this.cache.delete(key);
        }
      }
    }

    return result;
  }
}
