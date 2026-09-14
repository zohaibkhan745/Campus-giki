import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ActivateSocietyDto {
  @ApiProperty({
    example: 'a1b2c3d4e5f6...',
    description: 'Raw single-use activation token sent via email',
  })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({
    example: 'president.acm@giki.edu.pk',
    description: 'Registered president/society email',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'SecurePassword123!', description: 'New permanent password' })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @ApiProperty({ example: 'Ali Khan', description: 'Full name of the society president' })
  @IsString()
  @IsNotEmpty()
  presidentName: string;

  @ApiProperty({ example: '2022-CS-123', description: 'GIKI Student Registration Number' })
  @IsString()
  @IsNotEmpty()
  presidentRegNum: string;

  @ApiProperty({ example: '0300-1234567', description: 'Contact phone number' })
  @IsString()
  @IsNotEmpty()
  presidentContact: string;
}
