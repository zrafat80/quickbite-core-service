import { PermissionCacheService } from 'src/app/rbac/permission-cache.service';
import { PermissionRepo } from 'src/app/rbac/repository/permission.repository';

describe('PermissionCacheService', () => {
  const repository = { getPermissionsByRoleName: jest.fn() };
  const service = new PermissionCacheService(
    repository as unknown as PermissionRepo,
  );

  it('caches permissions and supports permission checks', async () => {
    repository.getPermissionsByRoleName.mockResolvedValue(['orders:read']);

    await expect(service.getPermissions('manager')).resolves.toEqual([
      'orders:read',
    ]);
    await expect(service.getPermissions('manager')).resolves.toEqual([
      'orders:read',
    ]);
    expect(repository.getPermissionsByRoleName).toHaveBeenCalledTimes(1);
    expect(service.hasPermission(['orders:read'], 'orders', 'read')).toBe(true);
    expect(service.hasPermission(['orders:read'], 'orders', 'delete')).toBe(
      false,
    );
  });

  it('clears one role or the complete cache', async () => {
    repository.getPermissionsByRoleName.mockResolvedValue(['orders:read']);
    await service.getPermissions('manager');
    await service.getPermissions('owner');

    service.clearCache('manager');
    await service.getPermissions('manager');
    service.clearCache();
    await service.getPermissions('owner');

    expect(repository.getPermissionsByRoleName).toHaveBeenCalledTimes(3);
  });

  it('refreshes expired cache entries', async () => {
    const now = jest.spyOn(Date, 'now');
    now.mockReturnValueOnce(0).mockReturnValueOnce(3_600_001);
    repository.getPermissionsByRoleName.mockResolvedValue(['orders:update']);

    await service.getPermissions('expired');
    await service.getPermissions('expired');

    expect(repository.getPermissionsByRoleName).toHaveBeenCalledTimes(2);
  });
});
