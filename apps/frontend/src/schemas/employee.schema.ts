import { z } from 'zod';

export const employeeFormSchema = z.object({
  // Personal Information
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().optional(),
  email: z.string().email('Valid email is required'),
  nik: z
    .string()
    .min(16, 'NIK must be 16 digits')
    .max(16, 'NIK must be 16 digits')
    .regex(/^\d+$/, 'NIK must only contain numbers'),
  phoneNumber: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .regex(/^\+[1-9]\d{1,14}$/, 'Phone number must start with country code (e.g., +62812345678)'),
  gender: z.enum(['Male', 'Female'], { required_error: 'Gender is required' }),
  lastEducation: z.enum(['SD', 'SMP', 'SMA/SMK', 'D1', 'D2', 'D3', 'S1/D4', 'S2', 'S3', 'Other'], {
    required_error: 'Education level is required',
  }),
  placeOfBirth: z.string().min(1, 'Place of birth is required'),
  dateOfBirth: z
    .string()
    .min(1, 'Date of birth is required')
    .refine((date) => {
      const parsedDate = new Date(date);
      const today = new Date();
      const birthYear = parsedDate.getFullYear();
      const currentYear = today.getFullYear();
      const age = currentYear - birthYear;

      // Check if birthday has passed this year
      const hasHadBirthdayThisYear =
        today.getMonth() > parsedDate.getMonth() ||
        (today.getMonth() === parsedDate.getMonth() && today.getDate() >= parsedDate.getDate());

      const actualAge = hasHadBirthdayThisYear ? age : age - 1;

      return actualAge >= 16 && actualAge <= 70;
    }, 'Age must be between 16 and 70 years'),
  taxStatus: z.enum(
    [
      'TK/0',
      'TK/1',
      'TK/2',
      'TK/3',
      'K/0',
      'K/1',
      'K/2',
      'K/3',
      'K/I/0',
      'K/I/1',
      'K/I/2',
      'K/I/3',
    ],
    { required_error: 'Tax status is required' },
  ),

  // Employee Information
  employeeId: z.string().min(1, 'Employee ID is required'),
  branch: z.string().min(1, 'Branch is required'),
  position: z.string().min(1, 'Position is required'),
  grade: z.string().optional(),
  contractType: z.enum(['permanent', 'contract', 'freelance'], {
    required_error: 'Contract type is required',
  }),
  hireDate: z.string().min(1, 'Hire date is required'),
  profilePhoto: z.instanceof(File).optional(),

  // Bank Information
  bankName: z.string().min(1, 'Bank name is required'),
  bankAccountHolder: z.string().min(1, 'Account holder name is required'),
  bankAccountNumber: z
    .string()
    .min(1, 'Bank account number is required')
    .regex(/^\d+$/, 'Account number must only contain numbers'),

  // UI state
  profilePhotoPreview: z.string().nullable().optional(),
});

export type EmployeeFormData = z.infer<typeof employeeFormSchema>;

// For step-by-step validation - make them more lenient
export const personalInfoSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().optional(),
  email: z.string().email('Valid email is required'),
  nik: z
    .string()
    .min(16, 'NIK must be 16 digits')
    .max(16, 'NIK must be 16 digits')
    .regex(/^\d+$/, 'NIK must only contain numbers'),
  phoneNumber: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .regex(/^\+[1-9]\d{1,14}$/, 'Phone number must start with country code (e.g., +62812345678)'),
  gender: z.enum(['Male', 'Female'], { required_error: 'Gender is required' }),
  lastEducation: z.enum(['SD', 'SMP', 'SMA/SMK', 'D1', 'D2', 'D3', 'S1/D4', 'S2', 'S3', 'Other'], {
    required_error: 'Education level is required',
  }),
  placeOfBirth: z.string().min(1, 'Place of birth is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  taxStatus: z.enum(
    [
      'TK/0',
      'TK/1',
      'TK/2',
      'TK/3',
      'K/0',
      'K/1',
      'K/2',
      'K/3',
      'K/I/0',
      'K/I/1',
      'K/I/2',
      'K/I/3',
    ],
    { required_error: 'Tax status is required' },
  ),
});

export const employeeInfoSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  branch: z.string().min(1, 'Branch is required'),
  position: z.string().min(1, 'Position is required'),
  grade: z.string().optional(),
  contractType: z.enum(['permanent', 'contract', 'freelance'], {
    required_error: 'Contract type is required',
  }),
  hireDate: z.string().min(1, 'Hire date is required'),
  profilePhoto: z.instanceof(File).optional(),
});

export const bankInfoSchema = z.object({
  bankName: z.string().min(1, 'Bank name is required'),
  bankAccountHolder: z.string().min(1, 'Account holder name is required'),
  bankAccountNumber: z.string().min(1, 'Bank account number is required'),
});

export type PersonalInfoData = z.infer<typeof personalInfoSchema>;
export type EmployeeInfoData = z.infer<typeof employeeInfoSchema>;
export type BankInfoData = z.infer<typeof bankInfoSchema>;
