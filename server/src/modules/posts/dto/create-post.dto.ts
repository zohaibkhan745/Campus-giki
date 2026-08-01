import { IsString, IsOptional, IsUrl, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty({ example: 'Important campus update...', description: 'Content of the announcement' })
  @IsString()
  @MaxLength(2000)
  content: string;

  @ApiPropertyOptional({ example: 'https://example.com/image.jpg', description: 'Optional attachment' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ example: 'https://example.com/video.mp4', description: 'Optional video attachment' })
  @IsOptional()
  @IsString()
  videoUrl?: string;
}
