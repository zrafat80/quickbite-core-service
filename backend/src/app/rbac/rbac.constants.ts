export const RBAC_ERRORS = {
  CANNOT_CREATE_OWNER_USERS: 'Cannot create owner users through the member invitation flow',
  ROLE_NOT_FOUND: 'Role not found',
  NO_ACCESS_FOR_BRANCES: 'Security Alert: One or more provided branches do not belong to this restaurant.',
  
  // 🌟 NEW ERRORS EXTRACTED FROM SERVICE
  MEMBER_NOT_FOUND: 'Member not found',
  MEMBER_NOT_IN_RESTAURANT: 'This member does not belong to your restaurant',
  CANNOT_REASSIGN_OWNER: 'Cannot reassign an account to the Owner role',
  CANNOT_DELETE_OWNER: 'CannotDeleteOwnerError: You cannot delete the restaurant owner.',
  OWNER_BRANCH_ACCESS_IMMUTABLE: 'Owners automatically have access to all branches. You cannot limit an owner to specific branches.',
};