"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { useRegister } from "./useRegister";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	const {
		register,
		isLoading,
		registerForm,
		initiateGoogleRegister,
	} = useRegister();

	return (
		<div className="h-full w-full flex flex-col">
			{/* Header */}
			<div className="flex items-center justify-between">
				<Image
					src="/logo.png"
					alt="Company Logo"
					width={120}
					height={40}
					className="h-10 w-auto"
				/>
				<Link
					href="/login"
					className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
				>
					Login here!
				</Link>
			</div>

			<div className="w-full flex-[1] flex flex-col justify-center gap-10">
				{/* Title and Description */}
				<div className="flex flex-col gap-4">
					<h1 className="typography-h5 font-bold text-gray-900">
						Sign Up
					</h1>
					<p className="typography-body2 text-gray-600">
						Create your account and streamline your employee
						management.
					</p>
				</div>

				{/* Form */}
				<Form {...registerForm}>
					<form
						onSubmit={registerForm.handleSubmit(register)}
						className="space-y-4"
					>
						<div className="grid grid-cols-2 gap-4">
							<FormField
								control={registerForm.control}
								name="first_name"
								render={({ field }) => (
									<FormItem className="min-h-20 relative">
										<FormLabel>First Name</FormLabel>
										<FormControl>
											<Input
												className="h-12 px-4 text-base"
												placeholder="Enter your first name"
												{...field}
											/>
										</FormControl>
										<FormMessage className="absolute -bottom-4 " />
									</FormItem>
								)}
							/>
							<FormField
								control={registerForm.control}
								name="last_name"
								render={({ field }) => (
									<FormItem className="min-h-20 relative">
										<FormLabel>Last Name</FormLabel>
										<FormControl>
											<Input
												className="h-12 px-4 text-base"
												placeholder="Enter your last name"
												{...field}
											/>
										</FormControl>
										<FormMessage className="absolute -bottom-4" />
									</FormItem>
								)}
							/>
						</div>

						<FormField
							control={registerForm.control}
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

						<FormField
							control={registerForm.control}
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

						<FormField
							control={registerForm.control}
							name="confirmPassword"
							render={({ field }) => (
								<FormItem className="min-h-20 relative">
									<FormLabel>Confirm Password</FormLabel>
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

						<FormField
							control={registerForm.control}
							name="agree_terms"
							render={({ field }) => (
								<FormItem className="flex flex-row items-start  space-y-0">
									<FormControl>
										<Checkbox
											checked={field.value}
											onCheckedChange={field.onChange}
										/>
									</FormControl>
									<div className="space-y-1 leading-none">
										<FormLabel>
											I agree to the{" "}
											<a
												href="/terms"
												className="text-indigo-600 hover:text-indigo-500"
											>
												Terms and Conditions
											</a>
										</FormLabel>
									</div>
								</FormItem>
							)}
						/>

						<div className="flex flex-col gap-4">
							<Button
								type="submit"
								className="w-full h-12 text-base hover:cursor-pointer"
								disabled={isLoading}
							>
								{isLoading ? "Signing up..." : "Sign Up"}
							</Button>
							<Button
								onClick={initiateGoogleRegister}
								disabled={isLoading}
								className="w-full h-12 text-base bg-white text-black border border-gray-300 hover:bg-gray-200 hover:cursor-pointer"
							>
								{isLoading
									? "Signing up..."
									: "Sign up with Google"}
							</Button>
						</div>
					</form>
				</Form>
				<div className="flex flex-col gap-8">
					<Separator className="my-4 bg-gray-300" />

					{/* Bottom Link */}
					<div className="text-center">
						<p className="text-sm text-gray-600">
							Already have an account?{" "}
							<Link
								href="/login"
								className="font-medium text-indigo-600 hover:text-indigo-500"
							>
								Sign in here
							</Link>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
