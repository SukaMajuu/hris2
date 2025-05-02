// app/checkclock/layout.tsx
import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-md flex flex-col">
          <div className="p-6 text-2xl font-bold">HRIS</div>
          <nav className="flex flex-col gap-2 p-4 flex-grow">
            <button className="text-left p-2 rounded bg-white hover:bg-gray-100">Dashboard</button>
            <button className="text-left p-2 rounded bg-white hover:bg-gray-100">Employee</button>
            <button className="text-left p-2 rounded bg-blue-100 font-bold">Check-Clock</button>
            <button className="text-left p-2 rounded bg-white hover:bg-gray-100">Overtime</button>
          </nav>
          <div className="p-4">
            <button className="block w-full text-left p-2 text-gray-600 hover:text-black">Support</button>
            <button className="block w-full text-left p-2 text-gray-600 hover:text-black">Settings</button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-6 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
