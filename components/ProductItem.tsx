import React from 'react';
import { Product } from '../types';
import Card from './ui/Card';
import { PlusIcon } from './icons/PlusIcon';
import { MinusIcon } from './icons/MinusIcon';

interface ProductItemProps {
  product: Product;
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
}

const ProductItem: React.FC<ProductItemProps> = ({ product, quantity, onAdd, onRemove }) => {
  return (
    <Card className="flex items-center justify-between">
      <div>
        <h3 className="text-lg font-bold text-brand-text">{product.name}</h3>
        <p className="text-sm text-brand-text-light">{product.description}</p>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={onRemove} disabled={quantity === 0} className="p-1 rounded-full bg-brand-surface-alt hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            <MinusIcon className="w-5 h-5 text-brand-primary"/>
        </button>
        <span className="text-lg font-bold w-6 text-center">{quantity}</span>
        <button onClick={onAdd} className="p-1 rounded-full bg-brand-primary hover:opacity-90 transition-opacity">
            <PlusIcon className="w-5 h-5 text-white"/>
        </button>
      </div>
    </Card>
  );
};

export default ProductItem;