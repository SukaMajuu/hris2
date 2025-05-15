// sementara doang, nanti dihapus
export interface Employee {
	id: number;
	name: string;
	employeeCode: string;
	nik?: string;
	email?: string;
	gender: string;
	placeOfBirth?: string;
	dateOfBirth?: string;
	phone: string;
	address?: string;
	branch: string;
	position: string;
	employmentStatus?: string;
	department?: string;
	grade: string;
	joinDate?: string;
	bankName?: string;
	bankAccountHolder?: string;
	bankAccountNumber?: string;
	profilePicture?: string;
	lastEducation?: string;
	contractType?: string;
	sp?: string;
	documentMetadata?: { name: string; url: string; uploadedAt?: string }[];
}
