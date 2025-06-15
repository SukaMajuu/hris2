import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import React from "react";

interface ApprovalConfirmationModalProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	selectedItem: {
		approved: boolean | null;
	} | null;
	adminNote: string;
	onAdminNoteChange: (note: string) => void;
	onApprove: (adminNote: string) => void;
	onReject: (adminNote: string) => void;
}

export function ApprovalConfirmationModal({
	isOpen,
	onOpenChange,
	selectedItem,
	adminNote,
	onAdminNoteChange,
	onApprove,
	onReject,
}: ApprovalConfirmationModalProps) {
	// Add state to track if an action is in progress
	const [isActionInProgress, setIsActionInProgress] = React.useState(false);

	// Handle approve with loading state
	const handleApprove = React.useCallback(async () => {
		if (isActionInProgress) return;

		try {
			setIsActionInProgress(true);
			await onApprove(adminNote);
		} catch (error) {
			console.error("Error approving request:", error);
		} finally {
			setIsActionInProgress(false);
		}
	}, [onApprove, adminNote, isActionInProgress]);

	// Handle reject with loading state
	const handleReject = React.useCallback(async () => {
		if (isActionInProgress) return;

		try {
			setIsActionInProgress(true);
			await onReject(adminNote);
		} catch (error) {
			console.error("Error rejecting request:", error);
		} finally {
			setIsActionInProgress(false);
		}
	}, [onReject, adminNote, isActionInProgress]);

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Confirm Approval Decision</DialogTitle>
					<DialogDescription>
						Please review the leave request and provide your
						decision with an optional note
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-2 mt-4">
					<Label
						htmlFor="adminNote"
						className="text-sm font-medium text-slate-700"
					>
						Admin Note (Optional)
					</Label>
					<Textarea
						id="adminNote"
						placeholder="Add a note for this approval/rejection decision..."
						value={adminNote}
						onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
							onAdminNoteChange(e.target.value)
						}
						className="min-h-[100px] resize-none border-slate-200 bg-slate-50 text-slate-700 placeholder:text-slate-400 focus:border-slate-300 focus:bg-white focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors duration-200"
					/>
				</div>

				<DialogFooter className="flex justify-end sm:justify-end">
					<div className="flex gap-2">
						<Button
							variant="outline"
							className="border-red-500 bg-red-500 text-white hover:bg-red-600"
							onClick={handleReject}
							disabled={isActionInProgress}
						>
							{isActionInProgress ? "Processing..." : "Reject"}
						</Button>
						<Button
							variant="outline"
							className="border-green-500 bg-green-500 text-white hover:bg-green-600"
							onClick={handleApprove}
							disabled={isActionInProgress}
						>
							{isActionInProgress ? "Processing..." : "Approve"}
						</Button>
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
