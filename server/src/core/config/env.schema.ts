import * as Joi from 'joi';

export const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),

  PORT: Joi.number().port().default(5000),

  API_PREFIX: Joi.string().default('api/v1'),

  CORS_ORIGIN: Joi.string().default('*'),

  SWAGGER_ENABLED: Joi.boolean().default(true),

  DATABASE_URL: Joi.string()
    .uri()
    .required()
    .messages({ 'any.required': 'DATABASE_URL environment variable is required' }),

  JWT_SECRET: Joi.string()
    .required()
    .messages({ 'any.required': 'JWT_SECRET environment variable is required' }),

  JWT_EXPIRES_IN: Joi.string().default('1d'),
});
