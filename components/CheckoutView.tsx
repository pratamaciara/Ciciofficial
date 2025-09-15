
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductContext';
import { useAdminSettings } from '../context/AdminSettingsContext';
import { useToast } from '../context/ToastContext';
import { PaymentMethods } from '../types';
import { formatCurrency } from '../utils/formatter';

const CheckoutView: React.FC = () => {
  const { cartItems, clearCart } = useCart();
  const { getProductById } = useProducts();
  const { whatsAppNumber } = useAdminSettings();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState(PaymentMethods[0]);
  const [notes, setNotes] = useState('');
  const [nameError, setNameError] = useState('');

  const subtotal = cartItems.reduce((total, item) => {
    const product = getProductById(item.productId);
    if (!product) return total;
    const variant = product.variants.find(v => v.id === item.variantId);
    const price = product.price + (variant?.priceModifier || 0);
    return total + price * item.quantity;
  }, 0);

  const handleOrder = () => {
    if (!customerName.trim()) {
      setNameError('Nama pemesan wajib diisi.');
      addToast('Nama pemesan wajib diisi.', 'error');
      return;
    }
    setNameError('');
    
    if (!whatsAppNumber) {
        addToast('Nomor WhatsApp penjual belum diatur.', 'error');
        return;
    }

    let message = `Halo, saya mau pesan:\n\n`;
    message += `*Nama Pemesan:* ${customerName}\n`;
    message += `*Metode Pembayaran:* ${paymentMethod}\n\n`;
    message += `*DAFTAR PESANAN:*\n`;

    cartItems.forEach(item => {
      const product = getProductById(item.productId);
      if (product) {
        const variant = product.variants.find(v => v.id === item.variantId);
        message += `----------------------------------\n`;
        message += `*${product.name}*\n`;
        if (variant) {
          message += `Varian: ${variant.name}\n`;
        }
        message += `Jumlah: ${item.quantity}\n`;
        const imageUrl = product.whatsappImageUrl || product.imageUrl;
        message += `Link Gambar: ${imageUrl}\n`;
      }
    });
    
    message += `----------------------------------\n\n`;
    if (notes.trim()) {
      message += `*Catatan:* ${notes.trim()}\n\n`;
    }
    message += `*TOTAL: ${formatCurrency(subtotal)}*`;

    const encodedMessage = encodeURIComponent(message);
    const waUrl = `https://wa.me/${whatsAppNumber}?text=${encodedMessage}`;
    
    window.open(waUrl, '_blank');
    
    clearCart();
    addToast('Pesanan Anda sedang diproses!');
    navigate('/');
  };
  
  const isOrderButtonDisabled = !customerName.trim();

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-4">Checkout</h1>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="customerName" className="block text-sm font-medium text-gray-700">Nama Pemesan <span className="text-red-500">*</span></label>
          <input
            type="text"
            id="customerName"
            value={customerName}
            onChange={(e) => {
              setCustomerName(e.target.value)
              if(e.target.value.trim()){
                  setNameError('');
              }
            }}
            className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary ${nameError ? 'border-red-500' : 'border-gray-300'}`}
          />
          {nameError && <p className="text-red-500 text-sm mt-1">{nameError}</p>}
        </div>
        <div>
          <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700">Metode Pembayaran</label>
          <select
            id="paymentMethod"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary"
          >
            {PaymentMethods.map(method => <option key={method} value={method}>{method}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Catatan (Opsional)</label>
          <textarea
            id="notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary"
            placeholder="Contoh: Minta dibungkus kado"
          />
        </div>
      </div>

      <div className="mt-6 border-t pt-4">
        <h2 className="text-lg font-semibold mb-2">Ringkasan Pesanan</h2>
        {cartItems.map(item => {
            const product = getProductById(item.productId);
            if(!product) return null;
            const variant = product.variants.find(v => v.id === item.variantId);
            const price = product.price + (variant?.priceModifier || 0);
            return (
                <div key={`${item.productId}-${item.variantId}`} className="flex justify-between text-gray-600 py-1">
                    <span>{product.name} {variant ? `(${variant.name})` : ''} x {item.quantity}</span>
                    <span>{formatCurrency(price * item.quantity)}</span>
                </div>
            );
        })}
        <div className="flex justify-between font-bold text-xl mt-4 text-primary">
            <span>Total</span>
            <span>{formatCurrency(subtotal)}</span>
        </div>
      </div>
      
      <div className="fixed bottom-0 left-0 right-0 bg-white p-4 border-t shadow-inner sm:hidden">
         <button
            onClick={handleOrder}
            disabled={isOrderButtonDisabled}
            className={`w-full text-center text-white py-3 px-4 rounded-md font-semibold transition-colors ${isOrderButtonDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-secondary'}`}
          >
            Pesan via WhatsApp
          </button>
      </div>
      <div className="hidden sm:flex justify-end mt-6">
         <button
            onClick={handleOrder}
            disabled={isOrderButtonDisabled}
            className={`py-3 px-8 rounded-md font-semibold text-white transition-colors ${isOrderButtonDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-secondary'}`}
          >
            Pesan via WhatsApp
          </button>
      </div>
    </div>
  );
};

export default CheckoutView;
