import { Test, TestingModule } from '@nestjs/testing';
import { LeadsService } from './leads.service';
import { PrismaService } from '../prisma/prisma.service';
import { UnprocessableEntityException, NotFoundException } from '@nestjs/common';
import { RedisEventBus } from '@agency/events';

// Mock the @agency/orchestrator module
jest.mock('@agency/orchestrator', () => ({
  isValidTransition: jest.fn(),
}));

// Mock the @agency/events module
jest.mock('@agency/events', () => ({
  RedisEventBus: jest.fn().mockImplementation(() => ({
    publish: jest.fn().mockResolvedValue(undefined),
  })),
  EVENTS: {
    LEAD_CREATED: 'lead.created',
    LEAD_STATUS_CHANGED: 'lead.status_changed',
  },
}));

import { isValidTransition } from '@agency/orchestrator';

const mockPrismaService = {
  lead: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  auditLog: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
  $transaction: jest.fn(),
};

const mockEventBus = {
  publish: jest.fn().mockResolvedValue(undefined),
};

describe('LeadsService', () => {
  let service: LeadsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeadsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: RedisEventBus, useValue: mockEventBus },
      ],
    }).compile();

    service = module.get<LeadsService>(LeadsService);
    jest.clearAllMocks();
  });

  describe('findAll()', () => {
    it('should return all leads', async () => {
      const mockLeads = [{ id: '1', status: 'DISCOVERED', business: {} }];
      mockPrismaService.lead.findMany.mockResolvedValue(mockLeads);
      const result = await service.findAll();
      expect(result).toEqual(mockLeads);
      expect(mockPrismaService.lead.findMany).toHaveBeenCalledTimes(1);
    });

    it('should filter leads by stage', async () => {
      mockPrismaService.lead.findMany.mockResolvedValue([]);
      await service.findAll({ stage: 'DISCOVERED' as any });
      expect(mockPrismaService.lead.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { status: 'DISCOVERED' } })
      );
    });
  });

  describe('findOne()', () => {
    it('should return a lead by id', async () => {
      const mockLead = { id: '1', status: 'DISCOVERED', business: {}, audit: [], contacts: [] };
      mockPrismaService.lead.findUnique.mockResolvedValue(mockLead);
      const result = await service.findOne('1');
      expect(result).toEqual(mockLead);
    });

    it('should throw NotFoundException if lead does not exist', async () => {
      mockPrismaService.lead.findUnique.mockResolvedValue(null);
      await expect(service.findOne('missing-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStage()', () => {
    it('should update stage when transition is valid', async () => {
      const mockLead = { id: '1', status: 'DISCOVERED', business: {}, audit: [], contacts: [] };
      const updatedLead = { ...mockLead, status: 'RESEARCHED' };
      mockPrismaService.lead.findUnique.mockResolvedValue(mockLead);
      mockPrismaService.$transaction.mockImplementation(async (fn: any) => fn(mockPrismaService));
      mockPrismaService.lead.update.mockResolvedValue(updatedLead);
      mockPrismaService.auditLog.create.mockResolvedValue({});
      (isValidTransition as jest.Mock).mockReturnValue(true);

      const result = await service.updateStage('1', 'RESEARCHED' as any);
      expect(result.status).toBe('RESEARCHED');
    });

    it('should throw UnprocessableEntityException for invalid transitions', async () => {
      const mockLead = { id: '1', status: 'DISCOVERED', business: {}, audit: [], contacts: [] };
      mockPrismaService.lead.findUnique.mockResolvedValue(mockLead);
      (isValidTransition as jest.Mock).mockReturnValue(false);

      await expect(service.updateStage('1', 'PAID' as any)).rejects.toThrow(
        UnprocessableEntityException
      );
    });
  });
});
