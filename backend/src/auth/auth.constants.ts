// src/auth/constants/auth.constants.ts

export const AUTH_ERRORS = {
  SYSTEM_ADMIN_SIGNUP_FORBIDDEN: 'Cannot signup as system admin directly',
  USER_ALREADY_EXISTS: 'User with this email or phone already exists',
  
  // Adding a few common ones you will need for the login route next!
  INVALID_CREDENTIALS: 'The email or password you entered is incorrect',
  USER_NOT_FOUND: 'No user found with this email address',
  TOKEN_EXPIRED: 'Your session has expired. Please log in again',
  UNAUTHORIZED_ACCESS: 'You are not authorized to perform this action',
} as const;