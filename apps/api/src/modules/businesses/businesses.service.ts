import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Business, Prisma } from '@agency/db';

@Injectable()
export class BusinessesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.business.findMany();
  }

  async findOne(id: string) {
    return this.prisma.business.findUnique({
      where: { id },
      include: { leads: true }
    });
  }

  async create(data: Prisma.BusinessCreateInput) {
    return this.prisma.business.create({
      data
    });
  }

  async update(id: string, data: Prisma.BusinessUpdateInput) {
    return this.prisma.business.update({
      where: { id },
      data
    });
  }

  async remove(id: string) {
    return this.prisma.business.delete({
      where: { id }
    });
  }
}
