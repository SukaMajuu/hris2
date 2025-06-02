'use client';

import React from 'react';
import { Button } from '@/components/ui/button';

interface FormNavigationProps {
  activeStep: number;
  totalSteps: number;
  onBack: () => void;
  onNext: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function FormNavigation({
  activeStep,
  totalSteps,
  onBack,
  onNext,
  onSubmit,
}: FormNavigationProps) {
  return (
    <div className='mt-8 flex justify-end gap-3'>
      {activeStep > 1 && (
        <Button
          type='button'
          variant={'outline'}
          onClick={onBack}
          className='border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
        >
          Back
        </Button>
      )}
      {activeStep < totalSteps ? (
        <Button
          type='button'
          onClick={onNext}
          className='bg-primary hover:bg-primary/90 text-primary-foreground'
        >
          Next
        </Button>
      ) : (
        <Button
          type='submit'
          className='bg-primary hover:bg-primary/90 text-primary-foreground'
          onClick={onSubmit}
        >
          Submit
        </Button>
      )}
    </div>
  );
}
