import { Test, TestingModule } from '@nestjs/testing';
import { SocietiesService } from './societies.service';
import { PrismaService } from '../../core/database/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('SocietiesService', () => {
  let service: SocietiesService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    society: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SocietiesService, { provide: PrismaService, useValue: mockPrismaService }],
    }).compile();

    service = module.get<SocietiesService>(SocietiesService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getPublicSocietyById', () => {
    it('should return a society if it exists and is setup completely', async () => {
      const mockSociety = {
        id: '123',
        name: 'Test Society',
        isSetupComplete: true,
        category: { id: 'cat-1', name: 'Test Cat', description: '' },
        advisor: null,
      };

      mockPrismaService.society.findUnique.mockResolvedValue(mockSociety);

      const result = await service.getPublicSocietyById('123');
      expect(result).toEqual(mockSociety);
      expect(prismaService.society.findUnique).toHaveBeenCalledWith({
        where: { id: '123' },
        select: expect.any(Object),
      });
    });

    it('should throw NotFoundException if society does not exist', async () => {
      mockPrismaService.society.findUnique.mockResolvedValue(null);
      await expect(service.getPublicSocietyById('invalid-id')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if society is not completely setup', async () => {
      mockPrismaService.society.findUnique.mockResolvedValue({ id: '123', isSetupComplete: false });
      await expect(service.getPublicSocietyById('123')).rejects.toThrow(NotFoundException);
    });
  });
});
