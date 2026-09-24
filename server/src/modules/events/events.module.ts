import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { UploadsModule } from '../uploads/uploads.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [UploadsModule, EmailModule],
  controllers: [EventsController],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}

