'use client';

import { Upload, Download, AlertCircle, CheckCircle, Users } from 'lucide-react';
import { useState, useRef } from 'react';
import { toast } from 'sonner';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useSubscriptionLimit } from '@/hooks/useSubscriptionLimit';
import { EmployeeService, type BulkImportResult } from '@/services/employee.service';
import { parseEmployeeCSV, downloadCSVTemplate } from '@/utils/csvImport';
import { parseEmployeeExcel, downloadExcelTemplate } from '@/utils/excelImport';


interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete: () => void;
}

interface ImportPreview {
  fileName: string;
  totalRows: number;
  validRows: number;
  errors: Array<{
    row: number;
    field: string;
    message: string;
    value?: string;
  }>;
  duplicates: {
    emails: string[];
    niks: string[];
    employeeCodes: string[];
  };
}

export const ImportDialog = ({ open, onOpenChange, onImportComplete }: ImportDialogProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<ImportPreview | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<BulkImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const employeeService = new EmployeeService();

  const { limitInfo, checkCanAddEmployees, getAddEmployeeErrorMessage } = useSubscriptionLimit();

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    setImportPreview(null);
    setIsProcessing(true);

    try {
      let result;
      const fileExtension = selectedFile.name.toLowerCase().split('.').pop();

      if (fileExtension === 'csv') {
        result = await parseEmployeeCSV(selectedFile);
      } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        result = await parseEmployeeExcel(selectedFile);
      } else {
        throw new Error('Unsupported file format. Please use CSV or Excel files.');
      }

      setImportPreview({
        fileName: selectedFile.name,
        totalRows: result.data.length + result.errors.length,
        validRows: result.data.length,
        errors: result.errors,
        duplicates: result.duplicates,
      });
    } catch (error) {
      console.error('Error parsing file:', error);
      toast.error(
        `Failed to parse file: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      setFile(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleImport = async () => {
    if (!file || !importPreview) return;

    if (!checkCanAddEmployees(importPreview.validRows)) {
      const errorMessage = getAddEmployeeErrorMessage(importPreview.validRows);
      toast.error('Cannot Import - Employee Limit Exceeded', {
        description: errorMessage,
        action: {
          label: 'Upgrade Plan',
          onClick: () => {
            window.open('/subscription?view=seat', '_blank');
          },
        },
        duration: 10000,
      });
      return;
    }

    setIsImporting(true);
    try {
      const result: BulkImportResult = await employeeService.bulkImportEmployees(file);
      setImportResult(result);

      if (result.error_count === 0) {
        toast.success(
          `✅ All ${result.success_count} employees imported successfully! Default password is 'password'. No partial imports - all data was valid.`,
          {
            duration: 8000,
            position: 'top-center',
            dismissible: true,
            action: {
              label: 'Got it!',
              onClick: () => {},
            },
            style: {
              maxWidth: '650px',
              fontSize: '15px',
              padding: '16px 20px',
              textAlign: 'center',
              fontWeight: '500',
              borderRadius: '12px',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
            },
          },
        );
        setTimeout(() => {
          onImportComplete();
          onOpenChange(false);
          resetDialog();
        }, 1000);
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error(
        `Import failed: ${error instanceof Error ? error.message : 'An unknown error occurred'}\n\nPlease try again or contact administrator if the problem persists.`,
        {
          duration: 10000,
          style: {
            maxWidth: '400px',
            whiteSpace: 'pre-line',
          },
        },
      );
    } finally {
      setIsImporting(false);
    }
  };

  const resetDialog = () => {
    setFile(null);
    setImportPreview(null);
    setImportResult(null);
    setIsProcessing(false);
    setIsImporting(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    resetDialog();
  };

  const hasErrors =
    importPreview &&
    (importPreview.errors.length > 0 ||
      importPreview.duplicates.emails.length > 0 ||
      importPreview.duplicates.niks.length > 0 ||
      importPreview.duplicates.employeeCodes.length > 0);

  const canImport = importPreview && !hasErrors && checkCanAddEmployees(importPreview.validRows);
  const limitExceeded = importPreview && !checkCanAddEmployees(importPreview.validRows);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='max-h-[80vh] max-w-4xl overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Import Employees</DialogTitle>
          <DialogDescription>
            Upload a CSV or Excel file to import multiple employees at once. Each employee will get
            a user account with default password &apos;password&apos;.
            <br />
            <strong>⚠️ Important:</strong> If any employee has an error, the entire import will be
            cancelled and no employees will be created. Please ensure all data is valid before
            importing.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Employee Limit Information */}
          <Alert>
            <Users className='h-4 w-4' />
            <AlertDescription>
              <div className='flex items-center justify-between'>
                <span>
                  Current employees:{' '}
                  <strong>
                    {limitInfo.currentCount} / {limitInfo.maxCount}
                  </strong>
                  {limitInfo.tierInfo && (
                    <span className='ml-2 text-sm text-gray-600'>
                      ({limitInfo.planName} - {limitInfo.tierInfo.minEmployees}-
                      {limitInfo.tierInfo.maxEmployees} tier)
                    </span>
                  )}
                </span>
                <Badge
                  variant={(() => {
                    if (limitInfo.canAddCount > 10) {
                      return 'default';
                    }

                    if (limitInfo.canAddCount > 0) {
                      return 'secondary';
                    }

                    return 'destructive';
                  })()}
                >
                  {limitInfo.canAddCount} remaining
                </Badge>
              </div>
            </AlertDescription>
          </Alert>

          {/* Template Downloads */}
          <div className='flex gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={downloadCSVTemplate}
              className='cursor-pointer'
            >
              <Download className='mr-2 h-4 w-4' />
              Download CSV Template
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={downloadExcelTemplate}
              className='cursor-pointer'
            >
              <Download className='mr-2 h-4 w-4' />
              Download Excel Template
            </Button>
          </div>

          {/* File Upload Area */}
          <div
            className='cursor-pointer rounded-lg border-2 border-dashed border-gray-300 p-8 text-center transition-colors hover:border-gray-400'
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <Upload className='mx-auto h-12 w-12 text-gray-400' />
            <div className='mt-4'>
              <p className='text-lg font-medium'>Drop your file here or</p>
              <Button
                variant='outline'
                className='mt-2 cursor-pointer'
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
              >
                Browse Files
              </Button>
              <input
                ref={fileInputRef}
                type='file'
                accept='.csv,.xlsx,.xls'
                onChange={handleFileUpload}
                className='hidden'
              />
            </div>
            <p className='mt-2 text-sm text-gray-500'>
              Supported formats: CSV, Excel (.xlsx, .xls)
            </p>
          </div>

          {/* Processing State */}
          {isProcessing && (
            <div className='py-4 text-center'>
              <div className='mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent' />
              <p className='mt-2 text-gray-600'>Processing file...</p>
            </div>
          )}

          {/* Import Preview */}
          {importPreview && !isProcessing && (
            <div className='space-y-4'>
              <div className='rounded-lg bg-gray-50 p-4'>
                <h3 className='mb-2 font-medium'>Import Preview</h3>
                <div className='grid grid-cols-2 gap-4 text-sm md:grid-cols-4'>
                  <div>
                    <span className='text-gray-500'>File:</span>
                    <p className='truncate font-medium'>{importPreview.fileName}</p>
                  </div>
                  <div>
                    <span className='text-gray-500'>Total Rows:</span>
                    <p className='font-medium'>{importPreview.totalRows}</p>
                  </div>
                  <div>
                    <span className='text-gray-500'>Valid Rows:</span>
                    <p className='font-medium text-green-600'>{importPreview.validRows}</p>
                  </div>
                  <div>
                    <span className='text-gray-500'>Errors:</span>
                    <p className='font-medium text-red-600'>{importPreview.errors.length}</p>
                  </div>
                </div>
              </div>

              {/* Success Message */}
              {!hasErrors && (
                <Alert>
                  <CheckCircle className='h-4 w-4' />
                  <AlertDescription>
                    All data is valid and ready to import! {importPreview.validRows} employees will
                    be created with user accounts.
                  </AlertDescription>
                </Alert>
              )}

              {/* Validation Errors */}
              {hasErrors && (
                <div className='space-y-4'>
                  <Alert variant='destructive'>
                    <AlertCircle className='h-4 w-4' />
                    <AlertDescription>
                      Found validation errors. Please fix the issues below before importing.
                    </AlertDescription>
                  </Alert>

                  {/* Duplicate Errors */}
                  {(importPreview.duplicates.emails.length > 0 ||
                    importPreview.duplicates.niks.length > 0 ||
                    importPreview.duplicates.employeeCodes.length > 0) && (
                    <div className='rounded-lg bg-red-50 p-4'>
                      <h4 className='mb-2 font-medium text-red-800'>Duplicate Data Found:</h4>
                      <div className='space-y-1 text-sm text-red-700'>
                        {importPreview.duplicates.emails.length > 0 && (
                          <p>📧 Duplicate emails: {importPreview.duplicates.emails.join(', ')}</p>
                        )}
                        {importPreview.duplicates.niks.length > 0 && (
                          <p>🔴 Duplicate NIKs: {importPreview.duplicates.niks.join(', ')}</p>
                        )}
                        {importPreview.duplicates.employeeCodes.length > 0 && (
                          <p>
                            🏷️ Duplicate employee codes:{' '}
                            {importPreview.duplicates.employeeCodes.join(', ')}
                          </p>
                        )}
                      </div>
                      <div className='mt-3 rounded-md bg-red-100 p-2'>
                        <p className='text-xs text-red-700'>
                          <strong>⚠️ Important:</strong> Each employee must have unique NIK, email,
                          and employee code.
                        </p>
                        <p className='mt-1 text-xs text-red-600'>
                          Remove or change duplicate data in your file before importing.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Field Validation Errors */}
                  {importPreview.errors.length > 0 && (
                    <div className='rounded-lg bg-red-50 p-4'>
                      <h4 className='mb-2 font-medium text-red-800'>
                        Validation Errors ({importPreview.errors.length}):
                      </h4>
                      <div className='max-h-64 space-y-1 overflow-y-auto text-sm text-red-700'>
                        {importPreview.errors.slice(0, 1000).map((error) => {
                          let errorText = '';

                          if (error.field === 'nik' && error.message.includes('already registered')) {
                            errorText = `🔴 Row ${error.row}: NIK "${error.value}" is already registered to another employee`;
                          } else if (error.field === 'email' && error.message.includes('already used')) {
                            errorText = `📧 Row ${error.row}: Email "${error.value}" is already used by another employee`;
                          } else if (error.field === 'employee_code' && error.message.includes('already used')) {
                            errorText = `🏷️ Row ${error.row}: Employee code "${error.value}" is already in use`;
                          } else if (error.field === 'phone' && error.message.includes('already used')) {
                            errorText = `📱 Row ${error.row}: Phone number "${error.value}" is already used by another employee`;
                          } else if (error.field === 'general') {
                            errorText = `⚠️ Row ${error.row}: ${error.message}`;
                          } else if (error.value) {
                            errorText = `• Row ${error.row}: ${error.message} (Value: "${error.value}")`;
                          } else {
                            errorText = `• Row ${error.row}: ${error.message}`;
                          }

                          return <p key={`error-${error.row}-${error.field}-${error.message.slice(0, 20)}`} className="text-xs text-red-600">{errorText}</p>;
                        })}
                        {importPreview.errors.length > 1000 && (
                          <p className='font-medium'>
                            ... and {importPreview.errors.length - 1000} more errors
                          </p>
                        )}
                      </div>
                      <div className='mt-3 rounded-md bg-red-100 p-2'>
                        <p className='text-xs text-red-700'>
                          <strong>💡 How to fix:</strong>
                        </p>
                        <ul className='mt-1 text-xs text-red-600'>
                          <li>• Remove duplicate NIK, email, or employee codes from your file</li>
                          <li>• Check that required fields are properly filled</li>
                          <li>
                            • Verify data formats (dates should be YYYY-MM-DD, emails should be
                            valid)
                          </li>
                          <li>• Fix these errors in your file and upload again</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Limit Exceeded Warning */}
              {limitExceeded && (
                <Alert variant='destructive'>
                  <AlertCircle className='h-4 w-4' />
                  <AlertDescription>
                    Cannot import {importPreview.validRows} employees. Your {limitInfo.planName}{' '}
                    plan ({limitInfo.tierInfo.minEmployees}-{limitInfo.tierInfo.maxEmployees}{' '}
                    employees tier) only allows {limitInfo.maxCount} total employees. You currently
                    have {limitInfo.currentCount} employees and can only add {limitInfo.canAddCount}{' '}
                    more.
                    <div className='mt-2'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => window.open('/subscription?view=seat', '_blank')}
                        className='cursor-pointer'
                      >
                        Upgrade Plan
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Import Result */}
          {importResult && (
            <div className='space-y-4'>
              <div className='rounded-lg bg-gray-50 p-4'>
                <h3 className='mb-2 font-medium'>Import Result</h3>
                <div className='grid grid-cols-2 gap-4 text-sm'>
                  <div>
                    <span className='text-gray-500'>Successful imports:</span>
                    <p className='font-medium text-green-600'>{importResult.success_count}</p>
                  </div>
                  <div>
                    <span className='text-gray-500'>Failed imports:</span>
                    <p className='font-medium text-red-600'>{importResult.error_count}</p>
                  </div>
                </div>
              </div>

              {/* Import Errors Details */}
              {importResult.failed_rows && importResult.failed_rows.length > 0 && (
                <div className='space-y-4'>
                  <Alert variant='destructive'>
                    <AlertCircle className='h-4 w-4' />
                    <AlertDescription>
                      ❌ <strong>Import Failed:</strong> Due to errors found, NO employees were
                      imported. Our system uses an all-or-nothing approach to prevent partial data
                      corruption.
                    </AlertDescription>
                  </Alert>

                  <div className='rounded-lg bg-red-50 p-4'>
                    <h4 className='mb-2 font-medium text-red-800'>
                      Import Error Details ({importResult.failed_rows.length}):
                    </h4>
                    <div className='max-h-64 space-y-2 overflow-y-auto text-sm text-red-700'>
                      {importResult.failed_rows.slice(0, 1000).map((failedRow) => (
                        <div key={`failed-row-${failedRow.row}-${failedRow.errors[0]?.field || 'unknown'}`} className='border-b border-red-200 pb-2 last:border-b-0'>
                          <p className='font-semibold text-red-900'>Row {failedRow.row}:</p>
                          {failedRow.errors.map((error) => {
                            let errorText = '';

                            if (
                              error.field === 'nik' &&
                              error.message.includes('already registered')
                            ) {
                              errorText = `🔴 NIK "${error.value}" is already registered to another employee`;
                            } else if (
                              error.field === 'email' &&
                              error.message.includes('already used')
                            ) {
                              errorText = `📧 Email "${error.value}" is already used by another employee`;
                            } else if (
                              error.field === 'employee_code' &&
                              error.message.includes('already used')
                            ) {
                              errorText = `🏷️ Employee code "${error.value}" is already in use`;
                            } else if (
                              error.field === 'phone' &&
                              error.message.includes('already used')
                            ) {
                              errorText = `📱 Phone number "${error.value}" is already used by another employee`;
                            } else if (error.field === 'general') {
                              errorText = `⚠️ ${error.message}`;
                            } else if (error.value) {
                              errorText = `• ${error.field}: ${error.message} (Value: "${error.value}")`;
                            } else {
                              errorText = `• ${error.field}: ${error.message}`;
                            }

                            return (
                              <p key={`error-${failedRow.row}-${error.field}-${error.message.slice(0, 20)}`} className='mt-1 ml-2'>
                                {errorText}
                              </p>
                            );
                          })}
                        </div>
                      ))}
                      {importResult.failed_rows.length > 1000 && (
                        <p className='font-medium text-red-800'>
                          ... and {importResult.failed_rows.length - 1000} more failed rows
                        </p>
                      )}
                    </div>
                    <div className='mt-3 rounded-md bg-red-100 p-2'>
                      <p className='text-xs text-red-700'>
                        <strong>💡 Quick Fixes:</strong>
                      </p>
                      <ul className='mt-1 text-xs text-red-600'>
                        <li>• Check for duplicate NIK, email, or employee codes in your file</li>
                        <li>• Ensure these values are not already used by existing employees</li>
                        <li>
                          • Verify required fields (email, first_name, position_name) are filled
                        </li>
                        <li>• Fix the data above and upload the corrected file again</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {importResult.success_count > 0 && (
                <Alert>
                  <CheckCircle className='h-4 w-4' />
                  <AlertDescription>
                    🎉 All {importResult.success_count} employees were successfully imported! You
                    can close this dialog to see the updated employee list. Since our system uses
                    all-or-nothing import, no partial data was created.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className='flex justify-end gap-2'>
            <Button
              variant='outline'
              onClick={handleClose}
              disabled={isImporting}
              className='cursor-pointer'
            >
              {importResult ? 'Close' : 'Cancel'}
            </Button>
            {importPreview && !hasErrors && !importResult && (
              <Button
                onClick={handleImport}
                disabled={!canImport || isImporting}
                className='min-w-[120px] cursor-pointer'
              >
                {isImporting ? (
                  <>
                    <div className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
                    Importing...
                  </>
                ) : (
                  `Import ${importPreview.validRows} Employees`
                )}
              </Button>
            )}
            {importResult && importResult.success_count > 0 && (
              <Button
                onClick={() => {
                  onImportComplete();
                  onOpenChange(false);
                  resetDialog();
                }}
                className='cursor-pointer'
              >
                View Updated List
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
