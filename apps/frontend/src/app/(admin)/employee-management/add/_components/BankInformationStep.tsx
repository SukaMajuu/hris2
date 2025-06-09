'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import type { FormEmployeeData } from '../_hooks/useAddEmployeeForm';
import { FieldErrors } from 'react-hook-form';

interface BankInformationStepProps {
  formData: FormEmployeeData;
  errors: FieldErrors<FormEmployeeData>;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function BankInformationStep({ formData, errors, onInputChange }: BankInformationStepProps) {
  return (
    <>
      <h2 className='text-center text-xl font-semibold text-slate-800 dark:text-slate-100'>
        Bank Information
      </h2>
      <Separator
        orientation='horizontal'
        className='mx-auto my-6 w-48 bg-slate-300 dark:bg-slate-700'
      />
      <form>
        <div className='grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2'>
          <div>
            <label
              htmlFor='bankName'
              className='mb-1 block text-sm font-medium text-slate-600 dark:text-slate-400'
            >
              Bank Name *
            </label>
            <Input
              id='bankName'
              name='bankName'
              value={formData.bankName}
              onChange={onInputChange}
              placeholder='Enter bank name'
              className={`focus:ring-primary focus:border-primary mt-1 w-full border-slate-300 bg-slate-50 placeholder:text-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:placeholder:text-slate-500 ${
                errors.bankName ? 'border-red-500 focus:border-red-500' : ''
              }`}
            />
            {errors.bankName && (
              <p className='mt-1 text-sm text-red-500'>{errors.bankName.message}</p>
            )}
          </div>
          <div>
            <label
              htmlFor='bankAccountHolder'
              className='mb-1 block text-sm font-medium text-slate-600 dark:text-slate-400'
            >
              Account Holder Name *
            </label>
            <Input
              id='bankAccountHolder'
              name='bankAccountHolder'
              value={formData.bankAccountHolder}
              onChange={onInputChange}
              placeholder='Enter account holder name'
              className={`focus:ring-primary focus:border-primary mt-1 w-full border-slate-300 bg-slate-50 placeholder:text-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:placeholder:text-slate-500 ${
                errors.bankAccountHolder ? 'border-red-500 focus:border-red-500' : ''
              }`}
            />
            {errors.bankAccountHolder && (
              <p className='mt-1 text-sm text-red-500'>{errors.bankAccountHolder.message}</p>
            )}
          </div>
          <div className='md:col-span-2'>
            <label
              htmlFor='bankAccountNumber'
              className='mb-1 block text-sm font-medium text-slate-600 dark:text-slate-400'
            >
              Account Number *
            </label>
            <Input
              id='bankAccountNumber'
              name='bankAccountNumber'
              value={formData.bankAccountNumber}
              onChange={onInputChange}
              placeholder='Enter account number'
              inputMode='numeric'
              pattern='[0-9]*'
              className={`focus:ring-primary focus:border-primary mt-1 w-full border-slate-300 bg-slate-50 placeholder:text-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:placeholder:text-slate-500 ${
                errors.bankAccountNumber ? 'border-red-500 focus:border-red-500' : ''
              }`}
            />
            {errors.bankAccountNumber && (
              <p className='mt-1 text-sm text-red-500'>{errors.bankAccountNumber.message}</p>
            )}
            <p className='mt-1 text-xs text-slate-500 dark:text-slate-400'>
              Account number must only contain numbers
            </p>
          </div>
        </div>
      </form>
    </>
  );
}
