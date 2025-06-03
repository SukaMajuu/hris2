'use client';

import React, { useEffect } from 'react';
import Header from './_component/header';
import Hero from './_component/hero';
import Features from './_component/features';
import Benefits from './_component/benefits';
// import Testimonials from './_component/testimoni';
import Pricing from './_component/pricing';
import Contact from './_component/contact';
import Footer from './_component/footer';

const LandingPage: React.FC = () => {
  useEffect(() => {
    document.title = 'HRIS';
    const handler = (e: Event) => {
      e.preventDefault();
      const anchor = e.currentTarget as HTMLAnchorElement;
      const target = document.querySelector(anchor.getAttribute('href') || '');
      if (target) {
        window.scrollTo({
          top: target.getBoundingClientRect().top + window.scrollY - 80,
          behavior: 'smooth',
        });
      }
    };
    const anchors = document.querySelectorAll('a[href^="#"]');
    anchors.forEach((anchor) => anchor.addEventListener('click', handler));
    return () => {
      anchors.forEach((anchor) => anchor.removeEventListener('click', handler));
    };
  }, []);

  return (
    <div className='min-h-screen bg-white font-sans'>
      <Header />
      <main>
        <Hero />
        <Features />
        <Benefits />
        {/* <Testimonials /> */}
        <Pricing />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
