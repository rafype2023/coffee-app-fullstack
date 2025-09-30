import { API_BASE_URL } from '../constants';
import type { OrderDetails, ConfirmedOrder } from '../types';

interface CreateOrderResponse {
  success: boolean;
  orderId: string;
  message: string;
}

interface VerifyOrderResponse {
    success: boolean;
    message: string;
    orderStatus?: 'Confirmed' | 'Failed';
}

const handleFetch = async (url: string, options: RequestInit) => {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ 
        message: `Error del servidor (código ${response.status}). Por favor, inténtalo de nuevo más tarde.` 
      }));
      throw new Error(errorData.message || 'Ocurrió un error inesperado en la respuesta del servidor.');
    }

    // For 204 No Content, return a success object
    if (response.status === 204) {
      return { success: true };
    }

    return response.json();
  } catch (error) {
    if (error instanceof TypeError) { 
        throw new Error(`No se pudo conectar con el servidor. Esto puede ser un problema de CORS o la API no está disponible en ${API_BASE_URL}.`);
    }
    
    if (error instanceof Error) {
        throw error;
    }
    
    throw new Error('Ha ocurrido un error de red desconocido.');
  }
};


export const createOrder = async (orderDetails: OrderDetails): Promise<CreateOrderResponse> => {
    return handleFetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderDetails),
    });
};

export const verifyOrder = async (orderId: string, code: string): Promise<VerifyOrderResponse> => {
    return handleFetch(`${API_BASE_URL}/api/orders/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId, code }),
    });
};

export const getConfirmedOrders = async (): Promise<ConfirmedOrder[]> => {
    return handleFetch(`${API_BASE_URL}/api/orders/confirmed`, {
        method: 'GET',
    });
};