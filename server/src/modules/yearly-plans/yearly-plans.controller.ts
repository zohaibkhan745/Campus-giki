import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { YearlyPlansService } from './yearly-plans.service';
import { CreateYearlyPlanDto } from './dto/create-yearly-plan.dto';
import { UpdateYearlyPlanDto } from './dto/update-yearly-plan.dto';
import { ReviewYearlyPlanDto } from './dto/review-yearly-plan.dto';
import { YearlyPlanResponseDto } from './dto/yearly-plan-response.dto';
import { Auth } from '../../core/decorators/auth.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserProfileDto } from '../auth/dto/auth-response.dto';

@ApiTags('Yearly Plans')
@Controller('yearly-plans')
export class YearlyPlansController {
  constructor(private readonly yearlyPlansService: YearlyPlansService) {}

  @Post()
  @Auth(Role.SOCIETY)
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Submit or draft a new yearly calendar plan for authenticated society',
  })
  @ApiResponse({
    status: 201,
    description: 'Yearly plan created successfully',
    type: YearlyPlanResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Yearly plan for the specified year already exists',
  })
  async createPlan(
    @CurrentUser() user: UserProfileDto,
    @Body() dto: CreateYearlyPlanDto,
  ): Promise<YearlyPlanResponseDto> {
    return this.yearlyPlansService.createYearlyPlan(user.id, dto);
  }

  @Get('me')
  @Auth(Role.SOCIETY)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get all yearly calendar plans belonging to authenticated society',
  })
  @ApiResponse({
    status: 200,
    description: 'List of yearly plans returned',
    type: [YearlyPlanResponseDto],
  })
  async getMyPlans(@CurrentUser() user: UserProfileDto): Promise<YearlyPlanResponseDto[]> {
    return this.yearlyPlansService.getMyYearlyPlans(user.id);
  }

  @Get(':id')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get yearly calendar plan details by UUID' })
  @ApiParam({ name: 'id', description: 'Yearly Plan UUID' })
  @ApiResponse({
    status: 200,
    description: 'Yearly plan details returned',
    type: YearlyPlanResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Yearly plan not found',
  })
  async getPlanById(@Param('id', ParseUUIDPipe) id: string): Promise<YearlyPlanResponseDto> {
    return this.yearlyPlansService.getYearlyPlanById(id);
  }

  @Patch(':id')
  @Auth(Role.SOCIETY)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update yearly calendar plan with workflow status guards',
  })
  @ApiParam({ name: 'id', description: 'Yearly Plan UUID' })
  @ApiResponse({
    status: 200,
    description: 'Yearly plan updated successfully',
    type: YearlyPlanResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Plan is APPROVED (read-only) or PENDING review',
  })
  async updatePlan(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserProfileDto,
    @Body() dto: UpdateYearlyPlanDto,
  ): Promise<YearlyPlanResponseDto> {
    return this.yearlyPlansService.updateYearlyPlan(id, user.id, dto);
  }

  @Patch(':id/review')
  @Auth(Role.ADVISOR, Role.DSA_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Faculty Advisor Review Endpoint (Approve or Request Changes)',
  })
  @ApiParam({ name: 'id', description: 'Yearly Plan UUID' })
  @ApiResponse({
    status: 200,
    description: 'Review decision applied successfully',
    type: YearlyPlanResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Plan is already APPROVED or in DRAFT state',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User is not the assigned advisor for this society',
  })
  async reviewPlan(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserProfileDto,
    @Body() dto: ReviewYearlyPlanDto,
  ): Promise<YearlyPlanResponseDto> {
    return this.yearlyPlansService.reviewYearlyPlan(id, user.id, user.role, dto);
  }
}
