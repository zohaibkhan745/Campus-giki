import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

/**
 * JWT Strategy: Validates token signature and expiration only.
 *
 * PERFORMANCE: Returns claims directly from the JWT payload without a database query.
 * The JWT contains sub (id), email, and role — which is all that controllers and guards need.
 * Endpoints that require the full user profile (e.g. GET /auth/profile) fetch it themselves.
 *
 * Security note: Deactivated users remain valid until their JWT expires (default 1 day).
 * This is an acceptable trade-off for eliminating 1 DB query (with 2 JOINs) per authenticated request.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    const jwtSecret = configService.get<string>('app.jwtSecret');

    if (!jwtSecret) {
      throw new Error('JWT_SECRET configuration is missing');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  /**
   * Returns JWT claims directly — no database round-trip.
   * The returned object is attached to `request.user` by Passport.
   */
  validate(payload: JwtPayload) {
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
