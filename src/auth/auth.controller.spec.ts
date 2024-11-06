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

  let userLoginResponseMock = {
    message: 'User logged in successfully',
    data: {
      email: 'test2@test.com',
      name: 'Test User',
      accountValueBrl: 0,
      id: 1,
    },
    token: 'test-token',
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

  // beforeEach(async () => {
  //   const moduleFixture: TestingModule = await Test.createTestingModule({
  //     imports: [AppModule],
  //   }).compile();

  //   app = moduleFixture.createNestApplication();
  //   await app.init();
  // });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  // Invalid test data
  describe('Login', () => {
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
          email: 'test@examplethatdontexist.com',
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

  // Valid test data
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
        console.log('User already exists, logging in');
        expect(loginResult.body.data.token).toBeDefined();
        userLoginResponseMock = loginResult.body.data;
      } else {
        expect(loginResult.status).toBe(400);

        if (loginResult.body.error === 'User not found') {
          const registerResult = await registerUser();
          expect(registerResult.status).toBe(200);
          expect(registerResult.body.data.token).toBeDefined();
          userLoginResponseMock = registerResult.body.data;
        } else {
          expect(loginResult.body).toEqual({
            error: 'Invalid password',
          });
        }
      }
    });
  });
});
