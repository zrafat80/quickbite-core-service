import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { SystemRole } from 'src/user/enums';
import { GUARD_ERRORS } from './guard.constants';

@Injectable()
export class BranchAccessGuard implements CanActivate {
  // We don't even need the MemberBranchRepository here anymore!
  // Reading from the JWT in memory is 1000x faster than querying the database.

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const user = req.user;

    // 🌟 1. Extract branchId from params OR query string (Fallback)
    const branchIdStr = req.params.branchId || req.query.branchId;
    const branchId = parseInt(branchIdStr, 10);

    // If the route doesn't specify a branch, let it pass (other guards will handle it)
    if (!branchId) return true;

    // 🌟 2. System Admin and Owner Bypass
    if (user.role === SystemRole.SYSTEM_ADMIN) return true;
    if (user.restaurantRole === 'owner') return true;

    // 🌟 3. Check the JWT Payload
    // Because we fetch these during login, user.branchIds will be an array like [2, 5, 8]
    const userBranchIds: number[] = user.branchIds || [];
    const hasAccess = userBranchIds.includes(branchId);

    if (!hasAccess) {
      throw new ForbiddenException(GUARD_ERRORS.BRANCH_ACCESS_DENIED);
    }

    return true;
  }
}
