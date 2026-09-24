import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { RedisService } from '../../core/redis/redis.service';
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
  private readonly CACHE_TTL_MS = 60_000;
  private static readonly REDIS_TTL_SECONDS = 60;
  private static instance: FeedService | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {
    FeedService.instance = this;
  }

  public invalidateCache(): void {
    this.cache.clear();
    void this.redis.invalidatePattern('feed:*');
  }

  public static invalidate(): void {
    if (FeedService.instance) {
      FeedService.instance.invalidateCache();
    }
  }

  async getMergedFeed(query: QueryFeedDto): Promise<PaginatedFeedResponseDto> {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 10));
    const skip = (page - 1) * limit;
    const cacheKey = `feed:page:${page}:limit:${limit}`;

    // 1. Try Shared Redis Cache
    const redisCached = await this.redis.get<PaginatedFeedResponseDto>(cacheKey);
    if (redisCached) {
      return redisCached;
    }

    // 2. Fallback to Local In-Memory Cache if Redis is offline
    const localCached = this.cache.get(cacheKey);
    if (localCached && Date.now() < localCached.expiresAt) {
      return localCached.data;
    }

    // Mathematically optimal fetch: the top (skip + limit) chronological items
    // across both tables can only ever be drawn from the top (skip + limit) of each.
    // For page 1 with limit 12, this fetches at most 12 events & 12 posts instead of 200.
    const fetchLimit = Math.min(skip + limit, 100);

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
              id: true,
              fullName: true,
              role: true,
              avatarUrl: true,
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
            name: post.author.fullName || 'Dean Student Affairs',
            logoUrl: post.author.avatarUrl || '/default-dsa.png',
            category: { id: 'admin', name: 'Administration', slug: 'administration' },
          }
        : post.author.society || {
            id: post.authorId,
            name: post.author.fullName || 'Campus Announcement',
            logoUrl: post.author.avatarUrl || null,
            category: null,
          };

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
      };
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

    // 1. Save to Shared Redis Cache (60s TTL)
    void this.redis.set(cacheKey, result, FeedService.REDIS_TTL_SECONDS);

    // 2. Cache in local process memory fallback
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
