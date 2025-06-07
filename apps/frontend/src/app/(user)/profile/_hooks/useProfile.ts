import { useState, useCallback, useEffect } from 'react';
import { useCurrentUserProfileQuery } from '@/api/queries/employee.queries';
import { useUpdateCurrentUserProfile } from '@/api/mutations/employee.mutations';
import { useDocumentsByEmployee } from '@/api/queries/document.queries';
import {
  useUploadDocumentForEmployee,
  useDeleteDocument,
} from '@/api/mutations/document.mutations';
import { toast } from 'sonner';
import type { Document } from '@/services/document.service';
import { EmployeeService } from '@/services/employee.service';

const PHONE_REGEX = /^\+[1-9]\d{8,14}$/;

function debounce<T extends (...args: any[]) => any>(func: T, delay: number): T {
  let timeoutId: NodeJS.Timeout;
  return ((...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  }) as T;
}

export interface ClientDocument {
  name: string;
  file?: File | null;
  url?: string;
  uploadedAt?: string;
  id?: number;
}

// Phone validation state interface
interface PhoneValidationState {
  isValidating: boolean;
  isValid: boolean | null;
  message: string;
}

const employeeService = new EmployeeService();

export function useProfile() {
  const { data: employee, isLoading, error, isError } = useCurrentUserProfileQuery();

  const updateProfileMutation = useUpdateCurrentUserProfile();
  const { data: documents = [] } = useDocumentsByEmployee(employee?.id || 0);
  const uploadDocumentMutation = useUploadDocumentForEmployee();
  const deleteDocumentMutation = useDeleteDocument();

  // Profile image states
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [isUploadingProfileImage, setIsUploadingProfileImage] = useState(false);

  // Personal information states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [employeeCode, setEmployeeCode] = useState('');
  const [nik, setNik] = useState('');
  const [gender, setGender] = useState('');
  const [placeOfBirth, setPlaceOfBirth] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [phone, setPhone] = useState('');
  const [lastEducation, setLastEducation] = useState('');
  const [editPersonal, setEditPersonal] = useState(false);

  // Phone validation state
  const [phoneValidation, setPhoneValidation] = useState<PhoneValidationState>({
    isValidating: false,
    isValid: null,
    message: '',
  });

  // Bank information states
  const [bankName, setBankName] = useState('');
  const [bankAccountHolder, setBankAccountHolder] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [editBank, setEditBank] = useState(false);

  // Change password states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Document management
  const currentDocuments: ClientDocument[] = (documents || []).map((doc: Document) => ({
    name: doc.name,
    file: undefined,
    url: doc.url,
    uploadedAt: doc.created_at,
    id: doc.id,
  }));

  const validatePhoneDebounced = useCallback(
    debounce(async (phoneNumber: string) => {
      if (!phoneNumber || phoneNumber.trim() === '') {
        setPhoneValidation((prev) => ({
          ...prev,
          isValidating: false,
          isValid: null,
          message: '',
        }));
        return;
      }

      // Check basic format first
      if (!phoneNumber.startsWith('+')) {
        setPhoneValidation({
          isValidating: false,
          isValid: false,
          message: 'Phone number must start with country code (e.g., +62)',
        });
        return;
      }

      // Check minimum length (at least 10 digits total)
      if (phoneNumber.length < 10) {
        setPhoneValidation({
          isValidating: false,
          isValid: false,
          message: 'Phone number must be at least 10 digits total',
        });
        return;
      }

      // Check regex pattern
      if (!PHONE_REGEX.test(phoneNumber)) {
        setPhoneValidation({
          isValidating: false,
          isValid: false,
          message: 'Phone number format is invalid (e.g., +628123456789)',
        });
        return;
      }

      setPhoneValidation((prev) => ({
        ...prev,
        isValidating: true,
        isValid: null,
        message: '',
      }));

      try {
        if (employee?.phone === phoneNumber) {
          setPhoneValidation({
            isValidating: false,
            isValid: true,
            message: '',
          });
          return;
        }

        const result = await employeeService.validateUniqueField('phone', phoneNumber);
        setPhoneValidation({
          isValidating: false,
          isValid: !result.exists,
          message: result.exists ? result.message || 'Phone number already exists' : '',
        });
      } catch (error) {
        setPhoneValidation({
          isValidating: false,
          isValid: null,
          message: 'Error validating phone number',
        });
      }
    }, 500),
    [employee?.phone],
  );

  const validatePhoneImmediate = useCallback(
    (phoneNumber: string) => {
      if (!phoneNumber || phoneNumber.trim() === '') {
        setPhoneValidation({ isValidating: false, isValid: null, message: '' });
        return;
      }

      // Check basic format first
      if (!phoneNumber.startsWith('+')) {
        setPhoneValidation({
          isValidating: false,
          isValid: false,
          message: 'Phone number must start with country code (e.g., +62)',
        });
        return;
      }

      // Check minimum length (at least 10 digits total)
      if (phoneNumber.length < 10) {
        setPhoneValidation({
          isValidating: false,
          isValid: false,
          message: 'Phone number must be at least 10 digits total',
        });
        return;
      }

      // Check regex pattern
      if (!PHONE_REGEX.test(phoneNumber)) {
        setPhoneValidation({
          isValidating: false,
          isValid: false,
          message: 'Phone number format is invalid (e.g., +628123456789)',
        });
        return;
      }

      // If format is valid, trigger debounced validation for uniqueness
      validatePhoneDebounced(phoneNumber);
    },
    [validatePhoneDebounced],
  );

  const validateDateOfBirth = useCallback((value: string): boolean => {
    if (!value) return true; // Allow empty value

    const selectedDate = new Date(value);
    const today = new Date();
    const minDate = new Date();
    minDate.setFullYear(today.getFullYear() - 100);
    const minWorkAge = new Date();
    minWorkAge.setFullYear(today.getFullYear() - 16);

    if (selectedDate > today) {
      toast.error('Date of birth cannot be in the future');
      return false;
    }
    if (selectedDate < minDate) {
      toast.error('Date of birth cannot be more than 100 years ago');
      return false;
    }
    if (selectedDate > minWorkAge) {
      toast.error('Employee must be at least 16 years old');
      return false;
    }

    return true;
  }, []);

  const setPhoneWithValidation = useCallback(
    (value: string) => {
      setPhone(value);
      validatePhoneImmediate(value);
      validatePhoneDebounced(value);
    },
    [validatePhoneImmediate, validatePhoneDebounced],
  );

  useEffect(() => {
    if (employee) {
      setFirstName(employee.first_name || '');
      setLastName(employee.last_name || '');
      setEmail(employee.email || '');
      setEmployeeCode(employee.employee_code || '');
      setNik(employee.nik || '');
      setGender(employee.gender || '');
      setPlaceOfBirth(employee.place_of_birth || '');
      setDateOfBirth(employee.date_of_birth || '');
      setPhone(employee.phone || '');
      setLastEducation(employee.last_education || '');
      setBankName(employee.bank_name || '');
      setBankAccountHolder(employee.bank_account_holder_name || '');
      setBankAccountNumber(employee.bank_account_number || '');
      setProfileImage(employee.profile_photo_url || null);

      if (employee.phone) {
        validatePhoneImmediate(employee.phone);
      }
    }
  }, [employee, validatePhoneImmediate]);

  const handleProfileImageChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] || null;
      if (!file || !employee || isUploadingProfileImage) {
        return;
      }

      setIsUploadingProfileImage(true);
      setProfileFile(file);

      const reader = new FileReader();
      reader.onload = (ev) => {
        setProfileImage(ev.target?.result as string);
      };
      reader.readAsDataURL(file);

      try {
        const updateData = {
          photo_file: file,
        };
        await updateProfileMutation.mutateAsync(updateData);
        toast.success('Profile photo updated successfully!');
        setProfileFile(null);
      } catch (error) {
        console.error('Error updating profile photo:', error);
        toast.error('Failed to update profile photo. Please try again.');
        setProfileImage(employee.profile_photo_url || null);
        setProfileFile(null);
      } finally {
        setIsUploadingProfileImage(false);
        e.target.value = '';
      }
    },
    [employee, updateProfileMutation, isUploadingProfileImage],
  );

  const handleAddNewDocument = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && employee?.id) {
        try {
          await uploadDocumentMutation.mutateAsync({
            employeeId: employee.id,
            file,
          });
          toast.success('Document uploaded successfully!');
          e.target.value = '';
        } catch (error) {
          console.error('Error uploading document:', error);
          toast.error('Failed to upload document. Please try again.');
        }
      }
    },
    [employee?.id, uploadDocumentMutation],
  );

  const handleDeleteDocument = useCallback(
    async (index: number) => {
      const doc = currentDocuments[index];
      if (doc && doc.id) {
        try {
          await deleteDocumentMutation.mutateAsync(doc.id);
          toast.success('Document deleted successfully!');
        } catch (error) {
          console.error('Error deleting document:', error);
          toast.error('Failed to delete document. Please try again.');
        }
      }
    },
    [currentDocuments, deleteDocumentMutation],
  );

  const handleDownloadDocument = useCallback((doc: ClientDocument) => {
    if (doc.url && !doc.file) {
      const link = document.createElement('a');
      link.href = doc.url;
      link.download = doc.name;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (doc.file) {
      const url = URL.createObjectURL(doc.file);
      const link = document.createElement('a');
      link.href = url;
      link.download = doc.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }, []);

  const handleCancelEdit = useCallback(() => {
    if (employee) {
      setFirstName(employee.first_name || '');
      setLastName(employee.last_name || '');
      setGender(employee.gender || '');
      setPlaceOfBirth(employee.place_of_birth || '');
      setDateOfBirth(employee.date_of_birth || '');
      setPhone(employee.phone || '');
      setLastEducation(employee.last_education || '');

      if (profileFile) {
        setProfileImage(employee.profile_photo_url || null);
        setProfileFile(null);
      }
    }
    setEditPersonal(false);
  }, [employee, profileFile]);

  const handleSavePersonal = useCallback(async () => {
    if (!employee) return;

    try {
      const updateData: any = {
        first_name: firstName,
        last_name: lastName,
        gender: gender,
        place_of_birth: placeOfBirth,
        date_of_birth: dateOfBirth,
        phone: phone,
        last_education: lastEducation,
      };

      if (profileFile) {
        updateData.photo_file = profileFile;
      }

      await updateProfileMutation.mutateAsync(updateData);
      toast.success('Personal information updated successfully!');
      setEditPersonal(false);
      setProfileFile(null);
    } catch (error) {
      console.error('Error updating personal information:', error);
      toast.error('Failed to update personal information. Please try again.');
    }
  }, [
    employee,
    firstName,
    lastName,
    gender,
    placeOfBirth,
    dateOfBirth,
    phone,
    lastEducation,
    profileFile,
    updateProfileMutation,
  ]);

  const handleSaveBank = useCallback(async () => {
    if (!employee) return;

    try {
      const updateData = {
        bank_name: bankName,
        bank_account_holder_name: bankAccountHolder,
        bank_account_number: bankAccountNumber,
      };

      await updateProfileMutation.mutateAsync(updateData);
      toast.success('Bank information updated successfully!');
      setEditBank(false);
    } catch (error) {
      console.error('Error updating bank information:', error);
      toast.error('Failed to update bank information. Please try again.');
    }
  }, [employee, bankName, bankAccountHolder, bankAccountNumber, updateProfileMutation]);

  const handleChangePassword = useCallback(() => {
    if (newPassword !== confirmPassword) {
      toast.error('New password and confirm password do not match.');
      return;
    }

    if (!newPassword) {
      toast.error('New password cannot be empty.');
      return;
    }

    console.log('Changing password with:', {
      currentPassword,
      newPassword,
    });

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    toast.success('Password change submitted (simulated).');
  }, [currentPassword, newPassword, confirmPassword]);

  const isPersonalFormValid = useCallback(() => {
    if (phoneValidation.isValidating) {
      return false;
    }

    if (phoneValidation.isValid === false) {
      return false;
    }

    if (!firstName.trim()) {
      return false;
    }

    return true;
  }, [phoneValidation.isValidating, phoneValidation.isValid, firstName]);

  return {
    // Data
    employee,
    isLoading,
    error: isError ? error : null,
    currentDocuments,

    // Profile image
    profileImage,
    isUploadingProfileImage,

    // Personal information
    firstName,
    setFirstName,
    lastName,
    setLastName,
    email,
    setEmail,
    employeeCode,
    nik,
    setNik,
    gender,
    setGender,
    placeOfBirth,
    setPlaceOfBirth,
    dateOfBirth,
    setDateOfBirth,
    phone,
    setPhone: setPhoneWithValidation,
    lastEducation,
    setLastEducation,
    editPersonal,
    setEditPersonal,

    // Bank information
    bankName,
    setBankName,
    bankAccountHolder,
    setBankAccountHolder,
    bankAccountNumber,
    setBankAccountNumber,
    editBank,
    setEditBank,

    // Password change
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,

    // Phone validation
    phoneValidation,

    // Handlers
    handleProfileImageChange,
    handleAddNewDocument,
    handleDeleteDocument,
    handleDownloadDocument,
    handleCancelEdit,
    handleSavePersonal,
    handleSaveBank,
    handleChangePassword,

    isPersonalFormValid,
    validateDateOfBirth,
  };
}
