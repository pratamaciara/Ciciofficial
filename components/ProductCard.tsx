
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { formatCurrency } from '../utils/formatter';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import BuyNowModal from './BuyNowModal';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { addToast } = useToast();
  
  const [selectedVariantId, setSelectedVariantId] = useState<string>(product.variants[0]?.id || '');
  const [quantity, setQuantity] = useState<number>(1);
  const [isBuyNowModalOpen, setIsBuyNowModalOpen] = useState(false);

  const selectedVariant = product.variants.find(v => v.id === selectedVariantId);
  const finalPrice = product.price + (selectedVariant?.priceModifier || 0);
  const finalOriginalPrice = (product.originalPrice || 0) + (selectedVariant?.priceModifier || 0);
  
  const isOnSale = product.originalPrice && product.originalPrice > product.price;
  const isOutOfStock = product.stock === 0;
  const discountPercentage = isOnSale ? Math.round(((finalOriginalPrice - finalPrice) / finalOriginalPrice) * 100) : 0;


  const handleAddToCart = () => {
    if (isOutOfStock) return;
    if (product.variants.length > 0 && !selectedVariantId) {
      addToast('Pilih varian terlebih dahulu', 'error');
      return;
    }
    if (quantity < 1) {
      addToast('Jumlah minimal 1', 'error');
      return;
    }
    addToCart({
      productId: product.id,
      variantId: selectedVariantId,
      quantity,
    });
    addToast(`${product.name} ditambahkan ke keranjang`);
  };
  
  const handleBuyNowClick = () => {
    if (isOutOfStock) return;
    if (product.variants.length > 0 && !selectedVariantId) {
      addToast('Pilih varian terlebih dahulu', 'error');
      return;
    }
    setIsBuyNowModalOpen(true);
  };

  return (
    <>
      <div className={`bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105 duration-300 flex flex-col relative ${isOutOfStock ? 'border-2 border-red-400' : ''}`}>
        {isOutOfStock && (
           <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
                HABIS
            </div>
        )}
        {isOnSale && !isOutOfStock && (
            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
                {discountPercentage}%
            </div>
        )}
        <Link to={`/product/${product.id}`} className={isOutOfStock ? 'pointer-events-none' : ''}>
          <img src={product.imageUrl} alt={product.name} className={`w-full h-48 object-cover ${isOutOfStock ? 'grayscale' : ''}`} />
        </Link>
        <div className="p-4 flex flex-col flex-grow">
          <Link to={`/product/${product.id}`} className={`hover:text-primary transition-colors ${isOutOfStock ? 'pointer-events-none' : ''}`}>
            <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
          </Link>
          <div className="flex items-baseline gap-2 mt-1">
             <p className="text-primary font-bold text-xl">{formatCurrency(finalPrice)}</p>
             {isOnSale && (
                <p className="text-gray-500 line-through text-sm">{formatCurrency(finalOriginalPrice)}</p>
             )}
          </div>
           {!isOutOfStock && (
            <p className={`text-sm mt-1 ${product.stock <= 10 ? 'text-orange-600 font-semibold' : 'text-gray-500'}`}>
              Sisa stok: {product.stock}
            </p>
          )}
          <div className="mt-4 space-y-3 flex-grow">
            {product.variants.length > 0 && (
              <div>
                <label htmlFor={`variant-${product.id}`} className="block text-sm font-medium text-gray-700">Varian</label>
                <select
                  id={`variant-${product.id}`}
                  value={selectedVariantId}
                  onChange={(e) => setSelectedVariantId(e.target.value)}
                  disabled={isOutOfStock}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md disabled:bg-gray-100"
                >
                  {product.variants.map(variant => (
                    <option key={variant.id} value={variant.id}>{variant.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label htmlFor={`quantity-${product.id}`} className="block text-sm font-medium text-gray-700">Jumlah</label>
              <input
                type="number"
                id={`quantity-${product.id}`}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                disabled={isOutOfStock}
                className="mt-1 block w-full pl-3 pr-2 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md disabled:bg-gray-100"
              />
            </div>
          </div>
          <div className="mt-4 flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`w-full py-2 px-4 rounded-md transition-colors font-semibold ${isOutOfStock ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20'}`}
              >
                {isOutOfStock ? 'Habis' : '+ Keranjang'}
              </button>
              <button
                onClick={handleBuyNowClick}
                disabled={isOutOfStock}
                className={`w-full py-2 px-4 rounded-md transition-colors font-semibold text-white ${isOutOfStock ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-secondary'}`}
              >
                {isOutOfStock ? 'Habis' : 'Beli'}
              </button>
          </div>
        </div>
      </div>
      {isBuyNowModalOpen && (
        <BuyNowModal
          isOpen={isBuyNowModalOpen}
          onClose={() => setIsBuyNowModalOpen(false)}
          product={product}
          initialVariantId={selectedVariantId}
        />
      )}
    </>
  );
};

export default ProductCard;
