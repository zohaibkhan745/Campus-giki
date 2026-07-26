import { ApiProperty } from '@nestjs/swagger';

export class HealthCheckDetailsDto {
  @ApiProperty({ example: 'up' })
  status: string;

  @ApiProperty({ example: '52.4 MB' })
  memoryUsage: string;

  @ApiProperty({ example: '120.45s' })
  uptime: string;
}

export class HealthResponseDto {
  @ApiProperty({ example: 'ok' })
  status: string;

  @ApiProperty({ example: '2026-07-25T22:45:00.000Z' })
  timestamp: string;

  @ApiProperty({ example: 'development' })
  environment: string;

  @ApiProperty({ type: HealthCheckDetailsDto })
  details: HealthCheckDetailsDto;
}
