'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCreateLeaveRequestMutation } from '@/api/mutations/leave-request.mutations';
import { LeaveType } from '@/types/leave-request';
import { useToast } from '@/components/ui/use-toast';

interface DialogFormData {
  attendanceType: string;
  checkIn: string;
  checkOut: string;
  latitude: string;
  longitude: string;
  permitEndDate: string;
  startDate: string;
  reason: string;
  evidence: FileList | null;
}

interface PermitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dialogTitle: string;
  formMethods: UseFormReturn<DialogFormData>;
  onSubmit: (data: DialogFormData) => void;
  currentAttendanceType: string;
}

export function PermitDialog({
  open,
  onOpenChange,
  dialogTitle,
  formMethods,
  onSubmit,
  currentAttendanceType,
}: PermitDialogProps) {
  const { register, handleSubmit, watch } = formMethods;
  const { toast } = useToast();
  const createLeaveRequestMutation = useCreateLeaveRequestMutation();

  const permitRelatedLeaveTypes = [
    'sick leave',
    'compassionate leave',
    'maternity leave',
    'annual leave',
    'marriage leave',
  ];

  // Map attendance types to LeaveType enum
  const mapAttendanceTypeToLeaveType = (attendanceType: string): LeaveType => {
    switch (attendanceType) {
      case 'sick leave':
        return LeaveType.SICK_LEAVE;
      case 'compassionate leave':
        return LeaveType.COMPASSIONATE_LEAVE;
      case 'maternity leave':
        return LeaveType.MATERNITY_LEAVE;
      case 'annual leave':
        return LeaveType.ANNUAL_LEAVE;
      case 'marriage leave':
        return LeaveType.MARRIAGE_LEAVE;
      default:
        return LeaveType.SICK_LEAVE;
    }
  };
  const handleLeaveRequestSubmit = async (data: DialogFormData) => {
    try {
      const leaveRequestData = {
        leave_type: mapAttendanceTypeToLeaveType(data.attendanceType),
        start_date: data.startDate,
        end_date: data.permitEndDate,
        employee_note: data.reason, // Changed from 'reason' to 'employee_note' to match backend
        attachment: data.evidence?.[0] || undefined,
      };

      await createLeaveRequestMutation.mutateAsync(leaveRequestData);

      toast({
        title: 'Success',
        description: 'Leave request submitted successfully!',
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Error creating leave request:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit leave request. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const watchedAttendanceType = watch('attendanceType');
  const isLeaveRequest = permitRelatedLeaveTypes.includes(
    watchedAttendanceType || currentAttendanceType,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='bg-slate-50 p-0 sm:max-w-[600px] dark:bg-slate-900'>
        <DialogHeader className='border-b px-6 py-4 dark:border-slate-700'>
          <DialogTitle className='text-xl font-semibold text-slate-800 dark:text-slate-100'>
            {dialogTitle}
          </DialogTitle>
          <DialogDescription className='text-sm text-slate-600 dark:text-slate-400'>
            Please fill in the details for your permit or leave request.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(isLeaveRequest ? handleLeaveRequestSubmit : onSubmit)}
          className='space-y-6'
        >
          <div className='max-h-[calc(100vh-220px)] space-y-6 overflow-y-auto px-6 py-4'>
            {/* Section 1: Attendance Type & Permit Duration */}
            <div className='rounded-lg bg-white p-6 shadow-md dark:bg-slate-800'>
              <div className='space-y-2'>
                <Label
                  htmlFor='attendanceType'
                  className='text-sm font-medium text-slate-700 dark:text-slate-300'
                >
                  Permit / Leave Type
                </Label>
                <select
                  id='attendanceType'
                  className='flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 ring-offset-white focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-50 dark:ring-offset-slate-900 dark:focus-visible:ring-blue-500'
                  {...register('attendanceType', {
                    required: true,
                  })}
                >
                  <option value='sick leave'>Sick Leave</option>
                  <option value='compassionate leave'>Compassionate Leave</option>
                  <option value='maternity leave'>Maternity Leave</option>
                  <option value='annual leave'>Annual Leave</option>
                  <option value='marriage leave'>Marriage Leave</option>
                </select>
              </div>{' '}
              {isLeaveRequest && (
                <>
                  <div className='mt-4 space-y-2'>
                    <Label
                      htmlFor='startDate'
                      className='text-sm font-medium text-slate-700 dark:text-slate-300'
                    >
                      Start Date
                    </Label>
                    <Input
                      id='startDate'
                      type='date'
                      className='border-slate-300 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-50'
                      {...register('startDate', {
                        required: true,
                      })}
                    />
                  </div>
                  <div className='mt-4 space-y-2'>
                    <Label
                      htmlFor='permitEndDate'
                      className='text-sm font-medium text-slate-700 dark:text-slate-300'
                    >
                      End Date
                    </Label>
                    <Input
                      id='permitEndDate'
                      type='date'
                      className='border-slate-300 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-50'
                      {...register('permitEndDate', {
                        required: true,
                      })}
                    />
                  </div>
                  <div className='mt-4 space-y-2'>
                    <Label
                      htmlFor='reason'
                      className='text-sm font-medium text-slate-700 dark:text-slate-300'
                    >
                      Reason
                    </Label>
                    <Textarea
                      id='reason'
                      placeholder='Please provide the reason for your leave request...'
                      className='border-slate-300 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-50'
                      {...register('reason', {
                        required: true,
                      })}
                    />
                  </div>
                </>
              )}
            </div>{' '}
            {/* Section 2: Upload Evidence (Only for Leave Request) */}
            {isLeaveRequest && (
              <div className='rounded-lg bg-white p-6 shadow-md dark:bg-slate-800'>
                <Label
                  htmlFor='evidence'
                  className='mb-2 block text-base font-semibold text-slate-800 dark:text-slate-200'
                >
                  Upload Support Evidence
                </Label>
                <Input
                  id='evidence'
                  type='file'
                  accept='image/*,application/pdf'
                  className='focus:ring-primary focus:border-primary file:bg-primary hover:file:bg-primary/90 mt-1 w-full max-w-xs border-slate-300 bg-slate-50 file:mr-4 file:rounded-md file:border-0 file:px-4 file:text-sm file:font-semibold file:text-white dark:border-slate-600 dark:bg-slate-800'
                  {...register('evidence')}
                />
                <p className='mt-2 text-xs text-slate-500 dark:text-slate-400'>
                  Upload relevant documents (image or PDF) for your leave request.
                </p>
              </div>
            )}
          </div>
          <DialogFooter className='rounded-b-lg border-t bg-slate-100 px-6 py-4 dark:border-slate-700 dark:bg-slate-800/50'>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              className='border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100'
            >
              Cancel
            </Button>{' '}
            <Button
              type='submit'
              disabled={createLeaveRequestMutation.isPending}
              className='bg-[#6B9AC4] text-white hover:bg-[#5A89B3] disabled:opacity-50'
            >
              {createLeaveRequestMutation.isPending ? 'Submitting...' : 'Submit Request'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
