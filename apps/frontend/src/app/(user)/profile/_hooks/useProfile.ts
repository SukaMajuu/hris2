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

export interface ClientDocument {
  name: string;
  file?: File | null;
  url?: string;
  uploadedAt?: string;
  id?: number;
}

export function useProfile() {
  const { data: employee, isLoading, error, isError } = useCurrentUserProfileQuery();

  const updateProfileMutation = useUpdateCurrentUserProfile();
  const { data: documents = [] } = useDocumentsByEmployee(employee?.id || 0);
  const uploadDocumentMutation = useUploadDocumentForEmployee();
  const deleteDocumentMutation = useDeleteDocument();

  // Profile image states
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [profileFile, setProfileFile] = useState<File | null>(null);

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

  // Initialize form data when employee data is loaded
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
    }
  }, [employee]);

  const handleProfileImageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] || null;
      if (file) {
        setProfileFile(file);
        const reader = new FileReader();
        reader.onload = (ev) => {
          setProfileImage(ev.target?.result as string);
        };
        reader.readAsDataURL(file);

        // Auto-save the profile photo
        setTimeout(async () => {
          if (employee) {
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
              // Reset to original image on error
              setProfileImage(employee.profile_photo_url || null);
              setProfileFile(null);
            }
          }
        }, 100);
      }
    },
    [employee, updateProfileMutation],
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
          // Clear the input
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
    // Reset form data to original values
    if (employee) {
      setFirstName(employee.first_name || '');
      setLastName(employee.last_name || '');
      // email and nik are readonly, so we don't reset them
      setGender(employee.gender || '');
      setPlaceOfBirth(employee.place_of_birth || '');
      setDateOfBirth(employee.date_of_birth || '');
      setPhone(employee.phone || '');
      setLastEducation(employee.last_education || '');

      // Reset profile image only if there was a pending change
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

      // Add profile photo if changed
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
    // Basic validation: Check if new password and confirm password match
    if (newPassword !== confirmPassword) {
      toast.error('New password and confirm password do not match.');
      return;
    }

    // Basic validation: Check if new password is provided
    if (!newPassword) {
      toast.error('New password cannot be empty.');
      return;
    }

    // TODO: Implement password change API call
    console.log('Changing password with:', {
      currentPassword,
      newPassword,
    });

    // Clear the fields after submission
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    toast.success('Password change submitted (simulated).');
  }, [currentPassword, newPassword, confirmPassword]);

  return {
    // Data
    employee,
    isLoading,
    error,
    isError,
    currentDocuments,

    // Profile image
    profileImage,
    profileFile,

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
    setPhone,
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

    // Handlers
    handleProfileImageChange,
    handleAddNewDocument,
    handleDeleteDocument,
    handleDownloadDocument,
    handleCancelEdit,
    handleSavePersonal,
    handleSaveBank,
    handleChangePassword,
  };
}
