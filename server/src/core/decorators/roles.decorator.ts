import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';

export const ROLES_KEY = 'roles';

/**
 * Custom decorator to attach required roles metadata to routes or controllers.
 * @example @Roles(Role.DSA_ADMIN, Role.ADVISOR)
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
