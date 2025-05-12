'use client';

import { useParams } from 'next/navigation';
import { useEmployeeManagement } from '../_hooks/useEmployeeManagement';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function Page() {
  const params = useParams();
  const id = Number(params.id);

  const { employees } = useEmployeeManagement();
  const employee = employees.find((e) => e.id === id);

  const [activeTab, setActiveTab] = useState<'personal' | 'document'>('personal');

  if (!employee) {
    return <div className='p-4'>Employee not found.</div>;
  }

  return (
    <div className='space-y-4 p-4'>
      <div className='flex flex-col items-center gap-4 rounded-lg bg-white p-4 shadow md:flex-row'>
        <div className='flex h-20 w-20 items-center justify-center rounded-full border-2'>
          <Image
            src='/logo.png'
            alt='Company Logo'
            width={80}
            height={80}
            className='object-fill'
          />
        </div>
        <div className='flex-1'>
          <div className='text-lg font-bold'>{employee.name}</div>
          <div className='text-gray-500'>{employee.position}</div>
        </div>
        <div className='flex flex-row gap-15 text-sm'>
          <div>
            <span className='font-semibold'>Employee Code:</span> {employee.id}
          </div>
          <div>
            <span className='font-semibold'>Branch:</span> {employee.branch}
          </div>
        </div>
      </div>

      <div className='mb-2 flex flex-col items-start gap-2 text-sm text-gray-600 sm:flex-row sm:items-center'>
        <Button
          className={`hover:text-gray w-full hover:cursor-pointer hover:bg-gray-200 sm:w-auto ${
            activeTab === 'personal' ? 'font-bold' : ''
          }`}
          variant='ghost'
          onClick={() => setActiveTab('personal')}
        >
          Employee Information
        </Button>
        <span className='hidden sm:inline'>|</span>
        <Button
          className={`hover:text-gray w-full hover:cursor-pointer hover:bg-gray-200 sm:w-auto ${
            activeTab === 'document' ? 'font-bold' : ''
          }`}
          variant='ghost'
          onClick={() => setActiveTab('document')}
        >
          Employee Document
        </Button>
      </div>

      {activeTab === 'personal' && (
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <Card className='border-none bg-white px-4 py-6 shadow'>
            <CardHeader className='mb-2 flex justify-between border-none font-semibold'>
              Personal Information
              <span className='cursor-pointer text-blue-500'>✎</span>
            </CardHeader>
            <CardContent className='grid grid-cols-1 gap-x-5 gap-y-5 border-none text-sm sm:grid-cols-2'>
              <div>
                <span className='font-semibold'>NIK</span>
                <Input disabled type='text' placeholder='Enter NIK' value='' />
              </div>
              <div>
                <span className='font-semibold'>Gender</span>
                <Input disabled type='text' placeholder='Enter Gender' value={employee.gender} />
              </div>
              <div>
                <span className='font-semibold'>Place of Birth</span>
                <Input disabled type='text' placeholder='Enter Place of Birth' value='' />
              </div>
              <div>
                <span className='font-semibold'>Date of Birth</span>
                <Input disabled type='text' placeholder='Enter Date of Birth' value='' />
              </div>
              <div>
                <span className='font-semibold'>Last Education</span>
                <Input
                  disabled
                  type='text'
                  placeholder='Enter Last Education'
                  value=''
                  className='border-secondary'
                />
              </div>
              <div>
                <span className='font-semibold'>Phone Number</span>
                <Input
                  disabled
                  type='text'
                  placeholder='Enter Phone Number'
                  value={employee.phone}
                />
              </div>
            </CardContent>
          </Card>
          <Card className='border-none bg-white px-4 py-6 shadow'>
            <CardHeader className='mb-2 flex justify-between border-none font-semibold'>
              Additional Information
              <span className='cursor-pointer text-blue-500'>✎</span>
            </CardHeader>
            <CardContent className='grid grid-cols-1 gap-x-5 gap-y-5 border-none text-sm sm:grid-cols-2'>
              <div>
                <span className='font-semibold'>Contract Type</span>
                <Input disabled type='text' placeholder='Enter Contract Type' value='' />
              </div>
              <div>
                <span className='font-semibold'>Grade</span>
                <Input disabled type='text' placeholder='Enter Grade' value='' />
              </div>
              <div>
                <span className='font-semibold'>Bank</span>
                <Input disabled type='text' placeholder='Enter Bank' value='' />
              </div>
              <div>
                <span className='font-semibold'>Account Number</span>
                <Input disabled type='text' placeholder='Enter Account Number' value='' />
              </div>
              <div>
                <span className='font-semibold'>Account Name</span>
                <Input disabled type='text' placeholder='Enter Account Name' value='' />
              </div>
              <div>
                <span className='font-semibold'>SP</span>
                <Input disabled type='text' placeholder='Enter SP' value='' />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'document' && (
        <Card className='border-none bg-white p-4 shadow'>
          <CardHeader className='mb-2 flex justify-between font-semibold'>
            Document Information
            <span className='cursor-pointer text-blue-500'>✎</span>
          </CardHeader>
          <CardContent className='grid grid-cols-1 gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4'>
            {[1, 2, 3, 4].map((idx) => (
              <div key={idx}>
                <div className='font-semibold'>Certification</div>
                <Input disabled type='file' placeholder='Enter Certification' value='' />
              </div>
            ))}
          </CardContent>
          <div className='mt-4 flex justify-end'></div>
        </Card>
      )}

      <Link href='/employee-management' className='flex justify-end'>
        <Button className='bg-secondary rounded px-4 py-1 hover:cursor-pointer'>Close</Button>
      </Link>
    </div>
  );
}
