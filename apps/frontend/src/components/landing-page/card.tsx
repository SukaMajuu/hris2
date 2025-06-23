import React from 'react';

type CardProps = {
  children: React.ReactNode;
  className?: string;
};

const Card: React.FC<CardProps> = ({ children, className = '' }) => (
    <div className={`bg-white rounded-lg shadow-md transition-all duration-300 hover:shadow-lg ${className}`}>
      {children}
    </div>
  );

export default Card;