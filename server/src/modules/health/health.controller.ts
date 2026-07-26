import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HealthService } from './health.service';
import { HealthResponseDto } from './dto/health-response.dto';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Check API system health status' })
  @ApiResponse({
    status: 200,
    description: 'System is healthy and operational',
    type: HealthResponseDto,
  })
  checkHealth(): HealthResponseDto {
    return this.healthService.getHealthStatus();
  }
}
