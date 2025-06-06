'use client';

import React, { useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import Image from 'next/image';
import type { FormEmployeeData } from '../_hooks/useAddEmployeeForm';
import { FieldErrors } from 'react-hook-form';
import { useRealtimeValidation } from '../_hooks/useRealtimeValidation';

interface EmployeeInformationStepProps {
  formData: FormEmployeeData;
  errors: FieldErrors<FormEmployeeData>;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectChange: (name: string, value: string) => void;
  onRemovePhoto: () => void;
  profilePhotoInputRef: React.RefObject<HTMLInputElement | null>;
}

export function EmployeeInformationStep({
  formData,
  errors,
  onInputChange,
  onSelectChange,
  onRemovePhoto,
  profilePhotoInputRef,
}: EmployeeInformationStepProps) {
  const { validationStates, validateField, clearValidation } = useRealtimeValidation();

  // Trigger validation when employeeId changes
  useEffect(() => {
    if (formData.employeeId && formData.employeeId.trim()) {
      validateField('employee_code', formData.employeeId);
    } else if (!formData.employeeId) {
      clearValidation('employee_code');
    }
  }, [formData.employeeId, validateField, clearValidation]);

  const getFieldValidationIcon = (field: 'employee_code') => {
    const state = validationStates[field];
    if (state.isValidating) {
      return <Loader2 className='h-4 w-4 animate-spin text-blue-500' />;
    }
    if (state.isValid === true) {
      return <CheckCircle className='h-4 w-4 text-green-500' />;
    }
    if (state.isValid === false) {
      return <XCircle className='h-4 w-4 text-red-500' />;
    }
    return null;
  };

  const getFieldValidationMessage = (field: 'employee_code') => {
    const state = validationStates[field];
    if (state.message) {
      return <p className='mt-1 text-sm text-red-500'>{state.message}</p>;
    }
    return null;
  };

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
                className='mt-3 cursor-pointer border-red-500 text-red-600 hover:bg-red-50 dark:border-red-500 dark:text-red-400 dark:hover:bg-red-700/20 dark:hover:text-red-300'
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
              Employee ID *
            </label>
            <div className='relative'>
              <Input
                id='employeeId'
                name='employeeId'
                value={formData.employeeId}
                onChange={onInputChange}
                placeholder='Enter employee ID'
                className={`focus:ring-primary focus:border-primary mt-1 w-full border-slate-300 bg-slate-50 pr-10 placeholder:text-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:placeholder:text-slate-500 ${
                  errors.employeeId || validationStates.employee_code.isValid === false
                    ? 'border-red-500 focus:border-red-500'
                    : validationStates.employee_code.isValid === true
                      ? 'border-green-500 focus:border-green-500'
                      : ''
                }`}
              />
              <div className='absolute top-1/2 right-3 -translate-y-1/2'>
                {getFieldValidationIcon('employee_code')}
              </div>
            </div>
            {errors.employeeId && (
              <p className='mt-1 text-sm text-red-500'>{errors.employeeId.message}</p>
            )}
            {!errors.employeeId && getFieldValidationMessage('employee_code')}
          </div>
          <div>
            <label
              htmlFor='branch'
              className='mb-1 block text-sm font-medium text-slate-600 dark:text-slate-400'
            >
              Branch *
            </label>
            <Input
              id='branch'
              name='branch'
              value={formData.branch}
              onChange={onInputChange}
              placeholder='Enter branch name'
              className={`focus:ring-primary focus:border-primary mt-1 w-full border-slate-300 bg-slate-50 placeholder:text-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:placeholder:text-slate-500 ${
                errors.branch ? 'border-red-500 focus:border-red-500' : ''
              }`}
            />
            {errors.branch && <p className='mt-1 text-sm text-red-500'>{errors.branch.message}</p>}
          </div>
          <div>
            <label
              htmlFor='position'
              className='mb-1 block text-sm font-medium text-slate-600 dark:text-slate-400'
            >
              Position *
            </label>
            <Input
              id='position'
              name='position'
              value={formData.position}
              onChange={onInputChange}
              placeholder='Enter position name'
              className={`focus:ring-primary focus:border-primary mt-1 w-full border-slate-300 bg-slate-50 placeholder:text-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:placeholder:text-slate-500 ${
                errors.position ? 'border-red-500 focus:border-red-500' : ''
              }`}
            />
            {errors.position && (
              <p className='mt-1 text-sm text-red-500'>{errors.position.message}</p>
            )}
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
              className={`focus:ring-primary focus:border-primary mt-1 w-full border-slate-300 bg-slate-50 placeholder:text-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:placeholder:text-slate-500 ${
                errors.grade ? 'border-red-500 focus:border-red-500' : ''
              }`}
            />
            {errors.grade && <p className='mt-1 text-sm text-red-500'>{errors.grade.message}</p>}
          </div>
          <div>
            <label
              htmlFor='contractType'
              className='mb-1 block text-sm font-medium text-slate-600 dark:text-slate-400'
            >
              Contract Type *
            </label>
            <Select
              value={formData.contractType}
              onValueChange={(value) => onSelectChange('contractType', value)}
            >
              <SelectTrigger
                className={`focus:ring-primary focus:border-primary mt-1 w-full cursor-pointer border-slate-300 bg-slate-50 dark:border-slate-600 dark:bg-slate-800 ${
                  formData.contractType
                    ? '[&>span]:text-slate-700 dark:[&>span]:text-slate-200'
                    : '[&>span]:text-slate-400 dark:[&>span]:text-slate-500'
                } ${errors.contractType ? 'border-red-500 focus:border-red-500' : ''}`}
              >
                <SelectValue placeholder='Select contract type' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='permanent' className='cursor-pointer'>
                  Permanent
                </SelectItem>
                <SelectItem value='contract' className='cursor-pointer'>
                  Contract
                </SelectItem>
                <SelectItem value='freelance' className='cursor-pointer'>
                  Freelance
                </SelectItem>
              </SelectContent>
            </Select>
            {errors.contractType && (
              <p className='mt-1 text-sm text-red-500'>{errors.contractType.message}</p>
            )}
          </div>
          <div>
            <label
              htmlFor='hireDate'
              className='mb-1 block text-sm font-medium text-slate-600 dark:text-slate-400'
            >
              Hire Date *
            </label>
            <Input
              id='hireDate'
              name='hireDate'
              type='date'
              value={formData.hireDate}
              readOnly
              className={`focus:ring-primary focus:border-primary mt-1 w-full cursor-not-allowed border-slate-300 bg-slate-100 dark:border-slate-600 dark:bg-slate-700 ${
                errors.hireDate ? 'border-red-500 focus:border-red-500' : ''
              }`}
            />
            <p className='mt-1 text-xs text-slate-500 dark:text-slate-400'>
              Hire date is automatically set to today&apos;s date, you can change it later in Detail
            </p>
            {errors.hireDate && (
              <p className='mt-1 text-sm text-red-500'>{errors.hireDate.message}</p>
            )}
          </div>
        </div>
      </form>
    </>
  );
}
