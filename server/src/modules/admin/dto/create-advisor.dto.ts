import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength, Matches } from 'class-validator';

export class CreateAdvisorDto {
  @ApiProperty({ example: 'Dr. Ahsan Khan' })
  @IsNotEmpty()
  @IsString()
  @MinLength(3, { message: 'Full name must be at least 3 characters' })
  @MaxLength(100)
  fullName: string;

  @ApiProperty({ example: 'ahsan.khan@giki.edu.pk' })
  @IsNotEmpty()
  @IsEmail({}, { message: 'Must be a valid email address' })
  email: string;

  @ApiProperty({ example: 'securepassword123' })
  @IsNotEmpty()
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;

  @ApiProperty({ example: 'Faculty of Computer Science & Engineering' })
  @IsNotEmpty()
  @IsString()
  department: string;

  @ApiProperty({ example: 'Assistant Professor' })
  @IsNotEmpty()
  @IsString()
  designation: string;
}
