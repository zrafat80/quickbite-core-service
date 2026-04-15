import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { MemberBranchRepository } from '../../../rbac/repository/member-branch.repository';
import { SystemRole } from 'src/user/enums';
import { GUARD_ERRORS } from './guard.constants'; // 🌟 Import the constants

@Injectable()
export class BranchAccessGuard implements CanActivate {
  constructor(private memberBranchRepo: MemberBranchRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const user = req.user;
    const branchId = parseInt(req.params.branchId, 10);

    if (!branchId) return true;
    if (user.role === SystemRole.SYSTEM_ADMIN) return true;
    if (user.restaurantRole === 'owner') return true;

    const hasAccess = {}; // TODO: Plug your actual check here later!

    if (!hasAccess) {
      // 🌟 Use the constant!
      throw new ForbiddenException(GUARD_ERRORS.BRANCH_ACCESS_DENIED);
    }

    return true;
  }
}