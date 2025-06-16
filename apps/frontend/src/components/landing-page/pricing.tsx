import { Check } from "lucide-react";
import React, { useState } from "react";

import { Button } from "../ui/button";

interface PricingTier {
	name: string;
	price: string;
	description: string;
	features: string[];
	ctaText: string;
	highlighted?: boolean;
}

const Pricing: React.FC = () => {
	const [isAnnual, setIsAnnual] = useState(true);

	const pricingTiers: PricingTier[] = [
		{
			name: "Starter",
			price: isAnnual ? "Rp12.000" : "Rp15.000",
			description: "Perfect for small businesses and startups",
			features: [
				"Up to 25 employees",
				"Employee directory",
				"Time & attendance",
				"Basic reporting",
				"Mobile access",
				"Email support",
			],
			ctaText: "Start Free Trial",
		},
		{
			name: "Professional",
			price: isAnnual ? "Rp29.000" : "Rp35.000",
			description: "Ideal for growing companies",
			features: [
				"Up to 100 employees",
				"All Starter features",
				"Performance management",
				"Leave management",
				"Recruitment tools",
				"Advanced reporting",
				"Priority support",
			],
			ctaText: "Start Free Trial",
			highlighted: true,
		},
		{
			name: "Enterprise",
			price: isAnnual ? "Rp49.000" : "Rp59.000",
			description: "For large organizations with complex needs",
			features: [
				"Unlimited employees",
				"All Professional features",
				"Custom workflows",
				"API access",
				"SSO integration",
				"Advanced analytics",
				"Dedicated account manager",
				"Custom training",
			],
			ctaText: "Contact Sales",
		},
	];

	return (
		<section id="pricing" className="bg-gray-50 py-20">
			<div className="container mx-auto px-4">
				<div className="mb-16 text-center">
					<h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
						Simple, Transparent Pricing
					</h2>
					<p className="mx-auto mb-8 max-w-3xl text-xl text-gray-600">
						Choose the plan that fits your business needs
					</p>

					<div className="mb-8 flex items-center justify-center">
						<span
							className={`mr-3 ${
								isAnnual
									? "font-medium text-blue-800"
									: "text-gray-500"
							}`}
						>
							Annual
						</span>
						<button
							type="button"
							onClick={() => setIsAnnual(!isAnnual)}
							onKeyDown={(e) => {
								if (e.key === "Enter" || e.key === " ") {
									e.preventDefault();
									setIsAnnual(!isAnnual);
								}
							}}
							className="relative h-7 w-14 cursor-pointer rounded-full bg-gray-200 transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
							aria-label={`Switch to ${
								isAnnual ? "monthly" : "annual"
							} billing`}
						>
							<div
								className={`absolute top-1 h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ease-in-out ${
									isAnnual ? "left-1" : "left-8"
								}`}
							/>
						</button>
						<span
							className={`ml-3 ${
								!isAnnual
									? "font-medium text-blue-800"
									: "text-gray-500"
							}`}
						>
							Monthly
						</span>
						{isAnnual && (
							<span className="ml-4 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
								Save 20%
							</span>
						)}
					</div>
				</div>

				<div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-3">
					{pricingTiers.map((tier) => (
						<div
							key={tier.name}
							className={`overflow-hidden rounded-xl transition-all duration-300 hover:shadow-xl ${
								tier.highlighted
									? "relative transform border-2 border-blue-600 shadow-lg hover:-translate-y-1"
									: "border border-gray-200 shadow"
							}`}
						>
							{tier.highlighted && (
								<div className="absolute top-0 right-0 rounded-bl-lg bg-blue-600 px-3 py-1 text-xs font-bold text-white">
									POPULAR
								</div>
							)}
							<div className="bg-white p-8">
								<h3 className="mb-2 text-xl font-bold text-gray-900">
									{tier.name}
								</h3>
								<p className="mb-4 text-gray-600">
									{tier.description}
								</p>
								<div className="mb-4 flex items-baseline">
									<span className="text-4xl font-bold text-gray-900">
										{tier.price}
									</span>
									<span className="ml-2 text-gray-600">
										/ user / month
									</span>
								</div>
								<Button className="w-full">
									{tier.ctaText}
								</Button>
							</div>
							<div className="bg-gray-50 p-8">
								<p className="mb-4 font-medium text-gray-900">
									Features include:
								</p>
								<ul className="space-y-3">
									{tier.features.map((feature) => (
										<li
											key={feature}
											className="flex items-start"
										>
											<Check
												size={18}
												className="mt-0.5 mr-2 flex-shrink-0 text-green-500"
											/>
											<span className="text-gray-600">
												{feature}
											</span>
										</li>
									))}
								</ul>
							</div>
						</div>
					))}
				</div>

				<div className="mt-12 text-center">
					<p className="mb-4 text-gray-600">
						All plans include a 14-day free trial. No credit card
						required.
					</p>
					<p className="text-sm text-gray-500">
						Need a custom plan?{" "}
						<a
							href="#contact"
							className="text-blue-800 hover:underline"
						>
							Contact us
						</a>{" "}
						for custom pricing.
					</p>
				</div>
			</div>
		</section>
	);
};

export default Pricing;
