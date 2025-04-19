'use client';

import { QueryClientProvider } from '@tanstack/react-query';

import useQueryClient from '@/hook/useQueryClient';

const AppQueryProvider = ({ children }: { children: React.ReactNode }) => {
  const { queryClient } = useQueryClient();
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

export default AppQueryProvider;
