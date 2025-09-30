import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4"
        aria-modal="true"
        role="dialog"
    >
      <div 
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md z-50 animate-fade-in-up">
        {children}
         <button 
            onClick={onClose} 
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 p-2 rounded-full"
            aria-label="Cerrar modal"
        >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
      </div>
    </div>
  );
};

export default Modal;