'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { useCreateEmployee } from '@/api/mutations/employee.mutations';
import {
  type ContractType,
  type EducationLevel,
  type Gender,
  type TaxStatus,
} from '@/const';
import { useSubscriptionLimit } from '@/hooks/useSubscriptionLimit';
import {
  employeeFormSchema,
  type EmployeeFormData,
  personalInfoSchema,
  employeeInfoSchema,
  bankInfoSchema,
} from '@/schemas/employee.schema';

const getTodaysDate = (): string => new Date().toISOString().split('T')[0] || '';

type FormEmployeeData = Omit<
  EmployeeFormData,
  'gender' | 'lastEducation' | 'taxStatus' | 'contractType'
> & {
  gender: '' | Gender;
  lastEducation: '' | EducationLevel;
  taxStatus: '' | TaxStatus;
  contractType: '' | ContractType;
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

export const useAddEmployeeForm = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [hasRealtimeValidationErrors, setHasRealtimeValidationErrors] = useState(false);
  const profilePhotoInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const createEmployeeMutation = useCreateEmployee();
  const { checkCanAddEmployees, getAddEmployeeErrorMessage } = useSubscriptionLimit();

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
      let processedValue = value;

      if (name === 'nik') {
        processedValue = value.replace(/\D/g, '').slice(0, 16);
      } else if (name === 'phoneNumber') {
        if (value.startsWith('+')) {
          processedValue = `+${  value.slice(1).replace(/\D/g, '')}`;
        } else if (value === '') {
          processedValue = '';
        } else {
          processedValue = `+${  value.replace(/\D/g, '')}`;
        }
      } else if (name === 'bankAccountNumber') {
        processedValue = value.replace(/\D/g, '');
      } else if (name === 'dateOfBirth') {
        if (value) {
          const selectedDate = new Date(value);
          const today = new Date();
          const minDate = new Date();
          minDate.setFullYear(today.getFullYear() - 100);

          if (selectedDate > today) {
            toast.error('Date of birth cannot be in the future');
            return;
          }

          if (selectedDate < minDate) {
            toast.error('Date of birth cannot be more than 100 years ago');
            return;
          }

          const minWorkAge = new Date();
          minWorkAge.setFullYear(today.getFullYear() - 16);
          if (selectedDate > minWorkAge) {
            toast.error('Employee must be at least 16 years old');
            return;
          }
        }
        processedValue = value;
      }

      setValue(name as keyof FormEmployeeData, processedValue);
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setValue(name as keyof FormEmployeeData, value);
  };

  const validateCurrentStep = async () => {
    const currentStepSchema = steps[activeStep - 1]?.schema;
    if (!currentStepSchema) return false;

    const currentData = getValues();

    try {
      currentStepSchema.parse(currentData);
      return true;
    } catch {
      return false;
    }
  };

  const handleNextStep = async () => {
    if (activeStep === 1 && hasRealtimeValidationErrors) {
      return;
    }

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
        return;
      }
    }

    if (activeStep < steps.length) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBackStep = () => {
    if (activeStep > 1) {
      setActiveStep((prev) => prev - 1);
    }
  };

  const handleValidationChange = (hasErrors: boolean) => {
    setHasRealtimeValidationErrors(hasErrors);
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

    if (!checkCanAddEmployees(1)) {
      const errorMessage = getAddEmployeeErrorMessage(1);
      toast.error('Employee Limit Reached', {
        description: errorMessage,
        action: {
          label: 'Upgrade Plan',
          onClick: () => router.push('/subscription?view=seat'),
        },
        duration: 10000,
      });
      return;
    }

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

      let errorMessage = 'Failed to create employee. Please try again.';

      if (error instanceof Error && error.message.includes('employee limit')) {
        errorMessage = error.message;
        toast.error(errorMessage, {
          duration: 8000,
          position: 'top-center',
          dismissible: true,
          action: {
            label: 'Upgrade Plan',
            onClick: () => {
              router.push('/subscription?view=package');
            },
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
        });
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const goToStep = async (stepNumber: number) => {
    if (stepNumber <= activeStep) {
      setActiveStep(stepNumber);
      return;
    }

    let canProceed = true;

    const stepValidations = [];
    for (let step = activeStep; step < stepNumber; step += 1) {
      if (step === 1 && hasRealtimeValidationErrors) {
        canProceed = false;
        break;
      }

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
        stepValidations.push(form.trigger(currentStepFields));
      }
    }

    if (stepValidations.length > 0) {
      const validationResults = await Promise.all(stepValidations);
      canProceed = validationResults.every(Boolean);
    }

    if (canProceed) {
      setActiveStep(stepNumber);
    } else {
      toast.error(
        'Please complete and fix all validation errors in the current step before proceeding',
      );
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

    const hasInvalidField = currentStepFields.some((field) => {
      const value = currentData[field];

      if (!value || (typeof value === 'string' && value.trim() === '')) {
        return true;
      }

      return Boolean(errors[field]);
    });

    return !hasInvalidField;
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
    handleValidationChange,
  };
}

export type { EmployeeFormData, FormEmployeeData };
