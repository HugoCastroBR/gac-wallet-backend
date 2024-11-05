import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({
    default: 'John Doe',
    required: false,
  })
  name?: string;

  @ApiProperty({
    default: 'johndoe@fakemail.com',
    required: false,
  })
  email?: string;

  @ApiProperty({
    default: 'password',
    required: false,
  })
  password?: string;
}
