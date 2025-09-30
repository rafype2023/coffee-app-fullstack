import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { OrderStage, type CartItem, type OrderDetails, type ConfirmedOrder } from './types';
import { createOrder, verifyOrder, getConfirmedOrders } from './services/apiService';
import { PRODUCTS } from './constants';

import ProductList from './components/ProductList';
import Cart from './components/Cart';
import OrderForm from './components/OrderForm';
import VerificationForm from './components/VerificationForm';
import ConfirmationScreen from './components/ConfirmationScreen';
import BaristaPanel from './components/BaristaPanel';
import { CheckIcon } from './components/icons/CheckIcon';
import Modal from './components/ui/Modal';

const App: React.FC = () => {
  const [stage, setStage] = useState<OrderStage>(OrderStage.SHOPPING);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currentOrder, setCurrentOrder] = useState<OrderDetails | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isBaristaPanelVisible, setBaristaPanelVisible] = useState(false);
  const [confirmedOrders, setConfirmedOrders] = useState<ConfirmedOrder[]>([]);

  const fetchOrders = useCallback(async () => {
    try {
      const orders = await getConfirmedOrders();
      setConfirmedOrders(orders);
    } catch (err) {
      console.error("Failed to fetch confirmed orders:", err);
      // Optionally set an error state for the barista panel
    }
  }, []);

  useEffect(() => {
    if (isBaristaPanelVisible) {
      fetchOrders();
      const interval = setInterval(fetchOrders, 15000); // Refresh every 15 seconds
      return () => clearInterval(interval);
    }
  }, [isBaristaPanelVisible, fetchOrders]);
  
  const handleAddToCart = useCallback((productId: string) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.productId === productId);
      if (existingItem) {
        return prevCart.map(item =>
          item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        const product = PRODUCTS.find(p => p.id === productId);
        if (product) {
          return [...prevCart, { productId, name: product.name, price: product.price, quantity: 1 }];
        }
      }
      return prevCart;
    });
  }, []);

  const handleRemoveFromCart = useCallback((productId: string) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.productId === productId);
      if (existingItem && existingItem.quantity > 1) {
        return prevCart.map(item =>
          item.productId === productId ? { ...item, quantity: item.quantity - 1 } : item
        );
      } else {
        return prevCart.filter(item => item.productId !== productId);
      }
    });
  }, []);

  const cartTotal = useMemo(() => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [cart]);

  const handlePlaceOrderClick = () => {
    if (cart.length === 0) {
      setError("Tu carrito está vacío.");
      return;
    }
    setStage(OrderStage.FORM);
  };
  
  const handleOrderSubmit = useCallback(async (details: { employeeName: string; employeeEmail: string }) => {
    const orderDetails: OrderDetails = {
      ...details,
      items: cart,
      total: cartTotal,
    };
    setIsLoading(true);
    setError(null);
    try {
      const response = await createOrder(orderDetails);
      if (response.success) {
        setCurrentOrder(orderDetails);
        setOrderId(response.orderId);
        setStage(OrderStage.VERIFICATION);
      } else {
        setError(response.message || 'Ocurrió un error al crear el pedido.');
        setStage(OrderStage.SHOPPING); // Go back to shopping on failure
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de conexión. Inténtalo de nuevo.');
      setStage(OrderStage.SHOPPING);
    } finally {
      setIsLoading(false);
    }
  }, [cart, cartTotal]);

  const handleVerificationSubmit = useCallback(async (code: string) => {
    if (!orderId) {
      setError("No se encontró el ID del pedido.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await verifyOrder(orderId, code);
      if (response.success) {
        setStage(OrderStage.CONFIRMED);
        fetchOrders(); // Refresh barista panel after confirmation
      } else {
        setError(response.message || 'El código de verificación es incorrecto.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de conexión. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  }, [orderId, fetchOrders]);

  const resetOrderFlow = useCallback(() => {
    setStage(OrderStage.SHOPPING);
    setCart([]);
    setCurrentOrder(null);
    setOrderId(null);
    setError(null);
    setIsLoading(false);
  }, []);

  const renderCheckoutModalContent = () => {
    switch (stage) {
      case OrderStage.FORM:
        return <OrderForm onSubmit={handleOrderSubmit} isLoading={isLoading} onBack={() => setStage(OrderStage.SHOPPING)} />;
      case OrderStage.VERIFICATION:
        return (
          <VerificationForm
            onSubmit={handleVerificationSubmit}
            isLoading={isLoading}
            email={currentOrder?.employeeEmail || ''}
            onBack={() => setStage(OrderStage.FORM)}
          />
        );
      case OrderStage.CONFIRMED:
        return (
          <ConfirmationScreen
            onNewOrder={resetOrderFlow}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen container mx-auto p-4 lg:p-8">
       <header className="bg-brand-surface-alt p-4 rounded-xl shadow-sm mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-serif font-bold text-brand-text">Hola, Rafy!</h1>
          <button 
            onClick={() => setBaristaPanelVisible(prev => !prev)}
            className="flex items-center gap-2 bg-white border border-gray-200 text-brand-text font-bold py-2 px-4 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transition-colors"
          >
            <CheckIcon className="w-6 h-6 text-brand-primary" />
            Ver Panel Barista
          </button>
        </header>
      
        <main className="grid grid-cols-1 lg:grid-cols-3 lg:gap-8">
            <div className="lg:col-span-2">
                <ProductList 
                    products={PRODUCTS} 
                    onAddToCart={handleAddToCart}
                    onRemoveFromCart={handleRemoveFromCart}
                    cart={cart}
                />
            </div>
            <div className="mt-8 lg:mt-0">
                <div className="sticky top-8">
                    <Cart 
                        cart={cart}
                        total={cartTotal}
                        onPlaceOrder={handlePlaceOrderClick}
                    />
                    {isBaristaPanelVisible && (
                      <div className="mt-8">
                        <BaristaPanel orders={confirmedOrders} />
                      </div>
                    )}
                </div>
            </div>
        </main>

        <Modal isOpen={stage !== OrderStage.SHOPPING} onClose={resetOrderFlow}>
          {renderCheckoutModalContent()}
        </Modal>

        {error && stage === OrderStage.SHOPPING && (
            <div className="fixed bottom-4 right-4 max-w-sm bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg z-50 animate-fade-in-up" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline pr-6">{error}</span>
                <button onClick={() => setError(null)} className="absolute top-0 bottom-0 right-0 px-4 py-3" aria-label="Cerrar">
                    <span className="text-2xl text-red-700">&times;</span>
                </button>
            </div>
        )}
    </div>
  );
};

export default App;