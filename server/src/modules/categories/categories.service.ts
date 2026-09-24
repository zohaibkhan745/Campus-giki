import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { RedisService } from '../../core/redis/redis.service';
import { CategoryResponseDto } from './dto/category-response.dto';

@Injectable()
export class CategoriesService {
  private static readonly CACHE_KEY = 'categories:all';
  private static readonly CACHE_TTL_SECONDS = 86400; // 24 hours

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  /**
   * Retrieves all predefined society categories ordered alphabetically by name.
   * Cached in Redis for 24 hours (sub-millisecond response).
   */
  async getCategories(): Promise<CategoryResponseDto[]> {
    const cached = await this.redis.get<CategoryResponseDto[]>(CategoriesService.CACHE_KEY);
    if (cached) {
      return cached;
    }

    const categories = await this.prisma.category.findMany({
      orderBy: { name: 'asc' },
    });

    if (categories && categories.length > 0) {
      await this.redis.set(CategoriesService.CACHE_KEY, categories, CategoriesService.CACHE_TTL_SECONDS);
    }

    return categories;
  }

  /**
   * Clears the categories cache when categories are updated.
   */
  async invalidateCache(): Promise<void> {
    await this.redis.del(CategoriesService.CACHE_KEY);
  }
}

