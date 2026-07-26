import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { QueryFeedDto } from './dto/query-feed.dto';
import { FeedItemDto, PaginatedFeedResponseDto } from './dto/feed-response.dto';

@Injectable()
export class FeedService {
  constructor(private readonly prisma: PrismaService) {}

  async getMergedFeed(query: QueryFeedDto): Promise<PaginatedFeedResponseDto> {
    const page = query.page || 1;
    const limit = query.limit || 10;

    // Fetch published events and general posts in parallel
    const [events, posts] = await Promise.all([
      this.prisma.event.findMany({
        where: { isPublished: true },
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
      registrationLink: event.registrationLink,
    }));

    const postItems: FeedItemDto[] = posts.map((post) => ({
      type: 'post',
      id: post.id,
      createdAt: post.createdAt,
      society: post.society,
      content: post.content,
      imageUrl: post.imageUrl,
    }));

    // Merge and sort chronologically (most recent createdAt first)
    const combined = [...eventItems, ...postItems].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    const total = combined.length;
    const skip = (page - 1) * limit;
    const items = combined.slice(skip, skip + limit);
    const totalPages = Math.ceil(total / limit) || 1;

    return {
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
  }
}
