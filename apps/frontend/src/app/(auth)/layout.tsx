'use client';

import { ReactNode } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function AuthLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = ['/login', '/register', '/login/id-employee'].includes(pathname);

  return (
    <div className={`flex min-h-screen ${isAuthPage ? 'flex-row' : 'flex-row-reverse'}`}>
      {/* Left side - Image */}
      <div className='relative hidden flex-[1] lg:block lg:w-1/2'>
        <Image
          src='/auth-bg.jpg'
          alt='HRIS System'
          fill
          className='object-cover hover:cursor-pointer'
          priority
        />
        <div className='absolute inset-0 flex items-center justify-center bg-black/50'>
          <div className='p-8 text-center text-white'>
            <h2 className='mb-4 text-4xl font-bold'>HRIS System</h2>
            <p className='text-lg'>
              Streamline your HR processes with our comprehensive management system
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className='relative flex w-full items-center justify-center p-8 lg:w-1/3'>
        {children}
      </div>
    </div>
  );
}
