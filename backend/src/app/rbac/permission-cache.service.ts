import { Injectable } from '@nestjs/common';
import { PermissionRepo } from './repository/permission.repository'; // Adjust the import path/name if you renamed it!
import { TimeUtils } from 'src/common/utils/time.utils'; // Using your existing TimeUtils

@Injectable()
export class PermissionCacheService {
  private cache: Map<string, { permissions: string[]; cachedAt: number }> = new Map();
  
  // Using the TimeUtils from your previous context for consistency!
  private readonly TTL = TimeUtils.hoursToMs(1);

  constructor(private readonly permissionRepo: PermissionRepo) {}

  async getPermissions(roleName: string): Promise<string[]> {
    const cached = this.cache.get(roleName);

    // 1. Cache Hit: Return immediately if it exists and hasn't expired
    if (cached && Date.now() - cached.cachedAt < this.TTL) {
      return cached.permissions;
    }

    // 2. Cache Miss: Fetch from database using the injected repository
    const permissions = await this.permissionRepo.getPermissionsByRoleName(roleName);

    // 3. Save to Cache
    this.cache.set(roleName, { permissions, cachedAt: Date.now() });

    return permissions;
  }

  hasPermission(permissions: string[], resource: string, action: string): boolean {
    return permissions.includes(`${resource}:${action}`);
  }

  // 🌟 ENTERPRISE BONUS: You absolutely need this!
  // Call this whenever an admin changes a role's permissions in the DB.
  clearCache(roleName?: string) {
    if (roleName) {
      this.cache.delete(roleName); // Clear specific role
    } else {
      this.cache.clear(); // Nuclear option: clear everything
    }
  }
}