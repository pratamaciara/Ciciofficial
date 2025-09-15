
import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductContext';
import CartItem from './CartItem';
import { formatCurrency } from '../utils/formatter';

const CartView: React.FC = () => {
    const { cartItems } = useCart();
    const { getProductById } = useProducts();

    const subtotal = cartItems.reduce((total, item) => {
        const product = getProductById(item.productId);
        if (!product) return total;
        const variant = product.variants.find(v => v.id === item.variantId);
        const price = product.price + (variant?.priceModifier || 0);
        return total + price * item.quantity;
    }, 0);

    if (cartItems.length === 0) {
        return (
            <div className="text-center py-10">
                <h2 className="text-2xl font-semibold mb-2">Keranjang Anda Kosong</h2>
                <p className="text-gray-600 mb-4">Ayo mulai belanja!</p>
                <Link to="/" className="bg-primary text-white px-6 py-2 rounded-md hover:bg-secondary">
                    Kembali ke Katalog
                </Link>
            </div>
        );
    }
    
    return (
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg">
            <h1 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-4">Keranjang Belanja</h1>
            <div>
                {cartItems.map(item => (
                    <CartItem key={`${item.productId}-${item.variantId}`} item={item} />
                ))}
            </div>

            <div className="mt-6 text-right">
                <p className="text-lg text-gray-700">Subtotal:</p>
                <p className="text-2xl font-bold text-primary">{formatCurrency(subtotal)}</p>
            </div>
            
            <div className="fixed bottom-0 left-0 right-0 bg-white p-4 border-t shadow-inner sm:hidden">
                 <Link to="/checkout" className="block w-full text-center bg-primary text-white py-3 px-4 rounded-md hover:bg-secondary font-semibold">
                    Checkout
                </Link>
            </div>
            <div className="hidden sm:flex justify-end mt-6">
                 <Link to="/checkout" className="bg-primary text-white py-3 px-8 rounded-md hover:bg-secondary font-semibold">
                    Checkout
                </Link>
            </div>
        </div>
    );
};

export default CartView;
