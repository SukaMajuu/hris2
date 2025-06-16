"use client";

import {
	Toast,
	ToastClose,
	ToastDescription,
	ToastProvider,
	ToastTitle,
	ToastViewport,
} from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";

export const Toaster = () => {
	const { toasts } = useToast();

	return (
		<ToastProvider>
			{toasts.map((toast) => (
					<Toast key={toast.id} {...toast}>
						<div className="grid gap-1">
							{toast.title && (
								<ToastTitle>{toast.title}</ToastTitle>
							)}
							{toast.description && (
								<ToastDescription>
									{toast.description}
								</ToastDescription>
							)}
						</div>
						{toast.action}
						<ToastClose />
					</Toast>
				))}
			<ToastViewport />
		</ToastProvider>
	);
}
