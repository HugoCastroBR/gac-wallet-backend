import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(prismaService).toBeDefined();
  });

  it('should connect to the Prisma client on module initialization', async () => {
    const connectSpy = jest.spyOn(prismaService, '$connect');
    await prismaService.onModuleInit();
    expect(connectSpy).toBeCalled();
    await prismaService.$disconnect();
  });
});
