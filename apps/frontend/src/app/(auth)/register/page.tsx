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
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import Link from "next/link";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { useRegister } from "./useRegister";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

// Terms and Conditions Modal Component
function TermsModal() {
	return (
		<DialogContent className="max-h-[80vh] max-w-4xl overflow-y-auto">
			<DialogHeader>
				<DialogTitle className="text-xl font-bold">
					Terms & Conditions
				</DialogTitle>
				<DialogDescription>
					Please read our terms and conditions carefully before
					proceeding.
				</DialogDescription>
			</DialogHeader>
			<div className="space-y-6 text-sm">
				<section>
					<h3 className="mb-2 text-base font-semibold">
						1. CONDITIONS OF USE
					</h3>
					<p>
						Our HR Management System is offered to you, the user,
						conditioned on your acceptance of the terms, conditions
						and notices contained or incorporated by reference
						herein and such additional terms and conditions,
						agreements, and notices that may apply to any page or
						section of the System.
					</p>
				</section>

				<section>
					<h3 className="mb-2 text-base font-semibold">
						2. OVERVIEW
					</h3>
					<p>
						Your use of this System constitutes your agreement to
						all terms, conditions and notices. Please read them
						carefully. By using this System, you agree to these
						Terms and Conditions, as well as any other terms,
						guidelines or rules that are applicable to any portion
						of this System, without limitation or qualification. If
						you do not agree to these Terms and Conditions, you must
						exit the System immediately and discontinue any use of
						information or services from this System.
					</p>
				</section>

				<section>
					<h3 className="mb-2 text-base font-semibold">
						3. MODIFICATION OF THE SYSTEM AND THESE TERMS &
						CONDITIONS
					</h3>
					<p>
						We reserve the right to change, modify, alter, update or
						discontinue the terms, conditions, and notices under
						which this System is offered and the links, content,
						information, prices and any other materials offered via
						this System at any time and from time to time without
						notice or further obligation to you except as may be
						provided therein. We have the right to adjust prices
						from time to time. By your continued use of the System
						following such modifications, alterations, or updates
						you agree to be bound by such modifications,
						alterations, or updates.
					</p>
				</section>

				<section>
					<h3 className="mb-2 text-base font-semibold">
						4. COPYRIGHTS
					</h3>
					<p>
						This System is owned and operated by our company. Unless
						otherwise specified, all materials on this System,
						trademarks, service marks, logos are our property and
						are protected by applicable copyright laws. No materials
						published by us on this System, in whole or in part, may
						be copied, reproduced, modified, republished, uploaded,
						posted, transmitted, or distributed in any form or by
						any means without prior written permission.
					</p>
				</section>

				<section>
					<h3 className="mb-2 text-base font-semibold">5. SIGN UP</h3>
					<p>
						You need to sign up to this System to use our HR
						management services. You will be asked to provide
						accurate and current information on all registration
						forms. You are solely responsible for maintaining the
						confidentiality of any username and password that you
						choose, as well as any activity that occur under your
						username/password. You will not misuse or share your
						username or password, misrepresent your identity or your
						affiliation with an entity, impersonate any person or
						entity, or misstate the origin of any information you
						provide through this System.
					</p>
				</section>

				<section>
					<h3 className="mb-2 text-base font-semibold">
						6. ELECTRONIC COMMUNICATIONS
					</h3>
					<p>
						You agree that we may send electronic communications to
						you for the purpose of advising you of changes or
						additions to this System, about any of our services, or
						for such other purpose(s) as we deem appropriate. If you
						wish to unsubscribe from our communications, please
						update your preferences in your account settings.
					</p>
				</section>

				<section>
					<h3 className="mb-2 text-base font-semibold">
						7. SERVICES DESCRIPTIONS
					</h3>
					<p>
						We always try our best to display the information and
						features of our HR management services as accurately as
						possible. However, we cannot guarantee that your
						device&apos;s display will be perfectly accurate as the
						actual appearance depends on your device and browser
						settings.
					</p>
				</section>

				<section>
					<h3 className="mb-2 text-base font-semibold">
						8. PRIVACY POLICY
					</h3>
					<p>
						Your information is safe with us. We understand that
						privacy concerns are extremely important to our users.
						You can rest assured that any information you submit to
						us will not be misused, abused or sold to any other
						parties. We only use your personal information to
						provide our HR management services and improve your
						experience.
					</p>
				</section>

				<section>
					<h3 className="mb-2 text-base font-semibold">
						9. INDEMNITY
					</h3>
					<p>
						You agree to indemnify, defend and hold us harmless from
						and against any and all third party claims, liabilities,
						damages, losses or expenses (including reasonable
						attorney&apos;s fees and costs) arising out of, based on
						or in connection with your access and/or use of this
						System.
					</p>
				</section>

				<section>
					<h3 className="mb-2 text-base font-semibold">
						10. DISCLAIMER
					</h3>
					<p>
						We assume no responsibility for accuracy, correctness,
						timeliness, or content of the information provided on
						this System. You should not assume that the information
						on this System is continuously updated or otherwise
						contains current information. We are not responsible for
						supplying content or materials from the System that have
						expired or have been removed.
					</p>
				</section>

				<section>
					<h3 className="mb-2 text-base font-semibold">
						11. APPLICABLE LAWS
					</h3>
					<p>
						These Terms and Conditions are governed by the
						applicable laws in your jurisdiction.
					</p>
				</section>

				<section>
					<h3 className="mb-2 text-base font-semibold">
						12. QUESTIONS AND FEEDBACK
					</h3>
					<p>
						We welcome your questions, comments, and concerns about
						privacy or any of the information collected from you or
						about you. Please send us any and all feedback
						pertaining to privacy, or any other issue through our
						support channels.
					</p>
				</section>

				<div className="mt-6 border-t pt-4">
					<p className="text-xs text-gray-500">
						Copyright © {new Date().getFullYear()} All Rights
						Reserved.
					</p>
				</div>
			</div>
		</DialogContent>
	);
}

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
		<div className="flex h-full w-full flex-col">
			{/* Header */}
			<div className="flex items-center justify-between">
				<Link href="/">
					<Image
						src="/logo.png"
						alt="Company Logo"
						width={120}
						height={40}
						className="h-10 w-auto"
					/>
				</Link>
				<Link
					href="/login"
					className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
				>
					Login here!
				</Link>
			</div>

			<div className="flex w-full flex-[1] flex-col justify-center gap-10">
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
									<FormItem className="relative min-h-20">
										<FormLabel>First Name</FormLabel>
										<FormControl>
											<Input
												className="h-12 px-4 text-base"
												placeholder="Enter your first name"
												{...field}
											/>
										</FormControl>
										<FormMessage className="absolute -bottom-4" />
									</FormItem>
								)}
							/>
							<FormField
								control={registerForm.control}
								name="last_name"
								render={({ field }) => (
									<FormItem className="relative min-h-20">
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
								<FormItem className="relative min-h-20">
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
								<FormItem className="relative min-h-20">
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
												className="absolute top-0 right-0 h-12 hover:bg-transparent"
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
								<FormItem className="relative min-h-20">
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
												className="absolute top-0 right-0 h-12 hover:bg-transparent"
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
								<FormItem className="flex flex-row items-start space-y-0">
									<FormControl>
										<Checkbox
											checked={field.value}
											onCheckedChange={field.onChange}
										/>
									</FormControl>
									<div className="space-y-1 leading-none">
										<FormLabel>
											I agree to the{" "}
											<Dialog>
												<DialogTrigger asChild>
													<button
														type="button"
														className="text-indigo-600 underline hover:text-indigo-500"
													>
														Terms and Conditions
													</button>
												</DialogTrigger>
												<TermsModal />
											</Dialog>
										</FormLabel>
									</div>
								</FormItem>
							)}
						/>

						<div className="flex flex-col gap-4">
							<Button
								type="submit"
								className="h-12 w-full text-base hover:cursor-pointer"
								disabled={isLoading}
							>
								{isLoading ? "Signing up..." : "Sign Up"}
							</Button>
							<Button
								onClick={initiateGoogleRegister}
								disabled={isLoading}
								className="h-12 w-full border border-gray-300 bg-white text-base text-black hover:cursor-pointer hover:bg-gray-200"
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
