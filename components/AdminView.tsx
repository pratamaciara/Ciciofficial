
import React, { useState, ChangeEvent } from 'react';
import { useAdminSettings } from '../context/AdminSettingsContext';
import { useProducts } from '../context/ProductContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { Product } from '../types';
import ProductForm from './ProductForm';
import { formatCurrency } from '../utils/formatter';

const AdminView: React.FC = () => {
  const { whatsAppNumber, setWhatsAppNumber } = useAdminSettings();
  const { products, addProduct, updateProduct, deleteProduct, loading: productsLoading } = useProducts();
  const { addToast } = useToast();
  const theme = useTheme();

  const [localWhatsAppNumber, setLocalWhatsAppNumber] = useState(whatsAppNumber);
  const [showProductForm, setShowProductForm] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [localTheme, setLocalTheme] = useState({
      storeName: theme.storeName,
      storeDescription: theme.storeDescription,
      instagramUrl: theme.instagramUrl,
      facebookUrl: theme.facebookUrl,
      tiktokUrl: theme.tiktokUrl,
  });
  
  const [localPopupSettings, setLocalPopupSettings] = useState(theme.popupSettings);

  // Sync local state when context data loads
  React.useEffect(() => { setLocalWhatsAppNumber(whatsAppNumber) }, [whatsAppNumber]);
  React.useEffect(() => { 
    setLocalTheme({
      storeName: theme.storeName,
      storeDescription: theme.storeDescription,
      instagramUrl: theme.instagramUrl,
      facebookUrl: theme.facebookUrl,
      tiktokUrl: theme.tiktokUrl,
    });
    setLocalPopupSettings(theme.popupSettings);
  }, [theme]);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    await setWhatsAppNumber(localWhatsAppNumber);
    addToast('Pengaturan dasar berhasil disimpan!');
    setIsSaving(false);
  };
  
  const handleLocalThemeChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setLocalTheme(prev => ({ ...prev, [name]: value }));
  };

  const handleBgImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            theme.updateThemeSettings({ backgroundImage: reader.result as string });
        };
        reader.readAsDataURL(file);
    }
  };

  const handleSaveTheme = async () => {
      setIsSaving(true);
      await theme.updateThemeSettings(localTheme);
      addToast('Pengaturan tampilan disimpan!');
      setIsSaving(false);
  };
  
  const handlePopupImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLocalPopupSettings(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSavePopupSettings = async () => {
    if (localPopupSettings.enabled && !localPopupSettings.linkProductId) {
        addToast('Pilih produk untuk ditautkan ke popup.', 'error');
        return;
    }
    setIsSaving(true);
    await theme.updateThemeSettings({ popupSettings: localPopupSettings });
    addToast('Pengaturan popup disimpan!');
    setIsSaving(false);
  };

  const handleResetBg = async () => {
      await theme.resetBackgroundImage();
      addToast('Background direset ke default.');
  };

  const handleSaveProduct = async (productData: Product | Omit<Product, 'id'>) => {
    setIsSaving(true);
    if ('id' in productData && productToEdit) {
      await updateProduct(productData);
      addToast('Produk berhasil diperbarui!');
    } else {
      await addProduct(productData as Omit<Product, 'id'>);
      addToast('Produk baru berhasil ditambahkan!');
    }
    setShowProductForm(false);
    setProductToEdit(null);
    setIsSaving(false);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus produk ini?")) {
        await deleteProduct(productId);
        addToast("Produk berhasil dihapus.");
    }
  };
  
  const handleCancelForm = () => {
    setShowProductForm(false);
    setProductToEdit(null);
  };

  const handleAddNewClick = () => {
    setProductToEdit(null);
    setShowProductForm(true);
  };

  const handleEditClick = (product: Product) => {
    setProductToEdit(product);
    setShowProductForm(true);
  };
  
  const AdminButton: React.FC<{onClick: () => void, children: React.ReactNode, disabled?: boolean}> = ({onClick, children, disabled}) => (
    <button 
      onClick={onClick} 
      disabled={isSaving || disabled}
      className={`px-4 py-2 text-white rounded-md transition-colors ${isSaving || disabled ? 'bg-gray-400' : 'bg-primary hover:bg-secondary'}`}
    >
      {isSaving ? 'Menyimpan...' : children}
    </button>
  );

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Panel Admin</h1>
      
      <div className="bg-emerald-50 border-l-4 border-emerald-500 text-emerald-900 p-4 rounded-r-lg shadow">
          <p className="font-semibold">Selamat Datang! Perubahan yang Anda simpan di sini akan langsung tampil untuk semua pengunjung.</p>
      </div>

      {/* Settings */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Pengaturan Dasar</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="waNumber" className="block text-sm font-medium text-gray-700">Nomor WhatsApp Penjual (Format: 628...)</label>
            <input
              type="text"
              id="waNumber"
              value={localWhatsAppNumber}
              onChange={(e) => setLocalWhatsAppNumber(e.target.value)}
              placeholder="Contoh: 6281234567890"
              className="mt-1 block w-full sm:w-1/2 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary"
            />
          </div>
          <AdminButton onClick={handleSaveSettings}>Simpan Pengaturan</AdminButton>
        </div>
      </div>
      
       {/* Theme Settings */}
      <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Pengaturan Tampilan</h2>
          <div className="space-y-4">
              <div>
                  <label htmlFor="storeName" className="block text-sm font-medium text-gray-700">Nama Toko</label>
                  <input type="text" id="storeName" name="storeName" value={localTheme.storeName} onChange={handleLocalThemeChange} className="mt-1 block w-full sm:w-1/2 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary" />
              </div>
              <div>
                  <label htmlFor="storeDescription" className="block text-sm font-medium text-gray-700">Deskripsi Singkat</label>
                  <textarea id="storeDescription" name="storeDescription" rows={2} value={localTheme.storeDescription} onChange={handleLocalThemeChange} className="mt-1 block w-full sm:w-1/2 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary" />
              </div>
               <div>
                  <label htmlFor="instagramUrl" className="block text-sm font-medium text-gray-700">Link Instagram</label>
                  <input type="url" id="instagramUrl" name="instagramUrl" value={localTheme.instagramUrl} onChange={handleLocalThemeChange} placeholder="https://instagram.com/toko" className="mt-1 block w-full sm:w-1/2 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary" />
              </div>
               <div>
                  <label htmlFor="facebookUrl" className="block text-sm font-medium text-gray-700">Link Facebook</label>
                  <input type="url" id="facebookUrl" name="facebookUrl" value={localTheme.facebookUrl} onChange={handleLocalThemeChange} placeholder="https://facebook.com/toko" className="mt-1 block w-full sm:w-1/2 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary" />
              </div>
               <div>
                  <label htmlFor="tiktokUrl" className="block text-sm font-medium text-gray-700">Link TikTok</label>
                  <input type="url" id="tiktokUrl" name="tiktokUrl" value={localTheme.tiktokUrl} onChange={handleLocalThemeChange} placeholder="https://tiktok.com/@toko" className="mt-1 block w-full sm:w-1/2 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary" />
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-700">Gambar Background</label>
                  <input type="file" accept="image/*" onChange={handleBgImageUpload} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer" />
                  {theme.backgroundImage && (
                      <div className="mt-2">
                          <p className="text-sm text-gray-500 mb-1">Preview:</p>
                          <img src={theme.backgroundImage} alt="Background Preview" className="h-24 w-48 rounded-md object-cover border" />
                      </div>
                  )}
              </div>
              <div className="flex space-x-2">
                  <AdminButton onClick={handleSaveTheme}>Simpan Tampilan</AdminButton>
                  <button onClick={handleResetBg} disabled={isSaving} className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:bg-gray-300">Reset Background</button>
              </div>
          </div>
      </div>
      
      {/* Popup Settings */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Pengaturan Popup Promosi</h2>
        <div className="space-y-4">
            <div className="flex items-center">
                <input type="checkbox" id="enablePopup" checked={localPopupSettings.enabled} onChange={e => setLocalPopupSettings(prev => ({ ...prev, enabled: e.target.checked }))} className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"/>
                <label htmlFor="enablePopup" className="ml-2 block text-sm text-gray-900">Aktifkan Popup Promosi</label>
            </div>
            <p className="text-xs text-gray-500">Popup akan muncul sekali per sesi browser untuk setiap pengunjung.</p>
            {localPopupSettings.enabled && (
                <>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Gambar Popup (PNG direkomendasikan)</label>
                    <input type="file" accept="image/png, image/jpeg" onChange={handlePopupImageUpload} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer" />
                    {localPopupSettings.imageUrl && (
                        <div className="mt-2">
                            <p className="text-sm text-gray-500 mb-1">Preview:</p>
                            <img src={localPopupSettings.imageUrl} alt="Popup Preview" className="h-48 w-auto rounded-md object-contain border" />
                        </div>
                    )}
                </div>
                <div>
                    <label htmlFor="popupProductLink" className="block text-sm font-medium text-gray-700">Tautkan ke Produk</label>
                    <select id="popupProductLink" value={localPopupSettings.linkProductId || ''} onChange={e => setLocalPopupSettings(prev => ({...prev, linkProductId: e.target.value || null}))} className="mt-1 block w-full sm:w-1/2 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary">
                        <option value="">-- Pilih Produk --</option>
                        {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
                </>
            )}
             <AdminButton onClick={handleSavePopupSettings}>
                Simpan Pengaturan Popup
            </AdminButton>
        </div>
      </div>

      {/* Product Management */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Manajemen Produk</h2>
            <AdminButton onClick={handleAddNewClick}>
                + Tambah Produk
            </AdminButton>
        </div>

        {showProductForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
                <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                    <h3 className="text-xl font-bold mb-4">{productToEdit ? 'Edit Produk' : 'Formulir Produk Baru'}</h3>
                    <ProductForm onSave={handleSaveProduct} onCancel={handleCancelForm} productToEdit={productToEdit} />
                </div>
            </div>
        )}
        
        <div className="mt-4 space-y-3">
            {productsLoading ? (
                <p className="text-gray-500">Memuat produk...</p>
            ) : products.length > 0 ? products.map(product => (
                <div key={product.id} className="flex items-center justify-between p-3 border rounded-md">
                    <div className="flex items-center space-x-4">
                        <img src={product.imageUrl} alt={product.name} className="w-12 h-12 rounded-md object-cover"/>
                        <div>
                            <p className="font-semibold">{product.name}</p>
                            <p className="text-sm text-gray-600">{formatCurrency(product.price)}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button onClick={() => handleEditClick(product)} className="font-semibold text-primary hover:text-secondary">
                            Edit
                        </button>
                        <button onClick={() => handleDeleteProduct(product.id)} className="font-semibold text-red-500 hover:text-red-700">
                            Hapus
                        </button>
                    </div>
                </div>
            )) : <p className="text-gray-500">Belum ada produk. Klik 'Tambah Produk' untuk memulai.</p>}
        </div>
      </div>
    </div>
  );
};

export default AdminView;
