import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Query,
  Param,
  HttpCode,
  HttpStatus,
  Header,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { SocietiesService, PublicSocietyEventsGroupDto } from './societies.service';
import { SetupSocietyDto } from './dto/setup-society.dto';
import { UpdateSocietyDto } from './dto/update-society.dto';
import { QuerySocietiesDto } from './dto/query-societies.dto';
import { SocietyResponseDto } from './dto/society-response.dto';
import { SocietyDashboardResponseDto } from './dto/society-dashboard-response.dto';
import { PaginatedSocietiesResponseDto } from './dto/public-society-response.dto';
import { PublicSocietyDetailResponseDto } from './dto/public-society-detail-response.dto';
import { Auth } from '../../core/decorators/auth.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserProfileDto } from '../auth/dto/auth-response.dto';
import { EventsService, SocietyEventsGroupDto } from '../events/events.service';

@ApiTags('Societies')
@Controller('societies')
export class SocietiesController {
  constructor(
    private readonly societiesService: SocietiesService,
    private readonly eventsService: EventsService,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @Header('Cache-Control', 'public, max-age=60, stale-while-revalidate=120')
  @ApiOperation({
    summary: 'Public Society Directory (Paginated, Category & Search Filtered)',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of active public societies returned',
    type: PaginatedSocietiesResponseDto,
  })
  async getPublicSocieties(
    @Query() query: QuerySocietiesDto,
  ): Promise<PaginatedSocietiesResponseDto> {
    return this.societiesService.getPublicSocieties(query);
  }

  @Get('me')
  @Auth(Role.SOCIETY)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get authenticated society profile' })
  @ApiResponse({
    status: 200,
    description: 'Society profile returned',
    type: SocietyResponseDto,
  })
  async getMyProfile(@CurrentUser() user: UserProfileDto): Promise<SocietyResponseDto | null> {
    return this.societiesService.getMySocietyProfile(user.id);
  }

  @Get('me/dashboard')
  @Auth(Role.SOCIETY)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary:
      'Get aggregated society dashboard data (Profile, Stats, Upcoming & Recent Events, Yearly Plan)',
  })
  @ApiResponse({
    status: 200,
    description: 'Aggregated dashboard payload returned',
    type: SocietyDashboardResponseDto,
  })
  async getDashboard(@CurrentUser() user: UserProfileDto): Promise<SocietyDashboardResponseDto> {
    return this.societiesService.getSocietyDashboard(user.id);
  }

  @Get('me/events')
  @Auth(Role.SOCIETY)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get authenticated society events categorized into upcoming and past' })
  @ApiResponse({
    status: 200,
    description: 'Society events categorized into upcoming and past returned',
  })
  async getMyEvents(@CurrentUser() user: UserProfileDto): Promise<SocietyEventsGroupDto> {
    return this.eventsService.getMySocietyEvents(user.id);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @Header('Cache-Control', 'public, max-age=60, stale-while-revalidate=120')
  @ApiOperation({ summary: 'Get public society profile details by ID' })
  @ApiParam({ name: 'id', description: 'Society UUID' })
  @ApiResponse({
    status: 200,
    description: 'Public society profile returned',
    type: PublicSocietyDetailResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Society not found or setup incomplete',
  })
  async getPublicSocietyById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PublicSocietyDetailResponseDto> {
    return this.societiesService.getPublicSocietyById(id);
  }

  @Get(':id/events')
  @HttpCode(HttpStatus.OK)
  @Header('Cache-Control', 'public, max-age=60, stale-while-revalidate=120')
  @ApiOperation({ summary: 'Get public events hosted by society (Split into upcoming and past)' })
  @ApiParam({ name: 'id', description: 'Society UUID' })
  @ApiResponse({
    status: 200,
    description:
      'Society events returned split into upcoming (nearest first) and past (most recent first)',
  })
  @ApiResponse({
    status: 404,
    description: 'Society not found',
  })
  async getPublicSocietyEvents(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PublicSocietyEventsGroupDto> {
    return this.societiesService.getPublicSocietyEvents(id);
  }

  @Get(':id/posts')
  @HttpCode(HttpStatus.OK)
  @Header('Cache-Control', 'public, max-age=60, stale-while-revalidate=120')
  @ApiOperation({ summary: 'Get public posts/announcements published by society' })
  @ApiParam({ name: 'id', description: 'Society UUID' })
  async getPublicSocietyPosts(@Param('id', ParseUUIDPipe) id: string) {
    return this.societiesService.getPublicSocietyPosts(id);
  }

  @Post('setup')
  @Auth(Role.SOCIETY)
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Complete initial society profile setup (One-time only)' })
  @ApiResponse({
    status: 201,
    description: 'Society profile setup completed successfully',
    type: SocietyResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation failed for input fields',
  })
  @ApiResponse({
    status: 409,
    description: 'Profile setup already completed or society name taken',
  })
  async setupProfile(
    @CurrentUser() user: UserProfileDto,
    @Body() dto: SetupSocietyDto,
  ): Promise<SocietyResponseDto> {
    return this.societiesService.setupSocietyProfile(user.id, dto);
  }

  @Patch('me')
  @Auth(Role.SOCIETY)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update existing society profile' })
  @ApiResponse({
    status: 200,
    description: 'Society profile updated successfully',
    type: SocietyResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Initial profile setup not completed yet',
  })
  async updateProfile(
    @CurrentUser() user: UserProfileDto,
    @Body() dto: UpdateSocietyDto,
  ): Promise<SocietyResponseDto> {
    return this.societiesService.updateSocietyProfile(user.id, dto);
  }
}
