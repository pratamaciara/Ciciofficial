import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Product } from '../types';
import { supabase } from '../utils/formatter';

interface ProductContextType {
  products: Product[];
  loading: boolean;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  getProductById: (productId: string) => Product | undefined;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      if (!supabase) {
        console.warn("Supabase client not initialized. Cannot fetch products.");
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: false });
      
      if (error) {
        console.error('Error fetching products:', error.message || error);
      } else {
        setProducts(data || []);
      }
      setLoading(false);
    };

    fetchProducts();
  }, []);

  const addProduct = async (productData: Omit<Product, 'id'>) => {
    if (!supabase) {
      console.error("Supabase client not initialized. Cannot add product.");
      return;
    }
    const productWithId = { ...productData, id: Date.now().toString() };
    
    // Optimistic update
    setProducts(prev => [productWithId, ...prev]);

    const { error } = await supabase.from('products').insert(productWithId);

    if (error) {
      console.error('Error adding product:', error.message || error);
      // Rollback on error
      setProducts(prev => prev.filter(p => p.id !== productWithId.id));
    }
  };

  const updateProduct = async (updatedProduct: Product) => {
    if (!supabase) {
      console.error("Supabase client not initialized. Cannot update product.");
      return;
    }
    // Optimistic update
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));

    const { error } = await supabase
      .from('products')
      .update(updatedProduct)
      .eq('id', updatedProduct.id);

    if (error) {
      console.error('Error updating product:', error.message || error);
      // Optional: Rollback on error by re-fetching data
    }
  };

  const deleteProduct = async (productId: string) => {
    if (!supabase) {
      console.error("Supabase client not initialized. Cannot delete product.");
      return;
    }

    const productToDelete = products.find(p => p.id === productId);
    
     // Optimistic update
    setProducts(prev => prev.filter(p => p.id !== productId));
    
    const { error: dbError } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (dbError) {
      console.error('Error deleting product from database:', dbError.message || dbError);
       // Optional: Rollback on error by re-fetching data
    }

    // After successfully deleting from DB, delete from storage
    if (productToDelete && productToDelete.imageUrl && !dbError) {
      try {
        const url = new URL(productToDelete.imageUrl);
        const filePath = url.pathname.split('/product-images/')[1];
        if (filePath) {
          const { error: storageError } = await supabase.storage.from('product-images').remove([filePath]);
          if (storageError) {
            console.error('Error deleting image from storage:', storageError.message || storageError);
          }
        }
      } catch (e) {
        console.error("Could not parse image URL to delete from storage:", e);
      }
    }
  };

  const getProductById = (productId: string): Product | undefined => {
    return products.find(p => p.id === productId);
  };

  return (
    <ProductContext.Provider value={{ products, loading, addProduct, updateProduct, deleteProduct, getProductById }}>
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