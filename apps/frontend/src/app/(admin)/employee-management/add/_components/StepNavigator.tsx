'use client';

import React, { Fragment } from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface Step {
  label: string;
}

interface StepNavigatorProps {
  steps: Step[];
  activeStep: number;
  onStepClick: (stepNumber: number) => void;
  isStepValid: (stepIndex: number) => boolean;
}

export function StepNavigator({ steps, activeStep, onStepClick, isStepValid }: StepNavigatorProps) {
  return (
    <div className='mb-8 flex w-full items-center'>
      {steps.map((step, idx) => {
        const stepNumber = idx + 1;
        const isActive = activeStep === stepNumber;
        const isCompleted = stepNumber < activeStep && isStepValid(idx);
        const canAccess = stepNumber <= activeStep || isCompleted;

        return (
          <Fragment key={step.label}>
            <div className='flex flex-col items-center'>
              <button
                type='button'
                onClick={() => onStepClick(stepNumber)}
                disabled={!canAccess && stepNumber > activeStep}
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all duration-150',
                  isActive
                    ? 'bg-primary border-primary text-white'
                    : isCompleted
                      ? 'border-green-500 bg-green-500 text-white hover:cursor-pointer'
                      : canAccess
                        ? 'hover:border-primary hover:text-primary border-slate-300 bg-white text-slate-600 hover:cursor-pointer dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400'
                        : 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-600',
                )}
              >
                {isCompleted ? <Check className='h-5 w-5' /> : stepNumber}
              </button>
              <span
                className={cn(
                  'mt-2 text-center text-xs font-medium',
                  isActive
                    ? 'text-primary dark:text-primary-foreground'
                    : isCompleted
                      ? 'text-green-600 dark:text-green-400'
                      : canAccess
                        ? 'text-slate-500 dark:text-slate-400'
                        : 'text-slate-400 dark:text-slate-600',
                )}
              >
                {step.label}
              </span>
            </div>

            {idx < steps.length - 1 && (
              <div
                className={cn(
                  'mx-2 mt-5 h-0.5 flex-1 self-start transition-colors duration-150',
                  isCompleted ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-700',
                )}
              />
            )}
          </Fragment>
        );
      })}
    </div>
  );
}
