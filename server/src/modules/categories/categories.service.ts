import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { CategoryResponseDto } from './dto/category-response.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Retrieves all predefined society categories ordered alphabetically by name.
   */
  async getCategories(): Promise<CategoryResponseDto[]> {
    return this.prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
  }
}
