'use client';

import { useParams } from 'next/navigation';
import { useEmployeeManagement } from '../_hooks/useEmployeeManagement';

export default function Page() {
  const params = useParams();
  const id = Number(params.id);

  const { employees } = useEmployeeManagement();
  const employee = employees.find((e) => e.id === id);

  if (!employee) {
    return <div className='p-4'>Employee not found.</div>;
  }

  return (
    <div className='space-y-4 p-4'>
      <div className='flex items-center gap-4 rounded-lg bg-white p-4 shadow'>
        <img
          src='https://randomuser.me/api/portraits/women/44.jpg'
          alt={employee.name}
          className='h-20 w-20 rounded-full object-cover'
        />
        <div className='flex-1'>
          <div className='text-lg font-bold'>{employee.name}</div>
          <div className='text-gray-500'>{employee.position}</div>
        </div>
        <div className='flex flex-col gap-1 text-sm'>
          <div>
            <span className='font-semibold'>Employee Code:</span> {employee.id}
          </div>
          <div>
            <span className='font-semibold'>Branch:</span> {employee.branch}
          </div>
        </div>
      </div>

      <div className='mb-2 text-sm text-gray-600'>
        <span className='font-semibold'>Employee Information</span> | Employee Document
      </div>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <div className='rounded-lg bg-white p-4 shadow'>
          <div className='mb-2 flex justify-between font-semibold'>
            Personal Information
            <span className='cursor-pointer text-blue-500'>✎</span>
          </div>
          <div className='grid grid-cols-2 gap-y-2 text-sm'>
            <div>
              <span className='font-semibold'>NIK</span>
              <div>-</div>
            </div>
            <div>
              <span className='font-semibold'>Gender</span>
              <div>{employee.gender}</div>
            </div>
            <div>
              <span className='font-semibold'>Place of Birth</span>
              <div>-</div>
            </div>
            <div>
              <span className='font-semibold'>Date of Birth</span>
              <div>-</div>
            </div>
            <div>
              <span className='font-semibold'>Last Education</span>
              <div>-</div>
            </div>
            <div>
              <span className='font-semibold'>Phone Number</span>
              <div>{employee.phone}</div>
            </div>
          </div>
        </div>
        <div className='rounded-lg bg-white p-4 shadow'>
          <div className='mb-2 flex justify-between font-semibold'>
            Additional Information
            <span className='cursor-pointer text-blue-500'>✎</span>
          </div>
          <div className='grid grid-cols-2 gap-y-2 text-sm'>
            <div>
              <span className='font-semibold'>Contract Type</span>
              <div>-</div>
            </div>
            <div>
              <span className='font-semibold'>Grade</span>
              <div>{employee.grade}</div>
            </div>
            <div>
              <span className='font-semibold'>Bank</span>
              <div>-</div>
            </div>
            <div>
              <span className='font-semibold'>Account Number</span>
              <div>-</div>
            </div>
            <div>
              <span className='font-semibold'>Account Name</span>
              <div>{employee.name}</div>
            </div>
            <div>
              <span className='font-semibold'>SP</span>
              <div>-</div>
            </div>
          </div>
        </div>
      </div>

      <div className='rounded-lg bg-white p-4 shadow'>
        <div className='mb-2 flex justify-between font-semibold'>
          Document Information
          <span className='cursor-pointer text-blue-500'>✎</span>
        </div>
        <div className='grid grid-cols-4 gap-4 text-sm'>
          {[1, 2, 3, 4].map((idx) => (
            <div key={idx}>
              <div className='font-semibold'>Certification</div>
              <div>1234567890.pdf</div>
            </div>
          ))}
        </div>
        <div className='mt-4 flex justify-end'>
          <button className='rounded bg-gray-200 px-4 py-1'>Close</button>
        </div>
      </div>
    </div>
  );
}
