import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ConfirmationDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title?: string;
	description?: string;
	itemName?: string;
	itemType?: string;
	confirmText?: string;
	cancelText?: string;
	onConfirm: () => void;
	onCancel?: () => void;
	isLoading?: boolean;
	loadingText?: string;
	variant?: "destructive" | "default";
}

export const ConfirmationDialog = ({
	open,
	onOpenChange,
	title = "Are you sure?",
	description,
	itemName,
	itemType = "item",
	confirmText,
	cancelText = "Cancel",
	onConfirm,
	onCancel,
	isLoading = false,
	loadingText,
	variant = "destructive",
}: ConfirmationDialogProps) => {
	const handleCancel = () => {
		if (onCancel) {
			onCancel();
		} else {
			onOpenChange(false);
		}
	};

	// Generate default description if not provided
	const defaultDescription = itemName
		? `This action cannot be undone. This will permanently delete the ${itemType} "${itemName}" and all associated data.`
		: `This action cannot be undone. This will permanently delete this ${itemType} and all associated data.`;

	// Generate default confirm text if not provided
	const defaultConfirmText =
		confirmText ||
		`Delete ${itemType.charAt(0).toUpperCase() + itemType.slice(1)}`;

	// Generate default loading text if not provided
	const defaultLoadingText = loadingText || `Deleting...`;

	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{title}</AlertDialogTitle>
					<AlertDialogDescription>
						{description || defaultDescription}
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel
						onClick={handleCancel}
						disabled={isLoading}
					>
						{cancelText}
					</AlertDialogCancel>
					<AlertDialogAction
						className={
							variant === "destructive"
								? "bg-destructive hover:bg-destructive/90 text-white"
								: ""
						}
						onClick={onConfirm}
						disabled={isLoading}
					>
						{isLoading ? (
							<>
								<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
								{defaultLoadingText}
							</>
						) : (
							defaultConfirmText
						)}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};
