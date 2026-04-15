import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { SystemRole } from 'src/user/enums';
import { GUARD_ERRORS } from './guard.constants'; // 🌟 Import the constants

@Injectable()
export class RestaurantMemberGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const user = req.user;
    const restaurantId = parseInt(req.params.restaurantId, 10);

    if (!restaurantId) return true;
    if (user.role === SystemRole.SYSTEM_ADMIN) return true;

    if (Number(user.restaurantId) !== restaurantId) {
      // 🌟 Use the constant!
      throw new ForbiddenException(GUARD_ERRORS.WORKSPACE_ACCESS_DENIED);
    }

    return true;
  }
}