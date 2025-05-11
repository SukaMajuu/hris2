import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

interface ApprovalConfirmationModalProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	selectedItem: {
		approved: boolean | null;
	} | null;
	onApprove: () => void;
	onReject: () => void;
}

export function ApprovalConfirmationModal({
	isOpen,
	onOpenChange,
	selectedItem,
	onApprove,
	onReject,
}: ApprovalConfirmationModalProps) {
	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Confirm Approval</DialogTitle>
					<DialogDescription>
						Are you sure you want to{" "}
						{selectedItem?.approved === null
							? "approve"
							: selectedItem?.approved
							? "reject"
							: "approve"}{" "}
						this request?
					</DialogDescription>
				</DialogHeader>
				<DialogFooter className="flex justify-end sm:justify-end">
					<div className="flex  gap-2">
						<Button
							variant="outline"
							className="bg-red-500 text-white hover:bg-red-600 border-red-500"
							onClick={onReject}
						>
							Reject
						</Button>
						<Button
							variant="outline"
							className="bg-green-500 text-white hover:bg-green-600 border-green-500"
							onClick={onApprove}
						>
							Approve
						</Button>
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
