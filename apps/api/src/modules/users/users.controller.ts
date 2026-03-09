import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@agency/db';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.OPS_ADMIN)
  async findAll() {
    const users = await this.usersService.findAll();
    return users.map((user) => {
      const { passwordHash, sessions, fullName, role, ...result } = user as any;
      return {
        ...result,
        name: fullName || user.username, // UI expects 'name'
        role: role.toLowerCase(), // UI RBAC keys are lowercase (e.g., 'super_admin')
        isOnline: sessions && sessions.length > 0,
      };
    });
  }

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.OPS_ADMIN)
  create(@Body() createUserDto: any) {
    return this.usersService.create(createUserDto);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.OPS_ADMIN)
  update(@Param('id') id: string, @Body() updateUserDto: any) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.OPS_ADMIN)
  remove(@Param('id') id: string) {
    return this.usersService.delete(id);
  }
}
