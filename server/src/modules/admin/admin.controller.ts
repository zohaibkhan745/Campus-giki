import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Query,
  Param,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { AdminService } from './admin.service';
import { QueryAdminYearlyPlansDto } from './dto/query-admin-plans.dto';
import { PaginatedAdminPlansResponseDto } from './dto/admin-plans-response.dto';
import { CreateSocietyAdminDto } from './dto/create-society-admin.dto';
import { OnboardSocietyResponseDto } from './dto/onboard-society-response.dto';
import { QueryAdminSocietiesDto } from './dto/query-admin-societies.dto';
import { UpdateSocietyAdminDto } from './dto/update-society-admin.dto';
import { CreateAdvisorDto } from './dto/create-advisor.dto';
import { CreateStaffDto } from './dto/create-staff.dto';
import { QueryAdminEventsDto } from './dto/query-admin-events.dto';
import { AdminDashboardResponseDto } from './dto/admin-dashboard-response.dto';
import { AdminPendingSummaryDto } from './dto/admin-pending-summary.dto';
import { AdminUpdateYearlyPlanDto } from './dto/admin-update-yearly-plan.dto';
import { VerifyVenueClearanceDto } from './dto/verify-venue-clearance.dto';
import { Auth } from '../../core/decorators/auth.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserProfileDto } from '../auth/dto/auth-response.dto';

@ApiTags('DSA Administration')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('pending-summary')
  @Auth(Role.DSA_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'DSA Quick Summary: Lightweight pending counts for navigation/layout badges',
  })
  @ApiResponse({
    status: 200,
    description: 'Pending counts for admin badge counters',
    type: AdminPendingSummaryDto,
  })
  async getPendingSummary(): Promise<AdminPendingSummaryDto> {
    return this.adminService.getPendingSummary();
  }

  @Get('dashboard')
  @Auth(Role.DSA_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'DSA Central Landing: Aggregated statistics and recent activity dashboard feed',
  })
  @ApiResponse({
    status: 200,
    description: 'Aggregated dashboard metrics returned',
    type: AdminDashboardResponseDto,
  })
  async getDashboardData(): Promise<AdminDashboardResponseDto> {
    return this.adminService.getDashboardData();
  }

  @Get('advisors')
  @Auth(Role.DSA_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'DSA Onboarding: Get available faculty advisors list for dropdown select',
  })
  @ApiResponse({
    status: 200,
    description: 'List of faculty advisors returned',
  })
  async getAvailableAdvisors() {
    return this.adminService.getAvailableAdvisors();
  }

  @Delete('advisors/:id')
  @Auth(Role.DSA_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'DSA Management: Delete a faculty advisor',
  })
  async deleteAdvisor(@Param('id') id: string) {
    return this.adminService.deleteAdvisor(id);
  }

  @Get('staff')
  @Auth(Role.DSA_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'DSA Staff Management: Get all DSA and DDSA administrative accounts (Director Only)',
  })
  async getStaffList(@CurrentUser() user: UserProfileDto) {
    return this.adminService.getStaffList(user.id);
  }

  @Post('staff')
  @Auth(Role.DSA_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'DSA Staff Management: Director invites a new DDSA staff account',
  })
  async createStaff(
    @CurrentUser() user: UserProfileDto,
    @Body() dto: CreateStaffDto,
  ) {
    return this.adminService.createStaff(dto, user.id);
  }

  @Delete('staff/:id')
  @Auth(Role.DSA_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'DSA Staff Management: Director deletes a DDSA staff account',
  })
  async deleteStaff(
    @CurrentUser() user: UserProfileDto,
    @Param('id') id: string,
  ) {
    return this.adminService.deleteStaff(id, user.id);
  }

  @Get('events')
  @Auth(Role.DSA_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'DSA Overview: Get paginated list of all campus events across all societies',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of campus events returned',
  })
  async getAllEvents(@Query() query: QueryAdminEventsDto) {
    return this.adminService.getAllEventsAdmin(query);
  }

  @Get('societies')
  @Auth(Role.DSA_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'DSA Management: Get paginated list of all campus societies with status filters',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of societies returned',
  })
  async getAllSocieties(@Query() query: QueryAdminSocietiesDto) {
    return this.adminService.getAllSocietiesAdmin(query);
  }

  @Get('societies/:id')
  @Auth(Role.DSA_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'DSA Management: Get full society details including advisor, EC members, events and yearly plans',
  })
  @ApiParam({ name: 'id', description: 'Society UUID' })
  @ApiResponse({
    status: 200,
    description: 'Full society details returned successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Society not found',
  })
  async getSocietyById(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.getSocietyByIdAdmin(id);
  }

  @Post('societies')
  @Auth(Role.DSA_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary:
      'DSA Onboarding: Provision a new society and society president user account with temporary credentials',
  })
  @ApiResponse({
    status: 201,
    description: 'Society and president user account provisioned successfully',
    type: OnboardSocietyResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error in input fields',
  })
  @ApiResponse({
    status: 409,
    description: 'Society name or president email already exists',
  })
  async onboardSociety(@Body() dto: CreateSocietyAdminDto): Promise<OnboardSocietyResponseDto> {
    return this.adminService.onboardSociety(dto);
  }

  @Post('advisors')
  @Auth(Role.DSA_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'DSA Management: Onboard a new faculty advisor',
  })
  @ApiResponse({
    status: 201,
    description: 'Advisor onboarded successfully',
  })
  @ApiResponse({
    status: 409,
    description: 'Email already exists',
  })
  async createAdvisor(@Body() dto: CreateAdvisorDto) {
    return this.adminService.createAdvisor(dto);
  }

  @Patch('societies/:id')
  @Auth(Role.DSA_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'DSA Management: Update society profile details or reassign faculty advisor',
  })
  @ApiParam({ name: 'id', description: 'Society UUID' })
  @ApiResponse({
    status: 200,
    description: 'Society updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Society or Advisor not found',
  })
  async updateSociety(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateSocietyAdminDto) {
    return this.adminService.updateSocietyAdmin(id, dto);
  }

  @Delete('societies/:id')
  @Auth(Role.DSA_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'DSA Management: Hard delete a society and its associated account completely',
  })
  @ApiParam({ name: 'id', description: 'Society UUID' })
  @ApiResponse({
    status: 200,
    description: 'Society deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Society not found',
  })
  async deleteSociety(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.deleteSociety(id);
  }

  @Patch('societies/:id/deactivate')
  @Auth(Role.DSA_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary:
      'DSA Management: Soft-deactivate a society account (preserves historical events & plans)',
  })
  @ApiParam({ name: 'id', description: 'Society UUID' })
  @ApiResponse({ status: 200, description: 'Society deactivated' })
  async deactivateSociety(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.deactivateSociety(id);
  }

  @Patch('societies/:id/reactivate')
  @Auth(Role.DSA_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Reactivate a society account' })
  @ApiParam({ name: 'id', description: 'Society UUID' })
  @ApiResponse({ status: 200, description: 'Society reactivated' })
  async reactivateSociety(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.reactivateSociety(id);
  }

  @Patch('societies/:id/warning')
  @Auth(Role.DSA_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Toggle society warning status' })
  @ApiParam({ name: 'id', description: 'Society UUID' })
  @ApiResponse({ status: 200, description: 'Society warning status updated' })
  async toggleWarning(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('hasWarning') hasWarning: boolean,
  ) {
    return this.adminService.toggleWarning(id, hasWarning);
  }

  @Get('yearly-plans')
  @Auth(Role.DSA_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'DSA Internal Records: Get paginated list of all society yearly calendar plans',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated yearly plans list returned',
    type: PaginatedAdminPlansResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - DSA_ADMIN role required',
  })
  async getAllYearlyPlans(
    @Query() query: QueryAdminYearlyPlansDto,
  ): Promise<PaginatedAdminPlansResponseDto> {
    return this.adminService.getAllYearlyPlans(query);
  }

  @Get('yearly-plans/:id')
  @Auth(Role.DSA_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'DSA Internal Records: Get complete yearly plan detail and audit record by ID',
  })
  @ApiParam({ name: 'id', description: 'Yearly Plan UUID' })
  @ApiResponse({
    status: 200,
    description: 'Complete yearly plan record details returned',
  })
  @ApiResponse({
    status: 404,
    description: 'Yearly plan record not found',
  })
  async getYearlyPlanDetailById(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.getYearlyPlanDetailById(id);
  }

  @Patch('yearly-plans/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'DSA Force Update Plan Events',
    description: 'Allows DSA to manually override and update events in a yearly plan.',
  })
  async updateYearlyPlan(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AdminUpdateYearlyPlanDto,
  ) {
    return this.adminService.updateYearlyPlan(id, dto);
  }

  @Patch('events/:id/status')
  @Auth(Role.DSA_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'DSA Management: Approve, reject, or request changes for an event',
  })
  async updateEventStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: { status: string; comments?: string; rules?: string },
  ) {
    return this.adminService.updateEventStatus(id, dto);
  }

  @Patch('events/:id/venue-clearance')
  @Auth(Role.DSA_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'DSA Management: Verify or reject physical venue clearance slip from PS to Dean',
  })
  async verifyVenueClearance(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: VerifyVenueClearanceDto,
  ) {
    return this.adminService.verifyVenueClearance(id, dto);
  }
}
