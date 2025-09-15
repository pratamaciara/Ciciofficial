import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { useAdminSettings } from '../context/AdminSettingsContext';
import { useToast } from '../context/ToastContext';
import { formatCurrency } from '../utils/formatter';

interface BuyNowModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: Product;
    initialVariantId: string;
}

const BuyNowModal: React.FC<BuyNowModalProps> = ({ isOpen, onClose, product, initialVariantId }) => {
    const { whatsAppNumber } = useAdminSettings();
    const { addToast } = useToast();

    const [customerName, setCustomerName] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [notes, setNotes] = useState('');
    const [nameError, setNameError] = useState('');
    const [currentVariantId, setCurrentVariantId] = useState(initialVariantId);

    const selectedVariant = product.variants.find(v => v.id === currentVariantId);
    const finalPrice = product.price + (selectedVariant?.priceModifier || 0);
    const totalPrice = finalPrice * quantity;

    useEffect(() => {
        if (isOpen) {
            setCurrentVariantId(initialVariantId || (product.variants.length > 0 ? product.variants[0].id : ''));
            setCustomerName('');
            setQuantity(1);
            setNotes('');
            setNameError('');
        }
    }, [isOpen, initialVariantId, product.variants]);


    if (!isOpen) return null;

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

        let message = `Halo, saya mau pesan langsung (Direct Order):\n\n`;
        message += `*Nama Pemesan:* ${customerName.trim()}\n\n`;
        message += `*PRODUK YANG DIPESAN:*\n`;
        message += `----------------------------------\n`;
        message += `*${product.name}*\n`;
        if (selectedVariant) {
            message += `Varian: ${selectedVariant.name}\n`;
        }
        message += `Jumlah: ${quantity}\n`;
        const imageUrl = product.whatsappImageUrl || product.imageUrl;
        message += `Link Gambar: ${imageUrl}\n`;
        message += `----------------------------------\n\n`;
        if (notes.trim()) {
            message += `*Catatan:* ${notes.trim()}\n\n`;
        }
        message += `*TOTAL: ${formatCurrency(totalPrice)}*`;

        const encodedMessage = encodeURIComponent(message);
        const waUrl = `https://wa.me/${whatsAppNumber}?text=${encodedMessage}`;
        
        window.open(waUrl, '_blank');
        addToast('Anda akan diarahkan ke WhatsApp!');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 transition-opacity duration-300" onClick={onClose}>
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md transform transition-all" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-xl font-bold mb-4 text-gray-800">Beli Langsung: {product.name}</h2>
                
                <div className="space-y-4">
                    {product.variants.length > 0 && (
                        <div>
                            <label htmlFor="variantModal" className="block text-sm font-medium text-gray-700">Varian</label>
                            <select
                                id="variantModal"
                                value={currentVariantId}
                                onChange={(e) => setCurrentVariantId(e.target.value)}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary"
                            >
                                {product.variants.map(variant => (
                                    <option key={variant.id} value={variant.id}>
                                        {variant.name} {variant.priceModifier !== 0 ? `(${variant.priceModifier > 0 ? '+' : ''}${formatCurrency(variant.priceModifier)})` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div>
                        <label htmlFor="customerNameModal" className="block text-sm font-medium text-gray-700">Nama Anda <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            id="customerNameModal"
                            value={customerName}
                            onChange={(e) => {
                                setCustomerName(e.target.value);
                                if (e.target.value.trim()) setNameError('');
                            }}
                            className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary ${nameError ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {nameError && <p className="text-red-500 text-sm mt-1">{nameError}</p>}
                    </div>
                     <div>
                        <label htmlFor="quantityModal" className="block text-sm font-medium text-gray-700">Jumlah</label>
                        <input
                            type="number"
                            id="quantityModal"
                            value={quantity}
                            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                            min="1"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary"
                        />
                    </div>
                     <div>
                        <label htmlFor="notesModal" className="block text-sm font-medium text-gray-700">Catatan (Opsional)</label>
                        <textarea
                            id="notesModal"
                            rows={2}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary"
                            placeholder="Contoh: Tolong bungkus kado"
                        />
                    </div>
                </div>

                <div className="mt-6 border-t pt-4">
                    <div className="flex justify-between font-bold text-lg">
                        <span>Total Harga:</span>
                        <span className="text-primary">{formatCurrency(totalPrice)}</span>
                    </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-semibold">
                        Batal
                    </button>
                    <button onClick={handleOrder} disabled={!customerName.trim()} className={`px-4 py-2 text-white rounded-md font-semibold transition-colors ${!customerName.trim() ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-secondary'}`}>
                        Pesan via WhatsApp
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BuyNowModal;