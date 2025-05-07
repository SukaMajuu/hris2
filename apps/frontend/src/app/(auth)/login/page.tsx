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
import { LoginFormData, loginSchema } from "@/schemas/auth.schema";
import { z } from "zod";

export default function LoginPage() {
	const loginForm = useForm<LoginFormData>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			emailOrPhoneNumber: "",
			password: "",
			rememberMe: false,
		},
	});

	const login = (data: z.infer<typeof loginSchema>) => {
		console.log(data);
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
							name="emailOrPhoneNumber"
							render={({ field }) => (
								<FormItem className="min-h-20 relative">
									<FormLabel>Email or Phone Number</FormLabel>
									<FormControl>
										<Input
											className="h-12 px-4 text-base"
											type="email"
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
										<Input
											className="h-12 px-4 text-base"
											type="password"
											placeholder="Enter your password"
											{...field}
										/>
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
							>
								Sign in
							</Button>
							<Button
								onClick={() => {}}
								className="w-full h-12 text-base bg-white text-black border border-gray-300 hover:bg-gray-200 hover:cursor-pointer"
							>
								Sign in with Google
							</Button>
							<Button
								onClick={() => {}}
								className="w-full h-12 text-base bg-white text-black border border-gray-300 hover:bg-gray-200 hover:cursor-pointer"
							>
								Sign in with ID Employee
							</Button>
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
