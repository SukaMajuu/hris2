import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";

interface PaginationComponentProps {
	page: number;
	setPage: (page: number) => void;
	totalPages: number;
}

export function PaginationComponent({
	page,
	setPage,
	totalPages,
}: PaginationComponentProps) {
	const generatePaginationItems = () => {
		const items = [];
		const maxVisiblePages = 5;
		const ellipsisThreshold = 7;

		if (totalPages <= maxVisiblePages) {
			for (let i = 1; i <= totalPages; i++) {
				items.push(
					<PaginationItem key={i}>
						<PaginationLink
							isActive={page === i}
							onClick={() => setPage(i)}
							className={
								page === i
									? "bg-[#6B9AC4] text-white border-[#6B9AC4] hover:bg-[#5A89B3] hover:text-white hover:border-[#5A89B3]"
									: "hover:bg-[#5A89B3] hover:text-white hover:border-[#5A89B3]"
							}
						>
							{i}
						</PaginationLink>
					</PaginationItem>
				);
			}
		} else {
			items.push(
				<PaginationItem key={1}>
					<PaginationLink
						isActive={page === 1}
						onClick={() => setPage(1)}
						className={
							page === 1
								? "bg-[#6B9AC4] text-white border-[#6B9AC4] hover:bg-[#5A89B3] hover:text-white hover:border-[#5A89B3]"
								: "hover:bg-[#5A89B3] hover:text-white hover:border-[#5A89B3]"
						}
					>
						1
					</PaginationLink>
				</PaginationItem>
			);

			if (page > 3) {
				items.push(
					<PaginationItem key="ellipsis-1">
						<PaginationEllipsis />
					</PaginationItem>
				);
			}

			let startPage = Math.max(2, page - 1);
			let endPage = Math.min(totalPages - 1, page + 1);

			if (page <= 3) {
				startPage = 2;
				endPage = Math.min(totalPages - 1, ellipsisThreshold - 2);
			}

			if (page >= totalPages - 2) {
				startPage = Math.max(2, totalPages - (ellipsisThreshold - 2));
				endPage = totalPages - 1;
			}

			for (let i = startPage; i <= endPage; i++) {
				items.push(
					<PaginationItem key={i}>
						<PaginationLink
							isActive={page === i}
							onClick={() => setPage(i)}
							className={
								page === i
									? "bg-[#6B9AC4] text-white border-[#6B9AC4] hover:bg-[#5A89B3] hover:text-white hover:border-[#5A89B3]"
									: "hover:bg-[#5A89B3] hover:text-white hover:border-[#5A89B3]"
							}
						>
							{i}
						</PaginationLink>
					</PaginationItem>
				);
			}

			if (page < totalPages - 2) {
				items.push(
					<PaginationItem key="ellipsis-2">
						<PaginationEllipsis />
					</PaginationItem>
				);
			}

			items.push(
				<PaginationItem key={totalPages}>
					<PaginationLink
						isActive={page === totalPages}
						onClick={() => setPage(totalPages)}
						className={
							page === totalPages
								? "bg-[#6B9AC4] text-white border-[#6B9AC4] hover:bg-[#5A89B3] hover:text-white hover:border-[#5A89B3]"
								: "hover:bg-[#5A89B3] hover:text-white hover:border-[#5A89B3]"
						}
					>
						{totalPages}
					</PaginationLink>
				</PaginationItem>
			);
		}

		return items;
	};

	return (
		<Pagination>
			<PaginationContent className="flex items-center gap-2">
				<PaginationItem>
					<PaginationPrevious
						onClick={() => setPage(Math.max(page - 1, 1))}
						className={`hover:bg-[#5A89B3] hover:text-white hover:border-[#5A89B3] ${
							page === 1 ? "pointer-events-none opacity-50" : ""
						}`}
					/>
				</PaginationItem>

				{generatePaginationItems()}

				<PaginationItem>
					<PaginationNext
						onClick={() => setPage(Math.min(page + 1, totalPages))}
						className={`hover:bg-[#5A89B3] hover:text-white hover:border-[#5A89B3] ${
							page === totalPages
								? "pointer-events-none opacity-50"
								: ""
						}`}
					/>
				</PaginationItem>
			</PaginationContent>
		</Pagination>
	);
}
