import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from '../database/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { AddMoneyDto } from './dto/add-mony.dto';

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

  async addMoney(id: number, AddMoneyDto: AddMoneyDto) {
    const verifyIfUserExists = await this.findOne(id);
    if (!verifyIfUserExists) {
      throw new Error('User not found');
    }
    const oldAmount = verifyIfUserExists.accountValueBrl;
    const newAmount = Number(oldAmount) + Number(AddMoneyDto.amount);
    const user = await this.prisma.user.update({
      where: { id },
      data: { accountValueBrl: newAmount },
    });
    return user;
  }

  async getUserByEmail(email: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
      });
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    } catch (error) {
      console.log(error);
      throw new Error('User not found');
    }
  }
}
