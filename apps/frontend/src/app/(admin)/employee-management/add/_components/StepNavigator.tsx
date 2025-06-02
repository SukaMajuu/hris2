'use client';

import React, { Fragment } from 'react';
import { cn } from '@/lib/utils';

interface Step {
  label: string;
}

interface StepNavigatorProps {
  steps: Step[];
  activeStep: number;
  onStepClick: (stepNumber: number) => void;
}

export function StepNavigator({ steps, activeStep, onStepClick }: StepNavigatorProps) {
  return (
    <div className='mb-8 flex w-full items-center'>
      {steps.map((step, idx) => (
        <Fragment key={step.label}>
          <div className='flex flex-col items-center'>
            <button
              type='button'
              onClick={() => onStepClick(idx + 1)}
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all duration-150 hover:cursor-pointer',
                activeStep === idx + 1
                  ? 'bg-primary border-primary text-white'
                  : 'hover:border-primary hover:text-primary border-slate-300 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400',
              )}
            >
              {idx + 1}
            </button>
            <span
              className={cn(
                'mt-2 text-center text-xs font-medium',
                activeStep === idx + 1
                  ? 'text-primary dark:text-primary-foreground'
                  : 'text-slate-500 dark:text-slate-400',
              )}
            >
              {step.label}
            </span>
          </div>

          {idx < steps.length - 1 && (
            <div className='mx-2 mt-5 h-0.5 flex-1 self-start bg-slate-300 dark:bg-slate-700' />
          )}
        </Fragment>
      ))}
    </div>
  );
}
