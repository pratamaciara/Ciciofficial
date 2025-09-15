
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Product } from '../types';
import { db } from '../firebase/config';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, writeBatch, query, orderBy } from 'firebase/firestore';
import { useToast } from './ToastContext';

interface ProductContextType {
  products: Product[];
  loading: boolean;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  importProducts: (newProducts: Product[]) => Promise<void>;
  getProductById: (productId: string) => Product | undefined;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    const productsCollectionRef = collection(db, 'products');
    const q = query(productsCollectionRef, orderBy('name', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Product));
      setProducts(productsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching products:", error);
      addToast('Gagal memuat data produk.', 'error');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [addToast]);

  const addProduct = async (product: Omit<Product, 'id'>) => {
    try {
      await addDoc(collection(db, 'products'), product);
    } catch (error) {
      console.error("Error adding product:", error);
      addToast('Gagal menambahkan produk.', 'error');
    }
  };

  const updateProduct = async (updatedProduct: Product) => {
    try {
      const productDocRef = doc(db, 'products', updatedProduct.id);
      // Make a copy and remove the id field before updating
      const { id, ...productData } = updatedProduct;
      await updateDoc(productDocRef, productData);
    } catch (error) {
      console.error("Error updating product:", error);
      addToast('Gagal memperbarui produk.', 'error');
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      const productDocRef = doc(db, 'products', productId);
      await deleteDoc(productDocRef);
    } catch (error) {
      console.error("Error deleting product:", error);
      addToast('Gagal menghapus produk.', 'error');
    }
  };

  const importProducts = async (newProducts: Product[]) => {
    const batch = writeBatch(db);
    const productsCollection = collection(db, 'products');
    newProducts.forEach((product) => {
      const docRef = product.id ? doc(productsCollection, product.id) : doc(productsCollection);
      batch.set(docRef, product);
    });
    try {
      await batch.commit();
    } catch (error) {
       console.error("Error importing products:", error);
       addToast('Gagal mengimpor produk.', 'error');
    }
  };
  
  const getProductById = (productId: string): Product | undefined => {
    return products.find(p => p.id === productId);
  };

  return (
    <ProductContext.Provider value={{ products, loading, addProduct, updateProduct, deleteProduct, importProducts, getProductById }}>
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