import {
	AlertDialog,
	AlertDialogTitle,
	AlertDialogHeader,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogCancel,
	AlertDialogAction,
} from "@/components/ui/alert-dialog";
import type { Location } from "@/types/location";

interface ConfirmationDeleteProps {
	isDeleteDialogOpen: boolean;
	handleCloseDeleteDialog: () => void;
	handleConfirmDelete: () => void;
	locationToDelete: Location | null;
	isDeleting?: boolean;
}
const ConfirmationDelete = ({
	isDeleteDialogOpen,
	handleCloseDeleteDialog,
	handleConfirmDelete,
	locationToDelete,
	isDeleting = false,
}: ConfirmationDeleteProps) => {
	return (
		<AlertDialog
			open={isDeleteDialogOpen}
			onOpenChange={handleCloseDeleteDialog}
		>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Are you sure?</AlertDialogTitle>
					<AlertDialogDescription>
						This action cannot be undone. This will permanently
						delete the location &quot;
						<strong>{locationToDelete?.name || ""}</strong>
						&quot; and all associated data.
					</AlertDialogDescription>
				</AlertDialogHeader>{" "}
				<AlertDialogFooter>
					<AlertDialogCancel
						onClick={handleCloseDeleteDialog}
						disabled={isDeleting}
					>
						Cancel
					</AlertDialogCancel>
					<AlertDialogAction
						className="bg-destructive hover:bg-destructive/90 text-white"
						onClick={handleConfirmDelete}
						disabled={isDeleting}
					>
						{isDeleting ? (
							<>
								<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
								Deleting...
							</>
						) : (
							"Delete Location"
						)}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};

export default ConfirmationDelete;
