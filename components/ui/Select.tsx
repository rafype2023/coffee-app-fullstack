import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  children: React.ReactNode;
}

const Select: React.FC<SelectProps> = ({ label, name, children, ...props }) => {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-brand-text-light mb-1">
        {label}
      </label>
      <select
        id={name}
        name={name}
        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-brand-primary focus:border-brand-primary bg-white transition-shadow duration-200 shadow-sm focus:shadow-md"
        {...props}
      >
        {children}
      </select>
    </div>
  );
};

export default Select;