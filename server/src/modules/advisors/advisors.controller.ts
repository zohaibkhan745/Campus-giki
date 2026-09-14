import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  ParseUUIDPipe,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { AdvisorsService } from './advisors.service';
import { QueryAdvisorPlansDto } from './dto/query-advisor-plans.dto';
import { PaginatedAdvisorPlansResponseDto } from './dto/advisor-plans-response.dto';
import { QueryAdvisorEventsDto } from './dto/query-advisor-events.dto';
import { UpdateAdvisorEventDto } from './dto/update-advisor-event.dto';
import { Auth } from '../../core/decorators/auth.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserProfileDto } from '../auth/dto/auth-response.dto';

@ApiTags('Advisors')
@Controller('advisors')
export class AdvisorsController {
  constructor(private readonly advisorsService: AdvisorsService) {}

  @Get('me')
  @Auth(Role.ADVISOR)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current advisor profile and assigned societies' })
  async getMyProfile(@CurrentUser() user: UserProfileDto) {
    const societies = await this.advisorsService.getAdvisorAssignedSocieties(user.id);
    return {
      societies: societies.map((s) => ({ id: s.id, name: s.name, logoUrl: s.logoUrl })),
    };
  }

  @Get('me/yearly-plans')
  @Auth(Role.ADVISOR)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Advisor Review Queue: Retrieve yearly plans for advisor assigned society',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated yearly plans for assigned society returned',
    type: PaginatedAdvisorPlansResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User is not assigned as faculty advisor to any active society',
  })
  async getMySocietyYearlyPlans(
    @CurrentUser() user: UserProfileDto,
    @Query() query: QueryAdvisorPlansDto,
  ): Promise<PaginatedAdvisorPlansResponseDto> {
    return this.advisorsService.getMySocietyYearlyPlans(user.id, query);
  }

  @Get('me/events')
  @Auth(Role.ADVISOR)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Advisor Review Queue: Retrieve events for advisor assigned society',
  })
  async getMySocietyEvents(
    @CurrentUser() user: UserProfileDto,
    @Query() query: QueryAdvisorEventsDto,
  ) {
    return this.advisorsService.getMySocietyEvents(user.id, query);
  }

  @Patch('me/events/:id/status')
  @Auth(Role.ADVISOR)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Advisor Event Approval: Approve or reject a society event' })
  @ApiParam({ name: 'id', description: 'Event UUID' })
  async updateEventStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserProfileDto,
    @Body() dto: UpdateAdvisorEventDto,
  ) {
    return this.advisorsService.updateEventStatus(user.id, id, dto);
  }
}
