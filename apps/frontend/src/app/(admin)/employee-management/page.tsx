"use client"

import { useState } from "react"
import { Search, Filter, FileText, Upload, Plus, BookUser, Trash2Icon} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

export default function EmployeeManagementPage() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [employees, setEmployees] = useState(
    [...Array(100)].map((_, index) => ({
      id: index + 1,
      name: "Sarah Connor",
      gender: "Female",
      phone: "+1234567890",
      branch: "HQ Jakarta",
      position: "CEO",
      grade: "L8",
    })),
  )

  const totalRecords = employees.length
  const totalPages = Math.ceil(totalRecords / pageSize)

  const generatePaginationItems = () => {
    const items = []
    const maxVisiblePages = 5
    const ellipsisThreshold = 7

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
          </PaginationItem>,
        )
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
        </PaginationItem>,
      )

      if (page > 3) {
        items.push(
          <PaginationItem key="ellipsis-1">
            <PaginationEllipsis />
          </PaginationItem>,
        )
      }

      let startPage = Math.max(2, page - 1)
      let endPage = Math.min(totalPages - 1, page + 1)

      if (page <= 3) {
        startPage = 2
        endPage = Math.min(totalPages - 1, ellipsisThreshold - 2)
      }

      if (page >= totalPages - 2) {
        startPage = Math.max(2, totalPages - (ellipsisThreshold - 2))
        endPage = totalPages - 1
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
          </PaginationItem>,
        )
      }

      if (page < totalPages - 2) {
        items.push(
          <PaginationItem key="ellipsis-2">
            <PaginationEllipsis />
          </PaginationItem>,
        )
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
        </PaginationItem>,
      )
    }

    return items
  }

  return (
    <div className="p-0">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-6">
        <Card className="border border-gray-100 dark:border-gray-800">
          <CardHeader className="pb-2">
            <div className="text-sm text-gray-500">Period</div>
          </CardHeader>
          <CardContent>
            <CardTitle className="text-xl font-bold">April 2025</CardTitle>
          </CardContent>
        </Card>
        <Card className="border border-gray-100 dark:border-gray-800">
          <CardHeader className="pb-2">
            <div className="text-sm text-gray-500">Total Employee</div>
          </CardHeader>
          <CardContent>
            <CardTitle className="text-xl font-bold">208</CardTitle>
          </CardContent>
        </Card>
        <Card className="border border-gray-100 dark:border-gray-800">
          <CardHeader className="pb-2">
            <div className="text-sm text-gray-500">Total New Hire</div>
          </CardHeader>
          <CardContent>
            <CardTitle className="text-xl font-bold">20</CardTitle>
          </CardContent>
        </Card>
        <Card className="border border-gray-100 dark:border-gray-800">
          <CardHeader className="pb-2">
            <div className="text-sm text-gray-500">Full Time Employee</div>
          </CardHeader>
          <CardContent>
            <CardTitle className="text-xl font-bold">20</CardTitle>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6 border border-gray-100 dark:border-gray-800">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <h2 className="text-xl font-semibold">All Employees Information</h2>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="outline" className="gap-2 hover:bg-[#5A89B3] hover:text-white">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
              <Button variant="outline" className="gap-2 hover:bg-[#5A89B3] hover:text-white">
                <FileText className="h-4 w-4" />
                Export
              </Button>
              <Button variant="outline" className="gap-2 hover:bg-[#5A89B3] hover:text-white">
                <Upload className="h-4 w-4" />
                Import
              </Button>
              <Button className="gap-2 bg-[#6B9AC4] hover:bg-[#5A89B3]">
                <Plus className="h-4 w-4" />
                Add Data
              </Button>
            </div>
          </div>

          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input className="pl-10 w-full bg-white border-gray-200" placeholder="Search Employee" />
            </div>
          </div>

          <div className="rounded-md border border-gray-100 dark:border-gray-800 overflow-auto">
            <Table className="border border-gray-100 dark:border-gray-800">
              <TableHeader>
                <TableRow className="border border-gray-100 dark:border-gray-800">
                  <TableHead className="w-[80px]">No.</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.slice((page - 1) * pageSize, page * pageSize).map((employee, index) => (
                  <TableRow key={employee.id}>
                    <TableCell>{(page - 1) * pageSize + index + 1}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src="#" />
                          <AvatarFallback>SC</AvatarFallback>
                        </Avatar>
                        <span>{employee.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-pink-100 text-pink-800 hover:bg-pink-100">{employee.gender}</Badge>
                    </TableCell>
                    <TableCell>{employee.phone}</TableCell>
                    <TableCell>{employee.branch}</TableCell>
                    <TableCell>{employee.position}</TableCell>
                    <TableCell>{employee.grade}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">      
                        <a href={`/employee-management/${employee.id}`}>             
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-9 px-3 bg-[#6B9AC4] text-white hover:bg-[#5A89B3] border-none"
                          >
                            <BookUser className="h-4 w-4 mr-1" />
                            Detail
                          </Button>
                        </a>                        
                        <Button
                          size="sm"
                          variant="destructive"
                          className="hover:bg-red-800 " 
                        >
                          <Trash2Icon className="h-4 w-4 mr-1" />
                          Delete
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
                  const newPageSize = Number(value)
                  setPageSize(newPageSize)

                  const newTotalPages = Math.ceil(totalRecords / newPageSize)
                  if (page > newTotalPages) {
                    setPage(1)
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
                Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, totalRecords)} out of {totalRecords}{" "}
                records
              </span>
            </div>

            <Pagination>
              <PaginationContent className="flex items-center gap-2">
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                    className={`hover:bg-[#5A89B3] hover:text-white hover:border-[#5A89B3] ${page === 1 ? "pointer-events-none opacity-50" : ""}`}
                  />
                </PaginationItem>

                {generatePaginationItems()}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                    className={`hover:bg-[#5A89B3] hover:text-white hover:border-[#5A89B3] ${page === totalPages ? "pointer-events-none opacity-50" : ""}`}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}