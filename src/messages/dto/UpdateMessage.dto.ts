import { PartialType } from '@nestjs/mapped-types';
import { CreateMessageDto } from './CreateMessage.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateMessageDto extends PartialType(CreateMessageDto) {
  @IsBoolean()
  @IsOptional()
  read?: boolean;
}
