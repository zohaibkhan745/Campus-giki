import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { EventsService, PaginatedEventsResponseDto } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { QueryEventsDto } from './dto/query-events.dto';
import { EventResponseDto } from './dto/event-response.dto';
import { ReviewEventDto } from './dto/review-event.dto';
import { Auth } from '../../core/decorators/auth.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserProfileDto } from '../auth/dto/auth-response.dto';

@ApiTags('Events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Public Campus Events Directory / Calendar Feed (Filtered by date range from & to)',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of public events returned',
  })
  async getAllPublicEvents(@Query() query: QueryEventsDto): Promise<PaginatedEventsResponseDto> {
    return this.eventsService.getAllPublicEvents(query);
  }

  @Post()
  @Auth(Role.SOCIETY)
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Create a new campus event for authenticated society',
  })
  @ApiResponse({
    status: 201,
    description: 'Event created successfully',
    type: EventResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation failed or end date is prior to start date',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Profile setup incomplete or society role missing',
  })
  async createEvent(
    @CurrentUser() user: UserProfileDto,
    @Body() dto: CreateEventDto,
  ): Promise<EventResponseDto> {
    return this.eventsService.createEvent(user.id, dto);
  }

  @Get('my-events')
  @Auth(Role.SOCIETY)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'View events hosted by authenticated society categorized by upcoming and past',
  })
  @ApiResponse({
    status: 200,
    description: 'List of upcoming and past events owned by authenticated society returned',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Society role missing or profile setup incomplete',
  })
  async getMyEvents(@CurrentUser() user: UserProfileDto) {
    return this.eventsService.getMySocietyEvents(user.id);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get single event by UUID' })
  @ApiParam({ name: 'id', description: 'Event UUID' })
  @ApiResponse({
    status: 200,
    description: 'Event details returned',
    type: EventResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Event with specified ID not found',
  })
  async getEventById(@Param('id', ParseUUIDPipe) id: string): Promise<EventResponseDto> {
    return this.eventsService.getEventById(id);
  }

  
  @Patch(':id/edit-request')
  @Auth(Role.SOCIETY)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Society: Request edit access for a locked event' })
  async requestEdit(@Param('id', ParseUUIDPipe) id: string, @Body('reason') reason: string) {
    return this.eventsService.requestEdit(id, reason || 'Society requested edit access');
  }

  @Patch(':id/edit-request-resolve')
  @Auth(Role.DSA_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'DSA: Approve or reject an edit request' })
  async resolveEditRequest(@Param('id', ParseUUIDPipe) id: string, @Body('status') status: 'APPROVED' | 'REJECTED') {
    return this.eventsService.resolveEditRequest(id, status);
  }

  @Patch(':id')
  @Auth(Role.SOCIETY, Role.ADVISOR, Role.DSA_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update an event with ownership/role validation' })
  @ApiParam({ name: 'id', description: 'Event UUID' })
  @ApiResponse({
    status: 200,
    description: 'Event updated successfully',
    type: EventResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - You do not own this event resource',
  })
  @ApiResponse({
    status: 404,
    description: 'Event not found',
  })
  async updateEvent(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserProfileDto,
    @Body() dto: UpdateEventDto,
  ): Promise<EventResponseDto> {
    return this.eventsService.updateEvent(id, user.id, dto, user.role);
  }

  @Delete(':id')
  @Auth(Role.SOCIETY, Role.DSA_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete an event with ownership validation' })
  @ApiParam({ name: 'id', description: 'Event UUID' })
  @ApiResponse({
    status: 200,
    description: 'Event deleted successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - You do not own this event resource',
  })
  @ApiResponse({
    status: 404,
    description: 'Event not found',
  })
  async deleteEvent(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserProfileDto,
  ): Promise<{ message: string; id: string }> {
    return this.eventsService.deleteEvent(id, user.id, user.role);
  }

  @Patch(':id/advisor-review')
  @Auth(Role.ADVISOR)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Advisor reviews a pending event' })
  @ApiParam({ name: 'id', description: 'Event UUID' })
  async reviewEventByAdvisor(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserProfileDto,
    @Body() dto: ReviewEventDto,
  ): Promise<EventResponseDto> {
    return this.eventsService.reviewEventByAdvisor(id, user.id, dto);
  }

  @Patch(':id/dsa-review')
  @Auth(Role.DSA_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'DSA Admin reviews a pending event' })
  @ApiParam({ name: 'id', description: 'Event UUID' })
  async reviewEventByDsa(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserProfileDto,
    @Body() dto: ReviewEventDto,
  ): Promise<EventResponseDto> {
    return this.eventsService.reviewEventByDsa(id, user.id, dto);
  }
}
