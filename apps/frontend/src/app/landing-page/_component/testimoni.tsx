import React, { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

interface Testimonial {
  id: number;
  name: string;
  position: string;
  company: string;
  quote: string;
  image: string;
}

const Testimonials: React.FC = () => {
  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: 'Olivia Hartono',
      position: 'HR Director',
      company: 'Techorama Inc.',
      quote:
        "HRIS has transformed our entire HR department. We've reduced administrative time by 70% and our employees love the self-service features. The analytics have given us insights we never had before.",
      image:
        'https://images.pexels.com/photos/3796217/pexels-photo-3796217.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    },
    {
      id: 2,
      name: 'Rendy Putra Kusuma',
      position: 'COO',
      company: 'Global Logistics',
      quote:
        "Implementing HRIS was one of the best business decisions we made last year. The ROI has been incredible - we've saved on HR costs while improving employee satisfaction and retention.",
      image:
        'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    },
    {
      id: 3,
      name: 'Putri Wulandari',
      position: 'People Operations Manager',
      company: 'Innovate Solutions',
      quote:
        'As a growing startup, we needed an HRIS that could scale with us. HRIS has been the perfect solution - easy to use, comprehensive, and their support team is always available when we need them.',
      image:
        'https://images.pexels.com/photos/1587009/pexels-photo-1587009.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section id='testimonials' className='bg-white py-20'>
      <div className='container mx-auto px-4'>
        <div className='mb-16 text-center'>
          <h2 className='mb-4 text-3xl font-bold text-gray-900 md:text-4xl'>
            Trusted by HR Leaders
          </h2>
          <p className='mx-auto max-w-3xl text-xl text-gray-600'>
            See what our customers say about how HRIS has transformed their HR operations
          </p>
        </div>

        <div className='relative mx-auto max-w-4xl'>
          <div className='flex flex-col overflow-hidden rounded-xl bg-white shadow-lg md:flex-row'>
            <div className='flex flex-col items-center justify-center p-8 md:w-1/3'>
              <Image
                src={testimonials[currentIndex]?.image ?? ''}
                alt={testimonials[currentIndex]?.name ?? 'Testimonial'}
                width={96}
                height={96}
                className='mb-4 h-24 w-24 rounded-full border-4 border-white object-cover'
                unoptimized
              />
              <h3 className='text-xl font-bold'>{testimonials[currentIndex]?.name}</h3>
              <p className='text-blue-100'>{testimonials[currentIndex]?.position}</p>
              <p className='font-medium'>{testimonials[currentIndex]?.company}</p>
              <div className='mt-3 flex items-center'>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} className='fill-current text-yellow-400' />
                ))}
              </div>
            </div>
            <div className='flex flex-col justify-center p-8 md:w-2/3 md:p-10'>
              <svg
                className='mb-4 h-12 w-12 text-blue-200'
                fill='currentColor'
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 512 512'
              >
                <path d='M464 256h-80v-64c0-35.3 28.7-64 64-64h8c13.3 0 24-10.7 24-24V56c0-13.3-10.7-24-24-24h-8c-88.4 0-160 71.6-160 160v240c0 26.5 21.5 48 48 48h128c26.5 0 48-21.5 48-48V304c0-26.5-21.5-48-48-48zm-288 0H96v-64c0-35.3 28.7-64 64-64h8c13.3 0 24-10.7 24-24V56c0-13.3-10.7-24-24-24h-8C71.6 32 0 103.6 0 192v240c0 26.5 21.5 48 48 48h128c26.5 0 48-21.5 48-48V304c0-26.5-21.5-48-48-48z'></path>
              </svg>
              <p className='mb-6 text-lg leading-relaxed text-gray-600 italic'>
                {testimonials[currentIndex]?.quote}
              </p>
            </div>
          </div>

          {/* Navigation buttons */}
          <button
            onClick={prevTestimonial}
            className='absolute top-1/2 left-0 -translate-x-5 -translate-y-1/2 transform rounded-full bg-white p-2 text-gray-700 shadow-md hover:text-blue-800 focus:outline-none'
            aria-label='Previous testimonial'
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={nextTestimonial}
            className='absolute top-1/2 right-0 translate-x-5 -translate-y-1/2 transform rounded-full bg-white p-2 text-gray-700 shadow-md hover:text-blue-800 focus:outline-none'
            aria-label='Next testimonial'
          >
            <ChevronRight size={24} />
          </button>

          {/* Dots */}
          <div className='mt-8 flex justify-center space-x-2'>
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-3 w-3 rounded-full focus:outline-none ${
                  currentIndex === index ? 'bg-blue-800' : 'bg-gray-300'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
