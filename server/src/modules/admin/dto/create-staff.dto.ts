import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateStaffDto {
  @ApiProperty({ example: 'Dr. Usman Tariq' })
  @IsNotEmpty()
  @IsString()
  @MinLength(3, { message: 'Full name must be at least 3 characters' })
  @MaxLength(100)
  fullName: string;

  @ApiProperty({ example: 'ddsa@giki.edu.pk' })
  @IsNotEmpty()
  @IsEmail({}, { message: 'Must be a valid email address' })
  email: string;
}
