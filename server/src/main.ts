import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './core/filters/all-exceptions.filter';
import { HttpExceptionFilter } from './core/filters/http-exception.filter';
import { LoggingInterceptor } from './core/interceptors/logging.interceptor';
import { TransformInterceptor } from './core/interceptors/transform.interceptor';
import { setupSwagger } from './core/swagger/swagger.config';
import compression from 'compression';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Enable HTTP wire compression (Gzip/Deflate)
  app.use(compression());

  // Enable graceful shutdown hooks
  app.enableShutdownHooks();

  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port', 5000);
  const apiPrefix = configService.get<string>('app.apiPrefix', 'api/v1');
  const corsOrigin = configService.get<string>('app.corsOrigin', '*');
  const swaggerEnabled = configService.get<boolean>('app.swaggerEnabled', true);

  // Set global API prefix
  app.setGlobalPrefix(apiPrefix);

  // Enable CORS
  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Always allow any origin (e.g., localhost, 127.0.0.1, any port)
      callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With', 'ngrok-skip-browser-warning'],
    credentials: true,
  });

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global Exception Filters
  app.useGlobalFilters(new AllExceptionsFilter(), new HttpExceptionFilter());

  // Global Interceptors
  app.useGlobalInterceptors(new LoggingInterceptor(), new TransformInterceptor());

  // Setup Swagger API documentation
  if (swaggerEnabled) {
    setupSwagger(app, apiPrefix);
  }

  await app.listen(port);

  logger.log(`==================================================`);
  logger.log(`🚀 Campus GIKI Server running on: http://localhost:${port}/${apiPrefix}`);
  if (swaggerEnabled) {
    logger.log(`📚 Swagger Documentation at: http://localhost:${port}/${apiPrefix}/docs`);
  }
  logger.log(`==================================================`);
}

void bootstrap();
