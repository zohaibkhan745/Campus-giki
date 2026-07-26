import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsOptional, ValidateNested } from 'class-validator';
import { SocietyAllowedPlanStatus } from './create-yearly-plan.dto';
import { PlannedEventItemDto } from './create-yearly-plan.dto';

export class UpdateYearlyPlanDto {
  @ApiPropertyOptional({ enum: SocietyAllowedPlanStatus })
  @IsOptional()
  @IsEnum(SocietyAllowedPlanStatus, { message: 'Status must be DRAFT or PENDING' })
  status?: SocietyAllowedPlanStatus;

  @ApiPropertyOptional({ type: [PlannedEventItemDto] })
  @IsOptional()
  @IsArray({ message: 'Events must be an array' })
  @ValidateNested({ each: true })
  @Type(() => PlannedEventItemDto)
  events?: PlannedEventItemDto[];
}
