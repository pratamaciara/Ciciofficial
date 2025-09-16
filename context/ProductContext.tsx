import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Product } from '../types';
import { supabase } from '../utils/formatter';

interface ProductContextType {
  products: Product[];
  loading: boolean;
  error: any | null; // Expose error state
  addProduct: (product: Omit<Product, 'id'>) => Promise<{ success: boolean; error?: any }>;
  updateProduct: (product: Product) => Promise<{ success: boolean; error?: any }>;
  deleteProduct: (productId: string) => Promise<{ success: boolean; error?: any }>;
  getProductById: (productId: string) => Product | undefined;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      if (!supabase) {
        console.warn("Supabase client not initialized. Cannot fetch products.");
        setLoading(false);
        return;
      }
      const { data, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: false });
      
      if (fetchError) {
        console.error('Error fetching products:', fetchError);
        setError(fetchError);
      } else {
        setProducts(data || []);
      }
      setLoading(false);
    };

    fetchProducts();
  }, []);

  const addProduct = async (productData: Omit<Product, 'id'>) => {
    setError(null);
    if (!supabase) {
      const err = new Error("Supabase client not initialized. Cannot add product.");
      console.error(err);
      return { success: false, error: err };
    }
    const productWithId = { ...productData, id: Date.now().toString() };
    
    setProducts(prev => [productWithId, ...prev]);

    const { error: insertError } = await supabase.from('products').insert(productWithId);

    if (insertError) {
      console.error('Error adding product:', insertError);
      setError(insertError);
      setProducts(prev => prev.filter(p => p.id !== productWithId.id));
      return { success: false, error: insertError };
    }
    return { success: true };
  };

  const updateProduct = async (updatedProduct: Product) => {
    setError(null);
    if (!supabase) {
      const err = new Error("Supabase client not initialized. Cannot update product.");
      console.error(err);
      return { success: false, error: err };
    }
    const originalProducts = products;
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));

    const { error: updateError } = await supabase
      .from('products')
      .update(updatedProduct)
      .eq('id', updatedProduct.id);

    if (updateError) {
      console.error('Error updating product:', updateError);
      setError(updateError);
      setProducts(originalProducts); // Rollback
      return { success: false, error: updateError };
    }
    return { success: true };
  };

  const deleteProduct = async (productId: string) => {
    setError(null);
    if (!supabase) {
       const err = new Error("Supabase client not initialized. Cannot delete product.");
       console.error(err);
       return { success: false, error: err };
    }

    const productToDelete = products.find(p => p.id === productId);
    const originalProducts = products;
    
    setProducts(prev => prev.filter(p => p.id !== productId));
    
    const { error: dbError } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (dbError) {
      console.error('Error deleting product from database:', dbError);
      setError(dbError);
      setProducts(originalProducts); // Rollback
      return { success: false, error: dbError };
    }

    // Continue to delete storage image even if DB deletion was successful
    if (productToDelete && productToDelete.imageUrl) {
      try {
        const url = new URL(productToDelete.imageUrl);
        const filePath = url.pathname.split('/product-images/')[1];
        if (filePath) {
          const { error: storageError } = await supabase.storage.from('product-images').remove([filePath]);
          if (storageError) {
            console.error('Error deleting image from storage:', storageError);
            // Non-critical error, don't return failure for this
          }
        }
      } catch (e) {
        console.error("Could not parse image URL to delete from storage:", e);
      }
    }
    return { success: true };
  };

  const getProductById = (productId: string): Product | undefined => {
    return products.find(p => p.id === productId);
  };

  return (
    <ProductContext.Provider value={{ products, loading, error, addProduct, updateProduct, deleteProduct, getProductById }}>
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

// Export context for direct consumption if needed
export { ProductContext };