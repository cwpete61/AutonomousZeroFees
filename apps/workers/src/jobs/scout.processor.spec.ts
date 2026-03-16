import { Test, TestingModule } from "@nestjs/testing";
import { getQueueToken } from "@nestjs/bull";
import { ScoutProcessor } from "./scout.processor";
import { ScoutAgent } from "@agency/agents";
import { PrismaService } from "@agency/db";
import { RedisEventBus } from "@agency/events";
import { Job } from "bull";

describe("ScoutProcessor", () => {
  let processor: ScoutProcessor;
  let prisma: PrismaService;
  let eventBus: RedisEventBus;
  let scoutAgent: { evaluateBusiness: jest.Mock };

  const mockPrisma = {
    lead: { update: jest.fn() },
    auditLog: { create: jest.fn() },
  };

  const mockEventBus = {
    publish: jest.fn(),
  };

  const mockScoutAgent = {
    evaluateBusiness: jest.fn(),
  };

  const mockResearchQueue = {
    add: jest.fn(),
  };

  const mockJob = {
    data: { id: "lead-123", website: "test.com", industry: "HVAC" },
    progress: jest.fn(),
  } as unknown as Job;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScoutProcessor,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: RedisEventBus, useValue: mockEventBus },
        { provide: ScoutAgent, useValue: mockScoutAgent },
        {
          provide: getQueueToken("research-queue"),
          useValue: mockResearchQueue,
        },
      ],
    }).compile();

    processor = module.get<ScoutProcessor>(ScoutProcessor);
    prisma = module.get<PrismaService>(PrismaService);
    eventBus = module.get<RedisEventBus>(RedisEventBus);
    scoutAgent = module.get(ScoutAgent as any);
  });

  it("should process research successfully", async () => {
    const mockResearchResult = {
      qualityScore: 85,
      redesignPitch: "Test Pitch",
      issues: ["Slow load"],
    };

    mockScoutAgent.evaluateBusiness.mockResolvedValue(mockResearchResult);
    mockPrisma.lead.update.mockResolvedValue({
      id: "lead-123",
      business: { name: "Test Business" },
    });

    const result = await processor.handleResearch(mockJob);

    expect(scoutAgent.evaluateBusiness).toHaveBeenCalledWith({
      website: "test.com",
      industry: "HVAC",
    });
    expect(prisma.lead.update).toHaveBeenCalled();
    expect(prisma.auditLog.create).toHaveBeenCalled();
    expect(eventBus.publish).toHaveBeenCalled();
    expect(result).toBe(mockResearchResult);
  });
});
