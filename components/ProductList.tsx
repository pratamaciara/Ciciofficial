
import React, { useState, useMemo } from 'react';
import { useProducts } from '../context/ProductContext';
import ProductCard from './ProductCard';

type FilterType = 'all' | 'newest' | 'bestselling' | 'sale';

const ProductList: React.FC = () => {
  const { products } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const filteredProducts = useMemo(() => {
    let processedProducts = [...products];

    // 1. Search filter
    if (searchTerm) {
      processedProducts = processedProducts.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 2. Category/Sort filter
    switch (activeFilter) {
      case 'newest':
        // Assuming newest are added first, no sort needed if addProduct prepends
        break;
      case 'bestselling':
        processedProducts.sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0));
        break;
      case 'sale':
        processedProducts = processedProducts.filter(p => p.originalPrice && p.originalPrice > p.price);
        break;
      case 'all':
      default:
        // No additional filtering
        break;
    }

    return processedProducts;
  }, [products, searchTerm, activeFilter]);
  
  const FilterButton: React.FC<{filter: FilterType; label: string}> = ({ filter, label }) => {
    const isActive = activeFilter === filter;
    return (
        <button
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-2 text-sm sm:text-base font-semibold rounded-full transition-colors duration-200 ${
                isActive
                    ? 'bg-primary text-white shadow'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
        >
            {label}
        </button>
    );
  };


  return (
    <div>
      <div className="mb-6 space-y-4">
        <input
          type="text"
          placeholder="Cari produk..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
        />
        <div className="flex justify-center sm:justify-start space-x-2 sm:space-x-3 overflow-x-auto pb-2">
            <FilterButton filter="all" label="Semua"/>
            <FilterButton filter="newest" label="Terbaru"/>
            <FilterButton filter="bestselling" label="Terlaris"/>
            <FilterButton filter="sale" label="Diskon"/>
        </div>
      </div>
      
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <ProductCard key={`${product.id}-${activeFilter}`} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-gray-500 bg-white rounded-lg shadow">
          <p className="font-semibold text-lg">Oops! Produk tidak ditemukan.</p>
          <p className="text-sm">Coba ubah kata kunci pencarian atau filter Anda.</p>
        </div>
      )}
    </div>
  );
};

export default ProductList;