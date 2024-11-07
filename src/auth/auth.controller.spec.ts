import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from 'src/database/prisma.module';
import { PrismaService } from 'src/database/prisma.service';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/users.service';
import { JwtStrategy } from './jwt.strategy';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { INestApplication } from '@nestjs/common';

describe('AuthController', () => {
  let app: INestApplication;

  const userLoginMock = {
    email: 'test2@test.com',
    name: 'Test User',
    password: 'test12345',
    confirmPassword: 'test12345',
  };

  let authController: AuthController;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        PrismaService,
        JwtStrategy,
        UsersService,
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
          },
        },
      ],
      imports: [
        UsersModule,
        PassportModule,
        PrismaModule,
        JwtModule.register({
          secret: process.env.JWT_SECRET,
          signOptions: {
            expiresIn: process.env.JWT_EXPIRES_IN,
          },
        }),
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  const loginUser = async () => {
    const result = await request(app.getHttpServer()).post('/auth/login').send({
      email: userLoginMock.email,
      password: userLoginMock.password,
    });
    return result;
  };

  const registerUser = async () => {
    const result = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: userLoginMock.email,
        password: userLoginMock.password,
        confirmPassword: userLoginMock.confirmPassword,
        name: userLoginMock.name,
      });
    return result;
  };

  describe('Setup Login and Register', () => {
    it('should return a token and user', async () => {
      const loginResult = await loginUser();

      if (loginResult.status === 200) {
        expect(loginResult.body.data.token).toBeDefined();
      } else {
        expect(loginResult.status).toBe(400);

        if (loginResult.body.error === 'User not found') {
          const registerResult = await registerUser();
          expect(registerResult.status).toBe(200);
          expect(registerResult.body.data.token).toBeDefined();
        } else {
          expect(loginResult.body).toEqual({
            error: 'Invalid password',
          });
        }
      }
    });
  });

  /*

    Invalid test data Tests
  
  */

  describe('Login Errors', () => {
    it('should return invalid password error', async () => {
      const result = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrong-password',
        });
      expect(result.status).toBe(400);
      expect(result.body).toEqual({
        error: 'Invalid password',
      });
    });
    it('should return user not found error', async () => {
      const result = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@exampletestlogin.com',
          password: 'test123',
        });
      expect(result.status).toBe(400);
      expect(result.body).toEqual({
        error: 'User not found',
      });
    });
    it('should return password invalid  error', async () => {
      const result = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: '',
        });
      expect(result.status).toBe(400);
      expect(result.body).toEqual({
        error: 'Invalid password',
      });
    });
  });

  describe('Register Errors', () => {
    it('should return email already in use error', async () => {
      const result = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'test123',
          confirmPassword: 'test123',
          name: 'Test User',
        });
      expect(result.status).toBe(400);
      expect(result.body).toEqual({
        error: 'Email already in use',
      });
    });
    it('should return confirm password required error', async () => {
      const result = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'test123-test',
          confirmPassword: '',
          name: 'Test User',
        });
      expect(result.status).toBe(400);
      expect(result.body).toEqual({
        error: 'Passwords do not match',
      });
    });
    it('should return passwords do not match error', async () => {
      const result = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'test123',
          confirmPassword: 'different-password',
          name: 'Test User',
        });
      expect(result.status).toBe(400);
      expect(result.body).toEqual({
        error: 'Passwords do not match',
      });
    });
  });
});
