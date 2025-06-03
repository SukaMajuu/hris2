import { useCallback, useState } from "react";
import { useCreateWorkSchedule } from "@/api/mutations/work-schedule.mutation";
import { useLocations } from "@/api/queries/location.queries";
import { toast } from "sonner";
import { WorkSchedule } from "@/types/work-schedule.types";
import { workScheduleSchema } from "@/schemas/work-schedule.schema";
import { useRouter } from "next/navigation";
import { ZodError } from "zod";

export const useAddWorkSchedule = () => {
	const router = useRouter();
	const [validationErrors, setValidationErrors] = useState<
		Record<string, string>
	>({});

	const locationsQuery = useLocations({});
	const createMutation = useCreateWorkSchedule();

	const locations = locationsQuery.data?.data?.items || [];

	const clearValidationErrors = useCallback(() => {
		setValidationErrors({});
	}, []);

	const handleSubmit = useCallback(
		async (data: WorkSchedule) => {
			try {
				// Clear previous validation errors
				setValidationErrors({});

				const validatedData = workScheduleSchema.parse(data);

				await createMutation.mutateAsync(validatedData);
				toast.success("Work schedule successfully created");

				setTimeout(() => {
					router.push("/check-clock/work-schedule");
				}, 1500);
			} catch (error) {
				console.error("Create work schedule error:", error);

				if (error instanceof ZodError) {
					// Map Zod errors to form fields
					const fieldErrors: Record<string, string> = {};

					error.issues.forEach((issue) => {
						const fieldPath = issue.path.join(".");
						fieldErrors[fieldPath] = issue.message;
					});

					setValidationErrors(fieldErrors);
					toast.error("Please fix the validation errors below");
					return;
				}

				const errorMessage =
					error instanceof Error
						? error.message
						: "Failed to create work schedule";
				toast.error(errorMessage);
			}
		},
		[createMutation, router]
	);

	const handleCancel = useCallback(() => {
		router.push("/check-clock/work-schedule");
	}, [router]);

	return {
		// Locations for form
		locations,
		isLoadingLocations: locationsQuery.isLoading,
		locationsError: locationsQuery.error,

		// Form submission with validation
		handleSubmit,
		isCreating: createMutation.isPending,
		validationErrors,
		clearValidationErrors,

		// Navigation
		handleCancel,

		// Query controls
		refetchLocations: locationsQuery.refetch,
	};
};
