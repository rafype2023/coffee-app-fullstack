import React from 'react';
import Spinner from './Spinner';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  fullWidth?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary';
}

const Button: React.FC<ButtonProps> = ({ children, className, fullWidth, loading, variant = 'primary', ...props }) => {
  const widthClass = fullWidth ? 'w-full' : '';
  const variantClasses = {
      primary: 'bg-brand-primary text-white hover:bg-opacity-90',
      secondary: 'bg-brand-secondary text-white hover:bg-opacity-90'
  };

  return (
    <button
      className={`flex items-center justify-center font-bold py-3 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed ${widthClass} ${variantClasses[variant]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <Spinner />}
      <span className={loading ? 'ml-2' : ''}>{children}</span>
    </button>
  );
};

export default Button;