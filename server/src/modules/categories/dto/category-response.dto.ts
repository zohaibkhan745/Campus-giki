import { ApiProperty } from '@nestjs/swagger';

export class CategoryResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ example: 'Technology' })
  name: string;

  @ApiProperty({ example: 'technology' })
  slug: string;

  @ApiProperty({ example: '2026-07-26T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-07-26T00:00:00.000Z' })
  updatedAt: Date;
}
