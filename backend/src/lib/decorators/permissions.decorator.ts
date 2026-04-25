import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

// This allows you to tag a route like: @RequirePermissions('product', 'create')
export const RequirePermissions = (resource: string, action: string, allowSystemAdmin = true) => 
  SetMetadata(PERMISSIONS_KEY, { resource, action, allowSystemAdmin });PERMISSIONS_KEY