"use client";

import Image from "next/image";
import Link from "next/link";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLogin } from "../_hooks/useLogin";
import {
	LoginIdEmployeeFormData,
	loginIdEmployeeSchema,
} from "@/schemas/auth.schema";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function LoginIdEmployeePage() {
	const [showPassword, setShowPassword] = useState(false);

	const loginForm = useForm<LoginIdEmployeeFormData>({
		resolver: zodResolver(loginIdEmployeeSchema),
		defaultValues: {
			employeeId: "",
			password: "",
			rememberMe: false,
		},
	});

	const { login: performApiLogin, isLoading } = useLogin();

	const onSubmit = async (data: LoginIdEmployeeFormData) => {
		await performApiLogin({
			identifier: data.employeeId,
			password: data.password,
			rememberMe: data.rememberMe,
		});
	};

	return (
		<div className="h-full w-full flex flex-col">
			{/* Header */}
			<div className="flex items-center">
				<Image
					src="/logo.png"
					alt="Company Logo"
					width={120}
					height={40}
					className="h-10 w-auto"
				/>
			</div>
			<div className="w-full flex-[1] flex flex-col justify-center gap-10">
				{/* Title and Description */}
				<div className="flex flex-col gap-4">
					<h1 className="typography-h5 font-bold text-gray-900">
						Sign in with Employee ID
					</h1>
					<p className="typography-body2 text-gray-600">
						Welcome back to HRIS cmlabs! Manage everything with
						ease.
					</p>
				</div>

				{/* Form */}
				<Form {...loginForm}>
					<form
						onSubmit={loginForm.handleSubmit(onSubmit)}
						className="space-y-4"
					>
						<FormField
							control={loginForm.control}
							name="employeeId"
							render={({ field }) => (
								<FormItem className="min-h-20 relative">
									<FormLabel>Employee ID</FormLabel>
									<FormControl>
										<Input
											className="h-12 px-4 text-base"
											type="text"
											placeholder="Enter your employee ID"
											{...field}
										/>
									</FormControl>
									<FormMessage className="absolute -bottom-4" />
								</FormItem>
							)}
						/>

						<FormField
							control={loginForm.control}
							name="password"
							render={({ field }) => (
								<FormItem className="min-h-20 relative">
									<FormLabel>Password</FormLabel>
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
													setShowPassword(
														!showPassword
													)
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

						<div className="flex flex-row items-center justify-between">
							<FormField
								control={loginForm.control}
								name="rememberMe"
								render={({ field }) => (
									<FormItem className="flex flex-row items-start  space-y-0">
										<FormControl>
											<Checkbox
												checked={field.value}
												onCheckedChange={field.onChange}
											/>
										</FormControl>
										<div className="space-y-1 leading-none">
											<FormLabel>Remember me</FormLabel>
										</div>
									</FormItem>
								)}
							/>

							<Link
								href="/forgot-password"
								className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
							>
								Forgot password?
							</Link>
						</div>

						<div className="flex flex-col gap-4">
							<Button
								type="submit"
								className="w-full h-12 text-base hover:cursor-pointer"
								disabled={isLoading}
							>
								{isLoading ? "Signing in..." : "Sign in"}
							</Button>
							<Link href="/login">
								<Button className="w-full h-12 text-base bg-white text-black border border-gray-300 hover:bg-gray-200 hover:cursor-pointer">
									Use a different sign-in method
								</Button>
							</Link>
						</div>
					</form>
				</Form>

				<div className="flex flex-col gap-8">
					<Separator className="my-4 bg-gray-300" />

					{/* Bottom Link */}
					<div className="text-center">
						<p className="text-sm text-gray-600">
							Don&apos;t have an account?{" "}
							<Link
								href="/register"
								className="font-medium text-indigo-600 hover:text-indigo-500"
							>
								Sign up here
							</Link>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
