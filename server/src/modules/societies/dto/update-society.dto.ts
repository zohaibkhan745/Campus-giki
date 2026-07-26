import { PartialType } from '@nestjs/swagger';
import { SetupSocietyDto } from './setup-society.dto';

export class UpdateSocietyDto extends PartialType(SetupSocietyDto) {}
