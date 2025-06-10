import { create } from "zustand";
import { User } from "@/types/api";
import { Role } from "@/const/role";
import { persist } from "zustand/middleware";

interface AuthState {
	user: User | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	isPasswordRecovery: boolean;
	isNewUser: boolean;
	setUser: (user: User | null) => void;
	logout: () => void;
	setIsLoading: (loading: boolean) => void;
	setIsPasswordRecovery: (isRecovery: boolean) => void;
	setIsNewUser: (isNew: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
	persist(
		(set) => ({
			user: null,
			isAuthenticated: false,
			isLoading: true,
			isPasswordRecovery: false,
			isNewUser: false,
			setUser: (user) =>
				set({ user, isAuthenticated: !!user, isLoading: false }),
			logout: () =>
				set({
					user: null,
					isAuthenticated: false,
					isLoading: false,
					isPasswordRecovery: false,
					isNewUser: false,
				}),
			setIsLoading: (loading) => set({ isLoading: loading }),
			setIsPasswordRecovery: (isRecovery) =>
				set({ isPasswordRecovery: isRecovery }),
			setIsNewUser: (isNewUser) => set({ isNewUser }),
		}),
		{
			name: "auth-storage",
			partialize: (state) => ({
				user: state.user,
				isAuthenticated: state.isAuthenticated,
				isNewUser: state.isNewUser,
			}),
		}
	)
);

export type { User, Role };
