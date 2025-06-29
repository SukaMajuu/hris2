import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { useLoginMutation } from '@/api/mutations/auth.mutation';
import { useUserSubscription } from '@/api/queries/subscription.queries';
import { ROLES } from '@/const/role';
import { loginSchema, LoginFormData } from '@/schemas/auth.schema';
import { useAuthStore } from '@/stores/auth.store';
import { getSupabaseGoogleToken } from '@/utils/google-auth';

export const useLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const setUser = useAuthStore((state) => state.setUser);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: '',
      password: '',
      rememberMe: false,
    },
  });

  const loginMutation = useLoginMutation();
  const { data: userSubscription } = useUserSubscription();

  const login = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const response = await loginMutation.mutateAsync(data);
      setUser(response.user);

      // Check subscription status and show appropriate notification
      const isAdmin = response.user?.role === ROLES.admin;
      const hasActiveSubscription = Boolean(
        userSubscription?.subscription_plan &&
          (userSubscription?.status === 'active' || userSubscription?.status === 'trial'),
      );

      if (isAdmin && !hasActiveSubscription && userSubscription?.status === 'expired') {
        toast.success(
          'Login successful, but your access is currently restricted due to expired subscription.',
        );
      } else {
        toast.success('Login successful! Welcome back.');
      }
    } catch (error) {
      // Generic error handling for all cases
      const errorMessage = 'Login failed. Please check your credentials and try again.';

      toast.error(`LOGIN ERROR: ${errorMessage}`, {
        duration: 10000,
        description:
          error instanceof AxiosError ? `Status: ${error.response?.status}` : 'Unexpected error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginWithGoogle = async () => {
    setIsLoading(true);
    try {
      await getSupabaseGoogleToken();
    } catch (error) {
      console.error('Google OAuth initiation error:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to start Google sign-in.';
      toast.error(errorMessage);
      setIsLoading(false);
    }
  };

  return {
    login,
    initiateGoogleLogin: handleLoginWithGoogle,
    isLoading: isLoading || loginMutation.isPending,
    loginForm,
  };
};
