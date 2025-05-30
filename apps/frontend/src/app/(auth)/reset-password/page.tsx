"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	resetPasswordSchema,
	ResetPasswordFormData,
} from "@/schemas/auth.schema";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { EyeOff } from "lucide-react";
import { Eye } from "lucide-react";

export default function ResetPasswordPage() {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	const resetPasswordForm = useForm<ResetPasswordFormData>({
		resolver: zodResolver(resetPasswordSchema),
		defaultValues: {
			newPassword: "",
			confirmPassword: "",
		},
	});

	useEffect(() => {
		const { data: authListener } = supabase.auth.onAuthStateChange(
			async (event, session) => {
				if (event === "PASSWORD_RECOVERY") {
					setMessage("You can now set your new password.");
					setError("");
				} else if (!session) {
					if (window.location.hash.includes("#error")) {
						const params = new URLSearchParams(
							window.location.hash.substring(1)
						);
						const errorDescription = params.get(
							"error_description"
						);
						toast.error(
							errorDescription ||
								"Invalid or expired password reset link."
						);
						setError(
							errorDescription ||
								"Invalid or expired password reset link."
						);
						router.push("/link-expired");
					}
				}
			}
		);

		return () => {
			authListener?.subscription?.unsubscribe();
		};
	}, [router]);

	const onSubmit = async (values: ResetPasswordFormData) => {
		setIsLoading(true);
		setMessage("");
		setError("");

		const { error: updateError } = await supabase.auth.updateUser({
			password: values.newPassword,
		});

		setIsLoading(false);

		if (updateError) {
			console.error("Error updating password:", updateError);
			toast.error(updateError.message || "Failed to reset password.");
			setError(updateError.message || "Failed to reset password.");
		} else {
			toast.success(
				"Password reset successfully! You can now log in with your new password."
			);
			setMessage("Password reset successfully! Redirecting to login...");
			await supabase.auth.signOut();
			router.push("/login");
		}
	};

	return (
		<div className="h-full w-full flex flex-col justify-center items-center gap-10">
			<div className="w-full max-w-md flex flex-col gap-4 text-center">
				<h4 className="text-2xl font-bold">Reset Password</h4>
				<p className="text-sm text-gray-600">
					Create a new password for your account. Make sure it&apos;s
					strong and memorable.
				</p>
				{message && <p className="text-green-600">{message}</p>}
				{error && <p className="text-red-600">{error}</p>}
			</div>

			<Form {...resetPasswordForm}>
				<form
					onSubmit={resetPasswordForm.handleSubmit(onSubmit)}
					className="w-full max-w-xl flex flex-col gap-4"
				>
					<FormField
						control={resetPasswordForm.control}
						name="newPassword"
						render={({ field }) => (
							<FormItem className="min-h-20 relative">
								<FormLabel>New Password</FormLabel>
								<FormControl>
									<div className="relative">
										<Input
											className="h-12 px-4 pr-12 text-base"
											type={
												showPassword
													? "text"
													: "password"
											}
											placeholder="Enter your password"
											{...field}
										/>
										<Button
											size="icon"
											type="button"
											variant="ghost"
											className="absolute h-12 right-0 top-0 hover:bg-transparent"
											onClick={() =>
												setShowPassword(!showPassword)
											}
											aria-label={
												showPassword
													? "Hide password"
													: "Show password"
											}
										>
											{showPassword ? (
												<EyeOff className="h-6 w-6 text-black" />
											) : (
												<Eye className="h-6 w-6 text-black" />
											)}
										</Button>
									</div>
								</FormControl>
								<FormMessage className="absolute -bottom-4" />
							</FormItem>
						)}
					/>
					<FormField
						control={resetPasswordForm.control}
						name="confirmPassword"
						render={({ field }) => (
							<FormItem className="min-h-20 relative">
								<FormLabel>Confirm New Password</FormLabel>
								<FormControl>
									<div className="relative">
										<Input
											className="h-12 px-4 pr-12 text-base"
											type={
												showConfirmPassword
													? "text"
													: "password"
											}
											placeholder="Confirm your password"
											{...field}
										/>
										<Button
											size="icon"
											type="button"
											variant="ghost"
											className="absolute h-12 right-0 top-0 hover:bg-transparent"
											onClick={() =>
												setShowConfirmPassword(
													!showConfirmPassword
												)
											}
											aria-label={
												showConfirmPassword
													? "Hide password"
													: "Show password"
											}
										>
											{showConfirmPassword ? (
												<EyeOff className="h-6 w-6 text-black" />
											) : (
												<Eye className="h-6 w-6 text-black" />
											)}
										</Button>
									</div>
								</FormControl>
								<FormMessage className="absolute -bottom-4" />
							</FormItem>
						)}
					/>
					<Button
						type="submit"
						className="w-full h-12 text-base hover:cursor-pointer"
						disabled={isLoading}
					>
						{isLoading ? "Resetting..." : "Reset Password"}
					</Button>
				</form>
			</Form>

			<div className="w-full max-w-xl flex flex-col gap-4">
				<Link
					href="/login"
					className="font-medium text-indigo-600 hover:text-indigo-500 text-center"
				>
					Back to Login
				</Link>
			</div>
		</div>
	);
}
