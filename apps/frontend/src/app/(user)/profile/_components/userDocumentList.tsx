import { Download, FileText, Lock, Mail } from "lucide-react";
import React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { FEATURE_CODES } from "@/const/features";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";

// Define the shape of a document object for the user profile
export interface UserDisplayDocument {
	id?: number; // Optional ID for each document
	name: string;
	uploadedAt?: string; // Changed to match ClientDocument interface
	fileUrl?: string; // URL to download the file (renamed from url for backward compatibility)
	url?: string; // URL to download the file
	file?: File | null; // File object for new uploads - made optional to match ClientDocument
	// Add any other relevant fields like fileType, size, etc.
}

interface UserDocumentListProps {
	currentDocuments: UserDisplayDocument[];
	handleDownloadDocument: (doc: UserDisplayDocument) => void;
}

const UserDocumentList: React.FC<UserDocumentListProps> = ({
	currentDocuments,
	handleDownloadDocument,
}) => {
	const { hasFeature } = useFeatureAccess();
	const canAccessDocuments = hasFeature(
		FEATURE_CODES.DOCUMENT_EMPLOYEE_MANAGEMENT
	);

	return (
		<Card className="border border-slate-100 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
			<CardHeader className="flex flex-row items-center justify-between">
				<CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-100">
					My Documents
					{!canAccessDocuments && (
						<span className="ml-3 inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
							Premium
						</span>
					)}
				</CardTitle>
			</CardHeader>
			<CardContent className="p-6">
				{canAccessDocuments ? (
					<>
						{currentDocuments.length === 0 ? (
							<div className="py-10 text-center">
								<FileText className="mx-auto h-12 w-12 text-slate-400" />
								<p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
									No documents found.
								</p>
							</div>
						) : (
							<Table>
								<TableHeader>
									<TableRow className="border-slate-200 dark:border-slate-700">
										<TableHead className="text-slate-700 dark:text-slate-300">
											No.
										</TableHead>
										<TableHead className="text-slate-700 dark:text-slate-300">
											Document Name
										</TableHead>
										<TableHead className="text-slate-700 dark:text-slate-300">
											Uploaded At
										</TableHead>
										<TableHead className="text-right text-slate-700 dark:text-slate-300">
											Actions
										</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{currentDocuments.map((doc, idx) => (
										<TableRow
											key={doc.id}
											className="border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/50"
										>
											<TableCell className="text-slate-600 dark:text-slate-400">
												{idx + 1}
											</TableCell>
											<TableCell className="font-medium text-slate-800 dark:text-slate-200">
												{doc.name}
											</TableCell>
											<TableCell className="text-slate-600 dark:text-slate-400">
												{doc.uploadedAt
													? new Date(
															doc.uploadedAt
													  ).toLocaleDateString()
													: "N/A"}
											</TableCell>
											<TableCell className="space-x-2 text-right">
												<Button
													variant="outline"
													size="icon"
													onClick={() =>
														handleDownloadDocument(
															doc
														)
													}
													disabled={
														!doc.fileUrl && !doc.url
													} // Disable if no URL
													className="cursor-pointer border-blue-600 text-blue-600 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-blue-500 dark:text-blue-400 dark:hover:bg-slate-700 dark:hover:text-blue-300"
												>
													<Download className="h-4 w-4" />
												</Button>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						)}
					</>
				) : (
					<div className="flex flex-col items-center justify-center py-12 text-center">
						<div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600">
							<Lock className="h-8 w-8 text-white" />
						</div>
						<h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
							Premium Feature
						</h3>
						<p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
							Document access is available with Premium plan
						</p>
						<div className="flex gap-3">
							<Button
								variant="outline"
								className="text-slate-600 dark:text-slate-300"
								onClick={() => {
									toast.error(
										"Please contact your administrator to upgrade your plan."
									);
								}}
							>
								<Mail className="w-4 h-4 mr-2" />
								Contact Admin
							</Button>
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
};

export default UserDocumentList;
