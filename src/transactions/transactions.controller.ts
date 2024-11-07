import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
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
  @Post()
  async create(
    @Body() createTransactionDto: CreateTransactionDto,
    @Req() req: Request,
  ) {
    try {
      const fromUserId = req.user['id'];
      return await this.transactionsService.create(
        createTransactionDto,
        fromUserId,
      );
    } catch (error) {
      throw new HttpException(error.message, 400);
    }
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id') // make a reverse transaction by id from transaction
  async createReverseTransaction(@Param('id') id: number) {
    return await this.transactionsService.createReverseTransaction(id);
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
