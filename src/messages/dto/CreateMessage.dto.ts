import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsPositive,
} from 'class-validator';

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(255)
  readonly text: string;

  @IsPositive()
  @IsNotEmpty()
  readonly toId: number;
}
