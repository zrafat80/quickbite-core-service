import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionCacheService } from '../../../rbac/permission-cache.service';
import { SystemRole } from 'src/user/enums';
import { PERMISSIONS_KEY } from '../../decorators/permissions.decorator';
import { GUARD_ERRORS } from './guard.constants'; // 🌟 Import the constants

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private permissionCacheService: PermissionCacheService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPerms = this.reflector.getAllAndOverride<{
      resource: string;
      action: string;
      allowSystemAdmin: boolean;
    }>(PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);

    if (!requiredPerms) return true;

    const req = context.switchToHttp().getRequest();
    const user = req.user;

    if (!user) {
      // 🌟 Use the constant!
      throw new ForbiddenException(GUARD_ERRORS.UNAUTHENTICATED);
    }

    if (requiredPerms.allowSystemAdmin && user.role === SystemRole.SYSTEM_ADMIN) {
      return true;
    }

    if (user.role === SystemRole.RESTAURANT_USER) {
      const permissions = await this.permissionCacheService.getPermissions(user.restaurantRole);

      const hasAccess = this.permissionCacheService.hasPermission(
        permissions,
        requiredPerms.resource,
        requiredPerms.action,
      );

      if (!hasAccess) {
        // 🌟 Call the constant as a function to inject the dynamic variables!
        throw new ForbiddenException(
          GUARD_ERRORS.MISSING_PERMISSION(requiredPerms.resource, requiredPerms.action)
        );
      }
      return true;
    }

    return false;
  }
}