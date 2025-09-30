import React from 'react';
import { CartItem } from '../types';
import Card from './ui/Card';
import Button from './ui/Button';

interface CartProps {
  cart: CartItem[];
  total: number;
  onPlaceOrder: () => void;
}

const Cart: React.FC<CartProps> = ({ cart, total, onPlaceOrder }) => {
  return (
    <Card>
      <div className="space-y-4">
        {cart.length === 0 ? (
          <p className="text-center text-brand-text-light">Tu carrito está vacío.</p>
        ) : (
          cart.map(item => (
            <div key={item.productId} className="flex justify-between items-center text-sm">
              <div>
                <p className="font-bold">{item.quantity}x {item.name}</p>
              </div>
              <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
            </div>
          ))
        )}
        
        <div className="border-t border-gray-200 pt-4 mt-4">
          <div className="flex justify-between items-center font-bold text-lg">
            <span>TOTAL</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>

        <Button 
            onClick={onPlaceOrder} 
            fullWidth 
            disabled={cart.length === 0}
            className="bg-brand-secondary hover:opacity-90 mt-4"
        >
          Realizar Pedido
        </Button>
      </div>
    </Card>
  );
};

export default Cart;