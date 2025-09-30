import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className }) => {
  return (
    <div className={`bg-brand-surface p-6 rounded-xl shadow-sm border border-gray-100 ${className}`}>
      {children}
    </div>
  );
};

export default Card;