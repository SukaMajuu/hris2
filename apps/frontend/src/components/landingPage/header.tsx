import React, { useState, useEffect } from 'react';
import { Menu, X, Users } from 'lucide-react';
import { Button } from '../ui/button';

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
    <header
      className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white py-3 shadow-md' : 'bg-transparent py-5'
      }`}
    >
      <div className='container mx-auto flex items-center justify-between px-4'>
        <div className='flex items-center'>
          <div className='mr-2 text-blue-800'>
            <Users size={28} />
          </div>
          <span className='text-xl font-bold text-gray-900'>HRIS</span>
        </div>

        {/* Desktop Navigation */}
        <nav className='hidden items-center space-x-8 md:flex'>
          <a href='#features' className='font-medium text-gray-700 hover:text-blue-800'>
            Features
          </a>
          <a href='#benefits' className='font-medium text-gray-700 hover:text-blue-800'>
            Benefits
          </a>
          <a href='#testimonials' className='font-medium text-gray-700 hover:text-blue-800'>
            Testimonials
          </a>
          <a href='#pricing' className='font-medium text-gray-700 hover:text-blue-800'>
            Pricing
          </a>
          <a href='/login'>
            <Button variant='outline' size='sm'>
              Log In
            </Button>
          </a>
           <a href="#contact">
                <Button size='sm' className='flex-1'>
                  Request Demo
                </Button>
              </a>     
        </nav>

        {/* Mobile Menu Button */}
        <button className='text-gray-700 md:hidden' onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className='bg-white shadow-lg md:hidden'>
          <div className='container mx-auto flex flex-col space-y-4 px-4 py-4'>
            <a
              href='#features'
              className='py-2 font-medium text-gray-700 hover:text-blue-800'
              onClick={() => setIsMenuOpen(false)}
            >
              Features
            </a>
            <a
              href='#benefits'
              className='py-2 font-medium text-gray-700 hover:text-blue-800'
              onClick={() => setIsMenuOpen(false)}
            >
              Benefits
            </a>
            <a
              href='#testimonials'
              className='py-2 font-medium text-gray-700 hover:text-blue-800'
              onClick={() => setIsMenuOpen(false)}
            >
              Testimonials
            </a>
            <a
              href='#pricing'
              className='py-2 font-medium text-gray-700 hover:text-blue-800'
              onClick={() => setIsMenuOpen(false)}
            >
              Pricing
            </a>
            <div className='flex space-x-4 pt-2'>
              <a href='/login'>
                <Button variant='outline' size='sm'>
                  Log In
                </Button>
              </a>
              <a href="#contact">
                <Button size='sm' className='flex-1'>
                  Request Demo
                </Button>
              </a>              
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
