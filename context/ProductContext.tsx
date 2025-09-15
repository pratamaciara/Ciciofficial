import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Product } from '../types';

interface ProductContextType {
  products: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  importProducts: (newProducts: Product[]) => void;
  getProductById: (productId: string) => Product | undefined;
  saveProducts: () => void;
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

const loadProductsFromStorage = (): Product[] => {
  try {
    const serializedProducts = window.localStorage.getItem('products');

    // Case 1: No data in localStorage. Initialize with default products.
    if (serializedProducts === null) {
      window.localStorage.setItem('products', JSON.stringify(initialProducts));
      return initialProducts;
    }

    // Case 2: Data is present. Try to parse it.
    const storedProducts = JSON.parse(serializedProducts);

    // Case 3: Parsed data is a valid array. Use it.
    if (Array.isArray(storedProducts)) {
      return storedProducts;
    }
    
    // Case 4: Parsed data is not an array. Fallback to initial products.
    console.warn('Stored product data is not an array. Falling back to initial products.');
    window.localStorage.setItem('products', JSON.stringify(initialProducts));
    return initialProducts;

  } catch (error) {
    // Case 5: Parsing failed (invalid JSON). Fallback to initial products.
    console.error('Failed to parse product data from localStorage. Falling back.', error);
    window.localStorage.setItem('products', JSON.stringify(initialProducts));
    return initialProducts;
  }
};


export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(loadProductsFromStorage);

  // Centralized effect to save products to localStorage whenever they change
  useEffect(() => {
    try {
      window.localStorage.setItem('products', JSON.stringify(products));
    } catch (error) {
      console.error("Failed to save products to localStorage:", error);
    }
  }, [products]);

  // Effect for cross-tab state synchronization
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'products' && event.newValue) {
        try {
          // Prevent re-saving what we just received from another tab
          const newProducts = JSON.parse(event.newValue);
          if (Array.isArray(newProducts) && JSON.stringify(products) !== event.newValue) {
            setProducts(newProducts);
          }
        } catch (error) {
          console.error("Failed to parse products from storage event:", error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [products]); // Add products to dependency array to have latest state for comparison

  const addProduct = (product: Product) => {
    setProducts((prev) => [product, ...prev]);
  };

  const updateProduct = (updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };

  const deleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const importProducts = (newProducts: Product[]) => {
    setProducts(newProducts);
  };
  
  const getProductById = (productId: string): Product | undefined => {
    return products.find(p => p.id === productId);
  };

  const saveProducts = () => {
    // This function is now more of a reassurance for the user,
    // as the useEffect hook already handles saving automatically.
    // Calling it again is harmless.
    try {
      window.localStorage.setItem('products', JSON.stringify(products));
    } catch (error) {
      console.error("Failed to save products to localStorage:", error);
    }
  };

  return (
    <ProductContext.Provider value={{ products, addProduct, updateProduct, deleteProduct, importProducts, getProductById, saveProducts }}>
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
