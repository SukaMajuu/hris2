'use client';

import { useState, useRef, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import {
  employeeFormSchema,
  type EmployeeFormData,
  personalInfoSchema,
  employeeInfoSchema,
  bankInfoSchema,
} from '@/schemas/employee.schema';
import { useCreateEmployee } from '@/api/mutations/employee.mutations';
import { toast } from 'sonner';

const getTodaysDate = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

type FormEmployeeData = Omit<
  EmployeeFormData,
  'gender' | 'lastEducation' | 'taxStatus' | 'contractType'
> & {
  gender: '' | 'Male' | 'Female';
  lastEducation:
    | ''
    | 'SD'
    | 'SMP'
    | 'SMA/SMK'
    | 'D1'
    | 'D2'
    | 'D3'
    | 'S1/D4'
    | 'S2'
    | 'S3'
    | 'Other';
  taxStatus:
    | ''
    | 'TK/0'
    | 'TK/1'
    | 'TK/2'
    | 'TK/3'
    | 'K/0'
    | 'K/1'
    | 'K/2'
    | 'K/3'
    | 'K/I/0'
    | 'K/I/1'
    | 'K/I/2'
    | 'K/I/3';
  contractType: '' | 'permanent' | 'contract' | 'freelance';
};

const initialFormData: FormEmployeeData = {
  firstName: '',
  lastName: '',
  email: '',
  nik: '',
  phoneNumber: '',
  gender: '',
  lastEducation: '',
  placeOfBirth: '',
  dateOfBirth: '',
  taxStatus: '',
  employeeId: '',
  branch: '',
  position: '',
  grade: '',
  contractType: '',
  hireDate: getTodaysDate(),
  profilePhoto: undefined,
  profilePhotoPreview: null,
  bankName: '',
  bankAccountHolder: '',
  bankAccountNumber: '',
};

export function useAddEmployeeForm() {
  const [activeStep, setActiveStep] = useState(1);
  const profilePhotoInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const createEmployeeMutation = useCreateEmployee();

  const form = useForm<FormEmployeeData>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: initialFormData,
    mode: 'onChange',
  });

  const {
    formState: { errors },
    watch,
    setValue,
    getValues,
  } = form;
  const formData = watch();

  useEffect(() => {
    setValue('hireDate', getTodaysDate());
  }, [setValue]);

  const steps = [
    { label: 'Personal Information', schema: personalInfoSchema },
    { label: 'Employee Information', schema: employeeInfoSchema },
    { label: 'Bank Information', schema: bankInfoSchema },
    { label: 'Review & Submit', schema: employeeFormSchema },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, files } = e.target;

    if (type === 'file') {
      const file = files?.[0];
      setValue(name as keyof FormEmployeeData, file as File);

      if (name === 'profilePhoto') {
        if (file) {
          const previewUrl = URL.createObjectURL(file);
          setValue('profilePhotoPreview', previewUrl);
        } else {
          setValue('profilePhotoPreview', null);
          if (profilePhotoInputRef.current) {
            profilePhotoInputRef.current.value = '';
          }
        }
      }
    } else {
      setValue(name as keyof FormEmployeeData, value);
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setValue(name as keyof FormEmployeeData, value);
  };

  const validateCurrentStep = async () => {
    const currentStepSchema = steps[activeStep - 1]?.schema;
    if (!currentStepSchema) return false;

    const currentData = getValues();
    console.log('Validating step', activeStep, 'with data:', currentData);

    try {
      currentStepSchema.parse(currentData);
      console.log('Step validation successful');
      return true;
    } catch (error) {
      console.log('Step validation failed:', error);
      return false;
    }
  };

  const handleNextStep = async () => {
    console.log('HandleNextStep called for step:', activeStep);

    const stepFields = {
      1: [
        'firstName',
        'email',
        'nik',
        'phoneNumber',
        'gender',
        'lastEducation',
        'placeOfBirth',
        'dateOfBirth',
        'taxStatus',
      ] as const,
      2: ['employeeId', 'branch', 'position', 'contractType', 'hireDate'] as const,
      3: ['bankName', 'bankAccountHolder', 'bankAccountNumber'] as const,
      4: [] as const,
    };

    const currentStepFields = stepFields[activeStep as keyof typeof stepFields];

    if (currentStepFields) {
      const isValid = await form.trigger(currentStepFields);

      if (!isValid) {
        console.log('Current step validation failed');
        return;
      }
    }

    if (activeStep < steps.length) {
      console.log('Moving to next step:', activeStep + 1);
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBackStep = () => {
    if (activeStep > 1) {
      setActiveStep((prev) => prev - 1);
    }
  };

  const handleRemovePhoto = () => {
    setValue('profilePhoto', undefined);
    setValue('profilePhotoPreview', null);
    if (profilePhotoInputRef.current) {
      profilePhotoInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    try {
      const validData = employeeFormSchema.parse(getValues());

      const createData = {
        email: validData.email,
        phone: validData.phoneNumber,
        first_name: validData.firstName,
        last_name: validData.lastName || undefined,
        position_name: validData.position,
        employee_code: validData.employeeId,
        branch: validData.branch,
        gender: validData.gender,
        nik: validData.nik,
        place_of_birth: validData.placeOfBirth,
        date_of_birth: validData.dateOfBirth,
        last_education: validData.lastEducation,
        grade: validData.grade || undefined,
        contract_type: validData.contractType,
        hire_date: validData.hireDate,
        tax_status: validData.taxStatus,
        bank_name: validData.bankName,
        bank_account_number: validData.bankAccountNumber,
        bank_account_holder_name: validData.bankAccountHolder,
        photo_file: validData.profilePhoto,
      };

      console.log('Submitting employee data:', createData);

      await createEmployeeMutation.mutateAsync(createData);

      const fullName = `${validData.firstName}${validData.lastName ? ` ${validData.lastName}` : ''}`;

      toast.success(
        `Employee has been added and Employee account for '${fullName}' has been created successfully! The default password is 'password'.`,
        {
          duration: 8000,
          position: 'top-center',
          dismissible: true,
          action: {
            label: 'Got it!',
            onClick: () => {},
          },
          style: {
            maxWidth: '600px',
            fontSize: '15px',
            padding: '16px 20px',
            textAlign: 'center',
            fontWeight: '500',
            borderRadius: '12px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
          },
        },
      );

      router.push('/employee-management');
    } catch (error) {
      console.error('Form submission error:', error);

      const errorMessage =
        error instanceof Error ? error.message : 'Failed to create employee. Please try again.';

      toast.error(errorMessage);
    }
  };

  const goToStep = async (stepNumber: number) => {
    if (stepNumber <= activeStep) {
      setActiveStep(stepNumber);
      return;
    }

    let canProceed = true;

    for (let step = activeStep; step < stepNumber; step++) {
      const stepFields = {
        1: [
          'firstName',
          'email',
          'nik',
          'phoneNumber',
          'gender',
          'lastEducation',
          'placeOfBirth',
          'dateOfBirth',
          'taxStatus',
        ] as const,
        2: ['employeeId', 'branch', 'position', 'contractType', 'hireDate'] as const,
        3: ['bankName', 'bankAccountHolder', 'bankAccountNumber'] as const,
        4: [] as const,
      };

      const currentStepFields = stepFields[step as keyof typeof stepFields];

      if (currentStepFields && currentStepFields.length > 0) {
        const isValid = await form.trigger(currentStepFields);
        if (!isValid) {
          console.log(`Step ${step} validation failed`);
          canProceed = false;
          break;
        }
      }
    }

    if (canProceed) {
      setActiveStep(stepNumber);
    }
  };

  const isStepValid = (stepIndex: number) => {
    const stepNumber = stepIndex + 1;

    const stepFields = {
      1: [
        'firstName',
        'email',
        'nik',
        'phoneNumber',
        'gender',
        'lastEducation',
        'placeOfBirth',
        'dateOfBirth',
        'taxStatus',
      ] as const,
      2: ['employeeId', 'branch', 'position', 'contractType', 'hireDate'] as const,
      3: ['bankName', 'bankAccountHolder', 'bankAccountNumber'] as const,
      4: [] as const,
    };

    const currentStepFields = stepFields[stepNumber as keyof typeof stepFields];

    if (!currentStepFields || currentStepFields.length === 0) {
      return true;
    }

    const currentData = getValues();

    for (const field of currentStepFields) {
      const value = currentData[field];

      if (!value || (typeof value === 'string' && value.trim() === '')) {
        return false;
      }

      if (errors[field]) {
        return false;
      }
    }

    return true;
  };

  return {
    activeStep,
    formData,
    steps,
    profilePhotoInputRef,
    errors,
    isSubmitting: createEmployeeMutation.isPending,
    handleInputChange,
    handleSelectChange,
    handleNextStep,
    handleBackStep,
    handleRemovePhoto,
    handleSubmit,
    goToStep,
    isStepValid,
    validateCurrentStep,
    form,
  };
}

export type { EmployeeFormData, FormEmployeeData };
