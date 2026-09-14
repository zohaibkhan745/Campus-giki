import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Auth } from '../../core/decorators/auth.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserProfileDto } from '../auth/dto/auth-response.dto';
import { Role } from '@prisma/client';

@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @Auth(Role.DSA_ADMIN, Role.SOCIETY)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new announcement' })
  @ApiResponse({ status: 201, description: 'Announcement created successfully' })
  async createPost(@CurrentUser() user: UserProfileDto, @Body() dto: CreatePostDto) {
    return this.postsService.createPost(user, dto);
  }

  @Get()
  @Auth(Role.DSA_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all announcements (Admin)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'type', required: false, type: String, description: 'global or society' })
  @ApiQuery({ name: 'societyId', required: false, type: String })
  async getAllPosts(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('type') type?: string,
    @Query('societyId') societyId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.postsService.getAllPosts({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
      type,
      societyId,
      from,
      to,
    });
  }

  @Get('me')
  @Auth(Role.SOCIETY)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get my announcements (Society)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getMyPosts(
    @CurrentUser() user: UserProfileDto,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.postsService.getMyPosts(user, {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
    });
  }

  @Put(':id')
  @Auth(Role.SOCIETY, Role.DSA_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update an announcement' })
  async updatePost(
    @CurrentUser() user: UserProfileDto,
    @Param('id') id: string,
    @Body() dto: UpdatePostDto,
  ) {
    return this.postsService.updatePost(user, id, dto);
  }

  @Delete(':id')
  @Auth(Role.SOCIETY, Role.DSA_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete an announcement' })
  @ApiResponse({ status: 200, description: 'Announcement deleted successfully' })
  async deletePost(@CurrentUser() user: UserProfileDto, @Param('id') id: string) {
    return this.postsService.deletePost(user, id);
  }
}
