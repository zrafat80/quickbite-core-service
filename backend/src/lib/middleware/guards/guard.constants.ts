export const GUARD_ERRORS = {
  // 🛡️ Authentication Errors
  UNAUTHENTICATED: 'User not authenticated',

  // 🛡️ Workspace & Tenant Errors
  WORKSPACE_ACCESS_DENIED: 'You do not have access to this restaurant workspace',
  BRANCH_ACCESS_DENIED: 'You are not assigned to manage this specific branch',

  // 🛡️ Dynamic Permission Error (Arrow function to handle the variables!)
  MISSING_PERMISSION: (resource: string, action: string) =>
    `Missing required permission: ${resource}:${action}`,

  // 🛡️ Internal API key (service-to-service)
  INVALID_INTERNAL_API_KEY: 'Invalid or missing internal API key',
  INTERNAL_API_KEY_NOT_CONFIGURED: 'Internal API key is not configured on the server',
};