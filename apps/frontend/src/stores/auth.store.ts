import { create } from "zustand";
import { User } from "@/types/api";
import { Role } from "@/const/role";

interface AuthState {
	user: User | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	setUser: (user: User | null) => void;
	logout: () => void;
	setIsLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
	user: null,
	isAuthenticated: false,
	isLoading: true,
	setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
	logout: () => set({ user: null, isAuthenticated: false, isLoading: false }),
	setIsLoading: (loading) => set({ isLoading: loading }),
}));

export type { User, Role };
