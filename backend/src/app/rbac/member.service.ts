import { RestaurantMemberRepository } from './repository/restaurant-member.repository';
import { MemberBranchRepository } from './repository/member-branch.repository';
import { PasswordResetRepository } from 'src/app/auth/repository/password-reset.repository';
import { RoleRepository } from './repository/role.repository';
import { PermissionRepo } from './repository/permission.repository'; // 🌟 Added PermissionRepo

// Enums & Utils
import { SystemRole } from '../user/enums';
import { MemberStatus } from './enums';
import { CreateMemberDTO } from './dto/member.dto';
import { UpdateMemberDTO, UpdateMemberBranchesDTO } from './dto/member.dto'; // 🌟 Added new DTO imports
import { AuthService } from 'src/app/auth/auth.service';
import { Knex } from 'knex';
import {
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RBAC_ERRORS } from './rbac.constants';
import { AuthUtilsService } from 'src/app/auth/auth-utils.service';
import { TimeUtils } from 'src/pkg/utils/time.utils';
import { BranchService } from 'src/app/branch/branch.service';
import { RestaurantMember } from './entity/restaurant-member.entity';
import { UserService } from '../user/user.service';
import { memberInvitationEmail } from './templates/member-invitation';
import { IEmailProvider } from 'src/lib/email/email.interface';
import { EMAIL_PROVIDER_TOKEN } from 'src/lib/email/email.constants';

@Injectable()
export class MemberService {
  constructor(
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    private readonly authUtilsService: AuthUtilsService,
    private readonly branchService: BranchService,
    private readonly userService: UserService,
    private readonly roleRepo: RoleRepository,
    private readonly restaurantMemberRepo: RestaurantMemberRepository,
    private readonly memberBranchRepo: MemberBranchRepository,
    private readonly permissionRepo: PermissionRepo, // 🌟 Injected PermissionRepo
    @Inject('KNEX_CONNECTION') private readonly knex: Knex,
    @Inject(EMAIL_PROVIDER_TOKEN)
    private readonly emailProvider: IEmailProvider,
  ) {}
  async createOwnerMember(
    restaurantId: number,
    userId: number,
    trx?: Knex.Transaction,
  ): Promise<RestaurantMember> {
    const ownerRoleId = await this.roleRepo.findRoleByName('owner', trx);
    if (!ownerRoleId) {
      throw new NotFoundException(RBAC_ERRORS.ROLE_NOT_FOUND);
    }
    const now = new Date();
    return this.restaurantMemberRepo.createRestaurantMember(
      {
        restaurantId,
        userId,
        roleId: ownerRoleId,
        status: MemberStatus.ACTIVE,
        createdAt: now,
        updatedAt: now,
      },
      trx,
    );
  }

  async createMember(restaurantId: number, data: CreateMemberDTO) {
    if (data.role === 'owner') {
      throw new ForbiddenException(RBAC_ERRORS.CANNOT_CREATE_OWNER_USERS);
    }

    const roleId = await this.roleRepo.findRoleByName(data.role);
    if (!roleId) {
      throw new NotFoundException(RBAC_ERRORS.ROLE_NOT_FOUND);
    }

    // 1. Default branchIds to empty array if not provided
    const branchIds = data.branchIds || [];

    // 2. Pre-validate branch ownership BEFORE opening the transaction
    if (branchIds.length > 0) {
      const isValid = await this.branchService.verifyBranchesBelongToRestaurant(
        branchIds,
        restaurantId,
      );
      if (!isValid) {
        throw new ForbiddenException(RBAC_ERRORS.NO_ACCESS_FOR_BRANCES);
      }
    }

    const trx = await this.knex.transaction();
    let user;
    let member;
    let otp;

    try {
      const now = new Date();
      user = await this.userService.hashAndCreateUser(
        {
          email: data.email,
          name: data.name,
          phone: data.phoneNumber,
          password: 'StrongStrongStrong1',
          createdAt: now,
          updatedAt: now,
        },
        SystemRole.RESTAURANT_USER,
        trx,
        now,
      );

      member = await this.restaurantMemberRepo.createRestaurantMember(
        {
          restaurantId,
          userId: user.id,
          roleId: Number(roleId),
          createdAt: now,
          updatedAt: now,
          status: MemberStatus.INACTIVE,
        },
        trx,
      );

      // 3. Insert branches (already validated above)
      if (branchIds.length > 0) {
        await this.memberBranchRepo.setMemberBranches(
          member.id,
          branchIds,
          now,
          trx,
        );
      }

      otp = await this.authUtilsService.generateAndSaveOTP(
        user.id,
        TimeUtils.hoursToMs(1),
        trx,
        now,
      );

      // 🌟 DATABASE WORK IS DONE. COMMIT IT NOW!
      await trx.commit();
    } catch (err) {
      await trx.rollback();
      throw err; // Only DB errors will trigger a rollback and a 500 response
    }

    // 🌟 FIRE AND FORGET EMAIL (Completely outside the transaction)
    const emailContent = memberInvitationEmail(otp, data.role);

    // Notice there is NO 'await' here!
    this.emailProvider
      .send(user.email, emailContent.subject, emailContent.html)
      .catch((emailError) => {
        // If Mailjet crashes 3 seconds from now, it logs quietly here without breaking the app.
        console.error(
          `🚨 BACKGROUND EMAIL FAILED for ${user.email}:`,
          emailError.message,
        );
      });

    // 🌟 Return immediately to the frontend!
    return {
      message: 'Member invited successfully',
      data: member,
    };
  }

  async listMembers(restaurantId: number) {
    const members =
      await this.restaurantMemberRepo.findMembersByRestaurantId(restaurantId);
    return members;
  }

  async updateMember(
    restaurantId: number,
    memberId: number,
    data: UpdateMemberDTO,
  ) {
    const result =
      await this.restaurantMemberRepo.findMemberWithRoleName(memberId);
    if (!result) throw new NotFoundException(RBAC_ERRORS.MEMBER_NOT_FOUND); // 🌟 Using Constant
    const { member } = result;

    if (Number(member.restaurantId) !== Number(restaurantId)) {
      throw new ForbiddenException(RBAC_ERRORS.MEMBER_NOT_IN_RESTAURANT); // 🌟 Using Constant
    }

    let newRoleId: number | null = null;

    if (data.role) {
      if (data.role === 'owner') {
        throw new ForbiddenException(RBAC_ERRORS.CANNOT_REASSIGN_OWNER); // 🌟 Using Constant
      }
      newRoleId = await this.roleRepo.findRoleIdByName(data.role);
      if (!newRoleId) throw new NotFoundException(RBAC_ERRORS.ROLE_NOT_FOUND); // 🌟 Using Constant
    }

    await this.restaurantMemberRepo.updateMember(memberId, {
      roleId: newRoleId ? Number(newRoleId) : undefined,
      status: data.status,
    });

    return { message: 'Member updated successfully' };
  }

  async deleteMember(restaurantId: number, memberId: number) {
    const result =
      await this.restaurantMemberRepo.findMemberWithRoleName(memberId);
    if (!result) throw new NotFoundException(RBAC_ERRORS.MEMBER_NOT_FOUND); // 🌟 Using Constant
    const { member, roleName } = result;

    if (Number(member.restaurantId) !== Number(restaurantId)) {
      throw new ForbiddenException(RBAC_ERRORS.MEMBER_NOT_IN_RESTAURANT); // 🌟 Using Constant
    }

    if (roleName === 'owner') {
      throw new ForbiddenException(RBAC_ERRORS.CANNOT_DELETE_OWNER); // 🌟 Using Constant
    }

    await this.restaurantMemberRepo.deleteMember(memberId);
    return { message: 'Member deleted successfully' };
  }

  async updateMemberBranches(
    restaurantId: number,
    memberId: number,
    data: UpdateMemberBranchesDTO,
  ) {
    const result =
      await this.restaurantMemberRepo.findMemberWithRoleName(memberId);
    if (!result) throw new NotFoundException(RBAC_ERRORS.MEMBER_NOT_FOUND); // 🌟 Using Constant
    const { member, roleName } = result;

    if (Number(member.restaurantId) !== Number(restaurantId)) {
      throw new ForbiddenException(RBAC_ERRORS.MEMBER_NOT_IN_RESTAURANT); // 🌟 Using Constant
    }

    if (roleName === 'owner') {
      throw new ForbiddenException(RBAC_ERRORS.OWNER_BRANCH_ACCESS_IMMUTABLE); // 🌟 Using Constant
    }

    if (data.branchIds && data.branchIds.length > 0) {
      const isValid = await this.branchService.verifyBranchesBelongToRestaurant(
        data.branchIds,
        restaurantId,
      );
      if (!isValid) {
        throw new ForbiddenException(RBAC_ERRORS.NO_ACCESS_FOR_BRANCES); // 🌟 Re-used your existing constant!
      }
    }

    await this.memberBranchRepo.setMemberBranches(
      memberId,
      data.branchIds || [],
    );
    return { message: 'Member branches access updated successfully' };
  }

  async getRolePermissions(roleName: string) {
    const roleId = await this.roleRepo.findRoleByName(roleName);
    if (!roleId) {
      throw new NotFoundException(RBAC_ERRORS.ROLE_NOT_FOUND);
    }

    const permissions =
      await this.permissionRepo.getPermissionsByRoleName(roleName);
    return {
      role: roleName,
      permissions,
    };
  }

  // =======================================================================
  // EXISTING METHODS
  // =======================================================================

  async activateInvite(userId: number, trx?: Knex.Transaction) {
    const activated = await this.restaurantMemberRepo.activateMemberByUserId(
      userId,
      trx,
    );
    if (!activated) {
      throw new NotFoundException('Pending invitation not found');
    }
    return activated;
  }

  async findRestaurantMemberWithRole(
    userId: number,
    trx?: Knex.Transaction,
  ): Promise<any> {
    return await this.restaurantMemberRepo.findRestaurantMemberWithRole(
      userId,
      trx,
    );
  }

  async findBranchIdsByMemberId(memberId: number) {
    return await this.memberBranchRepo.findBranchIdsByMemberId(memberId);
  }
}
