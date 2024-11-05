import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from '../database/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const verifyEmail = await this.findOneByEmail(createUserDto.email);
    if (verifyEmail) {
      return {
        message: 'Email already in use',
        error: true,
      };
    }
    const { password, ...userData } = createUserDto;
    const hashPassword = await bcrypt.hash(password, 10);

    if (!hashPassword) {
      return {
        message: 'Error hashing password',
        error: true,
      };
    }

    const user = await this.prisma.user.create({
      data: {
        ...userData,
        password: hashPassword,
        accountValueBrl: 0,
      },
    });

    return user;
  }

  async findAll() {
    const users = await this.prisma.user.findMany();
    return users;
  }

  async findAllWithPagination(
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
    const users = await this.prisma.user.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        [orderByProp]: order,
      },
      include: {
        receivedTransactions: true,
        sentTransactions: true,
      },
      where: {
        OR: [
          {
            name: {
              contains: search || '',
              mode: 'insensitive',
            },
          },
          {
            email: {
              contains: search || '',
              mode: 'insensitive',
            },
          },
        ],
      },
    });

    const total = await this.prisma.user.count({
      where: {
        OR: [
          {
            name: {
              contains: search || '',
              mode: 'insensitive',
            },
          },
          {
            email: {
              contains: search || '',
              mode: 'insensitive',
            },
          },
        ],
      },
    });
    const totalPages = Math.ceil(total / limit);
    const data = users.map((user) => {
      // Mapeia os dados do usuário, incluindo informações sobre posts e comentários
      return {
        ...user,
        totalReceivedTransactions: user.receivedTransactions.length,
        totalSentTransactions: user.sentTransactions.length,
      };
    });

    return { data, total, page, limit, totalPages };
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        receivedTransactions: true,
        sentTransactions: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return {
      ...user,
      totalReceivedTransactions: user.receivedTransactions.length,
      totalSentTransactions: user.sentTransactions.length,
    };
  }

  findOneByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const { password, ...updateData } = updateUserDto;
    const verifyIfUserExists = await this.findOne(id);
    if (!verifyIfUserExists) {
      throw new Error('User not found');
    }
    if (password) {
      // Se uma nova senha for fornecida, atualize a senha usando a função updatePassword
      await this.updatePassword(id, password);
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: updateData,
    });

    return user;
  }

  async updatePassword(id: number, password: string) {
    const hashPassword = await bcrypt.hash(password, 10);

    if (!hashPassword) {
      throw new Error('Error hashing password');
    }

    return await this.prisma.user.update({
      where: { id },
      data: { password: hashPassword },
    });
  }

  async remove(id: number) {
    const verifyIfUserExists = await this.findOne(id);
    if (!verifyIfUserExists) {
      throw new Error('User not found');
    }
    const user = await this.prisma.user.delete({
      where: { id },
    });
    return user;
  }
}
