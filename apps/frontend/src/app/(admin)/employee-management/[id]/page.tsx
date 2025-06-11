'use client';

import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pencil, ArrowLeft, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import DocumentManagement from './_tabContents/documentManagement';
import EmployeeInformation from './_tabContents/employeeInformation';
import { useDetailEmployee } from './_hooks/useDetailEmployee';
import { FeatureGuard } from '@/components/subscription/FeatureGuard';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { FEATURE_CODES } from '@/const/features';

export default function Page() {
  const params = useParams();
  const id = Number(params.id);
  const { hasFeature } = useFeatureAccess();

  const {
    initialEmployeeData: employee,
    isLoading,
    error,
    profileImage,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    employeeCode,
    setEmployeeCode,
    branch,
    setBranch,
    position,
    setPosition,
    grade,
    setGrade,
    joinDate,
    setJoinDate,
    contractType,
    setContractType,
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
    lastEducation,
    setLastEducation,
    taxStatus,
    setTaxStatus,
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
    validationStates,
    hasValidationErrors,
    validateDateOfBirth,
    isResettingPassword,
    onResetPasswordComplete,
    handleProfileImageChange,
    handleAddNewDocument,
    handleDeleteDocument,
    handleDownloadDocument,
    handleSaveJob,
    handleSavePersonal,
    handleSaveBank,
    handleResetPassword,
    handleCancelEdit,
    handleCancelPersonalEdit,
  } = useDetailEmployee(id);

  // Check if document management feature is available
  const canManageDocuments = hasFeature(FEATURE_CODES.DOCUMENT_EMPLOYEE_MANAGEMENT);

  const [activeTab, setActiveTab] = useState<'personal' | 'document'>('personal');

  if (isLoading) {
    return (
      <div className='p-6 text-center text-slate-500 dark:text-slate-400'>
        Loading employee data...
      </div>
    );
  }

  if (error) {
    return <div className='p-6 text-center text-red-500 dark:text-red-400'>Error: {error}</div>;
  }

  if (!employee) {
    return (
      <div className='p-6 text-center text-slate-500 dark:text-slate-400'>Employee not found.</div>
    );
  }

  return (
    <div className='min-h-screen space-y-6 bg-slate-50 p-4 md:p-6 dark:bg-slate-950'>
      <div className='mb-6'>
        <Link href='/employee-management'>
          <Button
            variant='outline'
            className='cursor-pointer border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100'
          >
            <ArrowLeft className='mr-2 h-4 w-4' />
            Back to Employee List
          </Button>
        </Link>
      </div>

      <Card className='overflow-hidden border border-slate-100 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900'>
        <CardHeader className='flex flex-row items-center justify-between border-b pb-3 dark:border-slate-700'>
          <CardTitle className='text-lg font-semibold text-slate-800 dark:text-slate-100'>
            Employee Overview
          </CardTitle>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => (editJob ? handleCancelEdit() : setEditJob(true))}
            className='cursor-pointer rounded-md px-4 py-2 text-blue-600 transition-colors duration-150 hover:bg-slate-100 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-slate-700/50 dark:hover:text-blue-300'
          >
            <Pencil className='mr-2 h-4 w-4' />
            {editJob ? 'Cancel Edit' : 'Edit'}
          </Button>
        </CardHeader>
        <CardContent className='p-6'>
          <div className='flex flex-col items-start gap-6 md:flex-row md:items-center'>
            <div
              className={`group relative mx-auto flex-shrink-0 md:mx-0 ${
                editJob ? 'cursor-pointer' : 'cursor-default'
              }`}
            >
              <Image
                src={profileImage || '/logo.png'}
                alt='Profile Photo'
                width={120}
                height={120}
                className='h-[120px] w-[120px] rounded-full border-4 border-slate-200 object-cover shadow-md dark:border-slate-700'
              />
              {editJob && (
                <label className='bg-opacity-50 absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black opacity-0 transition-opacity duration-200 group-hover:opacity-100'>
                  <Pencil className='h-6 w-6 text-white' />
                  <Input
                    type='file'
                    accept='image/*'
                    className='hidden'
                    onChange={handleProfileImageChange}
                  />
                </label>
              )}
            </div>
            <div className='flex-1 space-y-4'>
              <div>
                <p
                  id='employeeNameTop'
                  className='text-2xl font-bold text-slate-800 dark:text-slate-100'
                >
                  {[firstName, lastName].filter(Boolean).join(' ')}
                </p>
              </div>
              <div className='grid grid-cols-1 gap-x-6 gap-y-4 text-sm sm:grid-cols-2 md:grid-cols-3'>
                <div>
                  <Label
                    htmlFor='employeeCodeTop'
                    className='font-semibold text-slate-600 dark:text-slate-400'
                  >
                    Employee Code
                  </Label>
                  {editJob ? (
                    <div className='relative'>
                      <Input
                        id='employeeCodeTop'
                        value={employeeCode}
                        onChange={(e) => setEmployeeCode(e.target.value)}
                        className={`mt-1 h-8 border-slate-300 bg-slate-50 pr-8 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 ${
                          validationStates.employee_code.isValid === false
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                            : validationStates.employee_code.isValid === true
                              ? 'border-green-500 focus:border-green-500 focus:ring-green-500'
                              : ''
                        }`}
                      />
                      <div className='absolute inset-y-0 right-0 flex items-center pr-2'>
                        {validationStates.employee_code.isValidating ? (
                          <Loader2 className='h-3 w-3 animate-spin text-blue-500' />
                        ) : validationStates.employee_code.isValid === true ? (
                          <CheckCircle className='h-3 w-3 text-green-500' />
                        ) : validationStates.employee_code.isValid === false ? (
                          <XCircle className='h-3 w-3 text-red-500' />
                        ) : null}
                      </div>
                      {validationStates.employee_code.message && (
                        <p className='mt-1 text-xs text-red-500'>
                          {validationStates.employee_code.message}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className='text-slate-700 dark:text-slate-300'>{employeeCode}</p>
                  )}
                </div>
                <div>
                  <Label
                    htmlFor='positionTop'
                    className='font-semibold text-slate-600 dark:text-slate-400'
                  >
                    Position
                  </Label>
                  {editJob ? (
                    <Input
                      id='positionTop'
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      className='mt-1 h-8 border-slate-300 bg-slate-50 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800'
                      placeholder='Enter position'
                    />
                  ) : (
                    <p className='text-slate-700 dark:text-slate-300'>{position}</p>
                  )}
                </div>
                <div>
                  <Label
                    htmlFor='branchTop'
                    className='font-semibold text-slate-600 dark:text-slate-400'
                  >
                    Branch
                  </Label>
                  {editJob ? (
                    <Input
                      id='branchTop'
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      className='mt-1 h-8 border-slate-300 bg-slate-50 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800'
                      placeholder='Enter branch'
                    />
                  ) : (
                    <p className='text-slate-700 dark:text-slate-300'>{branch}</p>
                  )}
                </div>
                <div>
                  <Label
                    htmlFor='joinDateTop'
                    className='font-semibold text-slate-600 dark:text-slate-400'
                  >
                    Join Date
                  </Label>
                  {editJob ? (
                    <Input
                      id='joinDateTop'
                      type='date'
                      value={joinDate}
                      onChange={(e) => setJoinDate(e.target.value)}
                      className='mt-1 h-8 border-slate-300 bg-slate-50 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800'
                    />
                  ) : (
                    <p className='text-slate-700 dark:text-slate-300'>{joinDate}</p>
                  )}
                </div>
                <div>
                  <Label
                    htmlFor='gradeTop'
                    className='font-semibold text-slate-600 dark:text-slate-400'
                  >
                    Grade
                  </Label>
                  {editJob ? (
                    <Input
                      id='gradeTop'
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      className='mt-1 h-8 border-slate-300 bg-slate-50 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800'
                    />
                  ) : (
                    <p className='text-slate-700 dark:text-slate-300'>{grade}</p>
                  )}
                </div>
                <div>
                  <Label
                    htmlFor='contractTypeTop'
                    className='font-semibold text-slate-600 dark:text-slate-400'
                  >
                    Contract Type
                  </Label>
                  {editJob ? (
                    <Select value={contractType} onValueChange={(value) => setContractType(value)}>
                      <SelectTrigger className='mt-1 h-8 w-full cursor-pointer border-slate-300 bg-slate-50 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800'>
                        <SelectValue placeholder={contractType || 'Select contract type'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='permanent'>Permanent</SelectItem>
                        <SelectItem value='contract'>Contract</SelectItem>
                        <SelectItem value='freelance'>Freelance</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className='text-slate-700 dark:text-slate-300'>{contractType}</p>
                  )}
                </div>
              </div>
              {editJob && (
                <div className='mt-4 text-right'>
                  <Button
                    onClick={handleSaveJob}
                    disabled={validationStates.employee_code.isValid === false}
                    className={`cursor-pointer ${
                      validationStates.employee_code.isValid === false
                        ? 'cursor-not-allowed bg-slate-400 text-slate-600'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    Save Changes
                  </Button>
                  {validationStates.employee_code.isValid === false && (
                    <p className='mt-2 text-xs text-red-500'>
                      Please fix employee code validation error before saving
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as 'personal' | 'document')}
        className='w-full'
      >
        <TabsList
          className={`grid h-12 w-full ${
            canManageDocuments
              ? 'grid-cols-1 sm:grid-cols-2 md:inline-flex md:w-auto'
              : 'grid-cols-1 md:inline-flex md:w-auto'
          } rounded-lg border border-slate-200 bg-white p-1 shadow-md dark:border-slate-700 dark:bg-slate-800`}
        >
          <TabsTrigger
            value='personal'
            className='data-[state=active]:bg-primary dark:data-[state=active]:bg-primary cursor-pointer rounded-md px-4 py-2 text-slate-700 transition-colors duration-150 hover:bg-slate-100 data-[state=active]:text-white dark:text-slate-300 dark:hover:bg-slate-700/50 dark:data-[state=active]:text-slate-50'
          >
            Employee Information
          </TabsTrigger>
          <TabsTrigger
            value='document'
            className='data-[state=active]:bg-primary dark:data-[state=active]:bg-primary cursor-pointer rounded-md px-4 py-2 text-slate-700 transition-colors duration-150 hover:bg-slate-100 data-[state=active]:text-white dark:text-slate-300 dark:hover:bg-slate-700/50 dark:data-[state=active]:text-slate-50'
          >
            Employee Document
            {!canManageDocuments && (
              <span className='ml-2 inline-flex items-center rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/20 dark:text-amber-400'>
                Premium
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value='personal' className='mt-6'>
          <EmployeeInformation
            firstName={firstName}
            setFirstName={setFirstName}
            lastName={lastName}
            setLastName={setLastName}
            nik={nik}
            setNik={setNik}
            email={email}
            setEmail={setEmail}
            gender={gender}
            setGender={setGender}
            placeOfBirth={placeOfBirth}
            setPlaceOfBirth={setPlaceOfBirth}
            dateOfBirth={dateOfBirth}
            setDateOfBirth={setDateOfBirth}
            phone={phone}
            setPhone={setPhone}
            lastEducation={lastEducation}
            setLastEducation={setLastEducation}
            taxStatus={taxStatus}
            setTaxStatus={setTaxStatus}
            editPersonal={editPersonal}
            setEditPersonal={setEditPersonal}
            handleSavePersonal={handleSavePersonal}
            handleCancelPersonalEdit={handleCancelPersonalEdit}
            bankName={bankName}
            setBankName={setBankName}
            bankAccountHolder={bankAccountHolder}
            setBankAccountHolder={setBankAccountHolder}
            bankAccountNumber={bankAccountNumber}
            setBankAccountNumber={setBankAccountNumber}
            editBank={editBank}
            setEditBank={setEditBank}
            handleSaveBank={handleSaveBank}
            handleResetPassword={handleResetPassword}
            validationStates={validationStates}
            hasValidationErrors={hasValidationErrors}
            validateDateOfBirth={validateDateOfBirth}
            isResettingPassword={isResettingPassword}
            onResetPasswordComplete={onResetPasswordComplete}
          />
        </TabsContent>

        <TabsContent value='document' className='mt-6'>
          {canManageDocuments ? (
            <DocumentManagement
              currentDocuments={currentDocuments}
              handleAddNewDocument={handleAddNewDocument}
              handleDeleteDocument={handleDeleteDocument}
              handleDownloadDocument={handleDownloadDocument}
            />
          ) : (
            <FeatureGuard feature={FEATURE_CODES.DOCUMENT_EMPLOYEE_MANAGEMENT}>
              <div></div>
            </FeatureGuard>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
