import React, { useState, useMemo } from 'react';
import { useProducts } from '../context/ProductContext';
import ProductCard from './ProductCard';
import { Product } from '../types';

type FilterType = 'all' | 'newest' | 'bestselling' | 'sale';

const ProductList: React.FC = () => {
  const { products } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const filteredAndSortedProducts = useMemo(() => {
    let processedProducts: Product[] = [...products];

    // 1. Search filter
    if (searchTerm) {
      processedProducts = processedProducts.filter(product =>
        (product.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (product.category?.toLowerCase() || '').includes(searchTerm.toLowerCase())
      );
    }

    // 2. Category/Sort filter
    switch (activeFilter) {
      case 'newest':
        // Sort by ID (assuming it's a timestamp) descending for newest
        processedProducts.sort((a, b) => parseInt(b.id, 10) - parseInt(a.id, 10));
        break;
      case 'bestselling':
        processedProducts.sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0));
        break;
      case 'sale':
        processedProducts = processedProducts.filter(p => p.originalPrice && p.originalPrice > p.price);
        break;
      case 'all':
      default:
        // No additional filtering or sorting needed for 'all'
        break;
    }

    return processedProducts;
  }, [products, searchTerm, activeFilter]);
  
  const FilterButton: React.FC<{filter: FilterType; label: string}> = ({ filter, label }) => {
    const isActive = activeFilter === filter;
    return (
        <button
            onClick={() => setActiveFilter(filter)}
            className={`px-3 py-1.5 text-sm sm:px-4 sm:py-2 font-semibold rounded-full transition-colors duration-200 ${
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
      
      {filteredAndSortedProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredAndSortedProducts.map(product => (
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