"use client";

import { useState } from "react";
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
import { Eye, EyeOff } from "lucide-react";
import { useLogin } from "./_hooks/useLogin";

export default function LoginPage() {
	const { loginForm, login, initiateGoogleLogin, isLoading } = useLogin();
	const [showPassword, setShowPassword] = useState(false);

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
						Sign In
					</h1>
					<p className="typography-body2 text-gray-600">
						Welcome back to HRIS cmlabs! Manage everything with
						ease.
					</p>
				</div>

				{/* Form */}
				<Form {...loginForm}>
					<form
						onSubmit={loginForm.handleSubmit(login)}
						className="space-y-4"
					>
						<FormField
							control={loginForm.control}
							name="identifier"
							render={({ field }) => (
								<FormItem className="min-h-20 relative">
									<FormLabel>Email or Phone Number</FormLabel>
									<FormControl>
										<Input
											className="h-12 px-4 text-base"
											type="text"
											placeholder="Enter your email or phone number"
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
							<Button
								onClick={initiateGoogleLogin}
								className="w-full h-12 text-base bg-white text-black border border-gray-300 hover:bg-gray-200 hover:cursor-pointer"
								disabled={isLoading}
							>
								Sign in with Google
							</Button>
							<Link href="/login/id-employee">
								<Button
									className="w-full h-12 text-base bg-white text-black border border-gray-300 hover:bg-gray-200 hover:cursor-pointer"
									disabled={isLoading}
								>
									Sign in with ID Employee
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
