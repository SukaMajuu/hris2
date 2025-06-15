"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface FormNavigationProps {
	activeStep: number;
	totalSteps: number;
	isSubmitting?: boolean;
	onBack: () => void;
	onNext: () => void;
	onSubmit: (e: React.FormEvent) => void;
}

export function FormNavigation({
	activeStep,
	totalSteps,
	isSubmitting = false,
	onBack,
	onNext,
	onSubmit,
}: FormNavigationProps) {
	return (
		<div className="mt-8 flex justify-end gap-3">
			{activeStep > 1 && (
				<Button
					type="button"
					variant={"outline"}
					onClick={onBack}
					disabled={isSubmitting}
					className="cursor-pointer border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
				>
					Back
				</Button>
			)}
			{activeStep < totalSteps ? (
				<Button
					type="button"
					onClick={(e) => {
						e.preventDefault();
						onNext();
					}}
					disabled={isSubmitting}
					className="bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer"
				>
					Next
				</Button>
			) : (
				<Button
					type="submit"
					className="bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer"
					onClick={onSubmit}
					disabled={isSubmitting}
				>
					{isSubmitting ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							Creating...
						</>
					) : (
						"Submit"
					)}
				</Button>
			)}
		</div>
	);
}
