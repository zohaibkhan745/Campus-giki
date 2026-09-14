import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../../core/database/prisma.service';
import { RegisterStudentDto } from './dto/register-student.dto';
import { LoginDto } from './dto/login.dto';
import { ActivateSocietyDto } from './dto/activate-society.dto';
import { AuthResponseDto, UserProfileDto } from './dto/auth-response.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class AuthService {
  private readonly SALT_ROUNDS = 10;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Fetches the full user profile from DB (used by GET /auth/profile).
   * This is the explicit alternative to the per-request DB lookup that was removed from JwtStrategy.
   */
  async getFullProfile(userId: string): Promise<UserProfileDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { advisor: true, society: true },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User account not found or is currently inactive');
    }

    return this.sanitizeUser(user);
  }

  /**
   * Registers a new student account.
   */
  async registerStudent(dto: RegisterStudentDto): Promise<AuthResponseDto> {
    const normalizedEmail = dto.email.toLowerCase().trim();

    // Check email uniqueness
    const existingUser = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      throw new ConflictException('An account with this email address already exists');
    }

    // Hash password with bcrypt
    const hashedPassword = await bcrypt.hash(dto.password, this.SALT_ROUNDS);

    // Create student user record
    const user = await this.prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        fullName: dto.fullName.trim(),
        role: Role.STUDENT,
      },
      include: {
        advisor: true,
        society: true,
      },
    });

    // Generate JWT access token
    const accessToken = this.generateJwtToken(user);

    return {
      accessToken,
      user: this.sanitizeUser(user),
    };
  }

  /**
   * Authenticates user and issues access token.
   */
  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const normalizedEmail = dto.email.toLowerCase().trim();

    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        advisor: true,
        society: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isActive) {
      if (user.role === Role.SOCIETY) {
        throw new UnauthorizedException(
          'The society is banned, kindly visit DSA Office for further inquiry',
        );
      }
      throw new UnauthorizedException('Invalid email or password');
    }

    // Compare bcrypt password hash
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const accessToken = this.generateJwtToken(user);

    return {
      accessToken,
      user: this.sanitizeUser(user),
    };
  }

  /**
   * Updates a user's profile settings.
   */
  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<UserProfileDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { advisor: true, society: true },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const updateData: any = {};

    if (dto.fullName) {
      updateData.fullName = dto.fullName.trim();
    }

    if (dto.avatarUrl !== undefined) {
      updateData.avatarUrl = dto.avatarUrl;
    }

    // Handle password change
    if (dto.newPassword) {
      if (!dto.currentPassword) {
        throw new BadRequestException('Current password is required to set a new password');
      }

      const isPasswordValid = await bcrypt.compare(dto.currentPassword, user.password);
      if (!isPasswordValid) {
        throw new BadRequestException('Incorrect current password');
      }

      updateData.password = await bcrypt.hash(dto.newPassword, this.SALT_ROUNDS);
    }

    // If user is an advisor, handle advisor profile updates
    if (user.role === Role.ADVISOR && user.advisor && (dto.department || dto.designation)) {
      await this.prisma.advisor.update({
        where: { id: user.advisor.id },
        data: {
          department: dto.department || user.advisor.department,
          designation: dto.designation || user.advisor.designation,
        },
      });
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: { advisor: true, society: true },
    });

    return this.sanitizeUser(updatedUser);
  }

  /**
   * Activates a newly provisioned society account using a single-use email invitation token.
   */
  async activateSociety(dto: ActivateSocietyDto): Promise<AuthResponseDto> {
    const normalizedEmail = dto.email.toLowerCase().trim();

    // 1. Hash incoming token with SHA-256
    const hashedIncoming = crypto.createHash('sha256').update(dto.token.trim()).digest('hex');

    // 2. Find user matching email and hashed verification token
    const user = await this.prisma.user.findFirst({
      where: {
        email: normalizedEmail,
        verificationToken: hashedIncoming,
      },
      include: {
        society: true,
        advisor: true,
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired activation link');
    }

    if (user.verificationExpires && user.verificationExpires < new Date()) {
      throw new BadRequestException(
        'Activation token has expired. Please ask DSA for a new invitation.',
      );
    }

    // 3. Hash new password
    const hashedPassword = await bcrypt.hash(dto.password, this.SALT_ROUNDS);

    // 4. Perform activation in transaction
    const updatedUser = await this.prisma.$transaction(async (tx) => {
      // Update User
      const u = await tx.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          fullName: dto.presidentName.trim(),
          isEmailVerified: true,
          verificationToken: null,
          verificationExpires: null,
        },
        include: {
          society: true,
          advisor: true,
        },
      });

      // Update Society Details
      if (user.society) {
        await tx.society.update({
          where: { id: user.society.id },
          data: {
            presidentName: dto.presidentName.trim(),
            presidentRegNum: dto.presidentRegNum.trim(),
            presidentContact: dto.presidentContact.trim(),
            isSetupComplete: false,
          },
        });
      }

      return u;
    });

    // 5. Generate JWT access token
    const accessToken = this.generateJwtToken(updatedUser);

    return {
      accessToken,
      user: this.sanitizeUser(updatedUser),
    };
  }

  /**
   * Signs JWT payload.
   */
  private generateJwtToken(user: User): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return this.jwtService.sign(payload);
  }

  /**
   * Strips password hash before returning user object.
   */
  private sanitizeUser(user: any): UserProfileDto {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...safeUser } = user;
    return safeUser as UserProfileDto;
  }
}
