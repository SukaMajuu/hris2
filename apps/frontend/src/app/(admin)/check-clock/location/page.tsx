"use client";

import React, { useMemo, useEffect } from "react";
import {
    ColumnDef,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    PaginationState,
    useReactTable,
} from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/dataTable";
import { PaginationComponent } from "@/components/pagination";
import { PageSizeComponent } from "@/components/pageSize";
import { useLocationOperations } from "./_hooks/useLocation";
import { LocationForm } from "./_components/locationForm";
import { Edit, Filter, Plus, Search, Trash2 } from "lucide-react";
import ConfirmationDelete from "./_components/confirmationDelete";

export default function LocationPage() {
    const [locationNameFilter, setLocationNameFilter] = React.useState("");
    const [pagination, setPagination] = React.useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });    // Use location operations with server-side pagination
    const {
        locations,
        pagination: serverPagination,
        isLoading,
        error,
        dialogOpen,
        setDialogOpen,
        formData,
        setFormData,
        isEditing, isDeleteDialogOpen,
        locationToDelete,
        isCreating,
        isUpdating,
        isDeleting,
        handleChange,
        handleMapPositionChange,
        handleOpenAddDialog,
        handleOpenEditDialog,
        handleSaveLocation,
        handleOpenDeleteDialog,
        handleCloseDeleteDialog,
        handleConfirmDelete,
    } = useLocationOperations(pagination.pageIndex + 1, pagination.pageSize);

    // Sync pagination state with server pagination
    useEffect(() => {
        if (serverPagination && (
            pagination.pageIndex !== (serverPagination.current_page || 1) - 1 ||
            pagination.pageSize !== (serverPagination.page_size || 10)
        )) {
            setPagination(prev => ({
                ...prev,
                pageIndex: (serverPagination.current_page || 1) - 1,
                pageSize: serverPagination.page_size || 10,
            }));
        }
    }, [serverPagination, pagination.pageIndex, pagination.pageSize]);

    const columns = useMemo<ColumnDef<typeof locations[number]>[]>(() => [
        {
            header: "No.",
            id: "no",
            cell: ({ row }) => {
                const currentPage = pagination.pageIndex + 1;
                const pageSize = pagination.pageSize;
                return (currentPage - 1) * pageSize + row.index + 1;
            },
            meta: { className: "max-w-[80px]" },
        },
        {
            header: "Location Name",
            accessorKey: "locationName",
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
            cell: ({ row }) => (
                <div className="flex justify-center gap-2">
                    <Button
                        size="sm"
                        variant="outline"
                        className="h-9 px-3 bg-blue-500 text-white hover:bg-blue-600 border-none hover:cursor-pointer"
                        onClick={() => handleOpenEditDialog(row.original)}
                    >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                    </Button>
                    <Button
                        size="sm"
                        variant="destructive"
                        className="h-9 px-3 hover:cursor-pointer"
                        onClick={() => handleOpenDeleteDialog(row.original)}
                    >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                    </Button>
                </div>),
        },
    ],
        [handleOpenEditDialog, handleOpenDeleteDialog, pagination.pageIndex, pagination.pageSize]
    ); const table = useReactTable<typeof locations[number]>({
        data: locations,
        columns,
        state: {
            columnFilters: [{ id: "locationName", value: locationNameFilter }],
            pagination,
        },
        onColumnFiltersChange: (updater) => {
            const newFilters =
                typeof updater === "function"
                    ? updater(table.getState().columnFilters)
                    : updater;
            const nameFilterUpdate = newFilters.find((f) => f.id === "locationName");
            setLocationNameFilter((nameFilterUpdate?.value as string) || "");
        },
        onPaginationChange: (updater) => {
            const newPagination = typeof updater === "function"
                ? updater(pagination)
                : updater;
            setPagination(newPagination);
        },
        pageCount: serverPagination?.total_pages || 0,
        manualPagination: true,
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
                                Location
                            </h2>
                            <div className="flex gap-2 flex-wrap">
                                <Button
                                    onClick={handleOpenAddDialog}
                                    className="gap-2 bg-[#6B9AC4] hover:bg-[#5A89B3]"
                                >
                                    <Plus className="h-4 w-4" />
                                    Add Data
                                </Button>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2 w-full md:w-[400px]">
                            <div className="relative flex-[1]">
                                <Search
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <Input
                                    value={locationNameFilter ?? ""}
                                    onChange={(event) => {
                                        const newNameFilter =
                                            event.target.value;
                                        setLocationNameFilter(newNameFilter);
                                        table
                                            .getColumn("locationName")
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
                                <Filter className="h-4 w-4" />
                                Filter
                            </Button>
                        </div>
                    </header>

                    {isLoading ? (
                        <div className="flex justify-center items-center py-8">
                            <div className="text-gray-500">Loading locations...</div>
                        </div>
                    ) : error ? (
                        <div className="flex justify-center items-center py-8">
                            <div className="text-red-500">Error loading locations: {error.message}</div>
                        </div>
                    ) : (
                        <DataTable table={table} />
                    )}

                    <footer className="flex flex-col md:flex-row items-center justify-between mt-4 gap-4">
                        <PageSizeComponent table={table} />
                        <PaginationComponent table={table} />
                    </footer>
                </CardContent>
            </Card>            <LocationForm
                dialogOpen={dialogOpen}
                setDialogOpenAction={setDialogOpen}
                isEditing={isEditing}
                formData={formData}
                handleChangeAction={handleChange}
                setFormDataAction={setFormData}
                handleSaveAction={handleSaveLocation}
                onMapPositionChangeAction={handleMapPositionChange}
                isLoading={isCreating || isUpdating}
            />            <ConfirmationDelete
                isDeleteDialogOpen={isDeleteDialogOpen}
                handleCloseDeleteDialog={handleCloseDeleteDialog}
                handleConfirmDelete={handleConfirmDelete}
                locationToDelete={locationToDelete}
                isDeleting={isDeleting}
            />
        </div>
    );
}
