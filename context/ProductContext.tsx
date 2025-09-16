import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Product } from '../types';
import { supabase } from '../utils/formatter';

interface ProductContextType {
  products: Product[];
  loading: boolean;
  error: any | null; // Expose error state
  addProduct: (product: Omit<Product, 'id' | 'created_at'>) => Promise<{ success: boolean; data?: Product; error?: any }>;
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
        .order('created_at', { ascending: false }); // Urutkan berdasarkan yang terbaru
      
      if (fetchError) {
        console.error('Error fetching products:', fetchError.message || fetchError);
        setError(fetchError);
      } else {
        setProducts(data || []);
      }
      setLoading(false);
    };

    fetchProducts();
  }, []);

  const addProduct = async (productData: Omit<Product, 'id' | 'created_at'>) => {
    setError(null);
    if (!supabase) {
      const err = new Error("Supabase client not initialized. Cannot add product.");
      console.error(err.message);
      return { success: false, error: err };
    }
    
    // Kirim data ke Supabase, biarkan DB membuat ID (UUID) & created_at
    const { data: newProduct, error: insertError } = await supabase
      .from('products')
      .insert(productData)
      .select()
      .single();

    if (insertError) {
      console.error('Error adding product:', insertError.message || insertError);
      setError(insertError);
      return { success: false, error: insertError };
    }

    if (newProduct) {
      // Perbarui state dengan data valid dari database
      setProducts(prev => [newProduct, ...prev]);
      return { success: true, data: newProduct };
    }
    
    return { success: false, error: new Error('Failed to get product back after creation') };
  };

  const updateProduct = async (updatedProduct: Product) => {
    setError(null);
    if (!supabase) {
      const err = new Error("Supabase client not initialized. Cannot update product.");
      console.error(err.message);
      return { success: false, error: err };
    }
    const originalProducts = products;
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));

    const { error: updateError } = await supabase
      .from('products')
      .update(updatedProduct)
      .eq('id', updatedProduct.id);

    if (updateError) {
      console.error('Error updating product:', updateError.message || updateError);
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
       console.error(err.message);
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
      console.error('Error deleting product from database:', dbError.message || dbError);
      setError(dbError);
      setProducts(originalProducts); // Rollback
      return { success: false, error: dbError };
    }

    // Hanya coba hapus gambar dari storage jika URLnya adalah URL Supabase
    if (productToDelete && productToDelete.imageUrl && productToDelete.imageUrl.includes('supabase.co')) {
      try {
        const url = new URL(productToDelete.imageUrl);
        const pathParts = url.pathname.split('/product-images/');
        if (pathParts.length > 1 && pathParts[1]) {
            const filePath = decodeURIComponent(pathParts[1]);
            const { error: storageError } = await supabase.storage.from('product-images').remove([filePath]);
            if (storageError) {
                console.error('Error deleting image from storage:', storageError.message || storageError);
                // Non-critical error, don't return failure for this
            }
        }
      } catch (e) {
        console.error("Could not parse Supabase image URL to delete from storage:", e);
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