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
import { CreateLeaveRequestRequest, LeaveType } from '@/types/leave-request';
import { toast } from 'sonner';

interface PermitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dialogTitle: string;
  formMethods: UseFormReturn<CreateLeaveRequestRequest>;
  onSubmit: (data: CreateLeaveRequestRequest) => void;
  currentAttendanceType: string;
  onRefetch?: () => Promise<void>;
}

export const PermitDialog = React.memo(function PermitDialog({
  open,
  onOpenChange,
  dialogTitle,
  formMethods,
  onSubmit,
  currentAttendanceType,
  onRefetch,
}: PermitDialogProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
    setError,
    clearErrors,
  } = formMethods;
  const createLeaveRequestMutation = useCreateLeaveRequestMutation();
  // Watch start date and end date for validation - optimized to only watch when needed
  const watchedStartDate = watch('start_date');
  const watchedEndDate = watch('end_date');
  // Date validation function - memoized to prevent recreation on every render
  const validateDateRange = React.useCallback(
    (startDate: string, endDate: string): string | null => {
      if (!startDate || !endDate) {
        return null; // Let required validation handle empty dates
      }

      const start = new Date(startDate);
      const end = new Date(endDate);      if (end < start) {
        return 'End date cannot be earlier than start date';
      }

      return null;
    },
    [],
  );

  // Debounced validation to reduce excessive validation calls
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (watchedStartDate && watchedEndDate) {
        const dateError = validateDateRange(watchedStartDate, watchedEndDate);
        if (dateError) {
          setError('end_date', {
            type: 'manual',
            message: dateError,
          });
        } else {
          clearErrors('end_date');
        }
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [watchedStartDate, watchedEndDate, validateDateRange, setError, clearErrors]);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
  const ALLOWED_FILE_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/bmp',
    'image/webp',
    'application/pdf',
  ];
  const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.pdf'];
  // File validation function
  const validateFileUpload = (files: File | null): string | null => {
    if (!files) {
      return null; // No file selected, validation passes (file is optional)
    }

    const file = files;

    // Additional safety check for file existence
    if (!file) {
      return null; // No file selected, validation passes (file is optional)
    }    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return 'File size must be less than 10MB';
    }

    // Check file extension
    const fileName = file.name.toLowerCase();
    const hasValidExtension = ALLOWED_EXTENSIONS.some((ext) => fileName.endsWith(ext));

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
    'sick_leave',
    'compassionate_leave',
    'maternity_leave',
    'annual_leave',
    'marriage_leave',
  ];
  // Map attendance types to LeaveType enum
  const mapAttendanceTypeToLeaveType = (attendanceType: string): LeaveType => {
    switch (attendanceType) {
      case 'sick_leave':
        return LeaveType.SICK_LEAVE;
      case 'compassionate_leave':
        return LeaveType.COMPASSIONATE_LEAVE;
      case 'maternity_leave':
        return LeaveType.MATERNITY_LEAVE;
      case 'annual_leave':
        return LeaveType.ANNUAL_LEAVE;
      case 'marriage_leave':
        return LeaveType.MARRIAGE_LEAVE;
      default:
        return LeaveType.SICK_LEAVE;
    }
  };  const handleLeaveRequestSubmit = async (data: CreateLeaveRequestRequest) => {
    try {
      // Validate date range before submission
      const dateError = validateDateRange(data.start_date, data.end_date);
      if (dateError) {
        toast.error('Invalid Date Range', {
          description: 'Please check the date range you selected.',
          duration: 4000,
        });
        return;
      }

      // Validate file before submitting
      const fileValidationError = validateFileUpload(data.attachment || null);
      if (fileValidationError) {
        toast.error('Invalid File', {
          description: fileValidationError,
          duration: 4000,
        });
        return;
      }

      // Get the actual file from the evidence
      const attachmentFile = data.attachment && data.attachment.name ? data.attachment : undefined;

      const leaveRequestData = {
        leave_type: mapAttendanceTypeToLeaveType(data.leave_type),
        start_date: data.start_date,
        end_date: data.end_date,
        employee_note: data.employee_note,
        attachment: attachmentFile,
      };

      // Clear any previous toasts to prevent confusion
      toast.dismiss();

      const result = await createLeaveRequestMutation.mutateAsync(leaveRequestData);
      
      // Show success message
      toast.success('Leave Request Submitted Successfully', {
        description: 'Your leave request has been submitted and is awaiting approval.',
        duration: 4000,
      });

      // Reset form and close dialog
      formMethods.reset();
      onOpenChange(false);

      // Refetch data if refetch function is provided
      if (onRefetch) {
        await onRefetch();
      }    } catch (error) {
      console.error('Error creating leave request:', error);
      
      // Handle specific error messages from backend
      let errorMessage = 'Failed to submit leave request. Please try again.';
      let errorTitle = 'Failed to Submit Leave Request';

      // Check for axios error structure
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as any;
        const response = axiosError.response;
        
        if (response?.status === 409) {
          // Handle 409 Conflict specifically for overlapping leave requests
          errorTitle = 'Date Conflict';
          errorMessage = 'You have an existing leave request for these dates. Please choose different dates.';
        } else if (response?.data?.message) {
          // Use backend message if available from data
          errorMessage = response.data.message;
        } else if (response?.data?.error) {
          // Use backend error if available from data
          errorMessage = response.data.error;
        } else if (axiosError.message) {
          // Use axios error message as fallback
          errorMessage = axiosError.message;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      } else if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = (error as any).message;
      }

      // Show error toast
      toast.error(errorTitle, {
        description: errorMessage,
        duration: 6000, // Show error longer for user to read
      });
    }
  };

  const watchedAttendanceType = watch('leave_type');
  const isLeaveRequest = permitRelatedLeaveTypes.includes(
    watchedAttendanceType || currentAttendanceType,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='bg-slate-50 p-0 sm:max-w-[600px] dark:bg-slate-900'>        <DialogHeader className='border-b px-6 py-4 dark:border-slate-700'>
          <DialogTitle className='text-xl font-semibold text-slate-800 dark:text-slate-100'>
            {dialogTitle}
          </DialogTitle>          <DialogDescription className='text-sm text-slate-600 dark:text-slate-400'>
            Please fill in the details for your leave request.
          </DialogDescription>
        </DialogHeader><form
          onSubmit={handleSubmit(
            isLeaveRequest
              ? handleLeaveRequestSubmit
              : async (data) => {
                  try {
                    await onSubmit(data);
                      // Show success message for non-leave request
                    toast.success('Data Successfully Saved', {
                      description: 'Your attendance data has been successfully saved.',
                      duration: 4000,
                    });
                    
                    // Reset form and close dialog
                    formMethods.reset();
                    onOpenChange(false);
                    
                    // Refetch data if refetch function is provided
                    if (onRefetch) {
                      await onRefetch();
                    }
                  } catch (error) {
                    console.error('Error submitting form:', error);
                      // Handle specific error messages for non-leave requests
                    let errorMessage = 'Failed to save attendance data. Please try again.';
                    let errorTitle = 'Failed to Save Data';
                    let errorDescription = 'An error occurred while processing your data.';

                    if (error instanceof Error) {
                      errorMessage = error.message;
                    } else if (typeof error === 'object' && error !== null) {
                      // Handle axios error structure
                      if ('response' in error && error.response && typeof error.response === 'object') {
                        const response = error.response as any;
                        
                        switch (response.status) {
                          case 400: // Bad Request
                            errorTitle = 'Invalid Data';
                            errorDescription = 'The data you entered is invalid or incomplete.';
                            if (response.data?.message) {
                              errorMessage = response.data.message;
                            } else if (response.data?.error) {
                              errorMessage = response.data.error;
                            }
                            break;
                            
                          case 401: // Unauthorized
                            errorTitle = 'Session Expired';
                            errorMessage = 'Your session has expired.';
                            errorDescription = 'Please log in again to continue.';
                            break;
                            
                          case 403: // Forbidden
                            errorTitle = 'Access Denied';
                            errorMessage = 'You do not have permission to save data.';
                            errorDescription = 'Please contact administrator for more information.';
                            break;
                            
                          case 404: // Not Found
                            errorTitle = 'Data Not Found';
                            errorMessage = 'Required data was not found.';
                            errorDescription = 'Please contact system administrator.';
                            break;
                            
                          case 500:
                          case 502:
                          case 503:
                          case 504: // Server Error
                            errorTitle = 'Server Error';
                            errorMessage = 'A server error occurred.';
                            errorDescription = 'Please try again in a moment.';
                            break;
                            
                          default:
                            // Use backend message if available
                            if (response.data?.message) {
                              errorMessage = response.data.message;
                            } else if (response.data?.error) {
                              errorMessage = response.data.error;
                            }
                            break;
                        }
                      } else if ('message' in error) {
                        errorMessage = (error as any).message;
                      }
                    }

                    // Show error toast with title and description
                    toast.error(errorTitle, {
                      description: errorDescription,
                      duration: 5000,
                    });
                  }
                },
          )}
          className='space-y-6'
        >
          <div className='max-h-[calc(100vh-220px)] space-y-6 overflow-y-auto px-6 py-4'>
            {/* Section 1: Attendance Type & Permit Duration */}
            <div className='rounded-lg bg-white p-6 shadow-md dark:bg-slate-800'>
              <div className='space-y-2'>                <Label
                  htmlFor='leave_type'
                  className='text-sm font-medium text-slate-700 dark:text-slate-300'
                >
                  Leave Type
                </Label>
                <select
                  id='leave_type'
                  className='flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 ring-offset-white focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-50 dark:ring-offset-slate-900 dark:focus-visible:ring-blue-500'
                  {...register('leave_type', {
                    required: true,
                  })}
                >
                  <option value={LeaveType.SICK_LEAVE}>Sick Leave</option>
                  <option value={LeaveType.COMPASSIONATE_LEAVE}>Compassionate Leave</option>
                  <option value={LeaveType.MATERNITY_LEAVE}>Maternity Leave</option>
                  <option value={LeaveType.ANNUAL_LEAVE}>Annual Leave</option>
                  <option value={LeaveType.MARRIAGE_LEAVE}>Marriage Leave</option>
                </select>
              </div>
              <div className='mt-4 space-y-2'>                <Label
                  htmlFor='start_date'
                  className='text-sm font-medium text-slate-700 dark:text-slate-300'
                >
                  Start Date
                </Label>
                <Input
                  id='start_date'
                  type='date'
                  className='border-slate-300 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-50'                  {...register('start_date', {
                    required: 'Start date is required',
                  })}
                />
                {errors.start_date && (
                  <p className='text-sm text-red-600 dark:text-red-400'>
                    {errors.start_date.message}
                  </p>
                )}
              </div>
              <div className='mt-4 space-y-2'>                <Label
                  htmlFor='end_date'
                  className='text-sm font-medium text-slate-700 dark:text-slate-300'
                >
                  End Date
                </Label>
                <Input
                  id='end_date'
                  type='date'
                  className='border-slate-300 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-50'                  {...register('end_date', {
                    required: 'End date is required',
                    validate: (value) => {
                      if (watchedStartDate && value) {
                        return validateDateRange(watchedStartDate, value) || true;
                      }
                      return true;
                    },
                  })}
                />
                {errors.end_date && (
                  <p className='text-sm text-red-600 dark:text-red-400'>
                    {errors.end_date.message}
                  </p>
                )}
              </div>
              <div className='mt-4 space-y-2'>                <Label
                  htmlFor='employee_note'
                  className='text-sm font-medium text-slate-700 dark:text-slate-300'
                >
                  Employee Note
                </Label>
                <Textarea
                  id='employee_note'
                  placeholder='Please provide a reason for your leave request...'
                  className='border-slate-300 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-50'                  {...register('employee_note', {
                    required: 'Employee note is required',
                    minLength: {
                      value: 10,
                      message: 'Employee note must be at least 10 characters',
                    },
                  })}
                />
                {errors.employee_note && (
                  <p className='text-sm text-red-600 dark:text-red-400'>
                    {errors.employee_note.message}
                  </p>
                )}
              </div>
            </div>
            <div className='rounded-lg bg-white p-6 shadow-md dark:bg-slate-800'>              <Label
                htmlFor='evidence'
                className='mb-2 block text-base font-semibold text-slate-800 dark:text-slate-200'
              >
                Upload Supporting Document
              </Label>
              <Controller
                name='attachment'
                control={control}
                rules={{
                  validate: (files) => {
                    const error = validateFileUpload(files || null);
                    return error || true;
                  },
                }}
                render={({ field: { onChange, value, ...field } }) => (
                  <Input
                    {...field}
                    id='attachment'
                    type='file'
                    accept='.jpg,.jpeg,.png,.gif,.bmp,.webp,.pdf,image/*,application/pdf'
                    className='focus:ring-primary focus:border-primary file:bg-primary hover:file:bg-primary/90 mt-1 w-full max-w-xs border-slate-300 bg-slate-50 file:mr-4 file:rounded-md file:border-0 file:px-4 file:text-sm file:font-semibold file:text-white dark:border-slate-600 dark:bg-slate-800'
                    onChange={(e) => {
                      const files = e.target.files?.[0];

                      const validationError = validateFileUpload(files || null);

                      if (validationError) {
                        toast.error(validationError);                        
                        e.target.value = '';
                        onChange(null);
                        return;
                      }
                        onChange(files);
                    }}
                  />
                )}
              />{/* Display selected file */}
              {watch('attachment') && watch('attachment')?.size && (
                <div className='mt-2 rounded-md border border-slate-200 bg-slate-100 p-2 dark:border-slate-600 dark:bg-slate-700'>                  <p className='text-sm text-slate-700 dark:text-slate-300'>
                    <strong>Selected file:</strong> {watch('attachment')?.name || 'Unknown file'}
                  </p>
                  <p className='text-xs text-slate-500 dark:text-slate-400'>
                    Size: {((watch('attachment')?.size || 0) / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              )}
              {errors.attachment && (
                <p className='mt-1 text-sm text-red-600 dark:text-red-400'>
                  {errors.attachment.message}
                </p>
              )}              <div className='mt-2 space-y-1'>
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
          </div>          <DialogFooter className='rounded-b-lg border-t bg-slate-100 px-6 py-4 dark:border-slate-700 dark:bg-slate-800/50'>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              className='border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100'            >
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
      </DialogContent>{' '}
    </Dialog>
  );
});
