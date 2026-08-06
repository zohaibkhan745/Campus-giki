import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { UserProfileDto } from '../auth/dto/auth-response.dto';
import { Role, PostApprovalStatus } from '@prisma/client';

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

  async createPost(user: UserProfileDto, dto: CreatePostDto) {
    if (user.role !== Role.DSA_ADMIN && user.role !== Role.SOCIETY) {
      throw new ForbiddenException('You do not have permission to create an announcement');
    }

    const isAdmin = user.role === Role.DSA_ADMIN;

    return this.prisma.post.create({
      data: {
        content: dto.content,
        imageUrl: dto.imageUrl,
        videoUrl: dto.videoUrl,
        authorId: user.id,
        isPublished: isAdmin,
        approvalStatus: isAdmin ? PostApprovalStatus.APPROVED : PostApprovalStatus.PENDING_ADVISOR,
      },
    });
  }

  async getAllPosts(params: { page: number; limit: number; type?: string; societyId?: string }) {
    const { page, limit, type, societyId } = params;
    const skip = (page - 1) * limit;

    const where: any = {
      isPublished: true,
    };

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

    if (user.role === Role.SOCIETY && post.authorId !== user.id) {
      throw new ForbiddenException('You can only edit your own posts');
    } else if (user.role !== Role.DSA_ADMIN && user.role !== Role.SOCIETY) {
      throw new ForbiddenException('Permission denied');
    }

    return this.prisma.post.update({
      where: { id: postId },
      data: {
        content: dto.content,
        imageUrl: dto.imageUrl,
      },
    });
  }

  async deletePost(user: UserProfileDto, postId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (user.role === Role.DSA_ADMIN) {
      // Admin can delete any post
    } else if (user.role === Role.SOCIETY) {
      if (post.authorId !== user.id) {
        throw new ForbiddenException('You can only delete your own posts');
      }
    } else {
      throw new ForbiddenException('Permission denied');
    }

    await this.prisma.post.delete({
      where: { id: postId },
    });

    return { message: 'Post deleted successfully' };
  }
}
