import React, { useState } from 'react';
import Button from './ui/Button';
import Input from './ui/Input';

interface OrderFormProps {
  onSubmit: (details: { employeeName: string; employeeEmail: string }) => void;
  isLoading: boolean;
  onBack: () => void;
}

interface FormErrors {
  employeeName?: string;
  employeeEmail?: string;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const OrderForm: React.FC<OrderFormProps> = ({ onSubmit, isLoading, onBack }) => {
  const [formData, setFormData] = useState({
    employeeName: '',
    employeeEmail: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const validateField = (name: keyof typeof formData, value: string): string | undefined => {
    switch (name) {
      case 'employeeName':
        return value.trim() ? undefined : 'El nombre es obligatorio.';
      case 'employeeEmail':
        if (!value.trim()) return 'El email es obligatorio.';
        return emailRegex.test(value) ? undefined : 'Por favor, ingresa un email válido.';
      default:
        return undefined;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    if (errors[name as keyof FormErrors]) {
        const error = validateField(name as keyof typeof formData, value);
        setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      const error = validateField(name as keyof typeof formData, value);
      setErrors(prev => ({ ...prev, [name]: error }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors: FormErrors = {};
    (Object.keys(formData) as Array<keyof typeof formData>).forEach(key => {
        const error = validateField(key, formData[key]);
        if (error) {
            validationErrors[key as keyof FormErrors] = error;
        }
    });

    if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
    }

    setErrors({});
    onSubmit(formData);
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold text-center mb-6 text-brand-text font-serif">¿Para quién es el pedido?</h2>
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input
          label="Nombre del Empleado"
          name="employeeName"
          value={formData.employeeName}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.employeeName}
          required
        />
        <Input
          label="Email del Empleado"
          name="employeeEmail"
          type="email"
          value={formData.employeeEmail}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.employeeEmail}
          required
        />
        <Button type="submit" loading={isLoading} fullWidth className="bg-brand-secondary hover:opacity-90">
          {isLoading ? 'Enviando...' : 'Continuar'}
        </Button>
      </form>
      <button onClick={onBack} className="text-sm text-brand-text-light hover:text-brand-text mt-4 text-center w-full disabled:opacity-50" disabled={isLoading}>
            &larr; Volver al carrito
        </button>
    </div>
  );
};

export default OrderForm;