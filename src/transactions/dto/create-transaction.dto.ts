import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsString,
  IsOptional,
  IsEmail,
  IsNumber,
} from 'class-validator';

export class CreateTransactionDto {
  @ApiProperty()
  @IsNumber()
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
