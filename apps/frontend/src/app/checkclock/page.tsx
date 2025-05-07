'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Employee {
  id: number;
  name: string;
  position: string;
  type: string;
  checkIn: string;
  checkOut: string;
}

export default function CheckClockPage() {
  const [activeTab, setActiveTab] = useState("employee");
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();

  const employees: Employee[] = [
    { id: 1, name: "Sarah Connor", position: "CEO", type: "WFO", checkIn: "07:00", checkOut: "17:00" },
    { id: 2, name: "John Doe", position: "CTO", type: "WFH", checkIn: "08:00", checkOut: "16:00" },
    { id: 3, name: "Jane Smith", position: "Manager", type: "WFO", checkIn: "09:00", checkOut: "17:30" },
    { id: 4, name: "Michael", position: "Designer", type: "Remote", checkIn: "07:30", checkOut: "16:30" },
    { id: 5, name: "Emma", position: "Engineer", type: "WFO", checkIn: "08:15", checkOut: "17:45" },
    { id: 6, name: "Liam", position: "Analyst", type: "WFH", checkIn: "07:45", checkOut: "16:45" },
    { id: 7, name: "Olivia", position: "QA", type: "WFO", checkIn: "08:00", checkOut: "17:00" },
    { id: 8, name: "Noah", position: "Support", type: "Remote", checkIn: "09:00", checkOut: "18:00" },
    { id: 9, name: "Ava", position: "Admin", type: "WFO", checkIn: "07:30", checkOut: "16:30" },
    { id: 10, name: "William", position: "Intern", type: "WFH", checkIn: "10:00", checkOut: "16:00" },
    { id: 11, name: "Sophia", position: "HR", type: "WFO", checkIn: "08:30", checkOut: "17:00" },
    { id: 12, name: "James", position: "Finance", type: "WFH", checkIn: "07:30", checkOut: "16:00" },
    { id: 13, name: "Lucas", position: "Support", type: "WFO", checkIn: "08:00", checkOut: "17:30" },
    { id: 14, name: "Mia", position: "Manager", type: "Remote", checkIn: "08:00", checkOut: "17:00" },
    { id: 15, name: "Daniel", position: "Developer", type: "WFH", checkIn: "09:00", checkOut: "18:00" },
    { id: 16, name: "Ella", position: "Analyst", type: "WFO", checkIn: "07:45", checkOut: "16:45" },
  ];

  const pageSize = 10; // Changed to 10
  const totalPages = Math.ceil(employees.length / pageSize);
  const paginatedData = employees.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleFilterClick = () => {
    alert("Fitur filter belum tersedia. (Akan ditambahkan filter posisi, status, dll)");
  };

  const handleEditClick = (employeeId: number) => {
    router.push(`/checkclock/edit/${employeeId}`);
  };

  const tabClass = (tab: string) =>
    `px-4 py-2 rounded-t ${
      activeTab === tab ? "bg-blue-100 font-bold" : "bg-gray-200"
    } cursor-pointer`;

  const paginationButton = (page: number) => (
    <button
      key={page}
      onClick={() => setCurrentPage(page)}
      className={`p-1 px-2 rounded ${
        currentPage === page ? "bg-blue-400 text-white" : "bg-gray-300"
      }`}
    >
      {page}
    </button>
  );

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Check-Clock</h1>

      {/* Tabs */}
      <div className="flex space-x-2 mb-4 border-b">
        <div className={tabClass("employee")} onClick={() => setActiveTab("employee")}>
          Check-Clock Employee
        </div>
        <div className={tabClass("overview")} onClick={() => setActiveTab("overview")}>
          Check-Clock Overview
        </div>
        <div className={tabClass("approval")} onClick={() => setActiveTab("approval")}>
          Check-Clock Approval
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "employee" && (
        <>
          {/* Search & Filter */}
          <div className="flex items-center justify-between mb-4">
            <input
              type="text"
              placeholder="Search Employee"
              className="p-2 border rounded w-1/3"
            />
            <button
              className="p-2 bg-gray-200 rounded hover:bg-gray-300"
              onClick={handleFilterClick}
            >
              🔍 Filter
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 text-left">No.</th>
                  <th className="p-2 text-left">Nama</th>
                  <th className="p-2 text-left">Position</th>
                  <th className="p-2 text-left">Tipe pekerjaan</th>
                  <th className="p-2 text-left">Check In</th>
                  <th className="p-2 text-left">Check Out</th>
                  <th className="p-2 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((emp, index) => (
                  <tr key={emp.id} className="border-b">
                    <td className="p-2">{(currentPage - 1) * pageSize + index + 1}</td>
                    <td className="p-2 flex items-center gap-2">
                      <img src="/avatar.png" alt={emp.name} className="w-6 h-6 rounded-full" />
                      {emp.name}
                    </td>
                    <td className="p-2 font-bold">{emp.position}</td>
                    <td className="p-2">{emp.type}</td>
                    <td className="p-2">{emp.checkIn}</td>
                    <td className="p-2">{emp.checkOut}</td>
                    <td className="p-2">
                      <button
                        className="px-3 py-1 bg-yellow-400 text-white rounded"
                        onClick={() => handleEditClick(emp.id)}
                      >
                        ✏️ Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-4">
              <select
                className="border p-1 rounded"
                value={pageSize}
                disabled
              >
                <option value="10">10</option>
              </select>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  ◀
                </button>
                {[...Array(totalPages)].map((_, i) => paginationButton(i + 1))}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  ▶
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === "overview" && (
        <div className="bg-gray-50 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Ringkasan Kehadiran</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Total Pegawai: 60</li>
            <li>Hadir Hari Ini: 53</li>
            <li>Terlambat: 7</li>
            <li>Izin: 2</li>
          </ul>
        </div>
      )}

      {activeTab === "approval" && (
        <div className="bg-gray-50 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Permintaan Persetujuan</h2>
          <p className="mb-2">Belum ada permintaan persetujuan terbaru.</p>
          <button className="bg-blue-500 text-white px-4 py-2 rounded">
            Refresh Data
          </button>
        </div>
      )}
    </div>
  );
}
