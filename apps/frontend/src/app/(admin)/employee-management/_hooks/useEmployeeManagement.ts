import { useState } from "react";
import type { Employee } from "../_types/employee";

export function useEmployeeManagement() {
	const baseEmployees: Employee[] = [
		{
			id: 1,
			name: "Sarah Connor",
			employeeCode: "EMP001",
			nik: "3201234567890001",
			email: "sarah.connor@example.com",
			gender: "Female",
			placeOfBirth: "Los Angeles",
			dateOfBirth: "1985-05-10",
			phone: "+1234567890",
			address: "123 Main St, Anytown, USA",
			branch: "HQ Jakarta",
			position: "CEO",
			employmentStatus: "Active",
			department: "Executive",
			grade: "L8",
			joinDate: "2010-01-15",
			bankName: "Cyberdyne Bank",
			bankAccountHolder: "Sarah Connor",
			bankAccountNumber: "1234567890",
			profilePicture: "/avatars/01.png",
			lastEducation: "Master of Business Administration",
			contractType: "Permanent",
			sp: "None",
			documentMetadata: [
				{
					name: "KTP.pdf",
					url: "/docs/ktp_sarah.pdf",
					uploadedAt: "2023-01-10",
				},
				{
					name: "CV.pdf",
					url: "/docs/cv_sarah.pdf",
					uploadedAt: "2023-01-12",
				},
			],
		},
		{
			id: 2,
			name: "John Doe",
			employeeCode: "EMP002",
			nik: "3201234567890002",
			email: "john.doe@example.com",
			gender: "Male",
			placeOfBirth: "New York",
			dateOfBirth: "1990-08-20",
			phone: "+1234567891",
			address: "456 Oak St, Anytown, USA",
			branch: "HQ Surabaya",
			position: "CTO",
			employmentStatus: "Active",
			department: "Technology",
			grade: "L7",
			joinDate: "2015-03-01",
			bankName: "Omni Consumer Bank",
			bankAccountHolder: "John Doe",
			bankAccountNumber: "0987654321",
			profilePicture: "/avatars/02.png",
			lastEducation: "PhD in Computer Science",
			contractType: "Permanent",
			sp: "SP1 - 2023-05-15",
			documentMetadata: [
				{
					name: "ID_Card.pdf",
					url: "/docs/id_john.pdf",
					uploadedAt: "2022-11-20",
				},
			],
		},
		{
			id: 3,
			name: "Jane Smith",
			employeeCode: "EMP003",
			nik: "3201234567890003",
			email: "jane.smith@example.com",
			gender: "Female",
			placeOfBirth: "Chicago",
			dateOfBirth: "1988-12-01",
			phone: "+1234567892",
			address: "789 Pine St, Anytown, USA",
			branch: "HQ Bandung",
			position: "CFO",
			employmentStatus: "Active",
			department: "Finance",
			grade: "L6",
			joinDate: "2012-07-22",
			bankName: "Tyrell Corporation Bank",
			bankAccountHolder: "Jane Smith",
			bankAccountNumber: "1122334455",
			profilePicture: "/avatars/03.png",
		},
		{
			id: 4,
			name: "Michael Johnson",
			employeeCode: "EMP004",
			nik: "3201234567890004",
			email: "michael.johnson@example.com",
			gender: "Male",
			placeOfBirth: "Houston",
			dateOfBirth: "1992-02-14",
			phone: "+1234567893",
			address: "101 Maple St, Anytown, USA",
			branch: "HQ Medan",
			position: "COO",
			employmentStatus: "Active",
			department: "Operations",
			grade: "L5",
			joinDate: "2018-11-05",
			bankName: "Weyland-Yutani Bank",
			bankAccountHolder: "Michael Johnson",
			bankAccountNumber: "6677889900",
			profilePicture: "/avatars/04.png",
		},
		{
			id: 5,
			name: "Emily Davis",
			employeeCode: "EMP005",
			nik: "3201234567890005",
			email: "emily.davis@example.com",
			gender: "Female",
			placeOfBirth: "Miami",
			dateOfBirth: "1995-07-30",
			phone: "+1234567894",
			address: "202 Birch St, Anytown, USA",
			branch: "HQ Bali",
			position: "CMO",
			employmentStatus: "Active",
			department: "Marketing",
			grade: "L4",
			joinDate: "2020-06-10",
			bankName: "Acme Corp Bank",
			bankAccountHolder: "Emily Davis",
			bankAccountNumber: "2233445566",
			profilePicture: "/avatars/05.png",
		},
	];

	const [employees, setEmployees] = useState<Employee[]>(
		Array.from({ length: 100 }, (_, index) => {
			const base = baseEmployees[index % 5] ?? {
				id: 0,
				name: "",
				employeeCode: "",
				nik: "",
				email: "",
				gender: "",
				placeOfBirth: "",
				dateOfBirth: "",
				phone: "",
				address: "",
				branch: "",
				position: "",
				employmentStatus: "",
				department: "",
				grade: "",
				joinDate: "",
				emergencyContactName: "",
				emergencyContactPhone: "",
				bankName: "",
				bankAccountHolder: "",
				bankAccountNumber: "",
				profilePicture: "",
				lastEducation: "",
				contractType: "",
				sp: "",
				documentMetadata: [],
			};
			return {
				id: index + 1,
				name: base.name,
				employeeCode: base.employeeCode,
				nik: base.nik,
				email: base.email,
				gender: base.gender,
				placeOfBirth: base.placeOfBirth,
				dateOfBirth: base.dateOfBirth,
				phone: base.phone,
				address: base.address,
				branch: base.branch,
				position: base.position,
				employmentStatus: base.employmentStatus,
				department: base.department,
				grade: base.grade,
				joinDate: base.joinDate,
				bankName: base.bankName,
				bankAccountHolder: base.bankAccountHolder,
				bankAccountNumber: base.bankAccountNumber,
				profilePicture: base.profilePicture,
				lastEducation: base.lastEducation,
				contractType: base.contractType,
				sp: base.sp,
				documentMetadata: base.documentMetadata,
			};
		})
	);

	return {
		setEmployees,
		employees,
	};
}
