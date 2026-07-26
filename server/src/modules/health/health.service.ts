import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HealthResponseDto } from './dto/health-response.dto';

@Injectable()
export class HealthService {
  constructor(private readonly configService: ConfigService) {}

  getHealthStatus(): HealthResponseDto {
    const memoryUsage = process.memoryUsage();
    const heapUsedMB = (memoryUsage.heapUsed / 1024 / 1024).toFixed(2);
    const uptimeSeconds = process.uptime().toFixed(2);
    const environment = this.configService.get<string>('app.env') || 'development';

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment,
      details: {
        status: 'up',
        memoryUsage: `${heapUsedMB} MB`,
        uptime: `${uptimeSeconds}s`,
      },
    };
  }
}
