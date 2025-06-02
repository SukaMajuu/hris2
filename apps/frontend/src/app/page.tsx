'use client';

import React, { useEffect } from 'react';
import Header from '../components/landingPage/header';
import Hero from '../components/landingPage/hero';
import Features from '../components/landingPage/features';
import Benefits from '../components/landingPage/benefits';
import Testimonials from '../components/landingPage/testimoni';
import Pricing from '../components/landingPage/pricing';
import Contact from '../components/landingPage/contact';
import Footer from '../components/landingPage/footer';

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
        <Testimonials />
        <Pricing />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
