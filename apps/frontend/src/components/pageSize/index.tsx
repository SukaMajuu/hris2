import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

interface PageSizeComponentProps {
	pageSize: number;
	setPageSize: (pageSize: number) => void;
	page: number;
	setPage: (page: number) => void;
	totalRecords: number;
}

export function PageSizeComponent({
	pageSize,
	setPageSize,
	page,
	setPage,
	totalRecords,
}: PageSizeComponentProps) {
	const handlePageSizeChange = (value: string) => {
		const newPageSize = Number(value);
		setPageSize(newPageSize);

		const newTotalPages = Math.ceil(totalRecords / newPageSize);
		if (page > newTotalPages) {
			setPage(1);
		}
	};

	return (
		<div className="flex items-center gap-2 w-full">
			<Select
				defaultValue={String(pageSize)}
				onValueChange={handlePageSizeChange}
			>
				<SelectTrigger className="w-[80px]">
					<SelectValue placeholder="10" />
				</SelectTrigger>
				<SelectContent>
					{["10", "20", "50", "100"].map((value) => (
						<SelectItem
							key={value}
							value={value}
							className="data-[state=checked]:bg-[#5A89B3] data-[state=checked]:text-white hover:!bg-[#5A89B3] hover:!text-white"
						>
							{value}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			<span className="text-sm text-gray-500">
				Showing {(page - 1) * pageSize + 1} to{" "}
				{Math.min(page * pageSize, totalRecords)} out of {totalRecords}{" "}
				records
			</span>
		</div>
	);
}
