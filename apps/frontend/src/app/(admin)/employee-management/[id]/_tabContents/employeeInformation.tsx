import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectItem,
  SelectContent,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Pencil, KeyRound } from 'lucide-react';
import React from 'react';

interface EmployeeInformationProps {
  nik: string;
  setNik: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  gender: string;
  setGender: (value: string) => void;
  placeOfBirth: string;
  setPlaceOfBirth: (value: string) => void;
  dateOfBirth: string;
  setDateOfBirth: (value: string) => void;
  phone: string;
  setPhone: (value: string) => void;
  lastEducation: string;
  setLastEducation: (value: string) => void;
  editPersonal: boolean;
  setEditPersonal: (value: boolean) => void;
  handleSavePersonal: () => void;
  bankName: string;
  setBankName: (value: string) => void;
  bankAccountHolder: string;
  setBankAccountHolder: (value: string) => void;
  bankAccountNumber: string;
  setBankAccountNumber: (value: string) => void;
  editBank: boolean;
  setEditBank: (value: boolean) => void;
  handleSaveBank: () => void;
  handleResetPassword: () => void;
  name: string;
  setName: (value: string) => void;
}

const EmployeeInformation: React.FC<EmployeeInformationProps> = ({
  nik,
  setNik,
  email,
  setEmail,
  gender,
  setGender,
  placeOfBirth,
  setPlaceOfBirth,
  dateOfBirth,
  setDateOfBirth,
  phone,
  setPhone,
  lastEducation,
  setLastEducation,
  editPersonal,
  setEditPersonal,
  handleSavePersonal,
  bankName,
  setBankName,
  bankAccountHolder,
  setBankAccountHolder,
  bankAccountNumber,
  setBankAccountNumber,
  editBank,
  setEditBank,
  handleSaveBank,
  handleResetPassword,
  name,
  setName,
}) => {
  return (
    <div className='grid grid-cols-1 gap-6 xl:grid-cols-2'>
      <Card className='border border-slate-100 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900'>
        <CardHeader className='flex flex-row items-center justify-between border-b pb-3 dark:border-slate-700'>
          <CardTitle className='text-lg font-semibold text-slate-800 dark:text-slate-100'>
            Personal Information
          </CardTitle>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => setEditPersonal(!editPersonal)}
            className='rounded-md px-4 py-2 text-blue-600 transition-colors duration-150 hover:bg-slate-100 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-slate-700/50 dark:hover:text-blue-300'
          >
            <Pencil className='mr-2 h-4 w-4' />
            {editPersonal ? 'Cancel' : 'Edit'}
          </Button>
        </CardHeader>
        <CardContent className='space-y-4 p-6'>
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <div>
              <Label
                htmlFor='employeeCardName'
                className='text-sm font-medium text-slate-600 dark:text-slate-400'
              >
                Name
              </Label>
              <Input
                id='employeeCardName'
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!editPersonal}
                className='mt-1 border-slate-300 bg-slate-50 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-70 dark:border-slate-600 dark:bg-slate-800'
              />
            </div>
            <div>
              <Label
                htmlFor='nik'
                className='text-sm font-medium text-slate-600 dark:text-slate-400'
              >
                NIK
              </Label>
              <Input
                id='nik'
                value={nik}
                onChange={(e) => setNik(e.target.value)}
                disabled={!editPersonal}
                className='mt-1 border-slate-300 bg-slate-50 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-70 dark:border-slate-600 dark:bg-slate-800'
              />
            </div>
          </div>
          <div>
            <Label
              htmlFor='email'
              className='text-sm font-medium text-slate-600 dark:text-slate-400'
            >
              Email
            </Label>
            <Input
              id='email'
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={!editPersonal}
              className='mt-1 border-slate-300 bg-slate-50 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-70 dark:border-slate-600 dark:bg-slate-800'
            />
          </div>
          <div>
            <Label
              htmlFor='gender'
              className='text-sm font-medium text-slate-600 dark:text-slate-400'
            >
              Gender
            </Label>
            <Select
              value={gender}
              onValueChange={(value) => setGender(value)}
              disabled={!editPersonal}
            >
              <SelectTrigger
                id='gender'
                className='mt-1 w-full border-slate-300 bg-slate-50 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-70 dark:border-slate-600 dark:bg-slate-800'
              >
                <SelectValue placeholder='Select gender' />
              </SelectTrigger>
              <SelectContent className='bg-white dark:bg-slate-800'>
                <SelectItem value='Male'>Male</SelectItem>
                <SelectItem value='Female'>Female</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label
              htmlFor='placeOfBirth'
              className='text-sm font-medium text-slate-600 dark:text-slate-400'
            >
              Place of Birth
            </Label>
            <Input
              id='placeOfBirth'
              value={placeOfBirth}
              onChange={(e) => setPlaceOfBirth(e.target.value)}
              disabled={!editPersonal}
              className='mt-1 border-slate-300 bg-slate-50 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-70 dark:border-slate-600 dark:bg-slate-800'
            />
          </div>
          <div>
            <Label
              htmlFor='dateOfBirth'
              className='text-sm font-medium text-slate-600 dark:text-slate-400'
            >
              Date of Birth
            </Label>
            <Input
              id='dateOfBirth'
              type='date'
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              disabled={!editPersonal}
              className='mt-1 border-slate-300 bg-slate-50 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-70 dark:border-slate-600 dark:bg-slate-800'
            />
          </div>
          <div>
            <Label
              htmlFor='phone'
              className='text-sm font-medium text-slate-600 dark:text-slate-400'
            >
              Phone Number
            </Label>
            <Input
              id='phone'
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={!editPersonal}
              className='mt-1 border-slate-300 bg-slate-50 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-70 dark:border-slate-600 dark:bg-slate-800'
            />
          </div>
          <div>
            <Label
              htmlFor='lastEducation'
              className='text-sm font-medium text-slate-600 dark:text-slate-400'
            >
              Last Education
            </Label>
            <Select
              value={lastEducation}
              onValueChange={(value) => setLastEducation(value)}
              disabled={!editPersonal}
            >
              <SelectTrigger
                id='lastEducation'
                className='mt-1 border-slate-300 bg-slate-50 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-70 dark:border-slate-600 dark:bg-slate-800'
              >
                <SelectValue placeholder='Select education level' />
              </SelectTrigger>
              <SelectContent className='bg-white dark:bg-slate-800'>
                <SelectItem value='SD'>SD</SelectItem>
                <SelectItem value='SMP'>SMP</SelectItem>
                <SelectItem value='SMA/SMK'>SMA/SMK</SelectItem>
                <SelectItem value='D1'>D1</SelectItem>
                <SelectItem value='D2'>D2</SelectItem>
                <SelectItem value='D3'>D3</SelectItem>
                <SelectItem value='S1/D4'>S1/D4</SelectItem>
                <SelectItem value='S2'>S2</SelectItem>
                <SelectItem value='S3'>S3</SelectItem>
                <SelectItem value='Other'>Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {editPersonal && (
            <div className='text-right'>
              <Button
                onClick={handleSavePersonal}
                className='bg-blue-600 text-white hover:bg-blue-700'
              >
                Save Changes
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className='flex flex-col gap-6'>
        <Card className='border border-slate-100 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900'>
          <CardHeader className='flex flex-row items-center justify-between border-b pb-3 dark:border-slate-700'>
            <CardTitle className='text-lg font-semibold text-slate-800 dark:text-slate-100'>
              Bank Information
            </CardTitle>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => setEditBank(!editBank)}
              className='rounded-md px-4 py-2 text-blue-600 transition-colors duration-150 hover:bg-slate-100 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-slate-700/50 dark:hover:text-blue-300'
            >
              <Pencil className='mr-2 h-4 w-4' />
              {editBank ? 'Cancel' : 'Edit'}
            </Button>
          </CardHeader>
          <CardContent className='space-y-4 p-6'>
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <div>
                <Label
                  htmlFor='bankName'
                  className='text-sm font-medium text-slate-600 dark:text-slate-400'
                >
                  Bank Name
                </Label>
                <Input
                  id='bankName'
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  disabled={!editBank}
                  className='mt-1 border-slate-300 bg-slate-50 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-70 dark:border-slate-600 dark:bg-slate-800'
                />
              </div>
              <div>
                <Label
                  htmlFor='bankAccountHolder'
                  className='text-sm font-medium text-slate-600 dark:text-slate-400'
                >
                  Account Holder Name
                </Label>
                <Input
                  id='bankAccountHolder'
                  value={bankAccountHolder}
                  onChange={(e) => setBankAccountHolder(e.target.value)}
                  disabled={!editBank}
                  className='mt-1 border-slate-300 bg-slate-50 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-70 dark:border-slate-600 dark:bg-slate-800'
                />
              </div>
              <div className='sm:col-span-2'>
                <Label
                  htmlFor='bankAccountNumber'
                  className='text-sm font-medium text-slate-600 dark:text-slate-400'
                >
                  Account Number
                </Label>
                <Input
                  id='bankAccountNumber'
                  value={bankAccountNumber}
                  onChange={(e) => setBankAccountNumber(e.target.value)}
                  disabled={!editBank}
                  className='mt-1 border-slate-300 bg-slate-50 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-70 dark:border-slate-600 dark:bg-slate-800'
                />
              </div>
            </div>
            {editBank && (
              <div className='text-right'>
                <Button
                  onClick={handleSaveBank}
                  className='bg-blue-600 text-white hover:bg-blue-700'
                >
                  Save Changes
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Account Actions Card */}
        <Card className='border border-slate-100 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900'>
          <CardHeader className='flex flex-row items-center justify-between border-b pb-3 dark:border-slate-700'>
            <CardTitle className='text-lg font-semibold text-slate-800 dark:text-slate-100'>
              Account Actions
            </CardTitle>
          </CardHeader>
          <CardContent className='flex justify-start p-6'>
            <Button variant='destructive' onClick={handleResetPassword}>
              <KeyRound className='mr-2 h-4 w-4' />
              Reset Password
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmployeeInformation;
