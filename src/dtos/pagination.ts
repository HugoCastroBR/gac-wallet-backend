import { ApiProperty } from '@nestjs/swagger';

export class PaginationDTO {
  @ApiProperty({
    type: Number,
    default: 1,
  })
  page: number;

  @ApiProperty({
    type: Number,
    default: 10,
  })
  itemsPerPage: number;

  @ApiProperty({
    type: String,
    default: 'createdAt',
  })
  orderBy?: string;

  @ApiProperty({
    type: String,
    default: 'desc',
  })
  order?: 'asc' | 'desc';

  @ApiProperty({
    type: String,
    required: false,
    default: '',
  })
  search?: string;
}