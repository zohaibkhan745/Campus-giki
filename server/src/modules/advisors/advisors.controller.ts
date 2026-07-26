import { Controller, Get, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { AdvisorsService } from './advisors.service';
import { QueryAdvisorPlansDto } from './dto/query-advisor-plans.dto';
import { PaginatedAdvisorPlansResponseDto } from './dto/advisor-plans-response.dto';
import { Auth } from '../../core/decorators/auth.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserProfileDto } from '../auth/dto/auth-response.dto';

@ApiTags('Advisors')
@Controller('advisors')
export class AdvisorsController {
  constructor(private readonly advisorsService: AdvisorsService) {}

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
}
