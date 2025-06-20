import { UploadCloud, PlusCircle, Download, Trash2, Crown } from "lucide-react";
import React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

import type { ClientDocument } from "../_hooks/useDetailEmployee";

interface DocumentManagementProps {
	currentDocuments: ClientDocument[];
	handleAddNewDocument: (e: React.ChangeEvent<HTMLInputElement>) => void;
	handleDeleteDocument: (index: number) => void;
	handleDownloadDocument: (doc: ClientDocument) => void;
}

const DocumentManagement: React.FC<DocumentManagementProps> = ({
	currentDocuments,
	handleAddNewDocument,
	handleDeleteDocument,
	handleDownloadDocument,
}) => (
	<Card className="border border-slate-100 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
		<CardHeader className="flex flex-row items-center justify-between border-b pb-3 dark:border-slate-700">
			<div className="flex items-center gap-3">
				<CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-100">
					Documents
				</CardTitle>
				<Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-none">
					<Crown className="w-3 h-3 mr-1" />
					Premium
				</Badge>
			</div>
			<div>
				<label
					htmlFor="add-document-input"
					className="inline-flex cursor-pointer items-center rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none dark:bg-green-500 dark:hover:bg-green-600 dark:focus:ring-offset-slate-900"
				>
					<UploadCloud className="mr-2 h-4 w-4" />
					Upload New
				</label>
				<Input
					id="add-document-input"
					type="file"
					className="hidden"
					onChange={handleAddNewDocument}
				/>
			</div>
		</CardHeader>
		<CardContent className="p-6">
			{currentDocuments.length === 0 ? (
				<div className="py-10 text-center">
					<PlusCircle className="mx-auto h-12 w-12 text-slate-400" />
					<p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
						No documents uploaded yet.
					</p>
					<p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
						Upload contracts, certificates, evaluations, and
						training records.
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
								key={
									doc.id
										? `doc-${doc.id}`
										: `new-doc-${idx}-${doc.name}`
								}
								className="border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/50"
							>
								<TableCell className="text-slate-600 dark:text-slate-400">
									{idx + 1}
								</TableCell>
								<TableCell className="font-medium text-slate-800 dark:text-slate-200">
									{doc.name}
								</TableCell>
								<TableCell className="text-slate-600 dark:text-slate-400">
									{(() => {
										if (doc.uploadedAt) {
											return new Date(
												doc.uploadedAt
											).toLocaleDateString();
										}

										if (doc.file) {
											return "New Upload";
										}

										return "N/A";
									})()}
								</TableCell>
								<TableCell className="space-x-2 text-right">
									<Button
										variant="outline"
										size="icon"
										onClick={() =>
											handleDownloadDocument(doc)
										}
										className="cursor-pointer border-blue-600 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-500 dark:text-blue-400 dark:hover:bg-slate-700 dark:hover:text-blue-300"
									>
										<Download className="h-4 w-4" />
									</Button>
									<Button
										variant="outline"
										size="icon"
										onClick={() =>
											handleDeleteDocument(idx)
										}
										className="cursor-pointer border-red-600 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-500 dark:text-red-400 dark:hover:bg-slate-700 dark:hover:text-red-300"
									>
										<Trash2 className="h-4 w-4" />
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

export default DocumentManagement;
