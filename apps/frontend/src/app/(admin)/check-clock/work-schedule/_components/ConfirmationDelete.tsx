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
import type { WorkSchedule, WorkScheduleDetailRow } from "../_hooks/useWorkSchedule";

interface ConfirmationDeleteProps {
	isDeleteDialogOpen: boolean;
	handleCloseDeleteDialog: () => void;
	handleConfirmDelete: () => void;
	workScheduleToDelete: WorkScheduleDetailRow | null;
}
const ConfirmationDelete = ({
	isDeleteDialogOpen,
	handleCloseDeleteDialog,
	handleConfirmDelete,
	workScheduleToDelete,
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
						delete the work schedule &quot;
						<strong>{workScheduleToDelete?.nama || ""}</strong>
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
						Delete Work Schedule
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};

export default ConfirmationDelete;
