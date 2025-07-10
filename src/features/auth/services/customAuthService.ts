const demoUser = {
  id: 'd2f79ebc-ca9e-4936-b5a3-fa04cae4eedc', // Use existing user ID from storage
  username: 'demo-user'
};

export const customAuthService = {
  signIn: async () => ({ user: demoUser, error: null }),
  signUp: async () => ({ user: demoUser, error: null }),
  signOut: async () => ({ error: null }),
  onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
  getCurrentUser: () => demoUser,
};