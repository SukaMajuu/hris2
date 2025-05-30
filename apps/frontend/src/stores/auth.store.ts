import { create } from "zustand";
import { User } from "@/types/api";
import { Role } from "@/const/role";

interface AuthState {
	user: User | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	isPasswordRecovery: boolean;
	setUser: (user: User | null) => void;
	logout: () => void;
	setIsLoading: (loading: boolean) => void;
	setIsPasswordRecovery: (isRecovery: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
	user: null,
	isAuthenticated: false,
	isLoading: true,
	isPasswordRecovery: false,
	setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
	logout: () =>
		set({
			user: null,
			isAuthenticated: false,
			isLoading: false,
			isPasswordRecovery: false,
		}),
	setIsLoading: (loading) => set({ isLoading: loading }),
	setIsPasswordRecovery: (isRecovery) =>
		set({ isPasswordRecovery: isRecovery }),
}));

export type { User, Role };
