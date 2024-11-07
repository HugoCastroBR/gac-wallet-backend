import { ApiProperty } from '@nestjs/swagger';
import {
  IsDecimal,
  IsBoolean,
  IsString,
  IsOptional,
  IsEmail,
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
  @IsEmail()
  sentToUserEmail: string;
}
