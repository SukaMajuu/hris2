import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { LocationResponse } from "@/types/location";

// Component for the No. column
export const NoColumn = ({
	row,
	currentPage,
	pageSize,
}: {
	row: { index: number };
	currentPage: number;
	pageSize: number;
}) => (
	<div className="flex items-center justify-center text-center">
		{(currentPage - 1) * pageSize + row.index + 1}
	</div>
);

// Component for the Location Name column
export const NameColumn = ({
	row,
}: {
	row: { original: LocationResponse };
}) => (
	<div className="flex items-center justify-center">
		<div className="max-w-[120px] truncate text-center text-xs md:max-w-[150px] md:text-sm">
			{row.original.name}
		</div>
	</div>
);

// Component for the Address Details column
export const AddressColumn = ({
	row,
}: {
	row: { original: LocationResponse };
}) => (
	<div className="flex items-center justify-center">
		<div className="max-w-[150px] truncate text-center text-xs md:max-w-[200px] md:text-sm">
			{row.original.address_detail || "-"}
		</div>
	</div>
);

// Component for the Latitude column
export const LatitudeColumn = ({
	row,
}: {
	row: { original: LocationResponse };
}) => (
	<div className="flex items-center justify-center">
		<div className="max-w-[80px] truncate text-center text-xs md:max-w-[100px] md:text-sm">
			{row.original.latitude?.toFixed(6) || "-"}
		</div>
	</div>
);

// Component for the Longitude column
export const LongitudeColumn = ({
	row,
}: {
	row: { original: LocationResponse };
}) => (
	<div className="flex items-center justify-center">
		<div className="max-w-[80px] truncate text-center text-xs md:max-w-[100px] md:text-sm">
			{row.original.longitude?.toFixed(6) || "-"}
		</div>
	</div>
);

// Component for the Radius column
export const RadiusColumn = ({
	row,
}: {
	row: { original: LocationResponse };
}) => (
	<div className="flex items-center justify-center">
		<div className="max-w-[70px] truncate text-center text-xs md:max-w-[80px] md:text-sm">
			{row.original.radius_m || "-"}
		</div>
	</div>
);

// Component for the Actions column
export const ActionsColumn = ({
	row,
	onEdit,
	onDelete,
}: {
	row: { original: LocationResponse };
	onEdit: (data: LocationResponse) => void;
	onDelete: (data: LocationResponse) => void;
}) => (
	<div className="flex flex-col justify-center gap-1 md:flex-row">
		<Button
			size="sm"
			variant="default"
			className="h-7 w-full cursor-pointer bg-[#6B9AC4] px-1 text-xs hover:cursor-pointer hover:bg-[#5A89B3] md:h-8 md:w-auto md:px-2"
			onClick={() => onEdit(row.original)}
		>
			<Edit className="mr-0 h-3 w-3 md:mr-1" />
			<span className="hidden md:inline">Edit</span>
		</Button>
		<Button
			size="sm"
			variant="destructive"
			className="h-7 w-full cursor-pointer px-1 text-xs hover:cursor-pointer hover:bg-red-800 md:h-8 md:w-auto md:px-2"
			onClick={() => onDelete(row.original)}
		>
			<Trash2 className="mr-0 h-3 w-3 md:mr-1" />
			<span className="hidden md:inline">Delete</span>
		</Button>
	</div>
);

// Function to create the columns configuration
export const createLocationColumns = (
	currentPage: number,
	pageSize: number,
	onEdit: (data: LocationResponse) => void,
	onDelete: (data: LocationResponse) => void
): ColumnDef<LocationResponse>[] => [
	{
		header: "No.",
		id: "no",
		cell: ({ row }) => (
			<NoColumn row={row} currentPage={currentPage} pageSize={pageSize} />
		),
		meta: { className: "w-[50px] md:w-[80px] text-center" },
		enableSorting: false,
		enableColumnFilter: false,
	},
	{
		header: "Location Name",
		accessorKey: "name",
		cell: ({ row }) => <NameColumn row={row} />,
		meta: { className: "w-[120px] md:w-[150px] text-center" },
	},
	{
		header: "Address Details",
		accessorKey: "address_detail",
		cell: ({ row }) => <AddressColumn row={row} />,
		meta: { className: "w-[150px] md:w-[200px] text-center" },
	},
	{
		header: "Latitude",
		accessorKey: "latitude",
		cell: ({ row }) => <LatitudeColumn row={row} />,
		meta: { className: "w-[80px] md:w-[100px] text-center" },
	},
	{
		header: "Longitude",
		accessorKey: "longitude",
		cell: ({ row }) => <LongitudeColumn row={row} />,
		meta: { className: "w-[80px] md:w-[100px] text-center" },
	},
	{
		header: "Radius (m)",
		accessorKey: "radius_m",
		cell: ({ row }) => <RadiusColumn row={row} />,
		meta: { className: "w-[70px] md:w-[80px] text-center" },
	},
	{
		header: "Action",
		id: "actions",
		cell: ({ row }) => (
			<ActionsColumn row={row} onEdit={onEdit} onDelete={onDelete} />
		),
		meta: { className: "w-[120px] md:w-[180px] text-center" },
		enableSorting: false,
		enableColumnFilter: false,
	},
];
