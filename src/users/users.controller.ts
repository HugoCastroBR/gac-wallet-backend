import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { Request } from 'express';
import { AddMoneyDto } from './dto/add-mony.dto';
import { JwtAuthGuard } from 'src/auth/auth.guard';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Put('deposit')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async addMoney(@Body() AddMoneyDto: AddMoneyDto, @Req() req: Request) {
    const UserId = Number(req.user['id']);
    return this.usersService.addMoney(UserId, AddMoneyDto);
  }

  @Get(':email')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async getUserByEmail(@Param('email') email: string) {
    try {
      return await this.usersService.getUserByEmail(email);
    } catch (error) {
      return {};
    }
  }
}
