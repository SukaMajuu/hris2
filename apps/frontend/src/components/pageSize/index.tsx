import { Table as TanStackTableType } from "@tanstack/react-table";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

interface PageSizeComponentProps<TData> {
	table: TanStackTableType<TData>;
	pageSizeOptions?: number[];
	totalRecords?: number;
}

const PageSizeComponent = <TData,>({
	table,
	pageSizeOptions = [10, 20, 30, 50, 100],
	totalRecords,
}: PageSizeComponentProps<TData>) => {
	const { pageIndex, pageSize } = table.getState().pagination;

	const actualTotalRecords =
		totalRecords ?? table.getFilteredRowModel().rows.length;
	const currentPageRows = table.getRowModel().rows.length;

	const handlePageSizeChange = (value: string) => {
		table.setPageSize(Number(value));
	};

	const firstRecordOnPage =
		currentPageRows > 0 ? pageIndex * pageSize + 1 : 0;
	const lastRecordOnPage =
		firstRecordOnPage > 0 ? firstRecordOnPage + currentPageRows - 1 : 0;

	return (
		<div className="flex w-full items-center gap-3 sm:w-auto">
			<span className="hidden text-sm text-slate-600 sm:inline dark:text-slate-400">
				Rows
			</span>
			<Select
				value={String(pageSize)}
				onValueChange={handlePageSizeChange}
			>
				<SelectTrigger className="h-9 w-[80px] rounded-md border-slate-300 bg-white text-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300">
					<SelectValue placeholder={String(pageSize)} />
				</SelectTrigger>
				<SelectContent className="rounded-md border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800">
					{pageSizeOptions.map((value) => (
						<SelectItem
							key={value}
							value={String(value)}
							className="cursor-pointer text-slate-700 hover:!bg-[#5A89B3] hover:!text-white focus:bg-[#5A89B3]/90 focus:text-white data-[state=checked]:bg-[#6B9AC4] data-[state=checked]:text-white dark:text-slate-300 dark:hover:!text-slate-100 dark:focus:text-slate-100 dark:data-[state=checked]:text-slate-100"
						>
							{value}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			<span className="flex-grow text-right text-sm text-slate-600 sm:text-left dark:text-slate-400">
				{actualTotalRecords > 0 && currentPageRows > 0
					? `Showing ${firstRecordOnPage} to ${lastRecordOnPage} of ${actualTotalRecords} Records`
					: "No records"}
			</span>
		</div>
	);
};

export { PageSizeComponent };
