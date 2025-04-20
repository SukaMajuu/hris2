import { useMutation } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import { queryKeys } from '../query-keys';

export const useLoginMutation = () => {
  return useMutation({
    mutationKey: queryKeys.auth.login,
    mutationFn: authService.login,
  });
};

export const useRegisterMutation = () => {
  return useMutation({
    mutationKey: queryKeys.auth.register,
    mutationFn: authService.register,
  });
};

export const useGoogleAuthMutation = () => {
  return useMutation({
    mutationKey: queryKeys.auth.google,
    mutationFn: authService.registerWithGoogle,
  });
};
