import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CategoryResponseDto } from './dto/category-response.dto';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get list of predefined society categories' })
  @ApiResponse({
    status: 200,
    description: 'Predefined categories list returned',
    type: [CategoryResponseDto],
  })
  async getCategories(): Promise<CategoryResponseDto[]> {
    return this.categoriesService.getCategories();
  }
}
