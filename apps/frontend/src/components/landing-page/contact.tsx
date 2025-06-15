import React, { useState } from "react";
import { Button } from "../ui/button";
import { Mail, Phone, MapPin, CheckCircle } from "lucide-react";

const Contact: React.FC = () => {
	const [formState, setFormState] = useState({
		name: "",
		email: "",
		company: "",
		employees: "",
		message: "",
	});

	const [submitted, setSubmitted] = useState(false);

	const handleChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
		>
	) => {
		const { name, value } = e.target;
		setFormState((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		setTimeout(() => {
			setSubmitted(true);
		}, 500);
	};

	return (
		<section id="contact" className="bg-white py-20">
			<div className="container mx-auto px-4">
				<div className="flex flex-col lg:flex-row">
					<div className="mb-10 lg:mb-0 lg:w-1/2 lg:pr-16">
						<h2 className="mb-6 text-3xl font-bold text-gray-900 md:text-4xl">
							Ready to Transform Your HR?
						</h2>
						<p className="mb-8 text-lg text-gray-600">
							Schedule a personalized demo or contact us to learn
							how HRIS can help streamline your HR operations and
							improve employee experience.
						</p>

						<div className="mb-8 space-y-6">
							<div className="flex items-start">
								<div className="mr-4 text-blue-800">
									<Mail size={24} />
								</div>
								<div>
									<h3 className="mb-1 font-semibold text-gray-900">
										Email Us
									</h3>
									<p className="text-gray-600">
										contact@hris.com
									</p>
								</div>
							</div>

							<div className="flex items-start">
								<div className="mr-4 text-blue-800">
									<Phone size={24} />
								</div>
								<div>
									<h3 className="mb-1 font-semibold text-gray-900">
										Call Us
									</h3>
									<p className="text-gray-600">+62812345</p>
								</div>
							</div>

							<div className="flex items-start">
								<div className="mr-4 text-blue-800">
									<MapPin size={24} />
								</div>
								<div>
									<h3 className="mb-1 font-semibold text-gray-900">
										Visit Us
									</h3>
									<p className="text-gray-600">
										42A Rumah Hijau
										<br />
										Malang, Indonesia
									</p>
								</div>
							</div>
						</div>

						<div className="rounded-lg bg-gray-50 p-6">
							<h3 className="mb-3 font-semibold text-gray-900">
								What happens next?
							</h3>
							<ol className="space-y-3">
								<li className="flex items-start">
									<div className="mt-0.5 mr-3 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-800">
										1
									</div>
									<p className="text-gray-600">
										We&apos;ll schedule a call to understand
										your needs
									</p>
								</li>
								<li className="flex items-start">
									<div className="mt-0.5 mr-3 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-800">
										2
									</div>
									<p className="text-gray-600">
										You&apos;ll receive a personalized demo
										of HRIS
									</p>
								</li>
								<li className="flex items-start">
									<div className="mt-0.5 mr-3 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-800">
										3
									</div>
									<p className="text-gray-600">
										We&apos;ll guide you through
										implementation and setup
									</p>
								</li>
							</ol>
						</div>
					</div>

					<div className="rounded-xl bg-white p-8 shadow-lg lg:w-1/2">
						{submitted ? (
							<div className="py-10 text-center">
								<div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
									<CheckCircle
										size={32}
										className="text-green-600"
									/>
								</div>
								<h3 className="mb-2 text-2xl font-bold text-gray-900">
									Thank You!
								</h3>
								<p className="mb-6 text-gray-600">
									Your demo request has been submitted
									successfully. A member of our team will
									contact you shortly.
								</p>
								<Button
									onClick={() => setSubmitted(false)}
									variant="outline"
								>
									Submit Another Request
								</Button>
							</div>
						) : (
							<>
								<h3 className="mb-6 text-2xl font-bold text-gray-900">
									Request a Demo
								</h3>
								<form onSubmit={handleSubmit}>
									<div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
										<div>
											<label
												htmlFor="name"
												className="mb-1 block text-sm font-medium text-gray-700"
											>
												Full Name *
											</label>
											<input
												type="text"
												id="name"
												name="name"
												value={formState.name}
												onChange={handleChange}
												required
												className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
												placeholder="John Smith"
											/>
										</div>
										<div>
											<label
												htmlFor="email"
												className="mb-1 block text-sm font-medium text-gray-700"
											>
												Email Address *
											</label>
											<input
												type="email"
												id="email"
												name="email"
												value={formState.email}
												onChange={handleChange}
												required
												className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
												placeholder="john@company.com"
											/>
										</div>
									</div>

									<div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
										<div>
											<label
												htmlFor="company"
												className="mb-1 block text-sm font-medium text-gray-700"
											>
												Company Name *
											</label>
											<input
												type="text"
												id="company"
												name="company"
												value={formState.company}
												onChange={handleChange}
												required
												className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
												placeholder="Acme Inc."
											/>
										</div>
										<div>
											<label
												htmlFor="employees"
												className="mb-1 block text-sm font-medium text-gray-700"
											>
												Number of Employees *
											</label>
											<select
												id="employees"
												name="employees"
												value={formState.employees}
												onChange={handleChange}
												required
												className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
											>
												<option value="">
													Select...
												</option>
												<option value="1-25">
													1-25
												</option>
												<option value="26-100">
													26-100
												</option>
												<option value="101-500">
													101-500
												</option>
												<option value="501-1000">
													501-1000
												</option>
												<option value="1000+">
													1000+
												</option>
											</select>
										</div>
									</div>

									<div className="mb-6">
										<label
											htmlFor="message"
											className="mb-1 block text-sm font-medium text-gray-700"
										>
											How can we help you?
										</label>
										<textarea
											id="message"
											name="message"
											value={formState.message}
											onChange={handleChange}
											rows={4}
											className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
											placeholder="Tell us about your HR needs and challenges..."
										></textarea>
									</div>

									<div className="mb-6 flex items-center">
										<input
											id="privacy"
											type="checkbox"
											required
											className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
										/>
										<label
											htmlFor="privacy"
											className="ml-2 block text-sm text-gray-600"
										>
											I agree to the{" "}
											<a
												href="#"
												className="text-blue-800 hover:underline"
											>
												privacy policy
											</a>{" "}
											and{" "}
											<a
												href="#"
												className="text-blue-800 hover:underline"
											>
												terms of service
											</a>
											.
										</label>
									</div>

									<Button className="w-full">
										Request Demo
									</Button>
								</form>
							</>
						)}
					</div>
				</div>
			</div>
		</section>
	);
};

export default Contact;
