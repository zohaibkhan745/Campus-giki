import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterStudentDto } from './dto/register-student.dto';
import { LoginDto } from './dto/login.dto';
import { ActivateSocietyDto } from './dto/activate-society.dto';
import { AuthResponseDto, UserProfileDto } from './dto/auth-response.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CurrentUser } from './decorators/current-user.decorator';
import { Auth } from '../../core/decorators/auth.decorator';

@ApiTags('Auth')
@UseGuards(ThrottlerGuard)
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register/student')
  @HttpCode(HttpStatus.FORBIDDEN)
  @ApiOperation({ summary: 'Register a new GIKI student account (Disabled)' })
  @ApiResponse({
    status: 403,
    description: 'Student self-registration is closed',
  })
  async registerStudent(): Promise<never> {
    throw new ForbiddenException(
      'Student self-registration is closed. Administrative and society accounts are provisioned via DSA invitation.',
    );
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate user with email and password' })
  @ApiResponse({
    status: 200,
    description: 'Successfully authenticated',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials or inactive account',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many authentication attempts. Please wait before retrying.',
  })
  async login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(dto);
  }

  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post('activate-society')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activate provisioned society account using single-use token' })
  @ApiResponse({
    status: 200,
    description: 'Account activated successfully, returns access token',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired activation link',
  })
  async activateSociety(@Body() dto: ActivateSocietyDto): Promise<AuthResponseDto> {
    return this.authService.activateSociety(dto);
  }

  @Get('profile')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get authenticated user profile details' })
  @ApiResponse({
    status: 200,
    description: 'Authenticated user profile returned',
    type: UserProfileDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized access - token invalid or missing',
  })
  async getProfile(@CurrentUser() user: UserProfileDto): Promise<UserProfileDto> {
    return this.authService.getFullProfile(user.id);
  }

  @Patch('profile')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update authenticated user profile' })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
    type: UserProfileDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation failed or incorrect current password',
  })
  async updateProfile(
    @CurrentUser() user: UserProfileDto,
    @Body() dto: UpdateProfileDto,
  ): Promise<UserProfileDto> {
    return this.authService.updateProfile(user.id, dto);
  }

  @Get('dsa-dashboard')
  @Auth(Role.DSA_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Protected endpoint accessible only by DSA_ADMIN' })
  @ApiResponse({
    status: 200,
    description: 'Access granted to DSA Admin',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Required role DSA_ADMIN missing',
  })
  getDsaDashboard(@CurrentUser() user: UserProfileDto) {
    return {
      message: 'Welcome to the DSA Admin Dashboard',
      admin: user.email,
    };
  }
}
