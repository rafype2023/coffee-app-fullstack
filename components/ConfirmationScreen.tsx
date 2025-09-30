import React from 'react';
import Button from './ui/Button';
import { CheckCircleIcon } from './icons/CheckCircleIcon';

interface ConfirmationScreenProps {
  onNewOrder: () => void;
}

const ConfirmationScreen: React.FC<ConfirmationScreenProps> = ({ onNewOrder }) => {
  return (
    <div className="p-4 text-center">
        <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2 text-brand-text font-serif">¡Pedido Confirmado!</h2>
        <p className="text-brand-text-light mb-6">Gracias. Tu café estará listo para ti en breve.</p>
        
        <Button onClick={onNewOrder} className="mt-4 bg-brand-secondary hover:opacity-90" fullWidth>
          Hacer un Nuevo Pedido
        </Button>
    </div>
  );
};

export default ConfirmationScreen;