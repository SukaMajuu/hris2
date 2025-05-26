import React, { useState } from 'react';
import Button from './button';
import { Check } from 'lucide-react';

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
      price: isAnnual ? "$12" : "$15",
      description: "Perfect for small businesses and startups",
      features: [
        "Up to 25 employees",
        "Employee directory",
        "Time & attendance",
        "Basic reporting",
        "Mobile access",
        "Email support"
      ],
      ctaText: "Start Free Trial"
    },
    {
      name: "Professional",
      price: isAnnual ? "$29" : "$35",
      description: "Ideal for growing companies",
      features: [
        "Up to 100 employees",
        "All Starter features",
        "Performance management",
        "Leave management",
        "Recruitment tools",
        "Advanced reporting",
        "Priority support"
      ],
      ctaText: "Start Free Trial",
      highlighted: true
    },
    {
      name: "Enterprise",
      price: isAnnual ? "$49" : "$59",
      description: "For large organizations with complex needs",
      features: [
        "Unlimited employees",
        "All Professional features",
        "Custom workflows",
        "API access",
        "SSO integration",
        "Advanced analytics",
        "Dedicated account manager",
        "Custom training"
      ],
      ctaText: "Contact Sales"
    }
  ];

  return (
    <section id="pricing" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Choose the plan that fits your business needs
          </p>
          
          <div className="flex items-center justify-center mb-8">
            <span className={`mr-3 ${isAnnual ? 'text-blue-800 font-medium' : 'text-gray-500'}`}>Annual</span>
            <div 
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative w-14 h-7 bg-gray-200 rounded-full cursor-pointer transition-colors duration-300 ease-in-out"
            >
              <div 
                className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-300 ease-in-out ${
                  isAnnual ? 'left-1' : 'left-8'
                }`}
              ></div>
            </div>
            <span className={`ml-3 ${!isAnnual ? 'text-blue-800 font-medium' : 'text-gray-500'}`}>Monthly</span>
            {isAnnual && (
              <span className="ml-4 bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                Save 20%
              </span>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingTiers.map((tier, index) => (
            <div 
              key={index}
              className={`rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl ${
                tier.highlighted 
                  ? 'shadow-lg border-2 border-blue-600 relative transform hover:-translate-y-1' 
                  : 'shadow border border-gray-200'
              }`}
            >
              {tier.highlighted && (
                <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                  POPULAR
                </div>
              )}
              <div className="bg-white p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{tier.name}</h3>
                <p className="text-gray-600 mb-4">{tier.description}</p>
                <div className="flex items-baseline mb-4">
                  <span className="text-4xl font-bold text-gray-900">{tier.price}</span>
                  <span className="text-gray-600 ml-2">/ user / month</span>
                </div>
                <Button 
                  variant={tier.highlighted ? 'primary' : 'outline'}
                  className="w-full"
                >
                  {tier.ctaText}
                </Button>
              </div>
              <div className="bg-gray-50 p-8">
                <p className="font-medium text-gray-900 mb-4">Features include:</p>
                <ul className="space-y-3">
                  {tier.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <Check size={18} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            All plans include a 14-day free trial. No credit card required.
          </p>
          <p className="text-gray-500 text-sm">
            Need a custom plan? <a href="#contact" className="text-blue-800 hover:underline">Contact us</a> for custom pricing.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;