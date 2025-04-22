import React from "react";

const EmployeeTable: React.FC = () => {
  return (
    <div className="bg-white rounded shadow p-4">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 border-b">Employee name</th>
              <th className="p-3 border-b">Branch</th>
              <th className="p-3 border-b">Organization</th>
              <th className="p-3 border-b">Job level</th>
              <th className="p-3 border-b">Overtime duration</th>
              <th className="p-3 border-b">Approved request</th>
              <th className="p-3 border-b">Pending request</th>
            </tr>
          </thead>
          <tbody>
            {/* TIDAK ADA DATA */}
            <tr>
              <td colSpan={7} className="text-center py-6 text-gray-500">
                No data available
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeTable;
