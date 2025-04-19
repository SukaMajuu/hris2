export const queryKeys = {
  auth: {
    currentUser: ['auth', 'currentUser'] as const,
  },
  users: {
    list: ['users', 'list'] as const,
    detail: (id: string) => ['users', 'detail', id] as const,
  },
} as const;
