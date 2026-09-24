import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ActivateAdvisorDto {
  @ApiProperty({
    example: 'dr.ahsan@giki.edu.pk',
    description: 'Faculty email address matching the advisor nomination',
  })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Must be a valid email address' })
  email: string;

  @ApiProperty({
    example: 'a4b8c12d...',
    description: 'Single-use cryptographic activation token received via email',
  })
  @IsNotEmpty({ message: 'Activation token is required' })
  @IsString()
  token: string;

  @ApiProperty({
    example: 'FacultySecurePass@123',
    description: 'Chosen password for the faculty advisor account',
  })
  @IsNotEmpty({ message: 'Password is required' })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;
}
