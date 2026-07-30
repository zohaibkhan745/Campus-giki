import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../../core/database/prisma.service';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { UserProfileDto } from '../dto/auth-response.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
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

  async validate(payload: JwtPayload): Promise<UserProfileDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { advisor: true },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User account not found or is currently inactive');
    }

    // Omit sensitive password hash
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...safeUser } = user;
    return safeUser;
  }
}
