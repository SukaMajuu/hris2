import { z } from "zod";

export const loginSchema = z.object({
	identifier: z.string().min(1, "Identifier is required"),
	password: z.string().min(6, "Password must be at least 6 characters"),
	rememberMe: z.boolean().optional(),
});

export const loginIdEmployeeSchema = z.object({
	employeeId: z.string().min(1, "Employee ID is required"),
	password: z.string().min(6, "Password must be at least 6 characters"),
	rememberMe: z.boolean().optional(),
});

export const registerSchema = z
	.object({
		first_name: z.string().min(1, "First name is required"),
		last_name: z.string(),
		email: z.string().email("Invalid email address"),
		password: z.string().min(6, "Password must be at least 6 characters"),
		confirmPassword: z.string(),
		agree_terms: z.boolean().refine((val) => val === true, {
			message: "You must agree to the terms and conditions",
		}),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ["confirmPassword"],
	});

export const googleAuthSchema = z.object({
	token: z.string(),
	agree_terms: z.boolean().refine((val) => val === true, {
		message: "You must agree to the terms and conditions",
	}),
});

export const forgotPasswordSchema = z.object({
	email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z
	.object({
		newPassword: z
			.string()
			.min(8, "Password must be at least 8 characters"),
		confirmPassword: z.string(),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

export type LoginFormData = z.infer<typeof loginSchema>;
export type LoginIdEmployeeFormData = z.infer<typeof loginIdEmployeeSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type GoogleAuthFormData = z.infer<typeof googleAuthSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
