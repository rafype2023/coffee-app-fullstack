import React from 'react';
import { Product, CartItem } from '../types';
import ProductItem from './ProductItem';

interface ProductListProps {
  products: Product[];
  onAddToCart: (productId: string) => void;
  onRemoveFromCart: (productId: string) => void;
  cart: CartItem[];
}

const ProductList: React.FC<ProductListProps> = ({ products, onAddToCart, onRemoveFromCart, cart }) => {
  return (
    <div className="space-y-4">
      {products.map(product => {
        const cartItem = cart.find(item => item.productId === product.id);
        const quantity = cartItem ? cartItem.quantity : 0;
        return (
          <ProductItem 
            key={product.id}
            product={product}
            quantity={quantity}
            onAdd={() => onAddToCart(product.id)}
            onRemove={() => onRemoveFromCart(product.id)}
          />
        );
      })}
    </div>
  );
};

export default ProductList;