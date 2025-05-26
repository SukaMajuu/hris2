import React from 'react';
import { CheckCircle2 } from 'lucide-react';

const Benefits: React.FC = () => {
  return (
    <section id="benefits" className="py-20 bg-gradient-to-br from-blue-50 to-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <img 
              src="https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
              alt="HR professionals in meeting" 
              className="rounded-xl shadow-lg"
            />
          </div>
          <div className="md:w-1/2 md:pl-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Transform Your HR Operations
            </h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Our HRIS platform helps organizations of all sizes streamline HR processes, 
              reduce administrative burden, and focus on strategic initiatives.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <CheckCircle2 className="text-teal-600 mr-3 mt-1 flex-shrink-0" size={20} />
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">Increased Efficiency</h3>
                  <p className="text-gray-600">Automate routine tasks and reduce manual paperwork by up to 80%</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <CheckCircle2 className="text-teal-600 mr-3 mt-1 flex-shrink-0" size={20} />
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">Data-Driven Decisions</h3>
                  <p className="text-gray-600">Access real-time analytics and actionable insights on your workforce</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <CheckCircle2 className="text-teal-600 mr-3 mt-1 flex-shrink-0" size={20} />
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">Enhanced Employee Experience</h3>
                  <p className="text-gray-600">Empower employees with self-service tools and mobile access</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <CheckCircle2 className="text-teal-600 mr-3 mt-1 flex-shrink-0" size={20} />
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">Compliance & Security</h3>
                  <p className="text-gray-600">Ensure regulatory compliance with automated updates and secure data handling</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <CheckCircle2 className="text-teal-600 mr-3 mt-1 flex-shrink-0" size={20} />
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">Cost Savings</h3>
                  <p className="text-gray-600">Reduce operational costs by up to 30% with streamlined HR processes</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Benefits;