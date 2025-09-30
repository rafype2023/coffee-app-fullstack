import React, { useState } from 'react';
import Button from './ui/Button';
import Input from './ui/Input';

interface VerificationFormProps {
  onSubmit: (code: string) => void;
  isLoading: boolean;
  email: string;
  onBack: () => void;
}

const VerificationForm: React.FC<VerificationFormProps> = ({ onSubmit, isLoading, email, onBack }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || code.length < 6) {
        setError('El código debe tener 6 dígitos.');
        return;
    };
    setError('');
    onSubmit(code);
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold text-center mb-2 text-brand-text font-serif">Verifica tu Pedido</h2>
      <p className="text-center text-brand-text-light mb-6">
        Hemos enviado un código de verificación a <br/><strong>{email}</strong>
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Código de Verificación"
          name="code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
          placeholder="Ingresa el código"
          maxLength={6}
          className="text-center tracking-[0.5em]"
          error={error}
        />
        <Button type="submit" loading={isLoading} fullWidth className="bg-brand-secondary hover:opacity-90">
          {isLoading ? 'Verificando...' : 'Confirmar Pedido'}
        </Button>
      </form>
       <button onClick={onBack} className="text-sm text-brand-text-light hover:text-brand-text mt-4 text-center w-full disabled:opacity-50" disabled={isLoading}>
            &larr; Volver
        </button>
    </div>
  );
};

export default VerificationForm;