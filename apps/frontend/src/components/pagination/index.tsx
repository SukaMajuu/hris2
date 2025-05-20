import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import { Table as TanStackTableType } from "@tanstack/react-table";

interface PaginationComponentProps<TData> {
	table: TanStackTableType<TData>;
}

export function PaginationComponent<TData>({
	table,
}: PaginationComponentProps<TData>) {
	const pageIndex = table.getState().pagination.pageIndex;
	const totalPages = table.getPageCount();

	const generatePaginationItems = () => {
		const items = [];
		const maxVisiblePages = 5;
		const edgePageCount = 1;

		const createPageLink = (pageNumber: number) => {
			const zeroIndexedPageNumber = pageNumber - 1;
			return (
				<PaginationItem key={pageNumber}>
					<PaginationLink
						isActive={pageIndex === zeroIndexedPageNumber}
						onClick={() =>
							table.setPageIndex(zeroIndexedPageNumber)
						}
						className={cn(
							"h-9 w-9 p-0 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:cursor-pointer",
							pageIndex === zeroIndexedPageNumber
								? "bg-primary text-white dark:text-slate-100 border-primary dark:border-primary hover:bg-primary/90 hover:border-primary/90"
								: "hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-slate-400 dark:hover:border-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
						)}
					>
						{pageNumber}
					</PaginationLink>
				</PaginationItem>
			);
		};

		if (totalPages <= 0) return [];

		if (totalPages <= maxVisiblePages + 2 * edgePageCount) {
			for (let i = 1; i <= totalPages; i++) {
				items.push(createPageLink(i));
			}
		} else {
			for (let i = 1; i <= edgePageCount; i++) {
				items.push(createPageLink(i));
			}

			let startRange = Math.max(
				edgePageCount + 1,
				pageIndex - Math.floor((maxVisiblePages - 1) / 2) + 1
			);
			let endRange = Math.min(
				totalPages - edgePageCount,
				pageIndex + Math.floor(maxVisiblePages / 2) + 1
			);

			if (endRange - startRange + 1 < maxVisiblePages) {
				if (pageIndex + 1 < totalPages / 2) {
					endRange = Math.min(
						totalPages - edgePageCount,
						startRange + maxVisiblePages - 1
					);
				} else {
					startRange = Math.max(
						edgePageCount + 1,
						endRange - maxVisiblePages + 1
					);
				}
			}

			startRange = Math.max(1, startRange);
			endRange = Math.min(totalPages, endRange);

			if (startRange > edgePageCount + 1) {
				items.push(
					<PaginationItem key="ellipsis-start">
						<PaginationEllipsis className="text-slate-500 dark:text-slate-400" />
					</PaginationItem>
				);
			}

			for (let i = startRange; i <= endRange; i++) {
				if (i > edgePageCount && i <= totalPages - edgePageCount) {
					items.push(createPageLink(i));
				}
			}

			if (endRange < totalPages - edgePageCount) {
				items.push(
					<PaginationItem key="ellipsis-end">
						<PaginationEllipsis className="text-slate-500 dark:text-slate-400" />
					</PaginationItem>
				);
			}

			for (
				let i = Math.max(totalPages - edgePageCount + 1, endRange + 1);
				i <= totalPages;
				i++
			) {
				items.push(createPageLink(i));
			}
		}

		const uniqueItems = [];
		const keys = new Set();
		for (const item of items) {
			if (item && item.key && !keys.has(item.key)) {
				uniqueItems.push(item);
				keys.add(item.key);
			} else if (item && !item.key) {
				uniqueItems.push(item);
			}
		}
		return uniqueItems;
	};

	if (totalPages <= 1) return null;

	return (
		<Pagination>
			<PaginationContent className="flex items-center gap-1 sm:gap-2">
				<PaginationItem>
					<PaginationPrevious
						onClick={() => table.previousPage()}
						className={cn(
							"h-9 p-0 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300",
							"hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-slate-400 dark:hover:border-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:cursor-pointer",
							!table.getCanPreviousPage()
								? "pointer-events-none opacity-50"
								: ""
						)}
					/>
				</PaginationItem>

				{generatePaginationItems()}

				<PaginationItem>
					<PaginationNext
						onClick={() => table.nextPage()}
						className={cn(
							"h-9 p-0 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300",
							"hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-slate-400 dark:hover:border-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:cursor-pointer",
							!table.getCanNextPage()
								? "pointer-events-none opacity-50"
								: ""
						)}
					/>
				</PaginationItem>
			</PaginationContent>
		</Pagination>
	);
}
