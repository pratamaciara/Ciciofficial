import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Product } from '../types';
import { supabase } from '../utils/formatter';

interface ProductContextType {
  products: Product[];
  loading: boolean;
  loadError: any | null; // Error saat memuat data awal
  actionError: any | null; // Error saat melakukan aksi (CUD)
  addProduct: (product: Omit<Product, 'id' | 'created_at'>) => Promise<{ success: boolean; data?: Product; error?: any }>;
  updateProduct: (product: Product) => Promise<{ success: boolean; error?: any }>;
  deleteProduct: (productId: string) => Promise<{ success: boolean; error?: any }>;
  getProductById: (productId: string) => Product | undefined;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<any | null>(null);
  const [actionError, setActionError] = useState<any | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setLoadError(null);
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
        setLoadError(fetchError);
      } else {
        setProducts(data || []);
      }
      setLoading(false);
    };

    fetchProducts();
  }, []);

  const addProduct = async (productData: Omit<Product, 'id' | 'created_at'>) => {
    setActionError(null); // Hapus error aksi sebelumnya
    if (!supabase) {
      const err = new Error("Supabase client not initialized. Cannot add product.");
      console.error(err.message);
      setActionError(err);
      return { success: false, error: err };
    }
    
    const { data: newProduct, error: insertError } = await supabase
      .from('products')
      .insert(productData)
      .select()
      .single();

    if (insertError) {
      console.error('Error adding product:', insertError.message || insertError);
      setActionError(insertError);
      return { success: false, error: insertError };
    }

    if (newProduct) {
      setProducts(prev => [newProduct, ...prev]);
      return { success: true, data: newProduct };
    }
    
    const err = new Error('Failed to get product back after creation');
    setActionError(err);
    return { success: false, error: err };
  };

  const updateProduct = async (updatedProduct: Product) => {
    setActionError(null); // Hapus error aksi sebelumnya
    if (!supabase) {
      const err = new Error("Supabase client not initialized. Cannot update product.");
      console.error(err.message);
      setActionError(err);
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
      setActionError(updateError);
      setProducts(originalProducts); // Rollback
      return { success: false, error: updateError };
    }
    return { success: true };
  };

  const deleteProduct = async (productId: string) => {
    setActionError(null); // Hapus error aksi sebelumnya
    if (!supabase) {
       const err = new Error("Supabase client not initialized. Cannot delete product.");
       console.error(err.message);
       setActionError(err);
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
      setActionError(dbError);
      setProducts(originalProducts); // Rollback
      return { success: false, error: dbError };
    }

    if (productToDelete && productToDelete.imageUrl && productToDelete.imageUrl.includes('supabase.co')) {
      try {
        const url = new URL(productToDelete.imageUrl);
        const pathParts = url.pathname.split('/product-images/');
        if (pathParts.length > 1 && pathParts[1]) {
            const filePath = decodeURIComponent(pathParts[1]);
            const { error: storageError } = await supabase.storage.from('product-images').remove([filePath]);
            if (storageError) {
                console.error('Error deleting image from storage:', storageError.message || storageError);
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
    <ProductContext.Provider value={{ products, loading, loadError, actionError, addProduct, updateProduct, deleteProduct, getProductById }}>
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

export { ProductContext };