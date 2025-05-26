import React, { useState, useEffect } from 'react';
import { Menu, X, Users } from 'lucide-react';
import Button from './button';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white shadow-md py-3' : 'bg-transparent py-5'
    }`}>
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center">
          <div className="text-blue-800 mr-2">
            <Users size={28} />
          </div>
          <span className="font-bold text-xl text-gray-900">HRIS</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#features" className="text-gray-700 hover:text-blue-800 font-medium">Features</a>
          <a href="#benefits" className="text-gray-700 hover:text-blue-800 font-medium">Benefits</a>
          <a href="#testimonials" className="text-gray-700 hover:text-blue-800 font-medium">Testimonials</a>
          <a href="#pricing" className="text-gray-700 hover:text-blue-800 font-medium">Pricing</a>
          <Button variant="outline" size="sm">Log In</Button>
          <Button size="sm">Request Demo</Button>
        </nav>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-gray-700"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-lg">
          <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
            <a 
              href="#features" 
              className="text-gray-700 hover:text-blue-800 font-medium py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Features
            </a>
            <a 
              href="#benefits" 
              className="text-gray-700 hover:text-blue-800 font-medium py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Benefits
            </a>
            <a 
              href="#testimonials" 
              className="text-gray-700 hover:text-blue-800 font-medium py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Testimonials
            </a>
            <a 
              href="#pricing" 
              className="text-gray-700 hover:text-blue-800 font-medium py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Pricing
            </a>
            <div className="flex space-x-4 pt-2">
              <Button variant="outline" size="sm" className="flex-1">Log In</Button>
              <Button size="sm" className="flex-1">Request Demo</Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;