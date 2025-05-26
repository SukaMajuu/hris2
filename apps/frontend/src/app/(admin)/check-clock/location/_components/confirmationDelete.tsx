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
import type { Location } from "../_hooks/useLocation";

interface ConfirmationDeleteProps {
	isDeleteDialogOpen: boolean;
	handleCloseDeleteDialog: () => void;
	handleConfirmDelete: () => void;
	locationToDelete: Location | null;
}
const ConfirmationDelete = ({
	isDeleteDialogOpen,
	handleCloseDeleteDialog,
	handleConfirmDelete,
	locationToDelete,
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
						<strong>{locationToDelete?.nama || ""}</strong>
						&quot; and all associated data.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel onClick={handleCloseDeleteDialog}>
						Cancel
					</AlertDialogCancel>
					<AlertDialogAction
						className="bg-destructive hover:bg-destructive/90 text-white"
						onClick={handleConfirmDelete}
					>
						Delete Location
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};

export default ConfirmationDelete;
