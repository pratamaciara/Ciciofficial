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
        id: '1722444000001',
        name: 'basreng cili oil',
        description: 'Basreng (bakso goreng) renyah dengan bumbu chili oil pedas yang menggugah selera. Cemilan sempurna untuk menemani waktu santai Anda.',
        price: 10000,
        stock: 15,
        category: 'Makanan Ringan',
        imageUrl: 'https://storage.googleapis.com/static.aistudio.dev/1722444588825-0.png',
        variants: []
    },
    {
        id: '1722444000002',
        name: 'ALPUKAT KOCOK',
        description: 'Minuman alpukat kocok segar dengan topping keju melimpah. Manis, creamy, dan dijamin bikin ketagihan.',
        price: 10000,
        stock: 15,
        category: 'Minuman',
        imageUrl: 'https://storage.googleapis.com/static.aistudio.dev/1722444588998-1.png',
        variants: []
    }
];

const loadProductsFromStorage = (): Product[] => {
  try {
    const serializedProducts = window.localStorage.getItem('products');
    if (serializedProducts === null || serializedProducts === '[]') { // Handle empty array explicitly
      window.localStorage.setItem('products', JSON.stringify(initialProducts));
      return initialProducts;
    }
    const storedProducts = JSON.parse(serializedProducts);
    if (Array.isArray(storedProducts) && storedProducts.length > 0) {
      return storedProducts;
    }
    // If stored is empty array, it will fall through and return initialProducts
    window.localStorage.setItem('products', JSON.stringify(initialProducts));
    return initialProducts;
  } catch (error) {
    console.error('Failed to parse product data from localStorage. Falling back.', error);
    window.localStorage.setItem('products', JSON.stringify(initialProducts));
    return initialProducts;
  }
};


export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(loadProductsFromStorage);

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'products' && event.newValue) {
        try {
          const newProducts = JSON.parse(event.newValue);
          if (Array.isArray(newProducts)) {
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
  }, []);

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
    setProducts(() => {
      try {
        window.localStorage.setItem('products', JSON.stringify(newProducts));
      } catch (error) {
        console.error("Failed to import/save products to localStorage:", error);
      }
      return newProducts;
    });
  };
  
  const getProductById = (productId: string): Product | undefined => {
    return products.find(p => p.id === productId);
  };

  const saveProducts = () => {
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