import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { Request, Response } from 'express';
import { JwtAuthGuard } from 'src/auth/auth.guard';
import { PaginationDTO } from 'src/dtos/pagination';

@ApiTags('transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async getAll(
    @Query() pagination: PaginationDTO,
    @Res() response: Response,
    @Req() req: Request,
  ) {
    try {
      const res = await this.transactionsService.getAllWithPagination(
        Number(req.user['id']),
        Number(pagination.page),
        Number(pagination.itemsPerPage),
        pagination.orderBy,
        pagination.order,
        pagination.search,
      );
      response?.status(200).json(res);
    } catch (error) {
      response?.status(400).json({ error: error.message });
    }
  }

  @Get(':id')
  async getById(@Param('id') id: number) {
    return await this.transactionsService.findOne(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':userId')
  async create(
    @Body() createTransactionDto: CreateTransactionDto,
    @Param('userId') userId: number,
    @Req() req: Request,
  ) {
    const fromUserId = req.user['id'];
    return await this.transactionsService.create(
      createTransactionDto,
      fromUserId,
      userId,
    );
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateTransactionDto: UpdateTransactionDto,
  ) {
    return await this.transactionsService.update(id, updateTransactionDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return await this.transactionsService.remove(id);
  }
}