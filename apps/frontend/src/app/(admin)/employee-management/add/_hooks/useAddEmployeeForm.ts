'use client';

import { useState, useRef } from 'react';

export interface EmployeeFormData {
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
  bankName: string;
  bankAccountHolder: string;
  bankAccountNumber: string;
  zzz: string;
}

const initialFormData: EmployeeFormData = {
  firstName: '',
  lastName: '',
  nik: '',
  phoneNumber: '',
  gender: '',
  lastEducation: '',
  placeOfBirth: '',
  dateOfBirth: '',
  employeeId: '',
  branch: '',
  position: '',
  grade: '',
  profilePhoto: null,
  profilePhotoPreview: null,
  bankName: '',
  bankAccountHolder: '',
  bankAccountNumber: '',
  zzz: '',
};

export function useAddEmployeeForm() {
  const [activeStep, setActiveStep] = useState(1);
  const [formData, setFormData] = useState<EmployeeFormData>(initialFormData);
  const profilePhotoInputRef = useRef<HTMLInputElement>(null);

  const steps = [
    { label: 'Personal Information' },
    { label: 'Employee Information' },
    { label: 'Bank Information' },
    { label: 'Review & Submit' },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      setFormData((prev) => ({
        ...prev,
        [name]: files && files[0] ? files[0] : null,
        [`${name}Preview`]: files && files[0] ? URL.createObjectURL(files[0]) : null,
      }));
      if (name === 'profilePhoto' && (!files || !files[0])) {
        if (profilePhotoInputRef.current) profilePhotoInputRef.current.value = '';
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

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
    setFormData((prev) => ({
      ...prev,
      profilePhoto: null,
      profilePhotoPreview: null,
    }));
    if (profilePhotoInputRef.current) profilePhotoInputRef.current.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form Submitted:', formData);
    alert('Employee data submitted! (Check console for data)');
  };

  const goToStep = (stepNumber: number) => {
    setActiveStep(stepNumber);
  };

  return {
    activeStep,
    formData,
    steps,
    profilePhotoInputRef,
    handleInputChange,
    handleSelectChange,
    handleNextStep,
    handleBackStep,
    handleRemovePhoto,
    handleSubmit,
    goToStep,
  };
}
