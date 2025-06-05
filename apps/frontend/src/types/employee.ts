export interface Employee {
  id: number;
  email?: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
  employee_code: string;
  branch_id?: number;
  branch?: string;
  branch_name?: string;
  position_id?: number;
  position_name?: string;
  gender?: string;
  nik?: string;
  place_of_birth?: string;
  date_of_birth?: string;
  last_education?: string;
  grade?: string;
  contract_type?: string;
  employment_status: boolean;
  employmentStatus?: string;
  hire_date?: string;
  resignation_date?: string | null;
  bank_name?: string;
  bank_account_number?: string;
  bank_account_holder_name?: string;
  tax_status?: string;
  profile_photo_url?: string;
  created_at?: string;
  updated_at?: string;
  sp?: string;
  documentMetadata?: { name: string; url: string; uploadedAt?: string }[];
}

export interface EmployeeFilters {
  name?: string;
  gender?: string;
  employment_status?: boolean;
  search?: string;
}

export interface EmployeeStats {
  totalEmployees: number;
  totalNewHire: number;
  fullTimeEmployees: number;
  currentPeriod: string;
}
