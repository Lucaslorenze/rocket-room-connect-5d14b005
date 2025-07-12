import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "686c0802d1cf9db45d14b005", 
  requiresAuth: true // Ensure authentication is required for all operations
});
