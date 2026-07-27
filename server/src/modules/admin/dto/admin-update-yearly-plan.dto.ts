import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { PlannedEventItemDto } from '../../yearly-plans/dto/create-yearly-plan.dto';

export class AdminUpdateYearlyPlanDto {
  @ApiPropertyOptional({ type: [PlannedEventItemDto] })
  @IsOptional()
  @IsArray({ message: 'Events must be an array' })
  @ValidateNested({ each: true })
  @Type(() => PlannedEventItemDto)
  events?: PlannedEventItemDto[];
}
