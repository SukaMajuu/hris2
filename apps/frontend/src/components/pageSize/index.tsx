import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Table as TanStackTableType } from "@tanstack/react-table";

interface PageSizeComponentProps<TData> {
	table: TanStackTableType<TData>;
	pageSizeOptions?: number[];
}

export function PageSizeComponent<TData>({
	table,
	pageSizeOptions = [10, 20, 30, 50, 100],
}: PageSizeComponentProps<TData>) {
	const { pageIndex, pageSize } = table.getState().pagination;
	const totalRecords = table.getFilteredRowModel().rows.length;

	const handlePageSizeChange = (value: string) => {
		table.setPageSize(Number(value));
	};

	const firstRecordOnPage = pageIndex * pageSize + 1;
	const lastRecordOnPage = Math.min((pageIndex + 1) * pageSize, totalRecords);

	return (
		<div className="flex items-center gap-3 w-full sm:w-auto">
			<span className="text-sm text-slate-600 dark:text-slate-400 hidden sm:inline">
				Rows
			</span>
			<Select
				value={String(pageSize)}
				onValueChange={handlePageSizeChange}
			>
				<SelectTrigger className="w-[80px] h-9 rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
					<SelectValue placeholder={String(pageSize)} />
				</SelectTrigger>
				<SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-md shadow-lg">
					{pageSizeOptions.map((value) => (
						<SelectItem
							key={value}
							value={String(value)}
							className="cursor-pointer text-slate-700 dark:text-slate-300 data-[state=checked]:bg-[#6B9AC4] data-[state=checked]:text-white dark:data-[state=checked]:text-slate-100 hover:!bg-[#5A89B3] hover:!text-white dark:hover:!text-slate-100 focus:bg-[#5A89B3]/90 focus:text-white dark:focus:text-slate-100"
						>
							{value}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			<span className="text-sm text-slate-600 dark:text-slate-400 flex-grow text-right sm:text-left">
				{totalRecords > 0
					? `Showing ${firstRecordOnPage} to ${lastRecordOnPage} of ${totalRecords} Records`
					: "No records"}
			</span>
		</div>
	);
}
