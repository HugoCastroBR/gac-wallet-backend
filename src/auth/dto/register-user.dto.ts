import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, Length } from 'class-validator';
import { Match } from 'src/utils/match.decorator';

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
  @Match('password', { message: 'Passwords do not match' })
  confirmPassword: string;

  @ApiProperty()
  @IsString()
  @Length(2, 20)
  name: string;
}
