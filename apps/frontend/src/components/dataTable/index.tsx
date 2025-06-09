import React from "react";
import {
	Table as ShadcnTable,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
	flexRender,
	Table as TanStackTableType,
	Row as TanStackRow,
	Cell as TanStackCell,
} from "@tanstack/react-table";

export interface Column<T> {
	header: string;
	accessorKey: keyof T | ((item: T) => React.ReactNode);
	cell?: (item: T) => React.ReactNode;
	className?: string;
}

interface DataTableProps<TData> {
	table: TanStackTableType<TData>;
	containerClassName?: string;
	rowClassName?: string | ((row: TanStackRow<TData>) => string);
	headerClassName?: string;
	cellClassName?: string | ((cell: TanStackCell<TData, unknown>) => string);
	onRowClick?: (row: TanStackRow<TData>) => void;
}

export function DataTable<TData>({
	table,
	containerClassName,
	rowClassName,
	headerClassName,
	cellClassName,
	onRowClick,
}: DataTableProps<TData>) {
	return (
		<div
			className={cn(
				"scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 w-full overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900",
				containerClassName
			)}
		>
			<ShadcnTable className="w-full min-w-[800px] table-auto md:min-w-max">
				<TableHeader>
					{table.getHeaderGroups().map((headerGroup) => (
						<TableRow
							key={headerGroup.id}
							className={cn(
								"border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800",
								headerClassName
							)}
						>
							{headerGroup.headers.map((header) => {
								const columnMeta = header.column.columnDef
									.meta as { className?: string } | undefined;
								return (
									<TableHead
										key={header.id}
										className={cn(
											"h-12 px-2 py-3 text-center text-xs font-medium whitespace-nowrap text-slate-500 md:text-sm dark:text-slate-400",
											columnMeta?.className
										)}
										style={{
											width:
												header.getSize() !== 150
													? header.getSize()
													: undefined,
											minWidth: "80px",
										}}
									>
										{header.isPlaceholder
											? null
											: flexRender(
													header.column.columnDef
														.header,
													header.getContext()
											  )}
									</TableHead>
								);
							})}
						</TableRow>
					))}
				</TableHeader>
				<TableBody>
					{table.getRowModel().rows?.length ? (
						table.getRowModel().rows.map((row) => (
							<TableRow
								key={row.id}
								data-state={row.getIsSelected() && "selected"}
								onClick={() => onRowClick && onRowClick(row)}
								className={cn(
									"border-b border-slate-200 transition-colors hover:bg-slate-50/50 dark:border-slate-700 dark:hover:bg-slate-800/50",
									"data-[state=selected]:bg-slate-100 dark:data-[state=selected]:bg-slate-700",
									onRowClick && "cursor-pointer",
									typeof rowClassName === "function"
										? rowClassName(row)
										: rowClassName
								)}
							>
								{row.getVisibleCells().map((cell) => {
									const columnMeta = cell.column.columnDef
										.meta as
										| { className?: string }
										| undefined;
									return (
										<TableCell
											key={cell.id}
											className={cn(
												"px-1 py-2 text-center text-xs text-slate-700 md:px-2 md:py-3 md:text-sm dark:text-slate-300",
												typeof cellClassName ===
													"function"
													? cellClassName(cell)
													: cellClassName,
												columnMeta?.className
											)}
											style={{
												width:
													cell.column.getSize() !==
													150
														? cell.column.getSize()
														: undefined,
												minWidth: "80px",
											}}
										>
											<div className="max-w-full overflow-hidden text-ellipsis">
												{flexRender(
													cell.column.columnDef.cell,
													cell.getContext()
												)}
											</div>
										</TableCell>
									);
								})}
							</TableRow>
						))
					) : (
						<TableRow>
							<TableCell
								colSpan={table.getAllColumns().length}
								className="h-24 text-center text-xs text-slate-500 md:text-sm dark:text-slate-400"
							>
								No results.
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</ShadcnTable>
		</div>
	);
}
