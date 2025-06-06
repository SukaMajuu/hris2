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
	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent>				<DialogHeader>
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
				
				<div className="space-y-4 py-4">
					<div className="space-y-2">
						<Label htmlFor="adminNote" className="text-sm font-medium">
							Admin Note (Optional)
						</Label>						<Textarea
							id="adminNote"
							placeholder="Add a note for this approval/rejection decision..."
							value={adminNote}
							onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onAdminNoteChange(e.target.value)}
							className="min-h-[80px] resize-none"
						/>
					</div>
				</div>				<DialogFooter className="flex justify-end sm:justify-end">
					<div className="flex  gap-2">
						<Button
							variant="outline"
							className="bg-red-500 text-white hover:bg-red-600 border-red-500"
							onClick={() => onReject(adminNote)}
						>
							Reject
						</Button>
						<Button
							variant="outline"
							className="bg-green-500 text-white hover:bg-green-600 border-green-500"
							onClick={() => onApprove(adminNote)}
						>
							Approve
						</Button>
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
