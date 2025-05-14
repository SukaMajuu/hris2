"use client";

import { useEmployeeManagement } from '../../(admin)/employee-management/_hooks/useEmployeeManagement';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

export default function Page() {
  // Untuk profile user, ambil employee pertama (id=1), sementara aja nanti diganti
    const { employees } = useEmployeeManagement();
    const employee = employees.find((e) => e.id === 1);
  
    const [activeTab, setActiveTab] = useState<'personal' | 'document'>('personal');
    const [editPersonal, setEditPersonal] = useState(false);
    const [editAdditional, setEditAdditional] = useState(false);
    const [editDocument, setEditDocument] = useState(false);
  
    const [nik, setNik] = useState('');
    const [gender, setGender] = useState(employee?.gender || '');
    const [placeOfBirth, setPlaceOfBirth] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [lastEducation, setLastEducation] = useState('');
    const [phone, setPhone] = useState(employee?.phone || '');
    const [contractType, setContractType] = useState('');
    const [grade, setGrade] = useState('');
    const [bank, setBank] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [accountName, setAccountName] = useState('');
    const [sp, setSp] = useState('');
    const [documents, setDocuments] = useState<{ name: string; file: File | null }[]>([]);
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [profileFile, setProfileFile] = useState<File | null>(null);
  
    if (!employee) {
      return <div className='p-4'>Employee not found.</div>;
    }
  
    const handleDeleteDocument = (idx: number) => {
      setDocuments(documents.filter((_, i) => i !== idx));
    };
  
    const handleDownloadDocument = (file: File | null) => {
      if (!file) return;
      const url = URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    };
  
    return (
      <div className='space-y-4 p-4'>
        <div className='flex flex-col items-center gap-4 rounded-lg bg-white p-4 shadow md:flex-row'>
        <div className='flex flex-col items-center'>
                      <div className='group relative flex h-20 w-20 items-center justify-center rounded-full border-2 overflow-hidden'>
                          <Image
                              src={profileImage || '/logo.png'}
                              alt='Profile Photo'
                              width={80}
                              height={80}
                              className='object-fill'
                          />
                          <label className='absolute m-1 cursor-pointer bg-white hover:bg-secondary bg-opacity-80 rounded-full p-1 shadow opacity-0 group-hover:opacity-100 transition'>
                              <Input
                                  type='file'
                                  accept='image/*'
                                  className='hidden'
                                  onChange={e => {
                                      const file = e.target.files?.[0] || null;
                                      if (file) {
                                          setProfileFile(file);
                                          const reader = new FileReader();
                                          reader.onload = (ev) => {
                                              setProfileImage(ev.target?.result as string);
                                          };
                                          reader.readAsDataURL(file);
                                      }
                                  }}
                              />
                              <span className='text-lg'>✎</span>
                          </label>
                      </div>
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
                <span
                  className='cursor-pointer text-blue-500'
                  onClick={() => setEditPersonal((prev) => !prev)}
                >
                  Edit ✎
                </span>
              </CardHeader>
              <CardContent className='grid grid-cols-1 gap-x-4 gap-y-6 border-none text-sm sm:grid-cols-2'>
                <div>
                  <span className='font-semibold'>NIK</span>
                  <Input
                    disabled={!editPersonal}
                    type='text'
                    placeholder='Enter NIK'
                    value={nik}
                    onChange={(e) => setNik(e.target.value)}
                  />
                </div>
                <div>
                  <span className='font-semibold'>Gender</span>
                  <Input
                    disabled={!editPersonal}
                    type='text'
                    placeholder='Enter Gender'
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                  />
                </div>
                <div>
                  <span className='font-semibold'>Place of Birth</span>
                  <Input
                    disabled={!editPersonal}
                    type='text'
                    placeholder='Enter Place of Birth'
                    value={placeOfBirth}
                    onChange={(e) => setPlaceOfBirth(e.target.value)}
                  />
                </div>
                <div>
                  <span className='font-semibold'>Date of Birth</span>
                  <Input
                    disabled={!editPersonal}
                    type='text'
                    placeholder='Enter Date of Birth'
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                  />
                </div>
                <div>
                  <span className='font-semibold'>Last Education</span>
                  <Input
                    disabled={!editPersonal}
                    type='text'
                    placeholder='Enter Last Education'
                    value={lastEducation}
                    onChange={(e) => setLastEducation(e.target.value)}
                    className='border-secondary'
                  />
                </div>
                <div>
                  <span className='font-semibold'>Phone Number</span>
                  <Input
                    disabled={!editPersonal}
                    type='text'
                    placeholder='Enter Phone Number'
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className='col-span-2 flex justify-end'>
                  <Button disabled={!editPersonal} className='hover:cursor-pointer'>
                    Save
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card className='border-none bg-white px-4 py-6 shadow'>
              <CardHeader className='mb-2 flex justify-between border-none font-semibold'>
                Additional Information
                <span
                  className='cursor-pointer text-blue-500'
                  onClick={() => setEditAdditional((prev) => !prev)}
                >
                  Edit ✎
                </span>
              </CardHeader>
              <CardContent className='grid grid-cols-1 gap-x-4 gap-y-6 border-none text-sm sm:grid-cols-2'>
                <div>
                  <span className='font-semibold'>Contract Type</span>
                  <Input
                    disabled={!editAdditional}
                    type='text'
                    placeholder='Enter Contract Type'
                    value={contractType}
                    onChange={(e) => setContractType(e.target.value)}
                  />
                </div>
                <div>
                  <span className='font-semibold'>Grade</span>
                  <Input
                    disabled={!editAdditional}
                    type='text'
                    placeholder='Enter Grade'
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                  />
                </div>
                <div>
                  <span className='font-semibold'>Bank</span>
                  <Input
                    disabled={!editAdditional}
                    type='text'
                    placeholder='Enter Bank'
                    value={bank}
                    onChange={(e) => setBank(e.target.value)}
                  />
                </div>
                <div>
                  <span className='font-semibold'>Account Number</span>
                  <Input
                    disabled={!editAdditional}
                    type='text'
                    placeholder='Enter Account Number'
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                  />
                </div>
                <div>
                  <span className='font-semibold'>Account Name</span>
                  <Input
                    disabled={!editAdditional}
                    type='text'
                    placeholder='Enter Account Name'
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                  />
                </div>
                <div>
                  <span className='font-semibold'>SP</span>
                  <Input
                    disabled={!editAdditional}
                    type='text'
                    placeholder='Enter SP'
                    value={sp}
                    onChange={(e) => setSp(e.target.value)}
                  />
                </div>
                <div className='col-span-2 flex justify-end'>
                  <Button disabled={!editAdditional} className='hover:cursor-pointer'>
                    Save
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
  
        {activeTab === 'document' && (
          <Card className='border-none bg-white p-4 shadow'>
            <CardHeader className='mb-2 flex justify-between font-semibold'>
              Document Information
              <span
                className='cursor-pointer text-blue-500'
                onClick={() => setEditDocument((prev) => !prev)}
              >
                Edit ✎
              </span>
            </CardHeader>
            <CardContent>
              <div className='mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                <div className='flex flex-col gap-2'>
                  <label className='font-semibold'>File</label>
                  <Input
                    disabled={!editDocument}
                    type='file'
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      if (file && editDocument) {
                        setDocuments((prev) => [...prev, { name: file.name, file }]);
                        e.target.value = '';
                      }
                    }}
                  />
                </div>
              </div>
              {/* Tabel Dokumen */}
              <div className='overflow-x-auto'>
                <table className='min-w-full border text-sm'>
                  <thead>
                    <tr className='bg-gray-100'>
                      <th className='border px-2 py-1'>No</th>
                      <th className='border px-2 py-1'>File Name</th>
                      <th className='border px-2 py-1'>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.length === 0 && (
                      <tr>
                        <td colSpan={3} className='py-2 text-center'>
                          No documents
                        </td>
                      </tr>
                    )}
                    {documents.map((doc, idx) => (
                      <tr key={idx}>
                        <td className='border-none px-2 py-1 flex justify-center'>{idx + 1}</td>
                        <td className='border px-2 py-1'>{doc.file?.name}</td>
                        <td className='border px-2 py-1'>
                          <div className='flex flex-row justify-center gap-2'>
                            <Button
                              variant='destructive'                            
                              onClick={() => handleDeleteDocument(idx)}
                            >
                              Delete
                            </Button>
                            <Button                            
                              onClick={() => handleDownloadDocument(doc.file)}
                              disabled={!doc.file}
                              variant='secondary'
                            >
                              Download
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
  
        <Link href='/employee-management' className='flex justify-end'>
          <Button className='bg-secondary rounded px-4 py-1 hover:cursor-pointer'>Close</Button>
        </Link>
      </div>
    );
  }
  