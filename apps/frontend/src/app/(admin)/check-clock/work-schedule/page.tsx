'use client'

import WorkTypeBadge from "@/components/workTypeBadge";
import { WorkType } from "@/const/work";
import { DataTable, Column } from "@/components/dataTable";

import { useWorkSchedule, WorkSchedule as WorkScheduletype } from "../_hooks/useWorkSchedule";
import { Card, CardContent } from "@/components/ui/card";
import { PaginationComponent } from "@/components/pagination";
import { PageSizeComponent } from "@/components/pageSize";
import { Button } from "@/components/ui/button";
import { Edit, Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function WorkSchedule() {
    const {
            page,
            setPage,
            pageSize,
            setPageSize,
            workSchedules,
            totalRecords,
            totalPages,
        } = useWorkSchedule();

    const [dialogOpen, setDialogOpen] = useState(false);
    const [formData, setFormData] = useState<Partial<WorkScheduletype>>({});
    const [isEditing, setIsEditing] = useState(false);

    const handleChange = (key: keyof WorkScheduletype, value: string) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const handleOpenAdd = () => {
        setFormData({});
        setIsEditing(false);
        setDialogOpen(true);
    };

    const handleOpenEdit = (data: WorkScheduletype) => {
        setFormData(data);
        setIsEditing(true);
        setDialogOpen(true);
    };

    const handleSave = () => {
        // logika untuk simpan data
        console.log(isEditing ? "Update" : "Create", formData);
        setDialogOpen(false);
    };

    const columns : Column<WorkScheduletype>[] = [
        {
            header: "No.",
            accessorKey: (item) =>
                (page - 1) * pageSize + workSchedules.indexOf(item) + 1,
            className: "max-w-[80px]",
        },
        {
            header: "Nama",
            accessorKey: "nama",
            cell: (item) => (
                <div className="flex items-center gap-3">
                    <span>{item.nama}</span>
                </div>
            ),
        },
        {
            header: "Tipe Pekerjaan",
            accessorKey: "workType",
            cell: (item) => (
                <WorkTypeBadge workType={item.workType as WorkType} />
            ),
        },
        {
            header: "Check-in Start", 
            accessorKey: "checkInStart",
        },
        {
            header: "Check-in End",
            accessorKey: "checkInEnd",
        },
        {
            header: "Break Start",
            accessorKey: "breakStart",
        },
        {
            header: "Break End",
            accessorKey: "breakEnd",
        },
        {
            header: "Check-out Start",
            accessorKey: "checkOutStart",
        },
        {
            header: "Check-out End",
            accessorKey: "checkOutEnd",
        },
        {
            header: "Action",
            accessorKey: (item) => (
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        variant="outline"
                        className="h-9 px-3 bg-[#FFA500] text-white hover:bg-[#E69500] border-none hover:cursor-pointer"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEdit(item);
                        }}
                    >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                    </Button>
                </div>
            ),
        }
    ];

    return (
        <>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>{isEditing ? "Edit" : "Add"} Work Schedule</DialogTitle>
                        <DialogDescription>
                            {isEditing ? "Update existing schedule." : "Add new work schedule data."}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        {["nama", "workType", "checkInStart", "checkInEnd", "breakStart", "breakEnd", "checkOutStart", "checkOutEnd"].map((key) => (
                            <div key={key} className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor={key} className="text-right capitalize">
                                    {key.replace(/([A-Z])/g, " $1")}
                                </Label>
                                <Input
                                    id={key}
                                    value={formData[key as keyof WorkScheduletype] ?? ""}
                                    onChange={(e) =>
                                        handleChange(key as keyof WorkScheduletype, e.target.value)
                                    }
                                    className="col-span-3"
                                />
                            </div>
                        ))}
                    </div>
                    <DialogFooter>
                        <Button onClick={handleSave}>
                            {isEditing ? "Update" : "Save"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <Card className="border border-gray-100 dark:border-gray-800">
                <CardContent>
                    <header className="flex flex-col gap-4 mb-6">
                        <div className="flex flex-row flex-wrap justify-between items-center w-full">
                            <h2 className="text-xl font-semibold">
                                Work Schedule
                            </h2>
                            <div className="flex gap-2 flex-wrap">
                                <Button
                                    onClick={handleOpenAdd}
                                    className="gap-2 bg-[#6B9AC4] hover:bg-[#5A89B3]"
                                >
                                    <Plus className="h-4 w-4" />
                                    Add Data
                                </Button>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 md:w-[400px]">
                            <div className="relative flex-[1]">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <Input
                                    className="pl-10 w-full bg-white border-gray-200"
                                    placeholder="Search Employee"
                                />
                            </div>
                        </div>
                    </header>
                    <DataTable
                        columns={columns}
                        data={workSchedules}
                        page={page}
                        pageSize={pageSize}
                    />
                    <footer className="flex flex-col md:flex-row items-center justify-between mt-4 gap-4">
                        <PageSizeComponent
                            pageSize={pageSize}
                            setPageSize={setPageSize}
                            page={page}
                            setPage={setPage}
                            totalRecords={totalRecords}
                        />

                        <PaginationComponent
                            page={page}
                            setPage={setPage}
                            totalPages={totalPages}
                        />
                    </footer>
                </CardContent>
            </Card>
        </>
    )
}