
import React from 'react';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductContext';
import { CartItem as CartItemType } from '../types';
import { formatCurrency } from '../utils/formatter';

interface CartItemProps {
    item: CartItemType;
}

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

const CartItem: React.FC<CartItemProps> = ({ item }) => {
    const { updateQuantity, removeFromCart } = useCart();
    const { getProductById } = useProducts();

    const product = getProductById(item.productId);
    if (!product) return null;

    const variant = product.variants.find(v => v.id === item.variantId);
    const finalPrice = product.price + (variant?.priceModifier || 0);

    return (
        <div className="flex items-center space-x-4 py-4 border-b">
            <img src={product.imageUrl} alt={product.name} className="w-20 h-20 rounded-md object-cover"/>
            <div className="flex-grow">
                <p className="font-semibold text-gray-800">{product.name}</p>
                {variant && <p className="text-sm text-gray-500">{variant.name}</p>}
                <p className="font-bold text-primary">{formatCurrency(finalPrice * item.quantity)}</p>
            </div>
            <div className="flex items-center space-x-3">
                <input
                    type="number"
                    value={item.quantity}
                    onChange={e => updateQuantity(item.productId, item.variantId, parseInt(e.target.value))}
                    min="1"
                    className="w-16 p-1 border rounded-md text-center"
                />
                <button 
                    onClick={() => removeFromCart(item.productId, item.variantId)}
                    className="text-gray-500 hover:text-red-600 p-1"
                >
                    <TrashIcon />
                </button>
            </div>
        </div>
    );
};

export default CartItem;
