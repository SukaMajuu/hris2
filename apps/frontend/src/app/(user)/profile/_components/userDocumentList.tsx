import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Download, FileText } from "lucide-react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import React from "react";

// Define the shape of a document object for the user profile
export interface UserDisplayDocument {
	id: string | number; // Assuming an ID for each document
	name: string;
	uploadedAt?: string | Date; // Optional, could be a string or Date object
	fileUrl?: string; // URL to download the file
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
	return (
		<Card className="shadow-lg border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900">
			<CardHeader className="flex flex-row items-center justify-between">
				<CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-100">
					My Documents
				</CardTitle>
			</CardHeader>
			<CardContent className="p-6">
				{currentDocuments.length === 0 ? (
					<div className="text-center py-10">
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
									className="border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50"
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
									<TableCell className="text-right space-x-2">
										<Button
											variant="outline"
											size="icon"
											onClick={() =>
												handleDownloadDocument(doc)
											}
											disabled={!doc.fileUrl} // Disable if no URL
											className="text-blue-600 hover:text-blue-700 border-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:border-blue-500 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
										>
											<Download className="h-4 w-4" />
										</Button>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				)}
			</CardContent>
		</Card>
	);
};

export default UserDocumentList;
