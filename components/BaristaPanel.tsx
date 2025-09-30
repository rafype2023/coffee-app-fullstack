import React from 'react';
import { ConfirmedOrder } from '../types';
import Card from './ui/Card';
import { CheckIcon } from './icons/CheckIcon';

interface BaristaPanelProps {
  orders: ConfirmedOrder[];
}

const BaristaPanel: React.FC<BaristaPanelProps> = ({ orders }) => {
  return (
    <Card className="bg-brand-surface-alt">
        <h2 className="text-xl font-bold font-serif mb-4 flex items-center gap-2">
            Pedidos Confirmados 
            <CheckIcon className="w-6 h-6 text-green-600"/>
        </h2>
        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {orders.length === 0 ? (
                <p className="text-center text-brand-text-light py-4">No hay pedidos confirmados.</p>
            ) : (
                orders.map(order => (
                    <div key={order._id} className="bg-white p-3 rounded-lg shadow-sm text-sm">
                        <p className="font-bold">Pedido para: <span className="font-normal">{order.employeeName}</span></p>
                        <p className="text-gray-500">
                            {order.items.map(item => `${item.quantity}x ${item.name}`).join(', ')}
                        </p>
                        <p className="text-right font-bold mt-1">Total: ${order.total.toFixed(2)}</p>
                    </div>
                ))
            )}
        </div>
    </Card>
  );
};

export default BaristaPanel;