import { useState } from "react";
// import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Filter, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";


export default function CheckClockApprovalTab() {

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
    );
}