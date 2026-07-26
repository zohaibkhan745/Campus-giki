import { ApiProperty } from '@nestjs/swagger';

export class OnboardSocietyResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ example: 'ACM GIKI Student Chapter' })
  name: string;

  @ApiProperty({ example: 'president.acm@giki.edu.pk' })
  presidentEmail: string;

  @ApiProperty({ example: 'GIKI-Pass#8a9f2b' })
  temporaryPassword: string;

  @ApiProperty({ example: false })
  isSetupComplete: boolean;

  @ApiProperty({ example: { id: 'c1', name: 'Technology' } })
  category: {
    id: string;
    name: string;
  };

  @ApiProperty({
    example: {
      id: 'a1',
      designation: 'Assistant Professor',
      user: { fullName: 'Dr. Ahsan Ilyas' },
    },
  })
  advisor: {
    id: string;
    designation: string;
    user: {
      fullName: string;
    };
  };

  @ApiProperty({ example: '2026-07-26T15:10:00.000Z' })
  createdAt: Date;
}
