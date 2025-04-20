import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
	useRegisterMutation,
	useGoogleAuthMutation,
} from "@/api/mutations/auth.mutation";
import { RegisterFormData, registerSchema } from "@/schemas/auth.schema";
import { GoogleAuthRequest } from "@/services/auth.service";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { getGoogleToken } from "@/utils/google-auth";

export function useRegister() {
	const router = useRouter();
	const registerMutation = useRegisterMutation();
	const googleAuthMutation = useGoogleAuthMutation();

	const registerForm = useForm<RegisterFormData>({
		resolver: zodResolver(registerSchema),
		defaultValues: {
			email: "",
			password: "",
			first_name: "",
			last_name: "",
			confirmPassword: "",
			agree_terms: false,
		},
	});

	const register = (data: RegisterFormData) => {
		registerMutation.mutate(data, {
			onSuccess: () => {
				router.push("/dashboard");
				toast.success("Successfully registered");
			},
			onError: (error) => {
				toast.error("Failed to register. Please try again.");
				console.error("Registration error:", error);
			},
		});
	};

	const registerWithGoogle = async (data: GoogleAuthRequest) => {
		googleAuthMutation.mutate(data, {
			onSuccess: () => {
				router.push("/dashboard");
				toast.success("Successfully registered with Google");
			},
			onError: (error) => {
				toast.error(
					"Failed to register with Google. Please try again."
				);
				console.error("Google auth error:", error);
			},
		});
	};

	const handleSignIn = async () => {
		try {
			const token = await getGoogleToken();
			await registerWithGoogle({
				token,
			});
		} catch (err) {
			console.error("Registration failed:", err);
			toast.error("Failed to authenticate with Google");
		}
	};

	return {
		register,
		handleSignIn,
		registerForm,
		isLoading: {
			register: registerMutation.isPending,
			google: googleAuthMutation.isPending,
		},
	};
}
