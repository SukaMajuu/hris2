'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import type { EmployeeFormData } from '../_hooks/useAddEmployeeForm';
import { FieldErrors } from 'react-hook-form';

interface PersonalInformationStepProps {
  formData: EmployeeFormData;
  errors: FieldErrors<EmployeeFormData>;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectChange: (name: string, value: string) => void;
}

export function PersonalInformationStep({
  formData,
  errors,
  onInputChange,
  onSelectChange,
}: PersonalInformationStepProps) {
  return (
    <>
      <h2 className='text-center text-xl font-semibold text-slate-800 dark:text-slate-100'>
        Personal Information
      </h2>
      <Separator
        orientation='horizontal'
        className='mx-auto my-6 w-48 bg-slate-300 dark:bg-slate-700'
      />
      <form>
        <div className='grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2'>
          <div>
            <label
              htmlFor='firstName'
              className='mb-1 block text-sm font-medium text-slate-600 dark:text-slate-400'
            >
              First Name *
            </label>
            <Input
              id='firstName'
              name='firstName'
              value={formData.firstName}
              onChange={onInputChange}
              placeholder='Enter first name'
              className={`focus:ring-primary focus:border-primary mt-1 w-full border-slate-300 bg-slate-50 placeholder:text-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:placeholder:text-slate-500 ${
                errors.firstName ? 'border-red-500 focus:border-red-500' : ''
              }`}
            />
            {errors.firstName && (
              <p className='mt-1 text-sm text-red-500'>{errors.firstName.message}</p>
            )}
          </div>
          <div>
            <label
              htmlFor='lastName'
              className='mb-1 block text-sm font-medium text-slate-600 dark:text-slate-400'
            >
              Last Name
            </label>
            <Input
              id='lastName'
              name='lastName'
              value={formData.lastName || ''}
              onChange={onInputChange}
              placeholder='Enter last name'
              className={`focus:ring-primary focus:border-primary mt-1 w-full border-slate-300 bg-slate-50 placeholder:text-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:placeholder:text-slate-500 ${
                errors.lastName ? 'border-red-500 focus:border-red-500' : ''
              }`}
            />
            {errors.lastName && (
              <p className='mt-1 text-sm text-red-500'>{errors.lastName.message}</p>
            )}
          </div>
          <div>
            <label
              htmlFor='email'
              className='mb-1 block text-sm font-medium text-slate-600 dark:text-slate-400'
            >
              Email *
            </label>
            <Input
              id='email'
              name='email'
              type='email'
              value={formData.email}
              onChange={onInputChange}
              placeholder='Enter email address'
              className={`focus:ring-primary focus:border-primary mt-1 w-full border-slate-300 bg-slate-50 placeholder:text-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:placeholder:text-slate-500 ${
                errors.email ? 'border-red-500 focus:border-red-500' : ''
              }`}
            />
            {errors.email && <p className='mt-1 text-sm text-red-500'>{errors.email.message}</p>}
          </div>
          <div>
            <label
              htmlFor='nik'
              className='mb-1 block text-sm font-medium text-slate-600 dark:text-slate-400'
            >
              NIK *
            </label>
            <Input
              id='nik'
              name='nik'
              value={formData.nik}
              onChange={onInputChange}
              placeholder='Enter NIK (16 digits)'
              maxLength={16}
              className={`focus:ring-primary focus:border-primary mt-1 w-full border-slate-300 bg-slate-50 placeholder:text-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:placeholder:text-slate-500 ${
                errors.nik ? 'border-red-500 focus:border-red-500' : ''
              }`}
            />
            {errors.nik && <p className='mt-1 text-sm text-red-500'>{errors.nik.message}</p>}
          </div>
          <div>
            <label
              htmlFor='phoneNumber'
              className='mb-1 block text-sm font-medium text-slate-600 dark:text-slate-400'
            >
              Phone Number *
            </label>
            <Input
              id='phoneNumber'
              name='phoneNumber'
              value={formData.phoneNumber}
              onChange={onInputChange}
              placeholder='e.g., +62812345678'
              className={`focus:ring-primary focus:border-primary mt-1 w-full border-slate-300 bg-slate-50 placeholder:text-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:placeholder:text-slate-500 ${
                errors.phoneNumber ? 'border-red-500 focus:border-red-500' : ''
              }`}
            />
            {errors.phoneNumber && (
              <p className='mt-1 text-sm text-red-500'>{errors.phoneNumber.message}</p>
            )}
          </div>
          <div>
            <label
              htmlFor='gender'
              className='mb-1 block text-sm font-medium text-slate-600 dark:text-slate-400'
            >
              Gender *
            </label>
            <Select value={formData.gender} onValueChange={(v) => onSelectChange('gender', v)}>
              <SelectTrigger
                id='gender'
                className={`focus:ring-primary focus:border-primary mt-1 w-full border-slate-300 bg-slate-50 dark:border-slate-600 dark:bg-slate-800 ${
                  errors.gender ? 'border-red-500 focus:border-red-500' : ''
                }`}
              >
                <SelectValue placeholder='Choose gender' />
              </SelectTrigger>
              <SelectContent className='bg-white dark:bg-slate-800'>
                <SelectItem value='Male'>Male</SelectItem>
                <SelectItem value='Female'>Female</SelectItem>
              </SelectContent>
            </Select>
            {errors.gender && <p className='mt-1 text-sm text-red-500'>{errors.gender.message}</p>}
          </div>
          <div>
            <label
              htmlFor='lastEducation'
              className='mb-1 block text-sm font-medium text-slate-600 dark:text-slate-400'
            >
              Last Education *
            </label>
            <Select
              value={formData.lastEducation}
              onValueChange={(v) => onSelectChange('lastEducation', v)}
            >
              <SelectTrigger
                id='lastEducation'
                className={`focus:ring-primary focus:border-primary mt-1 w-full border-slate-300 bg-slate-50 dark:border-slate-600 dark:bg-slate-800 ${
                  errors.lastEducation ? 'border-red-500 focus:border-red-500' : ''
                }`}
              >
                <SelectValue placeholder='Choose education' />
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
            {errors.lastEducation && (
              <p className='mt-1 text-sm text-red-500'>{errors.lastEducation.message}</p>
            )}
          </div>
          <div>
            <label
              htmlFor='placeOfBirth'
              className='mb-1 block text-sm font-medium text-slate-600 dark:text-slate-400'
            >
              Place of Birth *
            </label>
            <Input
              id='placeOfBirth'
              name='placeOfBirth'
              value={formData.placeOfBirth}
              onChange={onInputChange}
              placeholder='Enter place of birth'
              className={`focus:ring-primary focus:border-primary mt-1 w-full border-slate-300 bg-slate-50 placeholder:text-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:placeholder:text-slate-500 ${
                errors.placeOfBirth ? 'border-red-500 focus:border-red-500' : ''
              }`}
            />
            {errors.placeOfBirth && (
              <p className='mt-1 text-sm text-red-500'>{errors.placeOfBirth.message}</p>
            )}
          </div>
          <div>
            <label
              htmlFor='dateOfBirth'
              className='mb-1 block text-sm font-medium text-slate-600 dark:text-slate-400'
            >
              Date of Birth *
            </label>
            <Input
              id='dateOfBirth'
              name='dateOfBirth'
              type='date'
              value={formData.dateOfBirth}
              onChange={onInputChange}
              className={`focus:ring-primary focus:border-primary mt-1 w-full border-slate-300 bg-slate-50 placeholder:text-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:placeholder:text-slate-500 ${
                errors.dateOfBirth ? 'border-red-500 focus:border-red-500' : ''
              }`}
            />
            {errors.dateOfBirth && (
              <p className='mt-1 text-sm text-red-500'>{errors.dateOfBirth.message}</p>
            )}
          </div>
          <div>
            <label
              htmlFor='taxStatus'
              className='mb-1 block text-sm font-medium text-slate-600 dark:text-slate-400'
            >
              Tax Status *
            </label>
            <Select
              value={formData.taxStatus}
              onValueChange={(v) => onSelectChange('taxStatus', v)}
            >
              <SelectTrigger
                id='taxStatus'
                className={`focus:ring-primary focus:border-primary mt-1 w-full border-slate-300 bg-slate-50 dark:border-slate-600 dark:bg-slate-800 ${
                  errors.taxStatus ? 'border-red-500 focus:border-red-500' : ''
                }`}
              >
                <SelectValue placeholder='Choose tax status' />
              </SelectTrigger>
              <SelectContent className='bg-white dark:bg-slate-800'>
                <SelectItem value='TK/0'>TK/0 - Tidak Kawin, 0 Tanggungan</SelectItem>
                <SelectItem value='TK/1'>TK/1 - Tidak Kawin, 1 Tanggungan</SelectItem>
                <SelectItem value='TK/2'>TK/2 - Tidak Kawin, 2 Tanggungan</SelectItem>
                <SelectItem value='TK/3'>TK/3 - Tidak Kawin, 3 Tanggungan</SelectItem>
                <SelectItem value='K/0'>K/0 - Kawin, 0 Tanggungan</SelectItem>
                <SelectItem value='K/1'>K/1 - Kawin, 1 Tanggungan</SelectItem>
                <SelectItem value='K/2'>K/2 - Kawin, 2 Tanggungan</SelectItem>
                <SelectItem value='K/3'>K/3 - Kawin, 3 Tanggungan</SelectItem>
                <SelectItem value='K/I/0'>K/I/0 - Kawin, Istri Bekerja, 0 Tanggungan</SelectItem>
                <SelectItem value='K/I/1'>K/I/1 - Kawin, Istri Bekerja, 1 Tanggungan</SelectItem>
                <SelectItem value='K/I/2'>K/I/2 - Kawin, Istri Bekerja, 2 Tanggungan</SelectItem>
                <SelectItem value='K/I/3'>K/I/3 - Kawin, Istri Bekerja, 3 Tanggungan</SelectItem>
              </SelectContent>
            </Select>
            {errors.taxStatus && (
              <p className='mt-1 text-sm text-red-500'>{errors.taxStatus.message}</p>
            )}
          </div>
        </div>
      </form>
    </>
  );
}
