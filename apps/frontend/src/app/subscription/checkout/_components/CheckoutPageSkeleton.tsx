import React from "react";

const CheckoutPageSkeleton: React.FC = () => {
	return (
		<div className="min-h-screen bg-slate-100 dark:bg-slate-950 p-4 md:p-8 animate-pulse">
			<div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8 items-start">
				{/* Left Column: Plan Details */}
				<div className="md:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-lg shadow-lg">
					{/* Plan Title and Description */}
					<div className="mb-6">
						<div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-md w-48 mb-2"></div>
						<div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-md w-72 mb-3"></div>
						<div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-md w-24"></div>
					</div>

					{/* Billing Period Section */}
					<div className="mt-8">
						<div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-md w-32 mb-4"></div>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							{[...Array(2)].map((_, index) => (
								<div
									key={index}
									className="flex flex-col items-center justify-between rounded-md border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-4"
								>
									<div className="h-5 bg-slate-200 dark:bg-slate-700 rounded-md w-16 mb-2"></div>
									<div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-md w-24"></div>
								</div>
							))}
						</div>
					</div>

					{/* Team Size Section */}
					<div className="mt-8">
						<div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-md w-24 mb-2"></div>
						<div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-md w-48 mb-3"></div>
						<div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
							<div className="h-5 bg-slate-200 dark:bg-slate-700 rounded-md w-40"></div>
						</div>
					</div>

					{/* Features Section */}
					<div className="mt-8">
						<div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-md w-36 mb-4"></div>
						<div className="space-y-3">
							{[...Array(4)].map((_, index) => (
								<div
									key={index}
									className="flex items-start space-x-3"
								>
									<div className="w-2 h-2 bg-slate-200 dark:bg-slate-700 rounded-full mt-2 flex-shrink-0"></div>
									<div className="flex-1">
										<div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-md w-full mb-1"></div>
										<div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-md w-3/4"></div>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>

				{/* Right Column: Order Summary */}
				<div className="md:col-span-1 bg-white dark:bg-slate-900 p-6 rounded-lg shadow-lg space-y-4">
					{/* Order Summary Title */}
					<div className="border-b border-slate-200 dark:border-slate-700 pb-3">
						<div className="h-7 bg-slate-200 dark:bg-slate-700 rounded-md w-32"></div>
					</div>

					{/* Order Details */}
					<div className="space-y-4">
						{[...Array(4)].map((_, index) => (
							<div key={index} className="flex justify-between">
								<div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-md w-20"></div>
								<div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-md w-24"></div>
							</div>
						))}
					</div>

					{/* Divider */}
					<hr className="border-slate-200 dark:border-slate-700" />

					{/* Price Breakdown */}
					<div className="space-y-4">
						{[...Array(2)].map((_, index) => (
							<div key={index} className="flex justify-between">
								<div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-md w-16"></div>
								<div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-md w-20"></div>
							</div>
						))}
					</div>

					{/* Divider */}
					<hr className="border-slate-200 dark:border-slate-700" />

					{/* Total */}
					<div className="flex justify-between">
						<div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-md w-12"></div>
						<div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-md w-24"></div>
					</div>

					{/* Continue Button */}
					<div className="mt-6">
						<div className="w-full h-12 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default CheckoutPageSkeleton;
