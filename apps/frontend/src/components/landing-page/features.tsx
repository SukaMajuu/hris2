import {
	Users,
	ClipboardCheck,
	BarChart3,
	Calendar,
	Clock,
	UserCheck,
	CreditCard,
	Briefcase,
} from "lucide-react";
import React from "react";

import Card from "./card";

interface FeatureCardProps {
	icon: React.ReactNode;
	title: string;
	description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
	icon,
	title,
	description,
}) => (
	<Card className="p-6 hover:translate-y-[-5px]">
		<div className="rounded-full bg-blue-100 w-12 h-12 flex items-center justify-center text-blue-800 mb-4">
			{icon}
		</div>
		<h3 className="text-xl font-semibold mb-2 text-gray-900">{title}</h3>
		<p className="text-gray-600">{description}</p>
	</Card>
);

const Features: React.FC = () => {
	const features = [
		{
			icon: <Users size={24} />,
			title: "Employee Management",
			description:
				"Centralize employee data and records with secure, cloud-based storage and easy access controls.",
		},
		{
			icon: <Clock size={24} />,
			title: "Time & Attendance",
			description:
				"Track work hours, shifts, and absences with automated time tracking and approval workflows.",
		},
		{
			icon: <UserCheck size={24} />,
			title: "Performance Management",
			description:
				"Set goals, conduct reviews, and track employee performance with customizable templates.",
		},
		{
			icon: <CreditCard size={24} />,
			title: "Payroll Integration",
			description:
				"Seamlessly integrate with your payroll system to ensure accurate and timely payments.",
		},
		{
			icon: <Briefcase size={24} />,
			title: "Recruitment & Onboarding",
			description:
				"Streamline hiring with applicant tracking and automated onboarding processes.",
		},
		{
			icon: <Calendar size={24} />,
			title: "Leave Management",
			description:
				"Manage time-off requests, track balances, and ensure policy compliance effortlessly.",
		},
		{
			icon: <BarChart3 size={24} />,
			title: "Analytics & Reporting",
			description:
				"Gain insights with customizable reports and dashboards for data-driven decisions.",
		},
		{
			icon: <ClipboardCheck size={24} />,
			title: "Compliance Management",
			description:
				"Stay compliant with automated document management and policy acknowledgments.",
		},
	];

	return (
		<section id="features" className="py-20 bg-white">
			<div className="container mx-auto px-4">
				<div className="text-center mb-16">
					<h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
						Comprehensive HR Solution
					</h2>
					<p className="text-xl text-gray-600 max-w-3xl mx-auto">
						Everything you need to manage your workforce efficiently
						in one integrated platform
					</p>
				</div>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
					{features.map((feature) => (
						<FeatureCard
							key={feature.title}
							icon={feature.icon}
							title={feature.title}
							description={feature.description}
						/>
					))}
				</div>
			</div>
		</section>
	);
};

export default Features;
