'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import type { EmployeeFormData } from '../_hooks/useAddEmployeeForm';

interface EmployeeInformationStepProps {
  formData: EmployeeFormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemovePhoto: () => void;
  profilePhotoInputRef: React.RefObject<HTMLInputElement | null>;
}

export function EmployeeInformationStep({
  formData,
  onInputChange,
  onRemovePhoto,
  profilePhotoInputRef,
}: EmployeeInformationStepProps) {
  return (
    <>
      <h2 className='text-center text-xl font-semibold text-slate-800 dark:text-slate-100'>
        Employee Information
      </h2>
      <Separator
        orientation='horizontal'
        className='mx-auto my-6 w-48 bg-slate-300 dark:bg-slate-700'
      />
      <form>
        <div className='mb-6 flex flex-col items-center'>
          <label
            htmlFor='profilePhoto'
            className='mb-2 block text-sm font-medium text-slate-600 dark:text-slate-400'
          >
            Profile Photo
          </label>
          <Input
            id='profilePhoto'
            type='file'
            name='profilePhoto'
            accept='image/*'
            className='focus:ring-primary focus:border-primary file:bg-primary hover:file:bg-primary/90 mt-1 w-full max-w-xs border-slate-300 bg-slate-50 file:mr-4 file:rounded-md file:border-0 file:px-4 file:text-sm file:font-semibold file:text-white dark:border-slate-600 dark:bg-slate-800'
            onChange={onInputChange}
            ref={profilePhotoInputRef}
          />
          {formData.profilePhotoPreview && (
            <>
              <Image
                src={formData.profilePhotoPreview}
                alt='Profile Preview'
                width={128}
                height={128}
                className='mt-4 h-32 w-32 rounded-full border-2 border-slate-200 object-cover shadow-md dark:border-slate-700'
              />
              {formData.profilePhoto && (
                <span className='mt-2 block text-xs text-slate-500 dark:text-slate-400'>
                  File: {formData.profilePhoto.name}
                </span>
              )}
              <Button
                type='button'
                variant='outline'
                size='sm'
                className='mt-3 border-red-500 text-red-600 hover:bg-red-50 dark:border-red-500 dark:text-red-400 dark:hover:bg-red-700/20 dark:hover:text-red-300'
                onClick={onRemovePhoto}
              >
                Remove Photo
              </Button>
            </>
          )}
        </div>
        <div className='grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2'>
          <div>
            <label
              htmlFor='employeeId'
              className='mb-1 block text-sm font-medium text-slate-600 dark:text-slate-400'
            >
              Employee ID
            </label>
            <Input
              id='employeeId'
              name='employeeId'
              value={formData.employeeId}
              onChange={onInputChange}
              placeholder='Enter employee ID'
              className='focus:ring-primary focus:border-primary mt-1 w-full border-slate-300 bg-slate-50 dark:border-slate-600 dark:bg-slate-800'
            />
          </div>
          <div>
            <label
              htmlFor='branch'
              className='mb-1 block text-sm font-medium text-slate-600 dark:text-slate-400'
            >
              Branch
            </label>
            <Input
              id='branch'
              name='branch'
              value={formData.branch}
              onChange={onInputChange}
              placeholder='Enter branch'
              className='focus:ring-primary focus:border-primary mt-1 w-full border-slate-300 bg-slate-50 dark:border-slate-600 dark:bg-slate-800'
            />
          </div>
          <div>
            <label
              htmlFor='position'
              className='mb-1 block text-sm font-medium text-slate-600 dark:text-slate-400'
            >
              Position
            </label>
            <Input
              id='position'
              name='position'
              value={formData.position}
              onChange={onInputChange}
              placeholder='Enter position'
              className='focus:ring-primary focus:border-primary mt-1 w-full border-slate-300 bg-slate-50 dark:border-slate-600 dark:bg-slate-800'
            />
          </div>
          <div>
            <label
              htmlFor='grade'
              className='mb-1 block text-sm font-medium text-slate-600 dark:text-slate-400'
            >
              Grade
            </label>
            <Input
              id='grade'
              name='grade'
              value={formData.grade}
              onChange={onInputChange}
              placeholder='Enter grade'
              className='focus:ring-primary focus:border-primary mt-1 w-full border-slate-300 bg-slate-50 dark:border-slate-600 dark:bg-slate-800'
            />
          </div>
        </div>
      </form>
    </>
  );
}
