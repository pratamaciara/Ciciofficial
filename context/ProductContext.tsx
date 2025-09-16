import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Product } from '../types';
import { supabase } from '../utils/formatter';

interface ProductContextType {
  products: Product[];
  loading: boolean;
  error: any | null; // Expose error state
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
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
      console.error("Supabase client not initialized. Cannot add product.");
      return;
    }
    const productWithId = { ...productData, id: Date.now().toString() };
    
    setProducts(prev => [productWithId, ...prev]);

    const { error: insertError } = await supabase.from('products').insert(productWithId);

    if (insertError) {
      console.error('Error adding product:', insertError);
      setError(insertError);
      setProducts(prev => prev.filter(p => p.id !== productWithId.id));
    }
  };

  const updateProduct = async (updatedProduct: Product) => {
    setError(null);
    if (!supabase) {
      console.error("Supabase client not initialized. Cannot update product.");
      return;
    }
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));

    const { error: updateError } = await supabase
      .from('products')
      .update(updatedProduct)
      .eq('id', updatedProduct.id);

    if (updateError) {
      console.error('Error updating product:', updateError);
      setError(updateError);
    }
  };

  const deleteProduct = async (productId: string) => {
    setError(null);
    if (!supabase) {
      console.error("Supabase client not initialized. Cannot delete product.");
      return;
    }

    const productToDelete = products.find(p => p.id === productId);
    
    setProducts(prev => prev.filter(p => p.id !== productId));
    
    const { error: dbError } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (dbError) {
      console.error('Error deleting product from database:', dbError);
      setError(dbError);
    }

    if (productToDelete && productToDelete.imageUrl && !dbError) {
      try {
        const url = new URL(productToDelete.imageUrl);
        const filePath = url.pathname.split('/product-images/')[1];
        if (filePath) {
          const { error: storageError } = await supabase.storage.from('product-images').remove([filePath]);
          if (storageError) {
            console.error('Error deleting image from storage:', storageError);
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
