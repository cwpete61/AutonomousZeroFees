import { Test, TestingModule } from "@nestjs/testing";
import { OutreachProcessor } from "./outreach.processor";
import { OutreachAgent } from "@agency/agents";
import { PrismaService } from "@agency/db";
import { RedisEventBus } from "@agency/events";
import { Job } from "bull";

describe("OutreachProcessor", () => {
  let processor: OutreachProcessor;
  let prisma: PrismaService;
  let eventBus: RedisEventBus;
  let outreachAgent: { sendInitialEmail: jest.Mock };

  const mockPrisma = {
    lead: { update: jest.fn() },
    outreachSequence: { create: jest.fn() },
    auditLog: { create: jest.fn() },
  };

  const mockEventBus = {
    publish: jest.fn(),
  };

  const mockOutreachAgent = {
    sendInitialEmail: jest.fn(),
  };

  const mockJob = {
    data: { id: "lead-123", name: "Test Business", email: "test@example.com" },
    progress: jest.fn(),
  } as unknown as Job;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OutreachProcessor,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: RedisEventBus, useValue: mockEventBus },
        { provide: OutreachAgent, useValue: mockOutreachAgent },
      ],
    }).compile();

    processor = module.get<OutreachProcessor>(OutreachProcessor);
    prisma = module.get<PrismaService>(PrismaService);
    eventBus = module.get<RedisEventBus>(RedisEventBus);
    outreachAgent = module.get(OutreachAgent as any);
  });

  it("should process outreach successfully", async () => {
    const mockEmailResult = {
      id: "email-1",
      subjectLine: "Test Subject",
      emailBody: "Test Body",
      provider: "stub",
    };

    mockOutreachAgent.sendInitialEmail.mockResolvedValue(mockEmailResult);
    mockPrisma.lead.update.mockResolvedValue({
      id: "lead-123",
      business: { name: "Test Business" },
    });

    const result = await processor.handleOutreach(mockJob);

    expect(outreachAgent.sendInitialEmail).toHaveBeenCalledWith(mockJob.data);
    expect(prisma.lead.update).toHaveBeenCalled();
    expect(prisma.outreachSequence.create).toHaveBeenCalled();
    expect(eventBus.publish).toHaveBeenCalled();
    expect(result).toBe(mockEmailResult);
  });
});
