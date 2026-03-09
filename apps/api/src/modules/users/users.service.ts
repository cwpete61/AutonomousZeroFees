import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, Prisma } from '@agency/db';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany({
      include: {
        sessions: {
          where: {
            expiresAt: { gt: new Date() }
          }
        }
      }
    });
  }

  async findOne(identifier: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { username: identifier },
        ],
      },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({
      data,
    });
  }

  async update(id: string, data: Partial<Prisma.UserUpdateInput>): Promise<User> {
    const existingUser = await this.findById(id);
    if (!existingUser) {
      throw new Error('User not found');
    }

    // Enforce immutable username
    if (data.username && data.username !== existingUser.username) {
      throw new Error('Username cannot be changed');
    }

    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async changePassword(userId: string, newPasswordHash: string): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });
  }
  async delete(id: string): Promise<User> {
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
