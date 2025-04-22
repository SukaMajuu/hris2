import React from "react";
import EmployeeTable from "@/components/ui/employeeTable";

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-2">Employee overtime details</h1>
      <p className="mb-6 text-gray-600">Data presented: - </p>
      <EmployeeTable />
    </div>
  );
};

export default App;
