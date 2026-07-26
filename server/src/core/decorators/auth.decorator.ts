import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../../modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from './roles.decorator';

/**
 * Composite Auth decorator combining JwtAuthGuard, RolesGuard, Roles metadata, and Swagger Bearer Auth annotations.
 *
 * @example @Auth(Role.DSA_ADMIN)
 * @example @Auth(Role.SOCIETY, Role.ADVISOR)
 * @example @Auth() // Any authenticated user
 */
export function Auth(...roles: Role[]) {
  if (roles.length > 0) {
    return applyDecorators(
      UseGuards(JwtAuthGuard, RolesGuard),
      Roles(...roles),
      ApiBearerAuth('JWT-auth'),
    );
  }

  return applyDecorators(UseGuards(JwtAuthGuard), ApiBearerAuth('JWT-auth'));
}
