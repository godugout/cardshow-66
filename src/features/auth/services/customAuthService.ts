const demoUser = {
  id: 'demo-user-123',
  username: 'demo-user'
};

export const customAuthService = {
  signIn: async () => ({ user: demoUser, error: null }),
  signUp: async () => ({ user: demoUser, error: null }),
  signOut: async () => ({ error: null }),
  onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
  getCurrentUser: () => demoUser,
};