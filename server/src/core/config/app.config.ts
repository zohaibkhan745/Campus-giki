import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  apiPrefix: process.env.API_PREFIX || 'api/v1',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  swaggerEnabled: process.env.SWAGGER_ENABLED === 'true' || process.env.NODE_ENV !== 'production',
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  storageDriver: process.env.STORAGE_DRIVER || 'local',
  storageLocalPath: process.env.STORAGE_LOCAL_PATH || './uploads',
  uploadMaxSizeMb: parseInt(process.env.UPLOAD_MAX_SIZE_MB || '5', 10),
  appUrl: process.env.APP_URL || 'http://localhost:5000',
}));
