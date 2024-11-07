import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  async login(loginUserDto: LoginUserDto): Promise<any> {
    const { email, password } = loginUserDto;
    const user = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const validatePassword = await bcrypt.compare(password, user.password);

    if (!validatePassword) {
      console.log('Invalid password');
      throw new Error('Invalid password');
    }

    return {
      user,
      token: this.jwtService.sign({ email }),
    };
  }

  async register(registerUserDto: RegisterUserDto): Promise<any> {
    const { email, password, name, confirmPassword } = registerUserDto;

    if (password !== confirmPassword) {
      throw new Error('Passwords do not match');
    }

    const existingUser = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error('Email already in use');
    }

    try {
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create the new user
      const newUser = await this.prismaService.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          accountValueBrl: 0, // or any default value
        },
      });

      // Return a token and the newly created user
      return {
        token: this.jwtService.sign({ email }),
        user: newUser,
      };
    } catch (error) {
      throw new Error('Error creating user');
      console.log(error);
    }
  }

  async updatePassword(email: string, password: string): Promise<any> {
    const hashPassword = await bcrypt.hash(password, 10);

    if (!hashPassword) {
      throw new Error('Error hashing password');
    }

    return await this.prismaService.user.update({
      where: { email },
      data: { password: hashPassword },
    });
  }

  async getUserByToken(token: string): Promise<any> {
    const { email } = this.jwtService.verify(token);
    return await this.prismaService.user.findUnique({
      where: { email },
    });
  }

  async updateUser(userId: number, updateUserDto: UpdateUserDto): Promise<any> {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const { email, password, confirmPassword, name } = updateUserDto;

    if (!password) throw new Error('Password is required');
    if (!confirmPassword) throw new Error('Confirm password is required');
    if (password !== confirmPassword)
      throw new Error('Passwords does not match');

    const hashPassword = !!password && (await bcrypt.hash(password, 10));
    if (!hashPassword) throw new Error('Error hashing password');

    if (!hashPassword && password === confirmPassword) {
      return await this.prismaService.user.update({
        where: { id: userId },
        data: {
          ...user,
          email,
          name,
        },
      });
    } else if (password === confirmPassword) {
      return await this.prismaService.user.update({
        where: { id: userId },
        data: {
          ...user,
          email,
          password: hashPassword,
          name,
        },
      });
    } else {
      if (!!!confirmPassword) throw new Error('Confirm password is required');
      if (!!!password) throw new Error('Password is required');
      if (confirmPassword !== password)
        throw new Error('Passwords does not match');
    }
  }

  async deleteUser(token: string): Promise<any> {
    const { email } = this.jwtService.verify(token);
    return await this.prismaService.user.delete({
      where: { email },
    });
  }
}
