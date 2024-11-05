import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, Length } from 'class-validator';

export class RegisterUserDto {
  @ApiProperty()
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @Length(8, 20)
  password: string;

  @ApiProperty()
  @IsString()
  @Length(8, 20)
  confirmPassword: string;

  @ApiProperty()
  @IsString()
  @Length(2, 20)
  name: string;
}
