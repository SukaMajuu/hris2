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
	forgotPasswordSchema,
	ForgotPasswordFormData,
} from "@/schemas/auth.schema";

export default function ForgotPasswordPage() {
	const forgotPasswordForm = useForm<ForgotPasswordFormData>({
		resolver: zodResolver(forgotPasswordSchema),
		defaultValues: {
			email: "",
		},
	});

	const onSubmit = (values: ForgotPasswordFormData) => {
		console.log(values);
	};

	return (
		<div className="h-full w-full flex flex-col justify-center items-center gap-10">
			<div className="w-full max-w-md flex flex-col gap-4">
				<h4 className="text-2xl font-bold text-center">
					Forgot Password
				</h4>
				<p className="text-sm text-gray-500 text-center">
					No worries! Enter your email address below, and we&apos;ll
					send you a link to reset your password
				</p>
			</div>
			<Form {...forgotPasswordForm}>
				<form
					onSubmit={forgotPasswordForm.handleSubmit(onSubmit)}
					className="w-full max-w-xl flex flex-col gap-4"
				>
					<FormField
						control={forgotPasswordForm.control}
						name="email"
						render={({ field }) => (
							<FormItem className="min-h-20 relative">
								<FormLabel>Email</FormLabel>
								<FormControl>
									<Input
										className="h-12 px-4 text-base"
										type="email"
										placeholder="Enter your email"
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
