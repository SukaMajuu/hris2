'use client';

import { useState, Fragment } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';

import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

export default function AddEmployeePage() {
  const [activeStep, setActiveStep] = useState(1);

  const steps = [
    { label: 'Personal Information' },
    { label: 'Employee Information' },
    { label: 'Document Information' },
  ];

  const handleNextStep = () => {
    if (activeStep < steps.length) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const [showCancelDialog, setShowCancelDialog] = useState(false);

  return (
    <div className='max-w-auto mx-auto'>
      <h1 className='mx-auto mb-4 rounded-md bg-white px-4 py-3 text-lg font-semibold'>
        Add Employee Data
      </h1>

      <div className='mb-6 flex w-full items-center justify-center'>
        {steps.map((step, idx) => (
          <Fragment key={step.label}>
            <div className='flex flex-col items-center'>
              <button
                type='button'
                onClick={() => setActiveStep(idx + 1)}
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full border font-bold transition-all duration-150',
                  activeStep === idx + 1
                    ? 'bg-secondary border-secondary text-white'
                    : 'bg-secondary-foreground text-secondary border-blue-200',
                )}
              >
                {idx + 1}
              </button>
              <span className='mt-1 text-center text-xs'>{step.label}</span>
            </div>

            {idx < steps.length - 1 && <div className='mt-4 h-0.5 w-16 self-start bg-gray-300' />}
          </Fragment>
        ))}
      </div>

      <Card className='border-none p-8'>
        {activeStep === 1 && (
          <>
            <h2 className='text-center text-xl font-bold'>Personal Information</h2>
            <Separator orientation='horizontal' className='mx-auto my-2 w-48 bg-gray-300' />
            <form>
              <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                <div className='border-none'>
                  <label className='mb-1 block font-medium'>First Name</label>
                  <Input placeholder='Enter' className='border-secondary' />
                </div>
                <div>
                  <label className='mb-1 block font-medium'>Last Name</label>
                  <Input placeholder='Enter' className='border-secondary' />
                </div>
                <div>
                  <label className='mb-1 block font-medium'>NIK</label>
                  <Input placeholder='Enter' className='border-secondary' />
                </div>
                <div>
                  <label className='mb-1 block font-medium'>Phone Number</label>
                  <Input placeholder='Enter' className='border-secondary' />
                </div>
                <div>
                  <label className='mb-1 block font-medium'>Gender</label>
                  <Select>
                    <SelectTrigger className='border-secondary min-w-full'>
                      <SelectValue placeholder='Choose' className='border-secondary' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='male'>Male</SelectItem>
                      <SelectItem value='female'>Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className='mb-1 block font-medium'>Last Education</label>
                  <Select>
                    <SelectTrigger className='border-secondary min-w-full'>
                      <SelectValue placeholder='Choose' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='sma'>SMA/SMK</SelectItem>
                      <SelectItem value='d3'>D3</SelectItem>
                      <SelectItem value='s1'>S1</SelectItem>
                      <SelectItem value='s2'>S2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className='mb-1 block font-medium'>Place of Birth</label>
                  <Input placeholder='Enter' className='border-secondary' />
                </div>
                <div>
                  <label className='mb-1 block font-medium'>Date of Birth</label>
                  <DateInput />
                </div>
              </div>
            </form>
          </>
        )}
        {activeStep === 2 && (
          <>
            <h2 className='text-center text-xl font-bold'>Employee Information</h2>
            <Separator orientation='horizontal' className='mx-auto my-2 w-48 bg-gray-300' />
            <form>
              <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                <div>
                  <label className='mb-1 block font-medium'>Employee ID</label>
                  <Input placeholder='Enter' className='border-secondary' />
                </div>
                <div>
                  <label className='mb-1 block font-medium'>Branch</label>
                  <Input placeholder='Enter' className='border-secondary' />
                </div>
                <div>
                  <label className='mb-1 block font-medium'>Position</label>
                  <Input placeholder='Enter' className='border-secondary' />
                </div>
                <div>
                  <label className='mb-1 block font-medium'>Grade</label>
                  <Input placeholder='Enter' className='border-secondary' />
                </div>
              </div>
            </form>
          </>
        )}
        {activeStep === 3 && (
          <>
            <h2 className='text-center text-xl font-bold'>Document Information</h2>
            <Separator orientation='horizontal' className='mx-auto my-2 w-48 bg-gray-300' />
            <form>
              <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                <div>
                  <label className='mb-1 block font-medium'>zzz</label>
                  <Input placeholder='zzz' className='border-secondary' />
                </div>
                <div>
                  <label className='mb-1 block font-medium'>Upload Document</label>
                  <Input type='file' className='border-secondary' />
                </div>
              </div>
            </form>
          </>
        )}
      </Card>

      <div className='mt-8 flex justify-end gap-3'>
        <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <AlertDialogTrigger asChild>
            <Button
              type='button'
              variant='outline'
              className='hover:bg-destructive bg-[#c7d3dd] text-black'
            >
              Close
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>All entered data will be discarded.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className='hover:bg-secondary'>Close</AlertDialogCancel>
              <AlertDialogAction
                className='bg-destructive hover:bg-red-500'
                onClick={() => {
                  window.location.href = '/employee-management';
                }}
              >
                Yes
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        {activeStep < steps.length ? (
          <Button
            type='button'
            onClick={handleNextStep}
            className='bg-secondary text-white hover:bg-gray-500'
          >
            Next
          </Button>
        ) : (
          <Button type='submit' className='bg-primary hover:bg-primary/80 text-white'>
            Submit
          </Button>
        )}
      </div>
    </div>
  );
}

function DateInput() {
  const [value, setValue] = useState<Date | undefined>(new Date());
  const currentYear = new Date().getFullYear();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant='outline' className='w-full justify-between'>
          {value ? value.toLocaleDateString() : 'Pick a date'}
          <CalendarIcon className='ml-2 h-4 w-4' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0'>
        <Calendar
          mode='single'
          selected={value}
          onSelect={(date) => {
            setValue(date);
          }}
          initialFocus
          captionLayout='dropdown-buttons'
          fromYear={1900}
          toYear={currentYear + 5}
        />
      </PopoverContent>
    </Popover>
  );
}
