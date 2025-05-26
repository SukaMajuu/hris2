import React from 'react';
import Button from './button';
import { ArrowRight } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section className="pt-32 pb-20 md:pt-40 md:pb-28 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0 md:pr-10">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-4">
              Simplify HR Management with <span className="text-blue-800">HRIS</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Streamline your HR operations with our comprehensive HRIS platform. 
              From recruitment to retirement, manage your entire employee lifecycle in one place.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Button size="lg" className="sm:w-auto w-full">
                Get Started
                <ArrowRight size={20} className="ml-2" />
              </Button>
              <Button variant="outline" size="lg" className="sm:w-auto w-full">
                Schedule Demo
              </Button>
            </div>
            <div className="mt-8 flex items-center text-sm text-gray-500">
              <span className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                No credit card required
              </span>
              <span className="flex items-center ml-6">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                14-day free trial
              </span>
            </div>
          </div>
          <div className="md:w-1/2">
            <div className="relative">
              <div className="absolute -top-6 -left-6 w-32 h-32 bg-blue-100 rounded-full opacity-70"></div>
              <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-teal-100 rounded-full opacity-70"></div>
              <img 
                src="https://images.pexels.com/photos/3184398/pexels-photo-3184398.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                alt="HR team collaborating" 
                className="relative z-10 rounded-xl shadow-xl w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;