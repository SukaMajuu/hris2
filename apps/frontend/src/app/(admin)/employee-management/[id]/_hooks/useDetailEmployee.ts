import { useState, useCallback, useEffect } from 'react';
import { useEmployeeDetailQuery } from '@/api/queries/employee.queries';

export interface ClientDocument {
  name: string;
  file: File | null;
  url?: string;
  uploadedAt?: string;
}

export function useDetailEmployee(employeeId: number) {
  const {
    data: employee,
    isLoading,
    error,
    isError,
  } = useEmployeeDetailQuery(employeeId, !!employeeId);

  // Profile image states
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [profileFile, setProfileFile] = useState<File | null>(null);

  // Job information states
  const [name, setName] = useState('');
  const [employeeCode, setEmployeeCode] = useState('');
  const [branch, setBranch] = useState('');
  const [position, setPosition] = useState('');
  const [employmentStatus, setEmploymentStatus] = useState('');
  const [department, setDepartment] = useState('');
  const [grade, setGrade] = useState('');
  const [joinDate, setJoinDate] = useState('');
  const [contractType, setContractType] = useState('');
  const [sp, setSp] = useState('');
  const [editJob, setEditJob] = useState(false);

  // Personal information states
  const [nik, setNik] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('');
  const [placeOfBirth, setPlaceOfBirth] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [lastEducation, setLastEducation] = useState('');
  const [editPersonal, setEditPersonal] = useState(false);

  // Bank information states
  const [bankName, setBankName] = useState('');
  const [bankAccountHolder, setBankAccountHolder] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [editBank, setEditBank] = useState(false);

  // Document states
  const [currentDocuments, setCurrentDocuments] = useState<ClientDocument[]>([]);

  // Initialize form data when employee data is loaded
  useEffect(() => {
    if (employee) {
      // Format employee name from first_name and last_name
      const fullName = [employee.first_name, employee.last_name].filter(Boolean).join(' ');

      setName(fullName);
      setEmployeeCode(employee.employee_code || '');
      setNik(employee.nik || '');
      setEmail(employee.email || '');
      setGender(employee.gender || '');
      setPlaceOfBirth(employee.place_of_birth || '');
      setDateOfBirth(employee.date_of_birth || '');
      setPhone(employee.phone || '');
      setAddress(''); // Address field not in API response
      setBranch(employee.branch_name || '');
      setPosition(employee.position_name || '');
      setEmploymentStatus(employee.employment_status ? 'Active' : 'Inactive');
      setDepartment(''); // Department field not in API response
      setGrade(employee.grade || '');
      setJoinDate(employee.hire_date || '');
      setBankName(employee.bank_name || '');
      setBankAccountHolder(employee.bank_account_holder_name || '');
      setBankAccountNumber(employee.bank_account_number || '');
      setProfileImage(employee.profile_photo_url || null);
      setLastEducation(employee.last_education || '');
      setContractType(employee.contract_type || '');
      setSp(employee.sp || '');
      setCurrentDocuments(
        employee.documentMetadata?.map((doc) => ({
          name: doc.name,
          file: null,
          url: doc.url,
          uploadedAt: doc.uploadedAt,
        })) || [],
      );
    }
  }, [employee]);

  const handleProfileImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setProfileFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => {
        setProfileImage(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleAddNewDocument = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCurrentDocuments((prevDocs) => [
        ...prevDocs,
        {
          name: file.name,
          file: file,
          url: undefined,
          uploadedAt: new Date().toISOString().split('T')[0],
        },
      ]);
    }
  }, []);

  const handleDeleteDocument = useCallback((index: number) => {
    setCurrentDocuments((prevDocs) => prevDocs.filter((_, i) => i !== index));
  }, []);

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

  const handleSaveJob = useCallback(() => {
    console.log('Saving job info...', {
      employeeCode,
      branch,
      position,
      employmentStatus,
      department,
      grade,
      joinDate,
      contractType,
      sp,
    });

    setEditJob(false);
  }, [
    employeeCode,
    branch,
    position,
    employmentStatus,
    department,
    grade,
    joinDate,
    contractType,
    sp,
  ]);

  const handleSavePersonal = useCallback(() => {
    console.log('Saving personal info...', {
      nik,
      email,
      gender,
      placeOfBirth,
      dateOfBirth,
      phone,
      address,
      lastEducation,
      name,
    });
    // TODO: Make API call to update employee data
    setEditPersonal(false);
  }, [nik, email, gender, placeOfBirth, dateOfBirth, phone, address, lastEducation, name]);

  const handleSaveBank = useCallback(() => {
    console.log('Saving bank info...', {
      bankName,
      bankAccountHolder,
      bankAccountNumber,
    });
    // TODO: Make API call to update employee data
    setEditBank(false);
  }, [bankName, bankAccountHolder, bankAccountNumber]);

  const handleResetPassword = useCallback(() => {
    const newPassword = Math.random().toString(36).slice(-8);
    console.log(
      `Password reset requested for employee ${employee?.id}. New temporary password: ${newPassword}`,
    );
    alert(`Password has been reset. New temporary password: ${newPassword}`);
  }, [employee?.id]);

  return {
    initialEmployeeData: employee,
    isLoading,
    error: isError ? error?.message || 'Failed to load employee data' : null,

    profileImage,
    setProfileImage,
    profileFile,
    setProfileFile,
    name,
    setName,
    employeeCode,
    setEmployeeCode,
    branch,
    setBranch,
    position,
    setPosition,
    employmentStatus,
    setEmploymentStatus,
    department,
    setDepartment,
    grade,
    setGrade,
    joinDate,
    setJoinDate,
    contractType,
    setContractType,
    sp,
    setSp,
    editJob,
    setEditJob,

    nik,
    setNik,
    email,
    setEmail,
    gender,
    setGender,
    placeOfBirth,
    setPlaceOfBirth,
    dateOfBirth,
    setDateOfBirth,
    phone,
    setPhone,
    address,
    setAddress,
    lastEducation,
    setLastEducation,
    editPersonal,
    setEditPersonal,

    bankName,
    setBankName,
    bankAccountHolder,
    setBankAccountHolder,
    bankAccountNumber,
    setBankAccountNumber,
    editBank,
    setEditBank,

    currentDocuments,
    setCurrentDocuments,

    handleProfileImageChange,
    handleAddNewDocument,
    handleDeleteDocument,
    handleDownloadDocument,
    handleSaveJob,
    handleSavePersonal,
    handleSaveBank,
    handleResetPassword,
  };
}
