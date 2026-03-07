import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Lead, Prisma } from '@agency/db';

@Injectable()
export class LeadsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.lead.findMany({
      include: { business: true }
    });
  }

  async findOne(id: string) {
    return this.prisma.lead.findUnique({
      where: { id },
      include: { business: true, audit: true, contacts: true }
    });
  }

  async create(data: any) {
    return this.prisma.lead.create({
      data,
      include: { business: true }
    });
  }

  async update(id: string, data: any) {
    return this.prisma.lead.update({
      where: { id },
      data,
      include: { business: true }
    });
  }

  async remove(id: string) {
    return this.prisma.lead.delete({
      where: { id }
    });
  }
}
