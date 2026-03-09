import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async validateUser(identifier: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(identifier);
    if (user && user.status === 'BLOCKED') {
      return null;
    }
    if (user && user.passwordHash && await bcrypt.compare(pass, user.passwordHash)) {
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        role: user.role ? user.role.toLowerCase() : 'standard_user'
      }
    };
  }

  async forgotCredentials(identifier: string) {
    const user = await this.usersService.findOne(identifier);
    if (!user) {
      // Security: Don't reveal if user exists. Return generic success.
      return { message: 'If an account exists, recovery details have been sent.' };
    }
    
    // Mock email sending
    console.log(`[MOCK EMAIL] Sending credential recovery to: ${user.email}`);
    console.log(`[MOCK EMAIL] Your username is: ${user.username || 'Not set'}`);
    
    return { message: 'If an account exists, recovery details have been sent.' };
  }
}
