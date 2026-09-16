import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { UserProfileDto } from '../auth/dto/auth-response.dto';
import { Role } from '@prisma/client';
import { UploadsService } from '../uploads/uploads.service';
import { FeedService } from '../feed/feed.service';

@Injectable()
export class PostsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadsService: UploadsService,
  ) {}

  async createPost(user: UserProfileDto, dto: CreatePostDto) {
    if (user.role !== Role.DSA_ADMIN) {
      throw new ForbiddenException(
        'Only the Director of Student Affairs (Admin) can create announcements',
      );
    }

    const created = await this.prisma.post.create({
      data: {
        title: dto.title,
        content: dto.content,
        imageUrl: dto.imageUrl,
        videoUrl: dto.videoUrl,
        authorId: user.id,
      },
      include: {
        author: {
          select: {
            role: true,
            society: {
              select: { id: true, name: true, logoUrl: true, category: true },
            },
          },
        },
      },
    });

    FeedService.invalidate();
    return created;
  }

  async getAllPosts(params: {
    page: number;
    limit: number;
    type?: string;
    societyId?: string;
    from?: string;
    to?: string;
  }) {
    const { page, limit, type, societyId, from, to } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (from || to) {
      where.createdAt = {};

      if (from) {
        let fromDate;
        if (from.includes('-')) {
          const [year, month, day] = from.split('-');
          fromDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 0, 0, 0, 0);
        } else {
          fromDate = new Date(from);
          fromDate.setHours(0, 0, 0, 0);
        }
        where.createdAt.gte = fromDate;
      }

      if (to) {
        let toDate;
        if (to.includes('-')) {
          const [year, month, day] = to.split('-');
          toDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 23, 59, 59, 999);
        } else {
          toDate = new Date(to);
          toDate.setHours(23, 59, 59, 999);
        }
        where.createdAt.lte = toDate;
      }
    }

    if (type === 'global') {
      where.author = { role: Role.DSA_ADMIN };
    } else if (type === 'society') {
      where.author = { role: Role.SOCIETY };
    }

    if (societyId) {
      where.author = {
        ...where.author,
        society: { id: societyId },
      };
    }

    const [items, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: {
              role: true,
              society: {
                select: { id: true, name: true, logoUrl: true, category: true },
              },
            },
          },
        },
      }),
      this.prisma.post.count({ where }),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async getMyPosts(user: UserProfileDto, params: { page: number; limit: number }) {
    const { page, limit } = params;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.post.findMany({
        where: { authorId: user.id },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: {
              role: true,
              society: {
                select: { id: true, name: true, logoUrl: true, category: true },
              },
            },
          },
        },
      }),
      this.prisma.post.count({ where: { authorId: user.id } }),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async updatePost(user: UserProfileDto, postId: string, dto: UpdatePostDto) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (user.role !== Role.DSA_ADMIN) {
      throw new ForbiddenException('Only administrators can edit announcements');
    }

    const updated = await this.prisma.post.update({
      where: { id: postId },
      data: {
        title: dto.title,
        content: dto.content,
        imageUrl: dto.imageUrl,
      },
    });

    FeedService.invalidate();
    return updated;
  }

  async deletePost(user: UserProfileDto, postId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (user.role !== Role.DSA_ADMIN) {
      throw new ForbiddenException('Only administrators can delete announcements');
    }

    await this.prisma.post.delete({
      where: { id: postId },
    });

    // Clean up uploaded media files from disk (parallel, fire-and-forget)
    await Promise.allSettled([
      post.imageUrl ? this.uploadsService.deleteImage(post.imageUrl) : null,
      post.videoUrl ? this.uploadsService.deleteImage(post.videoUrl) : null,
    ].filter(Boolean) as Promise<boolean>[]);

    FeedService.invalidate();
    return { message: 'Post deleted successfully' };
  }
}
