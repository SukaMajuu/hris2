import { useState } from 'react';
import type { Employee } from '../_types/employee';

export function useEmployeeManagement() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const baseEmployees: Employee[] = [
    {
      id: 1,
      name: 'Sarah Connor',
      gender: 'Female',
      phone: '+1234567890',
      branch: 'HQ Jakarta',
      position: 'CEO',
      grade: 'L8',
    },
    {
      id: 2,
      name: 'John Doe',
      gender: 'Male',
      phone: '+1234567891',
      branch: 'HQ Surabaya',
      position: 'CTO',
      grade: 'L7',
    },
    {
      id: 3,
      name: 'Jane Smith',
      gender: 'Female',
      phone: '+1234567892',
      branch: 'HQ Bandung',
      position: 'CFO',
      grade: 'L6',
    },
    {
      id: 4,
      name: 'Michael Johnson',
      gender: 'Male',
      phone: '+1234567893',
      branch: 'HQ Medan',
      position: 'COO',
      grade: 'L5',
    },
    {
      id: 5,
      name: 'Emily Davis',
      gender: 'Female',
      phone: '+1234567894',
      branch: 'HQ Bali',
      position: 'CMO',
      grade: 'L4',
    },
  ];

  const employees: Employee[] = Array.from({ length: 100 }, (_, index) => {
    const base = baseEmployees[index % 5] ?? {
      id: 0,
      name: '',
      gender: '',
      phone: '',
      branch: '',
      position: '',
      grade: '',
    };
    return {
      id: index + 1,
      name: base.name,
      gender: base.gender,
      phone: base.phone,
      branch: base.branch,
      position: base.position,
      grade: base.grade,
    };
  });

  const totalRecords = employees.length;
  const totalPages = Math.ceil(totalRecords / pageSize);

  return {
    page,
    setPage,
    pageSize,
    setPageSize,
    employees,
    totalRecords,
    totalPages,
  };
}
