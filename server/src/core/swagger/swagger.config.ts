import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

/**
 * Sets up Swagger OpenAPI documentation for Campus GIKI.
 *
 * @param app INestApplication instance
 * @param apiPrefix Global API prefix string (e.g. 'api/v1')
 */
export function setupSwagger(app: INestApplication, apiPrefix: string): void {
  const config = new DocumentBuilder()
    .setTitle('Campus GIKI REST API')
    .setDescription(
      `
## Overview
Welcome to the production-ready REST API documentation for **Campus GIKI** — the centralized university platform for GIKI students, societies, events, and campus activities.

## Authentication
This API uses **JWT (JSON Web Token) Bearer Authentication**.

1. Register or Log in via \`POST /${apiPrefix}/auth/login\` to obtain an \`accessToken\`.
2. Click the **Authorize** button at the top right of this page.
3. Enter your token into the **Bearer (JWT)** field (e.g. \`eyJhbGciOiJIUzI1NiIsInR5cCI6...\`).
4. Click **Authorize** to unlock protected endpoints.

## Role-Based Access Control (RBAC)
Endpoints are secured with RBAC guards. User roles include:
- \`STUDENT\` (Regular student access)
- \`SOCIETY\` (Society executive team management)
- \`ADVISOR\` (Faculty advisor oversight)
- \`DSA_ADMIN\` (Dean Student Affair Administrator)
      `,
    )
    .setVersion('1.0.0')
    .setContact('GIKI Development Team', 'https://giki.edu.pk', 'dev.team@giki.edu.pk')
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addTag('Auth', 'User authentication, registration, and user profile management')
    .addTag('Health', 'System status diagnostics, uptime, and health monitoring')
    .addTag('Societies', 'Campus student societies discovery and administration')
    .addTag('Events', 'University events, workshops, and competition schedules')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter your valid JWT access token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  const docsPath = `${apiPrefix}/docs`;

  SwaggerModule.setup(docsPath, app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: 'none', // Keeps tags collapsed by default for a clean layout
      filter: true, // Enables endpoint search filtering bar
      showExtensions: true,
      showCommonExtensions: true,
    },
    customSiteTitle: 'Campus GIKI API Documentation',
    customCss: '.swagger-ui .topbar { display: none }', // Hide topbar header for sleek aesthetic
  });
}
