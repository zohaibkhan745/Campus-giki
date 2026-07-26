import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserProfileDto } from '../dto/auth-response.dto';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = UserProfileDto>(err: unknown, user: TUser): TUser {
    if (err || !user) {
      throw (
        (err as Error) ||
        new UnauthorizedException('Authentication token is invalid, expired, or missing')
      );
    }
    return user;
  }
}
