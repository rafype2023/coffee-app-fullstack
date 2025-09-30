import React from 'react';

const Spinner: React.FC = () => {
  return (
    <div className="border-gray-200 h-5 w-5 animate-spin rounded-full border-2 border-t-white" />
  );
};

export default Spinner;