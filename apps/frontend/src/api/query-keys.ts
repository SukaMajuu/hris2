export const queryKeys = {
  auth: {
    currentUser: ['auth', 'currentUser'] as const,
    me: ['auth', 'me'] as const,
    login: ['auth', 'login'] as const,
    register: ['auth', 'register'] as const,
    google: ['auth', 'google'] as const,
  },
  users: {
    list: ['users', 'list'] as const,
    detail: (id: string) => ['users', 'detail', id] as const,
  },
} as const;
