import { Module } from '@nestjs/common';
import { AppConfigModule } from './core/config/config.module';
import { PrismaModule } from './core/database/prisma.module';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { SocietiesModule } from './modules/societies/societies.module';
import { EventsModule } from './modules/events/events.module';
import { YearlyPlansModule } from './modules/yearly-plans/yearly-plans.module';
import { AdvisorsModule } from './modules/advisors/advisors.module';
import { AdminModule } from './modules/admin/admin.module';
import { FeedModule } from './modules/feed/feed.module';
import { PostsModule } from './modules/posts/posts.module';

@Module({
  imports: [
    AppConfigModule,
    PrismaModule,
    HealthModule,
    AuthModule,
    CategoriesModule,
    SocietiesModule,
    EventsModule,
    YearlyPlansModule,
    AdvisorsModule,
    AdminModule,
    FeedModule,
    PostsModule,
  ],
})
export class AppModule {}
