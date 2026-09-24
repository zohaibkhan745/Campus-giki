import { Module } from '@nestjs/common';
import { YearlyPlansController } from './yearly-plans.controller';
import { YearlyPlansService } from './yearly-plans.service';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [EmailModule],
  controllers: [YearlyPlansController],
  providers: [YearlyPlansService],
  exports: [YearlyPlansService],
})
export class YearlyPlansModule {}

