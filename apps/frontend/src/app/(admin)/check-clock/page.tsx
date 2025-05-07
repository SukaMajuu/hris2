"use client";

import { useState } from "react";
import {
    Search,
    Filter,
    Edit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export default function CheckClockPage() {
    const [page, setPage] = useState(2);
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [employees, setEmployees] = useState(
        [...Array(100)].map((_, index) => ({
            id: index + 1,
            nama: "Sarah Connor",
            posisi: "CFO",
            tipePekerjaan: "WFO",
            checkIn: "07:00-08:00",
            checkOut: "17:00=18:00",
        }))
    );

    const [approvalData, setApprovalData] = useState([
        {
            id: 1,
            name: "D'Isiah T. Billings-Clyde",
            type: "WFO",
            approved: true,
            status: "Waiting Approval"
        },
        {
            id: 2,
            name: "D'Jasper Probincrux III",
            type: "WFO",
            approved: true,
            status: "Sick Leave"
        },
        {
            id: 3,
            name: "Leoz Maxwell Jilliums",
            type: "WFO",
            approved: true,
            status: "Annual Leave"
        },
        {
            id: 4,
            name: "Javaris Jamar Javarison-Lamar",
            type: "WFO",
            approved: false,
            status: "Annual Leave"
        },
        {
            id: 5,
            name: "Davoin Shower-Handel",
            type: "WFO",
            approved: true,
            status: "Waiting Approval"
        },
        {
            id: 6,
            name: "Hingle McCringleberry",
            type: "WFO",
            approved: false,
            status: "Sick Leave"
        }
    ]);

    const totalRecords = employees.length;
    const totalPages = Math.ceil(totalRecords / pageSize);

    const startRecord = (currentPage - 1) * pageSize + 1;
    const endRecord = Math.min(currentPage * pageSize, totalRecords);

    const paginationRange = Array.from(
        { length: totalPages },
        (_, i) => i + 1
    );

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    const handleViewDetails = (id: number) => {
        console.log("View details for ID:", id);
    };

    return (
        <div className="p-0">
            <div>
                <Tabs defaultValue="check-clock-employee" className="w-full mb-6">
                    {/* Tabs List */}
                    <TabsList className="mb-2 flex justify-start w-full rounded-md bg-white min-h-16 px-3 py-2">
                        <TabsTrigger
                            value="check-clock-employee"
                            className="px-6 py-3 text-sm font-medium text-gray-700 rounded-md focus:outline-none data-[state=active]:bg-secondary data-[state=active]:text-white max-w-[200px] whitespace-nowrap"
                        >
                            Check-Clock Employee
                        </TabsTrigger>
                        <TabsTrigger
                            value="check-clock-overview"
                            className="px-6 py-3 text-sm font-medium text-gray-700 rounded-md focus:outline-none data-[state=active]:bg-secondary data-[state=active]:text-white max-w-[200px] whitespace-nowrap"
                        >
                            Check-Clock Overview
                        </TabsTrigger>
                        <TabsTrigger
                            value="check-clock-approval"
                            className="px-6 py-3 text-sm font-medium text-gray-700 rounded-md focus:outline-none data-[state=active]:bg-secondary data-[state=active]:text-white max-w-[200px] whitespace-nowrap"
                        >
                            Check-Clock Approval
                        </TabsTrigger>
                    </TabsList>

                    {/* Tabs Content */}
                    <TabsContent value="check-clock-employee">
                        <Card className="mb-6 border border-gray-100 dark:border-gray-800">
                            <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                                    <h2 className="text-xl font-semibold">
                                        Check-Clock Employee
                                    </h2>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <Button
                                            variant="outline"
                                            className="gap-2 hover:bg-[#5A89B3]"
                                        >
                                            <Filter className="h-4 w-4" />
                                            Filter
                                        </Button>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                        <Input
                                            className="pl-10 w-full bg-white border-gray-200"
                                            placeholder="Search Employee"
                                        />
                                    </div>
                                </div>

                                <div className="rounded-md border border-gray-100 dark:border-gray-800 overflow-auto">
                                    <Table className="border border-gray-100 dark:border-gray-800">
                                        <TableHeader>
                                            <TableRow className="border border-gray-100 dark:border-gray-800">
                                                <TableHead className="max-w-[80px] text-center">
                                                    No.
                                                </TableHead>
                                                <TableHead>Nama</TableHead>
                                                <TableHead>Posisi</TableHead>
                                                <TableHead>Tipe Pekerjaan</TableHead>
                                                <TableHead>Check-In</TableHead>
                                                <TableHead>Check-Out</TableHead>
                                                <TableHead>Action</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {employees
                                                .slice(
                                                    (page - 1) * pageSize,
                                                    page * pageSize
                                                )
                                                .map((employee, index) => (
                                                    <TableRow key={employee.id}>
                                                        <TableCell className="text-center">
                                                            {(page - 1) * pageSize +
                                                                index +
                                                                1}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-3">
                                                                <span>{employee.nama}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge className="bg-pink-100 text-pink-800 hover:bg-pink-100">
                                                                {employee.posisi}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            {employee.tipePekerjaan}
                                                        </TableCell>
                                                        <TableCell>
                                                            {employee.checkIn}
                                                        </TableCell>
                                                        <TableCell>
                                                            {employee.checkOut}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex gap-2">
                                                                {/* <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="h-9 px-3 bg-[#6B9AC4] text-white hover:bg-[#5A89B3] border-none"
                                                                >
                                                                    <Detail className="h-4 w-4 mr-1" />
                                                                    Detail
                                                                </Button> */}
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="h-9 px-3 bg-[#FFA500] text-white hover:bg-[#E69500] border-none"
                                                                >
                                                                    <Edit className="h-4 w-4 mr-1" />
                                                                    Edit
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                <div className="flex flex-col md:flex-row items-center justify-between mt-4 gap-4">
                                    <div className="flex items-center gap-2">
                                        <Select
                                            defaultValue={String(pageSize)}
                                            onValueChange={(value) => {
                                                const newPageSize = Number(value);
                                                setPageSize(newPageSize);

                                                const newTotalPages = Math.ceil(
                                                    totalRecords / newPageSize
                                                );
                                                if (page > newTotalPages) {
                                                    setPage(1);
                                                }
                                            }}
                                        >
                                            <SelectTrigger className="w-[70px]">
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
                                            {Math.min(page * pageSize, totalRecords)} out of{" "}
                                            {totalRecords} records
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8 hover:bg-[#5A89B3] hover:text-white"
                                            onClick={() =>
                                                setPage((prev) => Math.max(prev - 1, 1))
                                            }
                                            disabled={page === 1}
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="24"
                                                height="24"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                className="h-4 w-4"
                                            >
                                                <path d="m15 18-6-6 6-6"></path>
                                            </svg>
                                        </Button>

                                        {(() => {
                                            let startPage = Math.max(1, page - 1);
                                            const endPage = Math.min(
                                                totalPages,
                                                startPage + 2
                                            );

                                            if (endPage - startPage < 2) {
                                                startPage = Math.max(1, endPage - 2);
                                            }

                                            return Array.from(
                                                { length: endPage - startPage + 1 },
                                                (_, i) => {
                                                    const pageNumber = startPage + i;
                                                    return (
                                                        <Button
                                                            key={pageNumber}
                                                            variant={
                                                                page === pageNumber
                                                                    ? "default"
                                                                    : "outline"
                                                            }
                                                            size="icon"
                                                            className={`h-8 w-8 ${page === pageNumber
                                                                    ? "bg-[#6B9AC4] text-white"
                                                                    : ""
                                                                } hover:bg-[#5A89B3] hover:text-white`}
                                                            onClick={() =>
                                                                setPage(pageNumber)
                                                            }
                                                        >
                                                            {pageNumber}
                                                        </Button>
                                                    );
                                                }
                                            );
                                        })()}

                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8 hover:bg-[#5A89B3] hover:text-white"
                                            onClick={() =>
                                                setPage((prev) =>
                                                    Math.min(prev + 1, totalPages)
                                                )
                                            }
                                            disabled={page === totalPages}
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="24"
                                                height="24"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                className="h-4 w-4"
                                            >
                                                <path d="m9 18 6-6-6-6"></path>
                                            </svg>
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="check-clock-overview">
                        <Card className="mb-6 border border-gray-100 dark:border-gray-800">
                            <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                                    <h2 className="text-xl font-semibold">
                                        Check-Clock Employee
                                    </h2>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <Button
                                            variant="outline"
                                            className="gap-2 hover:bg-[#5A89B3]"
                                        >
                                            <Filter className="h-4 w-4" />
                                            Filter
                                        </Button>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                        <Input
                                            className="pl-10 w-full bg-white border-gray-200"
                                            placeholder="Search Employee"
                                        />
                                    </div>
                                </div>

                                <div className="rounded-md border border-gray-100 dark:border-gray-800 overflow-auto">
                                    <Table className="border border-gray-100 dark:border-gray-800">
                                        <TableHeader>
                                            <TableRow className="border border-gray-100 dark:border-gray-800">
                                                <TableHead className="w-[80px]">
                                                    No.
                                                </TableHead>
                                                <TableHead>Nama</TableHead>
                                                <TableHead>Posisi</TableHead>
                                                <TableHead>Tipe Pekerjaan</TableHead>
                                                <TableHead>Check-In</TableHead>
                                                <TableHead>Check-Out</TableHead>
                                                <TableHead>Action</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {employees
                                                .slice(
                                                    (page - 1) * pageSize,
                                                    page * pageSize
                                                )
                                                .map((employee, index) => (
                                                    <TableRow key={employee.id}>
                                                        <TableCell>
                                                            {(page - 1) * pageSize +
                                                                index +
                                                                1}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-3">
                                                                <span>{employee.nama}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge className="bg-pink-100 text-pink-800 hover:bg-pink-100">
                                                                {employee.posisi}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            {employee.tipePekerjaan}
                                                        </TableCell>
                                                        <TableCell>
                                                            {employee.checkIn}
                                                        </TableCell>
                                                        <TableCell>
                                                            {employee.checkOut}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex gap-2">
                                                                {/* <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="h-9 px-3 bg-[#6B9AC4] text-white hover:bg-[#5A89B3] border-none"
                                                                >
                                                                    <Detail className="h-4 w-4 mr-1" />
                                                                    Detail
                                                                </Button> */}
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="h-9 px-3 bg-[#FFA500] text-white hover:bg-[#E69500] border-none"
                                                                >
                                                                    <Edit className="h-4 w-4 mr-1" />
                                                                    Edit
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                <div className="flex flex-col md:flex-row items-center justify-between mt-4 gap-4">
                                    <div className="flex items-center gap-2">
                                        <Select
                                            defaultValue={String(pageSize)}
                                            onValueChange={(value) => {
                                                const newPageSize = Number(value);
                                                setPageSize(newPageSize);

                                                const newTotalPages = Math.ceil(
                                                    totalRecords / newPageSize
                                                );
                                                if (page > newTotalPages) {
                                                    setPage(1);
                                                }
                                            }}
                                        >
                                            <SelectTrigger className="w-[70px]">
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
                                            {Math.min(page * pageSize, totalRecords)} out of{" "}
                                            {totalRecords} records
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8 hover:bg-[#5A89B3] hover:text-white"
                                            onClick={() =>
                                                setPage((prev) => Math.max(prev - 1, 1))
                                            }
                                            disabled={page === 1}
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="24"
                                                height="24"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                className="h-4 w-4"
                                            >
                                                <path d="m15 18-6-6 6-6"></path>
                                            </svg>
                                        </Button>

                                        {(() => {
                                            let startPage = Math.max(1, page - 1);
                                            const endPage = Math.min(
                                                totalPages,
                                                startPage + 2
                                            );

                                            if (endPage - startPage < 2) {
                                                startPage = Math.max(1, endPage - 2);
                                            }

                                            return Array.from(
                                                { length: endPage - startPage + 1 },
                                                (_, i) => {
                                                    const pageNumber = startPage + i;
                                                    return (
                                                        <Button
                                                            key={pageNumber}
                                                            variant={
                                                                page === pageNumber
                                                                    ? "default"
                                                                    : "outline"
                                                            }
                                                            size="icon"
                                                            className={`h-8 w-8 ${page === pageNumber
                                                                    ? "bg-[#6B9AC4] text-white"
                                                                    : ""
                                                                } hover:bg-[#5A89B3] hover:text-white`}
                                                            onClick={() =>
                                                                setPage(pageNumber)
                                                            }
                                                        >
                                                            {pageNumber}
                                                        </Button>
                                                    );
                                                }
                                            );
                                        })()}

                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8 hover:bg-[#5A89B3] hover:text-white"
                                            onClick={() =>
                                                setPage((prev) =>
                                                    Math.min(prev + 1, totalPages)
                                                )
                                            }
                                            disabled={page === totalPages}
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="24"
                                                height="24"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                className="h-4 w-4"
                                            >
                                                <path d="m9 18 6-6-6-6"></path>
                                            </svg>
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="check-clock-approval">
                        <Card className="mb-6 border border-gray-100 dark:border-gray-800">
                            <CardContent className="p-6">
                                {/* Header */}
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                                    <h2 className="text-xl font-semibold">Check-Clock Approval</h2>
                                </div>

                                {/* Search */}
                                <div className="mb-6">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                        <Input
                                            className="pl-10 w-full bg-white border-gray-200"
                                            placeholder="Search Check-clock"
                                        />
                                    </div>
                                </div>

                                {/* Table */}
                                <div className="rounded-md border border-gray-100 dark:border-gray-800 overflow-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-[80px]">No.</TableHead>
                                                <TableHead>Nama</TableHead>
                                                <TableHead>Tipe Pekerjaan</TableHead>
                                                <TableHead>Approve</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Details</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {approvalData.map((item, index) => (
                                                <TableRow key={item.id}>
                                                    <TableCell>{index + 1}</TableCell>
                                                    <TableCell>{item.name}</TableCell>
                                                    <TableCell>{item.type}</TableCell>
                                                    <TableCell>
                                                        <div className={cn(
                                                            "w-6 h-6 rounded-sm flex items-center justify-center",
                                                            item.approved 
                                                                ? "bg-green-500 text-white" 
                                                                : "bg-red-500 text-white"
                                                        )}>
                                                            {item.approved ? "✓" : "✕"}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge 
                                                            variant="outline"
                                                            className={cn(
                                                                item.status === "Waiting Approval"
                                                                    ? "bg-yellow-400 text-black hover:bg-yellow-400"
                                                                    : "bg-gray-600 text-white hover:bg-gray-600"
                                                            )}
                                                        >
                                                            {item.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            size="sm"
                                                            variant="default"
                                                            className="bg-blue-500 hover:bg-blue-600"
                                                            onClick={() => handleViewDetails(item.id)}
                                                        >
                                                            View
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* Pagination */}
                                <div className="flex flex-col md:flex-row items-center justify-between mt-4 gap-4">
                                    <div className="flex items-center gap-2">
                                        <Select
                                            defaultValue="10"
                                            onValueChange={(value) => setPageSize(Number(value))}
                                        >
                                            <SelectTrigger className="w-[70px]">
                                                <SelectValue placeholder="10" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {["10", "20", "50", "100"].map((value) => (
                                                    <SelectItem 
                                                        key={value} 
                                                        value={value}
                                                        className="data-[state=checked]:bg-[#5A89B3] data-[state=checked]:text-white"
                                                    >
                                                        {value}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <span className="text-sm text-gray-500">
                                            Showing {startRecord} to {endRecord} out of {totalRecords} records
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                        >
                                            ◀
                                        </Button>
                                        
                                        {paginationRange.map((pageNumber) => (
                                            <Button
                                                key={pageNumber}
                                                variant={currentPage === pageNumber ? "default" : "outline"}
                                                size="icon"
                                                className={cn(
                                                    "h-8 w-8",
                                                    currentPage === pageNumber && "bg-blue-500 text-white"
                                                )}
                                                onClick={() => handlePageChange(pageNumber)}
                                            >
                                                {pageNumber}
                                            </Button>
                                        ))}

                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                        >
                                            ▶
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}