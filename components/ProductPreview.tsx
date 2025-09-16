import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { formatCurrency } from '../utils/formatter';
import BuyNowModal from './BuyNowModal';
import BackButton from './BackButton';

const ProductPreview: React.FC = () => {
    const { productId } = useParams<{ productId: string }>();
    const { getProductById } = useProducts();
    const { addToCart } = useCart();
    const { addToast } = useToast();
    
    const product = getProductById(productId || '');

    const [selectedVariantId, setSelectedVariantId] = useState<string>('');
    const [quantity, setQuantity] = useState<number>(1);
    const [isBuyNowModalOpen, setIsBuyNowModalOpen] = useState(false);
    
    useEffect(() => {
        if (product && product.variants.length > 0) {
            setSelectedVariantId(product.variants[0].id);
        }
    }, [product]);

    if (!product) {
        return (
            <div className="text-center py-20 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold mb-2 text-gray-700">Produk Tidak Ditemukan</h2>
                <p className="text-gray-500 mb-6">Produk yang Anda cari mungkin telah dihapus atau tidak tersedia.</p>
                <Link to="/" className="bg-primary text-white px-6 py-2 rounded-md hover:bg-secondary transition-colors">
                    Kembali ke Katalog
                </Link>
            </div>
        );
    }
    
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
            <div className="bg-white p-4 sm:p-8 rounded-lg shadow-lg max-w-4xl mx-auto">
                <BackButton />
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="relative">
                        <img src={product.imageUrl} alt={product.name} className={`w-full h-auto rounded-lg object-cover aspect-square shadow-md ${isOutOfStock ? 'grayscale' : ''}`}/>
                         {isOnSale && !isOutOfStock && (
                            <div className="absolute top-3 right-3 bg-red-500 text-white text-base font-bold px-3 py-1.5 rounded-full z-10">
                                Diskon {discountPercentage}%
                            </div>
                        )}
                        {isOutOfStock && (
                             <div className="absolute top-3 left-3 bg-red-500 text-white text-base font-bold px-3 py-1.5 rounded-full z-10">
                                STOK HABIS
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col">
                        <p className="text-gray-500 text-sm mb-1">{product.category}</p>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{product.name}</h1>
                        
                        <div className="flex items-baseline gap-3 my-4">
                            <p className="text-primary font-bold text-3xl sm:text-4xl">{formatCurrency(finalPrice)}</p>
                            {isOnSale && (
                                <p className="text-gray-400 line-through text-xl sm:text-2xl">{formatCurrency(finalOriginalPrice)}</p>
                            )}
                        </div>

                        <div className="flex items-center space-x-2 mb-4 text-sm sm:text-base">
                            {!isOutOfStock && (
                                <p className={`${product.stock <= 10 ? 'text-orange-600 font-semibold' : 'text-gray-600'}`}>
                                    Sisa stok: {product.stock}
                                </p>
                            )}
                            {product.salesCount && product.salesCount > 0 && !isOutOfStock && (
                                <>
                                    <span className="text-gray-300">|</span>
                                    <div className="flex items-center text-gray-600" title="Jumlah produk terjual">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45.385c-.345.675-.865 1.228-1.462 1.755C8.893 5.23 8.358 5.765 8 6.5c-.358.735-.705 1.625-1.003 2.53C6.695 10.035 6.5 11.235 6.5 12.5c0 1.265.195 2.465.497 3.47.302.995.649 1.885 1.003 2.53.358.735.893 1.27 1.49 1.795.597.527 1.117 1.08 1.462 1.755a1 1 0 001.45.385c.345-.675.865-1.228 1.462-1.755.597-.527 1.132-1.06 1.49-1.795.354-.645.69-1.535 1.003-2.53.302-1.005.497-2.205.497-3.47 0-1.265-.195-2.465-.497-3.47-.302-.995-.649-1.885-1.003-2.53-.358-.735-.893-1.27-1.49-1.795-.597-.527-1.117-1.08-1.462-1.755a1 1 0 00-1.45-.385z" clipRule="evenodd" />
                                        </svg>
                                        <span>Terjual {product.salesCount}</span>
                                    </div>
                                </>
                            )}
                        </div>

                         {isOutOfStock && (
                            <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-400 text-red-700 rounded-r-lg">
                                <p className="font-bold">Stok Habis</p>
                                <p className="text-sm">Mohon maaf, produk ini sedang tidak tersedia.</p>
                            </div>
                        )}
                        
                        {product.description && (
                            <div className="mb-6 border-t pt-4">
                                <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">Deskripsi Produk</h2>
                                <p className="text-gray-600 whitespace-pre-wrap text-sm sm:text-base leading-relaxed">{product.description}</p>
                            </div>
                        )}

                        <div className="space-y-6">
                            {product.variants.length > 0 && (
                                <div>
                                    <label htmlFor={`variant-${product.id}`} className="block text-sm sm:text-md font-medium text-gray-800">Pilih Varian</label>
                                    <select
                                        id={`variant-${product.id}`}
                                        value={selectedVariantId}
                                        onChange={(e) => setSelectedVariantId(e.target.value)}
                                        disabled={isOutOfStock}
                                        className="mt-2 block w-full pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-primary focus:border-primary rounded-md shadow-sm disabled:bg-gray-100"
                                    >
                                        {product.variants.map(variant => (
                                        <option key={variant.id} value={variant.id}>
                                            {variant.name} {variant.priceModifier > 0 ? `(+${formatCurrency(variant.priceModifier)})` : ''}
                                        </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            <div>
                                <label htmlFor={`quantity-${product.id}`} className="block text-sm sm:text-md font-medium text-gray-800">Jumlah</label>
                                <input
                                    type="number"
                                    id={`quantity-${product.id}`}
                                    value={quantity}
                                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                    min="1"
                                    disabled={isOutOfStock}
                                    className="mt-2 block w-full pl-3 pr-2 py-2 text-sm border-gray-300 focus:outline-none focus:ring-primary focus:border-primary rounded-md shadow-sm disabled:bg-gray-100"
                                />
                            </div>
                        </div>

                        <div className="mt-auto pt-6 space-y-2">
                            <button 
                                onClick={handleBuyNowClick}
                                disabled={isOutOfStock}
                                className={`w-full py-2.5 sm:py-3 px-6 rounded-md font-semibold text-base sm:text-lg text-white transition-colors ${isOutOfStock ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-secondary'}`}
                            >
                            {isOutOfStock ? 'Stok Habis' : 'Beli Sekarang'}
                            </button>
                            <button 
                                onClick={handleAddToCart}
                                disabled={isOutOfStock}
                                className={`w-full py-2.5 sm:py-3 px-6 rounded-md font-semibold text-base sm:text-lg transition-colors ${isOutOfStock ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20'}`}
                            >
                                {isOutOfStock ? 'Stok Habis' : '+ Tambah ke Keranjang'}
                            </button>
                        </div>
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

export default ProductPreview;