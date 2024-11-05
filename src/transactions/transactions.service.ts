import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async getAll() {
    const transactions = await this.prisma.transaction.findMany();
    return transactions;
  }
  async getAllWithPagination(
    userId: number,
    page: number,
    limit: number,
    orderByProp?: string,
    order?: string,
    search?: string,
  ) {
    if (page < 1) {
      page = 1;
    }
    if (limit < 1) {
      limit = 1;
    }
    const transactions = await this.prisma.transaction.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        [orderByProp]: order,
      },
      where: {
        OR: [
          {
            sentFromUserId: Number(userId),
          },
          {
            sentToUserId: Number(userId),
          },
        ],
        AND: [
          {
            description: {
              contains: search || '',
              mode: 'insensitive',
            },
          },
        ],
      },
    });

    const total = await this.prisma.transaction.count({
      where: {
        OR: [
          {
            sentFromUserId: Number(userId),
          },
          {
            sentToUserId: Number(userId),
          },
        ],
        AND: [
          {
            description: {
              contains: search || '',
              mode: 'insensitive',
            },
          },
        ],
      },
    });
    const totalPages = Math.ceil(total / limit);
    const data = transactions.map((transaction) => {
      return {
        ...transaction,
      };
    });

    return { data, total, page, limit, totalPages };
  }

  async findOne(id: number) {
    const transaction = await this.prisma.transaction.findUnique({
      where: {
        id: Number(id),
      },
    });

    return {
      ...transaction,
    };
  }

  async create(
    createTransactionDto: CreateTransactionDto,
    fromUserId: number,
    toUserId: number,
  ) {
    const transaction = await this.prisma.transaction.create({
      data: {
        sentFromUser: {
          connect: {
            id: Number(fromUserId),
          },
        },
        sentToUser: {
          connect: {
            id: Number(toUserId),
          },
        },
        valueBrl: createTransactionDto.valueBrl,
        reversed: createTransactionDto.reversed,
        description: createTransactionDto.description,
      },
    });

    return transaction;
  }

  async update(id: number, updateTransactionDto: UpdateTransactionDto) {
    const transaction = await this.prisma.transaction.update({
      where: {
        id: Number(id),
      },
      data: updateTransactionDto,
    });
    return transaction;
  }

  async remove(id: number) {
    const transaction = await this.prisma.transaction.delete({
      where: {
        id: Number(id),
      },
    });
    return transaction;
  }
}
