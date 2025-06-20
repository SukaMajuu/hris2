import { useMutation } from '@tanstack/react-query';

import { queryClient } from '@/lib/react-query';
import { LoginFormData, RegisterFormData } from '@/schemas/auth.schema';
import { authService } from '@/services/auth.service';

import { queryKeys } from '../query-keys';

export const useLoginMutation = () => useMutation({
    mutationKey: queryKeys.auth.login,
    mutationFn: (data: LoginFormData) => {
      const credentials = {
        identifier: data.identifier,
        password: data.password,
        rememberMe: data.rememberMe || false,
      };
      return authService.login(credentials);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
    },
  });

export const useRegisterMutation = () => useMutation({
    mutationKey: queryKeys.auth.register,
    mutationFn: (data: RegisterFormData) => {
      const credentials = {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        password: data.password,
        agree_terms: data.agree_terms,
      };
      return authService.register(credentials);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
    },
  });

export const useGoogleAuthMutation = () => useMutation({
    mutationKey: queryKeys.auth.google,
    mutationFn: (supabaseAccessToken: string) =>
      authService.registerWithGoogle(supabaseAccessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
    },
  });

export const useRequestPasswordResetMutation = () => useMutation({
    mutationKey: queryKeys.auth.passwordResetRequest,
    mutationFn: (email: string) => authService.requestPasswordReset(email),
  });

export const useChangePasswordMutation = () => useMutation({
    mutationKey: queryKeys.auth.passwordChange,
    mutationFn: ({ oldPassword, newPassword }: { oldPassword: string; newPassword: string }) =>
      authService.changePassword(oldPassword, newPassword),
  });

export const useUpdateUserPasswordMutation = () => useMutation({
    mutationKey: queryKeys.auth.passwordUpdate,
    mutationFn: ({ oldPassword, newPassword }: { oldPassword: string; newPassword: string }) =>
      authService.updateUserPassword(oldPassword, newPassword),
  });

export const useLogoutMutation = () => useMutation({
    mutationKey: queryKeys.auth.logout,
    mutationFn: async () => {
      try {
        await authService.logout();
      } catch (error) {
        console.error('Error in logout mutation:', error);
      }
      return { success: true };
    },
  });
