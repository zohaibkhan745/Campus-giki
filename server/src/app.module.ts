import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { Module } from '@nestjs/common';
import { AppConfigModule } from './core/config/config.module';
import { PrismaModule } from './core/database/prisma.module';
import { RedisModule } from './core/redis/redis.module';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { SocietiesModule } from './modules/societies/societies.module';
import { EventsModule } from './modules/events/events.module';
import { YearlyPlansModule } from './modules/yearly-plans/yearly-plans.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { AdvisorsModule } from './modules/advisors/advisors.module';
import { AdminModule } from './modules/admin/admin.module';
import { FeedModule } from './modules/feed/feed.module';
import { PostsModule } from './modules/posts/posts.module';
import { EmailModule } from './modules/email/email.module';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    AppConfigModule,
    PrismaModule,
    RedisModule,
    EmailModule,
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000,
        // Generous quota for campus network (5,000+ students & faculty sharing campus NAT IP)
        limit: parseInt(process.env.THROTTLE_LIMIT || '3000', 10),
      },
    ]),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
      serveStaticOptions: {
        maxAge: 31536000000, // 1 year cache for static images
      },
    }),
    HealthModule,
    AuthModule,
    CategoriesModule,
    SocietiesModule,
    EventsModule,
    YearlyPlansModule,
    UploadsModule,
    AdvisorsModule,
    AdminModule,
    FeedModule,
    PostsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
