'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export function AddEmployeeHeader() {
  return (
    <div className='mb-6 flex items-center justify-between'>
      <Link href='/employee-management'>
        <Button
          variant='outline'
          className='border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100'
        >
          <ArrowLeft className='mr-2 h-4 w-4' />
          Back to Employee List
        </Button>
      </Link>
    </div>
  );
}
