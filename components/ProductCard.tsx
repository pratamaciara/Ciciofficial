
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
          <div className="flex justify-between items-center text-sm mt-1">
            {!isOutOfStock && (
              <p className={`${product.stock <= 10 ? 'text-orange-600 font-semibold' : 'text-gray-500'}`}>
                Sisa stok: {product.stock}
              </p>
            )}
            {product.salesCount && product.salesCount > 0 && !isOutOfStock && (
                <div className="flex items-center text-gray-500" title="Jumlah produk terjual">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45.385c-.345.675-.865 1.228-1.462 1.755C8.893 5.23 8.358 5.765 8 6.5c-.358.735-.705 1.625-1.003 2.53C6.695 10.035 6.5 11.235 6.5 12.5c0 1.265.195 2.465.497 3.47.302.995.649 1.885 1.003 2.53.358.735.893 1.27 1.49 1.795.597.527 1.117 1.08 1.462 1.755a1 1 0 001.45.385c.345-.675.865-1.228 1.462-1.755.597-.527 1.132-1.06 1.49-1.795.354-.645.69-1.535 1.003-2.53.302-1.005.497-2.205.497-3.47 0-1.265-.195-2.465-.497-3.47-.302-.995-.649-1.885-1.003-2.53-.358-.735-.893-1.27-1.49-1.795-.597-.527-1.117-1.08-1.462-1.755a1 1 0 00-1.45-.385z" clipRule="evenodd" />
                    </svg>
                    <span>Terjual {product.salesCount}</span>
                </div>
            )}
          </div>
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
