
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Product } from '../types';

interface ProductContextType {
  products: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  importProducts: (newProducts: Product[]) => void;
  getProductById: (productId: string) => Product | undefined;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

const initialProducts: Product[] = [
    {
        id: '1', name: 'T-Shirt Keren',
        description: 'Tampil gaya dan nyaman setiap hari dengan T-Shirt Keren kami! Dibuat dari bahan katun premium yang lembut dan menyerap keringat, kaos ini cocok untuk segala aktivitas, mulai dari santai di rumah hingga hangout bersama teman. Desain minimalis namun tetap stylish membuatnya mudah dipadupadankan dengan outfit apa pun. Tersedia dalam berbagai ukuran dan warna favoritmu.',
        price: 120000, 
        originalPrice: 150000, // Discounted
        salesCount: 152, // Best-seller
        stock: 50,
        category: 'Pakaian',
        imageUrl: 'https://picsum.photos/id/10/400/400',
        whatsappImageUrl: 'https://picsum.photos/id/10/200/200',
        variants: [
            { id: '1-s', name: 'Putih (S)', priceModifier: 0 },
            { id: '1-m', name: 'Putih (M)', priceModifier: 0 },
            { id: '1-l', name: 'Putih (L)', priceModifier: 5000 },
            { id: '1-xl', name: 'Hitam (XL)', priceModifier: 10000 },
        ]
    },
    {
        id: '2', name: 'Sepatu Lari Cepat',
        description: 'Capai performa terbaikmu dengan Sepatu Lari Cepat! Dirancang khusus untuk para pelari yang mengutamakan kecepatan dan kenyamanan. Dengan teknologi sol yang responsif dan upper mesh yang ringan, sepatu ini memberikan sirkulasi udara maksimal dan pijakan yang stabil. Siap menemanimu memecahkan rekor pribadi di setiap lintasan.',
        price: 750000,
        salesCount: 88,
        stock: 15,
        category: 'Sepatu',
        imageUrl: 'https://picsum.photos/id/20/400/400',
        variants: [
            { id: '2-39', name: 'Ukuran 39', priceModifier: 0 },
            { id: '2-40', name: 'Ukuran 40', priceModifier: 0 },
            { id: '2-41', name: 'Ukuran 41', priceModifier: 0 },
        ]
    },
    {
        id: '3', name: 'Topi Gaul',
        description: 'Lengkapi gayamu dengan Topi Gaul yang trendi ini. Desain klasik dengan sentuhan modern, cocok untuk melindungi dari sinar matahari sekaligus menambah poin pada penampilanmu. Terbuat dari bahan berkualitas yang awet dan nyaman dipakai sepanjang hari. Wajib punya untuk kamu yang berjiwa muda dan dinamis!',
        price: 85000,
        salesCount: 110,
        stock: 0, // Out of stock
        category: 'Aksesoris',
        imageUrl: 'https://picsum.photos/id/30/400/400',
        variants: [
            { id: '3-red', name: 'Merah', priceModifier: 0 },
            { id: '3-blue', name: 'Biru', priceModifier: 0 },
        ]
    }
];


export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const item = window.localStorage.getItem('products');
      // If there's data, parse it. If not, or if it's empty, use initialProducts.
      if (item && item !== '[]') {
        return JSON.parse(item);
      }
      // On first load, populate with initial products and save to storage.
      window.localStorage.setItem('products', JSON.stringify(initialProducts));
      return initialProducts;
    } catch (error) {
      console.error("Failed to load products from localStorage:", error);
      return initialProducts;
    }
  });

  const addProduct = (product: Product) => {
    setProducts((prev) => {
      const newProducts = [product, ...prev];
      try {
        window.localStorage.setItem('products', JSON.stringify(newProducts));
      } catch (error) {
        console.error("Failed to save products to localStorage:", error);
      }
      return newProducts;
    });
  };

  const updateProduct = (updatedProduct: Product) => {
    setProducts(prev => {
      const newProducts = prev.map(p => p.id === updatedProduct.id ? updatedProduct : p);
      try {
        window.localStorage.setItem('products', JSON.stringify(newProducts));
      } catch (error) {
        console.error("Failed to save products to localStorage:", error);
      }
      return newProducts;
    });
  };

  const deleteProduct = (productId: string) => {
    setProducts((prev) => {
      const newProducts = prev.filter((p) => p.id !== productId);
      try {
        window.localStorage.setItem('products', JSON.stringify(newProducts));
      } catch (error) {
        console.error("Failed to save products to localStorage:", error);
      }
      return newProducts;
    });
  };

  const importProducts = (newProducts: Product[]) => {
    try {
      window.localStorage.setItem('products', JSON.stringify(newProducts));
      setProducts(newProducts);
    } catch (error) {
      console.error("Failed to save imported products to localStorage:", error);
    }
  };
  
  const getProductById = (productId: string): Product | undefined => {
    return products.find(p => p.id === productId);
  };

  return (
    <ProductContext.Provider value={{ products, addProduct, updateProduct, deleteProduct, importProducts, getProductById }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = (): ProductContextType => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
