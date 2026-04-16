// src/user/constants/user.constants.ts

export const USER_ERRORS = {
  USER_NOT_FOUND: 'User not found',
  USER_INACTIVE: 'This user account has been deactivated', // Adding a common one for later!
} as const;

// src/user/constants/user.constants.ts

// ... keep existing errors ...

export const USER_MESSAGES = {
  PROFILE_FETCHED: 'User profile retrieved successfully',
  PROFILE_UPDATED: 'Profile updated', // <-- Add this new message
} as const;