import { useState, useMemo } from "react";
import { useAttendances } from "@/api/queries/attendance.queries";
import { useEmployeesQuery } from "@/api/queries/employee.queries";
import { useCreateAttendance } from "@/api/mutations/attendance.mutation";
import { Attendance } from "@/types/attendance";
import { Employee, EmployeeFilters } from "@/types/employee";

export function useCheckClockOverview() {
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [nameFilter, setNameFilter] = useState("");

	const {
		data: attendances,
		isLoading: isLoadingAttendances,
		error: attendanceError,
	} = useAttendances();

	const employeeFilters: EmployeeFilters = {
		employment_status: true,
		name: "",
	};

	const {
		data: employeesData,
		isLoading: isLoadingEmployees,
	} = useEmployeesQuery(1, 100, employeeFilters);

	const createAttendanceMutation = useCreateAttendance();

	const overviewData = useMemo(() => {
		if (!attendances || !Array.isArray(attendances)) return [];

		return attendances.map((attendance) => {
			const employee = attendance.employee;
			const employeeName = employee
				? `${employee.first_name} ${employee.last_name || ""}`.trim()
				: "Unknown Employee";

			const formattedDate = attendance.date
				? new Date(attendance.date).toLocaleDateString("en-US", {
						year: "numeric",
						month: "long",
						day: "2-digit",
				  })
				: "";

			const formatTime = (timeString: string | null) => {
				if (!timeString) return "-";

				if (timeString.match(/^\d{2}:\d{2}:\d{2}$/)) {
					return timeString.substring(0, 5);
				}

				try {
					const time = new Date(timeString);
					return time.toLocaleTimeString("en-US", {
						hour: "2-digit",
						minute: "2-digit",
						hour12: false,
					});
				} catch {
					return timeString.substring(0, 5);
				}
			};

			const formatWorkHours = (hours: number | null) => {
				if (!hours) return "-";
				const wholeHours = Math.floor(hours);
				const minutes = Math.round((hours - wholeHours) * 60);
				return `${wholeHours}h ${minutes}m`;
			};

			const formatLocation = (lat: number | null, lng: number | null) => {
				if (!lat || !lng) return "-";
				return `${lat}, ${lng}`;
			};

			const mapStatus = (status: string) => {
				switch (status?.toLowerCase()) {
					case "on_time":
						return "on_time" as const;
					case "late":
						return "late" as const;
					case "early_leave":
						return "early_leave" as const;
					case "absent":
						return "absent" as const;
					case "leave":
						return "leave" as const;
					default:
						return "on_time" as const;
				}
			};

			return {
				id: attendance.id,
				name: employeeName,
				date: formattedDate,
				clockIn: formatTime(attendance.clock_in),
				clockOut: formatTime(attendance.clock_out),
				workHours: formatWorkHours(attendance.work_hours),
				status: mapStatus(attendance.status),
				detailAddress: "N/A",
				latitude: attendance.clock_in_lat?.toString() || "-",
				longitude: attendance.clock_in_long?.toString() || "-",
				employee_id: attendance.employee_id,
				employee: employee,
				attendance: attendance,
			};
		});
	}, [attendances]);

	const filteredData = useMemo(() => {
		if (!nameFilter) return overviewData;
		return overviewData.filter((item) =>
			item.name.toLowerCase().includes(nameFilter.toLowerCase())
		);
	}, [overviewData, nameFilter]);

	const paginatedData = useMemo(() => {
		const startIndex = (page - 1) * pageSize;
		const endIndex = startIndex + pageSize;
		return filteredData.slice(startIndex, endIndex);
	}, [filteredData, page, pageSize]);

	const totalRecords = filteredData.length;
	const totalPages = Math.ceil(totalRecords / pageSize);

	const employeeList = useMemo(() => {
		if (!employeesData?.data?.items) return [];
		return employeesData.data.items;
	}, [employeesData]);

	const createAttendance = async (attendanceData: Partial<Attendance>) => {
		try {
			await createAttendanceMutation.mutateAsync(attendanceData);
		} catch (error) {
			console.error("Failed to create attendance:", error);
			throw error;
		}
	};

	return {
		page,
		setPage,
		pageSize,
		setPageSize,
		overviewData: paginatedData,
		totalRecords,
		totalPages,
		employeeList,
		nameFilter,
		setNameFilter,
		isLoading: isLoadingAttendances || isLoadingEmployees,
		error: attendanceError,
		createAttendance,
		isCreating: createAttendanceMutation.isPending,
	};
}
