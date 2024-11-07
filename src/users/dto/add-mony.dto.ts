import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class AddMoneyDto {
  @IsNumber()
  @ApiProperty()
  amount: number;
}
