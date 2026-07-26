import { Module } from '@nestjs/common';
import { YearlyPlansController } from './yearly-plans.controller';
import { YearlyPlansService } from './yearly-plans.service';

@Module({
  controllers: [YearlyPlansController],
  providers: [YearlyPlansService],
  exports: [YearlyPlansService],
})
export class YearlyPlansModule {}
