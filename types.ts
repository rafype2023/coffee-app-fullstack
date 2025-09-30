export enum OrderStage {
  SHOPPING,
  FORM,
  VERIFICATION,
  CONFIRMED,
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
}

export interface CartItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface OrderDetails {
  employeeName: string;
  employeeEmail: string;
  items: CartItem[];
  total: number;
}

// Representa un pedido confirmado como se recibe desde el backend
export interface ConfirmedOrder {
  _id: string;
  employeeName: string;
  employeeEmail: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  status: 'Pending' | 'Confirmed';
  createdAt: string;
}