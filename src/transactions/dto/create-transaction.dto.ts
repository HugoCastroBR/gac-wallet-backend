import { ApiProperty } from '@nestjs/swagger';
import {
  IsDecimal,
  IsBoolean,
  IsString,
  IsNumber,
  IsOptional,
} from 'class-validator';

export class CreateTransactionDto {
  @ApiProperty()
  @IsDecimal()
  valueBrl: number;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  reversed?: boolean;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsNumber()
  sentFromUserId: number;

  @ApiProperty()
  @IsNumber()
  sentToUserId: number;
}
