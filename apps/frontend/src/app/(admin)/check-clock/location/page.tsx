"use client";

import React, {useMemo} from "react";
import {
	ColumnDef,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	PaginationState,
	useReactTable,
} from "@tanstack/react-table";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Card, CardContent} from "@/components/ui/card";
import {DataTable} from "@/components/dataTable";
import {PaginationComponent} from "@/components/pagination";
import {PageSizeComponent} from "@/components/pageSize";
import {useLocation} from "./_hooks/useLocation";
import {LocationForm} from "./_components/locationForm";
import {Edit, Filter, Plus, Search, Trash2} from "lucide-react";
import ConfirmationDelete from "./_components/confirmationDelete";

export default function LocationPage() {
    const {
        locations,
        dialogOpen,
        setDialogOpen,
        formData,
        setFormData,
        isEditing,
        isDeleteDialogOpen,
        locationToDelete,
        handleChange,
        handleMapPositionChange,
        handleOpenAddDialog,
        handleOpenEditDialog,
        handleSaveLocation,
        handleOpenDeleteDialog,
        handleCloseDeleteDialog,
        handleConfirmDelete,
    } = useLocation();

    const [locationNameFilter, setLocationNameFilter] = React.useState("");
    const [pagination, setPagination] = React.useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });

    const columns = useMemo<ColumnDef<typeof locations[number]>[]>(
        () => [
            {
                header: "No.",
                id: "no",
                cell: ({row, table}) => {
                    const {pageIndex, pageSize} = table.getState().pagination;
                    return pageIndex * pageSize + row.index + 1;
                },
                meta: {className: "max-w-[80px]"},
            },
            {
                header: "Location Name",
                accessorKey: "nama",
            },
            {
                header: "Address Details",
                accessorKey: "addressDetails"
            },
            {
                header: "Latitude",
                accessorKey: "latitude",
            },
            {
                header: "Longitude",
                accessorKey: "longitude",
            },
            {
                header: "Radius (m)",
                accessorKey: "radius",
            },
            {
                header: "Actions",
                id: "actions",
                cell: ({row}) => (
                    <div className="flex justify-center gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-9 px-3 bg-blue-500 text-white hover:bg-blue-600 border-none hover:cursor-pointer"
                            onClick={() => handleOpenEditDialog(row.original)}
                        >
                            <Edit className="h-4 w-4 mr-1"/>
                            Edit
                        </Button>
                        <Button
                            size="sm"
                            variant="destructive"
                            className="h-9 px-3 hover:cursor-pointer"
                            onClick={() => handleOpenDeleteDialog(row.original)}
                        >
                            <Trash2 className="h-4 w-4 mr-1"/>
                            Delete
                        </Button>
                    </div>
                ),
            },
        ],
        [handleOpenEditDialog, handleOpenDeleteDialog]
    );

    const table = useReactTable<typeof locations[number]>({
        data: locations,
        columns,
        state: {
            columnFilters: [{id: "nama", value: locationNameFilter}],
            pagination,
        },
        onColumnFiltersChange: (updater) => {
            const newFilters =
                typeof updater === "function"
                    ? updater(table.getState().columnFilters)
                    : updater;
            const nameFilterUpdate = newFilters.find((f) => f.id === "nama");
            setLocationNameFilter((nameFilterUpdate?.value as string) || "");
        },
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        autoResetPageIndex: false,
    });

    return (
        <div>
            <Card className="mb-6 border border-gray-100 dark:border-gray-800">
                <CardContent>
                    <header className="flex flex-col justify-between items-start gap-4 mb-6">
                        <div className="flex flex-row flex-wrap gap-4 justify-between items-center w-full">
                            <h2 className="text-xl font-semibold">
                                Daftar Lokasi
                            </h2>
                            <div className="flex gap-2 flex-wrap">
                                <Button
                                    onClick={handleOpenAddDialog}
                                    className="gap-2 bg-[#6B9AC4] hover:bg-[#5A89B3]"
                                >
                                    <Plus className="h-4 w-4"/>
                                    Add Data
                                </Button>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2 w-full md:w-[400px]">
                            <div className="relative flex-[1]">
                                <Search
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4"/>
                                <Input
                                    value={locationNameFilter ?? ""}
                                    onChange={(event) => {
                                        const newNameFilter =
                                            event.target.value;
                                        setLocationNameFilter(newNameFilter);
                                        table
                                            .getColumn("nama")
                                            ?.setFilterValue(newNameFilter);
                                    }}
                                    className="pl-10 w-full bg-white border-gray-200"
                                    placeholder="Cari Lokasi"
                                />
                            </div>
                            <Button
                                variant="outline"
                                className="gap-2 hover:bg-[#5A89B3] hover:text-white"
                                // onClick={ // Future filter logic }
                            >
                                <Filter className="h-4 w-4"/>
                                Filter
                            </Button>
                        </div>
                    </header>

                    <DataTable table={table}/>

                    <footer className="flex flex-col md:flex-row items-center justify-between mt-4 gap-4">
                        <PageSizeComponent table={table}/>
                        <PaginationComponent table={table}/>
                    </footer>
                </CardContent>
            </Card>
            <LocationForm
                dialogOpen={dialogOpen}
                setDialogOpen={setDialogOpen}
                isEditing={isEditing}
                formData={formData}
                handleChange={handleChange}
                setFormData={setFormData}
                handleSave={handleSaveLocation}
                onMapPositionChange={handleMapPositionChange}
            />
            <ConfirmationDelete
                isDeleteDialogOpen={isDeleteDialogOpen}
                handleCloseDeleteDialog={handleCloseDeleteDialog}
                handleConfirmDelete={handleConfirmDelete}
                locationToDelete={locationToDelete}
            />
        </div>
    );
}
