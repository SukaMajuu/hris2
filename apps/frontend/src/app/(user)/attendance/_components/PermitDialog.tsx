'use client';

import React from 'react';
import { UseFormReturn, Controller } from 'react-hook-form';
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
  onRefetch?: () => Promise<void>;
}

export function PermitDialog({
  open,
  onOpenChange,
  dialogTitle,
  formMethods,
  onSubmit,
  currentAttendanceType,
  onRefetch,
}: PermitDialogProps) {const { register, handleSubmit, watch, setValue, control, formState: { errors }, setError, clearErrors } = formMethods;
  const { toast } = useToast();
  const createLeaveRequestMutation = useCreateLeaveRequestMutation();

  // Watch start date and end date for validation
  const watchedStartDate = watch('startDate');
  const watchedEndDate = watch('permitEndDate');

  // Date validation function
  const validateDateRange = (startDate: string, endDate: string): string | null => {
    if (!startDate || !endDate) {
      return null; // Let required validation handle empty dates
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      return 'End date cannot be earlier than start date';
    }

    return null;
  };

  // Validate dates whenever they change
  React.useEffect(() => {
    if (watchedStartDate && watchedEndDate) {
      const dateError = validateDateRange(watchedStartDate, watchedEndDate);
      if (dateError) {
        setError('permitEndDate', {
          type: 'manual',
          message: dateError,
        });
      } else {
        clearErrors('permitEndDate');
      }
    }
  }, [watchedStartDate, watchedEndDate, setError, clearErrors]);
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
  const ALLOWED_FILE_TYPES = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/bmp',
    'image/webp',
    'application/pdf'
  ];  const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.pdf'];

  // File validation function
  const validateFileUpload = (files: FileList | null): string | null => {
    if (!files || files.length === 0) {
      return null; // No file selected, validation passes (file is optional)
    }

    const file = files[0];
    
    // Additional safety check for file existence
    if (!file) {
      return null; // No file selected, validation passes (file is optional)
    }
    
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return 'File size must be less than 10MB';
    }

    // Check file extension
    const fileName = file.name.toLowerCase();
    const hasValidExtension = ALLOWED_EXTENSIONS.some(ext => fileName.endsWith(ext));
    
    if (!hasValidExtension) {
      return 'Only image files (JPG, JPEG, PNG, GIF, BMP, WEBP) and PDF files are allowed';
    }

    // Check MIME type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return 'Invalid file type. Only image files and PDF files are allowed';
    }

    return null; // Validation passed
  };

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
  };  const handleLeaveRequestSubmit = async (data: DialogFormData) => {
    try {
      console.log('Form data received:', data);
      console.log('Evidence data:', data.evidence);
      
      // Validate date range before submission
      const dateError = validateDateRange(data.startDate, data.permitEndDate);
      if (dateError) {
        toast({
          title: 'Validation Error',
          description: dateError,
          variant: 'destructive',
        });
        return;
      }
      
      // Validate file before submitting
      const fileValidationError = validateFileUpload(data.evidence);
      if (fileValidationError) {
        toast({
          title: 'File Validation Error',
          description: fileValidationError,
          variant: 'destructive',
        });
        return;
      }

      // Get the actual file from the evidence
      const attachmentFile = data.evidence && data.evidence.length > 0 ? data.evidence[0] : undefined;
      console.log('Attachment file:', attachmentFile);

      const leaveRequestData = {
        leave_type: mapAttendanceTypeToLeaveType(data.attendanceType),
        start_date: data.startDate,
        end_date: data.permitEndDate,
        employee_note: data.reason,
        attachment: attachmentFile,
      };

      console.log('Submitting leave request data:', leaveRequestData);

      await createLeaveRequestMutation.mutateAsync(leaveRequestData);      toast({
        title: 'Berhasil!',
        description: 'Permohonan izin/cuti berhasil diajukan. Menunggu persetujuan atasan.',
        variant: 'default',
      });

      // Reset form and close dialog
      formMethods.reset();
      onOpenChange(false);
      
      // Refetch data if refetch function is provided
      if (onRefetch) {
        await onRefetch();
      }
    } catch (error) {
      console.error('Error creating leave request:', error);
      
      // Handle specific error messages from backend
      let errorMessage = 'Gagal mengajukan permohonan izin/cuti. Silakan coba lagi.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        // Handle axios error structure
        if ('response' in error && error.response && typeof error.response === 'object') {
          const response = error.response as any;
          if (response.data?.message) {
            errorMessage = response.data.message;
          } else if (response.data?.error) {
            errorMessage = response.data.error;
          }
        } else if ('message' in error) {
          errorMessage = (error as any).message;
        }
      }
      
      toast({
        title: 'Gagal Mengajukan Permohonan',
        description: errorMessage,
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
        </DialogHeader>        <form
          onSubmit={handleSubmit(isLeaveRequest ? handleLeaveRequestSubmit : (data) => {
            try {
              onSubmit(data);
              toast({
                title: 'Berhasil!',
                description: 'Data attendance berhasil disimpan.',
                variant: 'default',
              });
              onOpenChange(false);
            } catch (error) {
              console.error('Error submitting form:', error);
              toast({
                title: 'Gagal Menyimpan',
                description: 'Terjadi kesalahan saat menyimpan data. Silakan coba lagi.',
                variant: 'destructive',
              });
            }
          })}
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
              </div>{' '}              {isLeaveRequest && (
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
                        required: 'Start date is required',
                      })}
                    />
                    {errors.startDate && (
                      <p className='text-sm text-red-600 dark:text-red-400'>
                        {errors.startDate.message}
                      </p>
                    )}
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
                        required: 'End date is required',
                        validate: (value) => {
                          if (watchedStartDate && value) {
                            return validateDateRange(watchedStartDate, value) || true;
                          }
                          return true;
                        }
                      })}
                    />
                    {errors.permitEndDate && (
                      <p className='text-sm text-red-600 dark:text-red-400'>
                        {errors.permitEndDate.message}
                      </p>
                    )}
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
                        required: 'Reason is required',
                        minLength: {
                          value: 10,
                          message: 'Reason must be at least 10 characters long'
                        }
                      })}
                    />
                    {errors.reason && (
                      <p className='text-sm text-red-600 dark:text-red-400'>
                        {errors.reason.message}
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>{' '}            {/* Section 2: Upload Evidence (Only for Leave Request) */}
            {isLeaveRequest && (
              <div className='rounded-lg bg-white p-6 shadow-md dark:bg-slate-800'>
                <Label
                  htmlFor='evidence'
                  className='mb-2 block text-base font-semibold text-slate-800 dark:text-slate-200'
                >
                  Upload Support Evidence
                </Label>                <Controller
                  name="evidence"
                  control={control}
                  rules={{
                    validate: (files) => {
                      const error = validateFileUpload(files);
                      return error || true;
                    }
                  }}
                  render={({ field: { onChange, value, ...field } }) => (
                    <Input
                      {...field}
                      id='evidence'
                      type='file'
                      accept='.jpg,.jpeg,.png,.gif,.bmp,.webp,.pdf,image/*,application/pdf'
                      className='focus:ring-primary focus:border-primary file:bg-primary hover:file:bg-primary/90 mt-1 w-full max-w-xs border-slate-300 bg-slate-50 file:mr-4 file:rounded-md file:border-0 file:px-4 file:text-sm file:font-semibold file:text-white dark:border-slate-600 dark:bg-slate-800'
                      onChange={(e) => {
                        const files = e.target.files;
                        console.log('File input changed:', files);
                        
                        const validationError = validateFileUpload(files);
                        
                        if (validationError) {
                          toast({
                            title: 'File Validation Error',
                            description: validationError,
                            variant: 'destructive',
                          });
                          // Clear the file input
                          e.target.value = '';
                          onChange(null);
                          return;
                        }
                        
                        // If validation passes, update the form value
                        onChange(files);
                        console.log('File updated in form:', files);
                      }}
                    />
                  )}
                />{/* Display selected file */}
                {watch('evidence') && watch('evidence')?.length && watch('evidence')!.length > 0 && (
                  <div className='mt-2 p-2 bg-slate-100 dark:bg-slate-700 rounded-md border border-slate-200 dark:border-slate-600'>
                    <p className='text-sm text-slate-700 dark:text-slate-300'>
                      <strong>Selected file:</strong> {watch('evidence')?.[0]?.name || 'Unknown file'}
                    </p>
                    <p className='text-xs text-slate-500 dark:text-slate-400'>
                      Size: {((watch('evidence')?.[0]?.size || 0) / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                )}
                {errors.evidence && (
                  <p className='mt-1 text-sm text-red-600 dark:text-red-400'>
                    {errors.evidence.message}
                  </p>
                )}
                <div className='mt-2 space-y-1'>
                  <p className='text-xs text-slate-500 dark:text-slate-400'>
                    <strong>Accepted file types:</strong> Images (JPG, JPEG, PNG, GIF, BMP, WEBP) and PDF files
                  </p>
                  <p className='text-xs text-slate-500 dark:text-slate-400'>
                    <strong>Maximum file size:</strong> 10MB
                  </p>
                  <p className='text-xs text-slate-500 dark:text-slate-400'>
                    Upload relevant documents to support your leave request.
                  </p>
                </div>
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
