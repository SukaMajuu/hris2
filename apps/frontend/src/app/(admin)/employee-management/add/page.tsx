'use client';

import { useState, Fragment, useRef } from 'react';
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
import Image from 'next/image';

import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

export default function AddEmployeePage() {
  const [activeStep, setActiveStep] = useState(1);
  const [formData, setFormData] = useState<{
    firstName: string;
    lastName: string;
    nik: string;
    phoneNumber: string;
    gender: string;
    lastEducation: string;
    placeOfBirth: string;
    dateOfBirth: string;
    employeeId: string;
    branch: string;
    position: string;
    grade: string;
    profilePhoto: File | null;
    profilePhotoPreview: string | null;
    document: File | null;
    documentPreview: string | null;
    zzz: string;
  }>({
    // Step 1
    firstName: '',
    lastName: '',
    nik: '',
    phoneNumber: '',
    gender: '',
    lastEducation: '',
    placeOfBirth: '',
    dateOfBirth: '',
    // Step 2
    employeeId: '',
    branch: '',
    position: '',
    grade: '',
    profilePhoto: null,
    profilePhotoPreview: null,
    // Step 3
    document: null,
    documentPreview: null,
    zzz: '',
  });
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const profilePhotoInputRef = useRef<HTMLInputElement | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      setFormData(prev => ({
        ...prev,
        [name]: files && files[0] ? files[0] : null,
        [`${name}Preview`]: files && files[0] ? URL.createObjectURL(files[0]) : null,
      }));
      if (name === 'profilePhoto' && (!files || !files[0])) {
        if (profilePhotoInputRef.current) profilePhotoInputRef.current.value = '';
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

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

  const handleBackStep = () => {
    if (activeStep > 1) {
      setActiveStep((prev) => prev - 1);
    }
  };

  const handleRemovePhoto = () => {
    setFormData(prev => ({
      ...prev,
      profilePhoto: null,
      profilePhotoPreview: null,
    }));
    if (profilePhotoInputRef.current) profilePhotoInputRef.current.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

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
                  'flex h-8 w-8 items-center justify-center rounded-full border font-bold transition-all duration-150 hover:cursor-pointer',
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
                  <Input name='firstName' value={formData.firstName} onChange={handleInputChange} placeholder='Enter' className='border-secondary cursor-pointer' />
                </div>
                <div>
                  <label className='mb-1 block font-medium'>Last Name</label>
                  <Input name='lastName' value={formData.lastName} onChange={handleInputChange} placeholder='Enter' className='border-secondary cursor-pointer' />
                </div>
                <div>
                  <label className='mb-1 block font-medium'>NIK</label>
                  <Input name='nik' value={formData.nik} onChange={handleInputChange} placeholder='Enter' className='border-secondary cursor-pointer' />
                </div>
                <div>
                  <label className='mb-1 block font-medium'>Phone Number</label>
                  <Input name='phoneNumber' value={formData.phoneNumber} onChange={handleInputChange} placeholder='Enter' className='border-secondary cursor-pointer' />
                </div>
                <div>
                  <label className='mb-1 block font-medium'>Gender</label>
                  <Select value={formData.gender} onValueChange={v => handleSelectChange('gender', v)}>
                    <SelectTrigger className='border-secondary min-w-full cursor-pointer'>
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
                  <Select value={formData.lastEducation} onValueChange={v => handleSelectChange('lastEducation', v)}>
                    <SelectTrigger className='border-secondary min-w-full cursor-pointer'>
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
                  <Input name='placeOfBirth' value={formData.placeOfBirth} onChange={handleInputChange} placeholder='Enter' className='border-secondary cursor-pointer' />
                </div>
                <div>
                  <label className='mb-1 block font-medium'>Date of Birth</label>
                  <Input name='dateOfBirth' type='date' value={formData.dateOfBirth} onChange={handleInputChange} className='border-secondary' />
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
              <div className='mb-6 flex flex-col items-center'>
                <label className='mb-2 block font-medium'>Profile Photo</label>
                <Input
                  type='file'
                  name='profilePhoto'
                  accept='image/*'
                  className='border-secondary w-48 cursor-pointer'
                  onChange={handleInputChange}
                  ref={profilePhotoInputRef}
                />
                {formData.profilePhotoPreview && (
                  <>
                    <Image
                      src={formData.profilePhotoPreview}
                      alt='Profile Preview'
                      width={128}
                      height={128}
                      className='mt-4 h-32 w-32 rounded-full object-cover border border-gray-300 shadow'
                    />
                    {formData.profilePhoto && (
                      <span className='block mt-2 text-xs text-gray-500'>File: {formData.profilePhoto.name}</span>
                    )}
                    <Button
                      type='button'
                      variant='outline'
                      className='mt-2 text-red-600 border-red-300 hover:bg-red-500'
                      onClick={handleRemovePhoto}
                    >
                      Remove Photo
                    </Button>
                  </>
                )}
              </div>
              <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                <div>
                  <label className='mb-1 block font-medium'>Employee ID</label>
                  <Input name='employeeId' value={formData.employeeId} onChange={handleInputChange} placeholder='Enter' className='border-secondary' />
                </div>
                <div>
                  <label className='mb-1 block font-medium'>Branch</label>
                  <Input name='branch' value={formData.branch} onChange={handleInputChange} placeholder='Enter' className='border-secondary' />
                </div>
                <div>
                  <label className='mb-1 block font-medium'>Position</label>
                  <Input name='position' value={formData.position} onChange={handleInputChange} placeholder='Enter' className='border-secondary' />
                </div>
                <div>
                  <label className='mb-1 block font-medium'>Grade</label>
                  <Input name='grade' value={formData.grade} onChange={handleInputChange} placeholder='Enter' className='border-secondary' />
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
                  <label className='mb-1 block font-medium'>Upload Document</label>
                  <Input type='file' name='document' className='border-secondary' onChange={handleInputChange} />
                  {formData.documentPreview && (
                    <span className='block mt-2 text-xs text-gray-500'>File selected: {formData.document ? formData.document.name : ''}</span>
                  )}
                </div>
              </div>
            </form>
          </>
        )}
      </Card>

      <div className='mt-8 flex justify-end gap-3'>
        <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <AlertDialogTrigger asChild>
            <Button type='button' variant='outline' className='bg-[#c7d3dd] text-black'>
              Close
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>All entered data will be discarded.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className='hover:bg-blue-500'>Close</AlertDialogCancel>
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
        {activeStep > 1 && (
          <Button
            type='button'
            variant={'outline'}
            onClick={handleBackStep}
            className='bg-gray-300 text-black hover:bg-gray-400'
          >
            Back
          </Button>
        )}
        {activeStep < steps.length ? (
          <Button
            type='button'
            onClick={handleNextStep}
            className='bg-secondary text-white hover:bg-gray-500'
          >
            Next
          </Button>
        ) : (
          <Button type='submit' className='bg-primary hover:bg-primary/80 text-white' onClick={handleSubmit}>
            Submit
          </Button>
        )}
      </div>
    </div>
  );
}
