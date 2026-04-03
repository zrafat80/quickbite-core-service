// src/auth/constants/auth.constants.ts

export const AUTH_ERRORS = {
  // Registration
  SYSTEM_ADMIN_SIGNUP_FORBIDDEN: 'Cannot signup as system admin directly',
  USER_ALREADY_EXISTS: 'User with this email or phone already exists',
  
  // Login
  INVALID_CREDENTIALS: 'The email or password you entered is incorrect',
  USER_NOT_FOUND: 'No user found with this email address',
  
  // JWT & Auth Guards
  TOKEN_EXPIRED: 'Your session has expired. Please log in again',
  UNAUTHORIZED_ACCESS: 'You are not authorized to perform this action',
  
  // Password Reset
  INVALID_OTP: 'The OTP provided is invalid or has expired',
} as const;


export const AUTH_MESSAGES = {
  // We use this vague message to prevent Email Enumeration attacks
  PASSWORD_RESET_EMAIL_SENT: 'If an account exists, a password reset email has been sent.',
  PASSWORD_RESET_SUCCESS: 'Password has been successfully reset',
  LOGIN_SUCCESS: 'Login successful',
} as const;