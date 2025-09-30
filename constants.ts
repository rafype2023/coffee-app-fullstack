import { Product } from "./types";

// 🚀 La URL base de la API ahora es relativa porque el frontend y el backend están en el mismo servidor.
export const API_BASE_URL = '';

export const PRODUCTS: Product[] = [
    { id: '1', name: 'Espresso Simple', description: 'Shot de café puro y fuerte.', price: 2.50 },
    { id: '2', name: 'Latte Vainilla', description: 'Leche texturizada con sirope de vainilla.', price: 4.50 },
    { id: '3', name: 'Cappuccino', description: 'Shot de café y vainleo.', price: 4.00 },
    { id: '4', name: 'Americano', description: 'Espresso con agua caliente.', price: 3.00 },
    { id: '5', name: 'Mocha', description: 'Espresso con chocolate y leche.', price: 5.00 },
];