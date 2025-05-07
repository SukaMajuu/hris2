"use client";

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

export default function ResetPasswordPage() {
	const resetPasswordForm = useForm<ResetPasswordFormData>({
		resolver: zodResolver(resetPasswordSchema),
		defaultValues: {
			newPassword: "",
			confirmPassword: "",
		},
	});

	const onSubmit = (values: ResetPasswordFormData) => {
		console.log(values);
		// TODO: Implement password reset logic
	};

	return (
		<div className="h-full w-full flex flex-col justify-center items-center gap-10">
			<div className="w-full max-w-md flex flex-col gap-4 text-center">
				<h4 className="text-2xl font-bold">Reset Password</h4>
				<p className="text-sm text-gray-600">
					Create a new password for your account. Make sure it&apos;s
					strong and memorable.
				</p>
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
									<Input
										className="h-12 px-4 text-base"
										type="password"
										placeholder="Enter your new password"
										{...field}
									/>
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
									<Input
										className="h-12 px-4 text-base"
										type="password"
										placeholder="Confirm your new password"
										{...field}
									/>
								</FormControl>
								<FormMessage className="absolute -bottom-4" />
							</FormItem>
						)}
					/>
					<Button
						type="submit"
						className="w-full h-12 text-base hover:cursor-pointer"
					>
						Reset Password
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
