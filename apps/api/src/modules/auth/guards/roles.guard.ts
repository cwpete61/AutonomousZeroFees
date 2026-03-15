import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    
    // Support both direct role and roles array
    const userRole = user?.role;
    const userRoles = user?.roles || (userRole ? [userRole] : []);
    
    console.log(`[RolesGuard] User ID: ${user?.userId}, Email: ${user?.email}, Role: ${userRole}, Roles: ${JSON.stringify(userRoles)}, Required: ${JSON.stringify(requiredRoles)}`);
    
    const hasRole = requiredRoles.some((role) => 
      userRoles.some((userRole: string) => userRole.toUpperCase() === role.toUpperCase())
    );
    console.log(`[RolesGuard] Access: ${hasRole}`);
    
    return hasRole;
  }
}
