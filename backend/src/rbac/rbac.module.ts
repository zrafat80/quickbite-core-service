import { Module, Global } from '@nestjs/common';

// RBAC Repositories
import { RoleRepository } from './repository/role.repository';
import { RestaurantMemberRepository } from './repository/restaurant-member.repository';
import { MemberBranchRepository } from './repository/member-branch.repository';
import { AuthModule } from 'src/auth/auth.module';
import { RbacController } from './rbac.controller';
import { MemberService } from './member.service';
import { BranchModule } from 'src/branch/branch.module';
import { RestaurantModule } from 'src/restaurant/restaurant.module';
import { PermissionCacheService } from './permission-cache.service';
import { PermissionRepo } from './repository/permission.repository';

// If you have a centralized RBAC Service or Guards, they go here too!
// import { RbacService } from './rbac.service';
// import { PermissionsGuard } from './guards/permissions.guard';

@Global() // 🌟 This makes RBAC available everywhere automatically!
@Module({
  imports: [AuthModule, BranchModule],
  controllers: [RbacController],
  providers: [
    RoleRepository,
    RestaurantMemberRepository,
    MemberBranchRepository,
    MemberService,
    RestaurantModule,
    PermissionRepo,
    PermissionCacheService,
  ],
  exports: [
    // 🌟 Export them so AuthModule, RestaurantModule, and OrderModule can use them!
    RoleRepository,
    RestaurantMemberRepository,
    MemberBranchRepository,

    MemberService,
    PermissionCacheService,
  ],
})
export class RbacModule {}
