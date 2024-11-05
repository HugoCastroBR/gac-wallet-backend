import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../database/prisma.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterUserDto } from './dto/register-user.dto';
import { Prisma } from '@prisma/client';
import { LoginUserDto } from './dto/login-user.dto';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/update-user.dto';

describe('AuthService', () => {
  let authService: AuthService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let prismaService: PrismaService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('test-token'),
            verify: jest
              .fn()
              .mockImplementation(() => ({ email: 'test@example.com' })),
          },
        },
        {
          provide: UsersService,
          useValue: {},
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('register', () => {
    it('should throw an error if passwords do not match', async () => {
      const registerDto: RegisterUserDto = {
        email: 'test@example.com',
        password: 'test123',
        confirmPassword: 'different-password',
        name: 'Test User',
      };

      await expect(authService.register(registerDto)).rejects.toThrowError(
        'Passwords do not match',
      );
    });

    it('should return user and token if registration is successful', async () => {
      const registerDto: RegisterUserDto = {
        email: 'test@example.com',
        password: 'test123',
        confirmPassword: 'test123',
        name: 'Test User',
      };

      const result = await authService.register(registerDto);
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('user');
    });

    it('should throw an error if email is already in use', async () => {
      const registerDto: RegisterUserDto = {
        email: 'test@example.com',
        password: 'test123',
        confirmPassword: 'test123',
        name: 'Test User',
      };

      // Configura o mock para simular um usuário existente
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValueOnce({
        id: 1,
        name: 'Existing User',
        email: 'test@example.com',
        password: 'hashed-password',
        accountValueBrl: new Prisma.Decimal(0),
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      await expect(authService.register(registerDto)).rejects.toThrowError(
        'Email already in use',
      );
    });
  });

  describe('login', () => {
    // it('should throw an error if user not found', async () => {
    //   jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);
    //   const loginDto: LoginUserDto = {
    //     email: 'test@example.com',
    //     password: 'test123',
    //   };
    //   await expect(authService.login(loginDto)).rejects.toThrowError(
    //     'User not found',
    //   );
    // });

    it('should throw an error if user not found', async () => {
      await expect(
        authService.login({
          email: 'test@example.com',
          password: 'test123',
        }),
      ).rejects.toThrowError('User not found');
    });

    it('should throw an error if password is invalid', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValueOnce({
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashed-password',
        accountValueBrl: new Prisma.Decimal(0),
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      const loginDto: LoginUserDto = {
        email: 'test@example.com',
        password: 'wrong-password',
      };

      await expect(authService.login(loginDto)).rejects.toThrowError(
        'Invalid password',
      );
    });

    it('should return user and token if login is successful', async () => {
      const user = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashed-password',
        accountValueBrl: new Prisma.Decimal(0),
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(user);
      await jest
        .spyOn(bcrypt, 'compare')
        .mockImplementationOnce(() => Promise.resolve(true));

      const result = await authService.login({
        email: 'test@example.com',
        password: 'test123',
      });
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
    });
  });

  describe('updateUser', () => {
    it('should update user if passwords match and user is found', async () => {
      const user = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        password: 'old-password',
        accountValueBrl: new Prisma.Decimal(0),
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(user);
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(user);
      await jest
        .spyOn(bcrypt, 'hash')
        .mockImplementationOnce(() => Promise.resolve(true));
      jest.spyOn(prismaService.user, 'update').mockResolvedValue({
        id: 1,
        name: 'New Name',
        email: 'new@example.com',
        password: 'hashed-password',
        accountValueBrl: new Prisma.Decimal(0),
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });
      const updateUserDto: UpdateUserDto = {
        email: 'new@example.com',
        password: 'new-pass',
        confirmPassword: 'new-pass',
        name: 'New Name',
      };

      const result = await authService.updateUser(1, updateUserDto, {} as any);
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('password');
    });

    it('should throw an error if passwords do not match', async () => {
      const user = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        password: 'old-password',
        accountValueBrl: new Prisma.Decimal(0),
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(user);
      await jest
        .spyOn(bcrypt, 'hash')
        .mockImplementationOnce(() => Promise.resolve(false));

      const updateUserDto: UpdateUserDto = {
        email: 'new@example.com',
        password: 'new-pass',
        confirmPassword: 'different-pass',
        name: 'New Name',
      };

      await expect(
        authService.updateUser(1, updateUserDto, {} as any),
      ).rejects.toThrowError('Passwords does not match');
    });

    it('should throw an error if user not found', async () => {
      const updateUserDto: UpdateUserDto = {
        email: 'new@example.com',
        password: 'new-pass',
        confirmPassword: 'new-pass',
        name: 'New Name',
      };

      await expect(
        authService.updateUser(1, updateUserDto, {} as any),
      ).rejects.toThrowError('User not found');
    });

    it('should throw an error if password is not provided', async () => {
      const user = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        password: 'old-password',
        accountValueBrl: new Prisma.Decimal(0),
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(user);

      const updateUserDto: UpdateUserDto = {
        email: 'new@example.com',
        confirmPassword: 'new-pass',
        name: 'New Name',
      };

      await expect(
        authService.updateUser(1, updateUserDto, {} as any),
      ).rejects.toThrowError('Password is required');
    });

    it('should throw an error if confirm password is not provided', async () => {
      const user = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        password: 'old-password',
        accountValueBrl: new Prisma.Decimal(0),
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(user);

      const updateUserDto: UpdateUserDto = {
        email: 'new@example.com',
        password: 'new-pass',
        name: 'New Name',
      };

      await expect(
        authService.updateUser(1, updateUserDto, {} as any),
      ).rejects.toThrowError('Confirm password is required');
    });
  });
  // end tests
});
