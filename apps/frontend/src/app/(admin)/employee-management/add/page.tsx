"use client";

import { Card } from "@/components/ui/card";

import { AddEmployeeHeader } from "./_components/AddEmployeeHeader";
import { BankInformationStep } from "./_components/BankInformationStep";
import { EmployeeInformationStep } from "./_components/EmployeeInformationStep";
import { FormNavigation } from "./_components/FormNavigation";
import { PersonalInformationStep } from "./_components/PersonalInformationStep";
import { ReviewStep } from "./_components/ReviewStep";
import { StepNavigator } from "./_components/StepNavigator";
import { useAddEmployeeForm } from "./_hooks/useAddEmployeeForm";

const AddEmployeePage = () => {
	const {
		activeStep,
		formData,
		steps,
		errors,
		isSubmitting,
		profilePhotoInputRef,
		handleInputChange,
		handleSelectChange,
		handleNextStep,
		handleBackStep,
		handleRemovePhoto,
		handleSubmit,
		goToStep,
		isStepValid,
		handleValidationChange,
	} = useAddEmployeeForm();

	const renderStepContent = () => {
		switch (activeStep) {
			case 1:
				return (
					<PersonalInformationStep
						formData={formData}
						errors={errors}
						onInputChange={handleInputChange}
						onSelectChange={handleSelectChange}
						onValidationChange={handleValidationChange}
					/>
				);
			case 2:
				return (
					<EmployeeInformationStep
						formData={formData}
						errors={errors}
						onInputChange={handleInputChange}
						onSelectChange={handleSelectChange}
						onRemovePhoto={handleRemovePhoto}
						profilePhotoInputRef={profilePhotoInputRef}
					/>
				);
			case 3:
				return (
					<BankInformationStep
						formData={formData}
						errors={errors}
						onInputChange={handleInputChange}
					/>
				);
			case 4:
				return <ReviewStep formData={formData} />;
			default:
				return null;
		}
	};

	return (
		<div className="max-w-auto mx-auto">
			<AddEmployeeHeader />

			<Card className="mb-6 rounded-lg border border-slate-200 bg-white p-0 shadow-xl dark:border-slate-700 dark:bg-slate-900">
				<div className="border-b border-slate-200 px-4 py-5 sm:px-6 dark:border-slate-700">
					<h1 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
						Add Employee Data
					</h1>
				</div>

				<div className="p-6 sm:p-8">
					<StepNavigator
						steps={steps}
						activeStep={activeStep}
						onStepClick={goToStep}
						isStepValid={isStepValid}
					/>

					<div className="mt-8">{renderStepContent()}</div>

					<FormNavigation
						activeStep={activeStep}
						totalSteps={steps.length}
						isSubmitting={isSubmitting}
						onBack={handleBackStep}
						onNext={handleNextStep}
						onSubmit={handleSubmit}
					/>
				</div>
			</Card>
		</div>
	);
};

export default AddEmployeePage;
