import React from "react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export interface Column<T> {
	header: string;
	accessorKey: keyof T | ((item: T) => React.ReactNode);
	cell?: (item: T) => React.ReactNode;
	className?: string;
}

interface DataTableProps<T> {
	columns: Column<T>[];
	data: T[];
	page?: number;
	pageSize?: number;
	className?: string;
	rowClassName?: string;
	headerClassName?: string;
	cellClassName?: string;
	onRowClick?: (item: T) => void;
}

export function DataTable<T>({
	columns,
	data,
	page = 1,
	pageSize = 10,
	className,
	rowClassName,
	headerClassName,
	cellClassName,
	onRowClick,
}: DataTableProps<T>) {
	const paginatedData = pageSize
		? data.slice((page - 1) * pageSize, page * pageSize)
		: data;

	return (
		<div className="rounded-md border border-gray-100 dark:border-gray-800 overflow-auto">
			<Table
				className={cn(
					"border border-gray-100 dark:border-gray-800",
					className
				)}
			>
				<TableHeader>
					<TableRow
						className={cn(
							"border border-gray-100 dark:border-gray-800 hover:bg-transparent",
							headerClassName
						)}
					>
						{columns.map((column, index) => (
							<TableHead
								key={index}
								className={cn("text-center", column.className)}
							>
								{column.header}
							</TableHead>
						))}
					</TableRow>
				</TableHeader>
				<TableBody>
					{paginatedData.map((item, rowIndex) => (
						<TableRow
							key={rowIndex}
							className={cn(
								"data-[state=selected]:bg-muted border-b transition-colors hover:bg-transparent",
								onRowClick && "cursor-pointer",
								rowClassName
							)}
							onClick={() => onRowClick && onRowClick(item)}
						>
							{columns.map((column, colIndex) => (
								<TableCell
									key={colIndex}
									className={cn(
										"text-center",
										cellClassName,
										column.className
									)}
								>
									{column.cell
										? column.cell(item)
										: typeof column.accessorKey ===
										  "function"
										? column.accessorKey(item)
										: String(item[column.accessorKey])}
								</TableCell>
							))}
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
