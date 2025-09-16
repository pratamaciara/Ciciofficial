
import React, { useState, useRef, ChangeEvent } from 'react';
import { useAdminSettings } from '../context/AdminSettingsContext';
import { useProducts } from '../context/ProductContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { Product } from '../types';
import ProductForm from './ProductForm';
import { formatCurrency } from '../utils/formatter';

const SaveIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const AdminView: React.FC = () => {
  const { whatsAppNumber, setWhatsAppNumber } = useAdminSettings();
  const { products, addProduct, updateProduct, deleteProduct, importProducts, saveProducts } = useProducts();
  const { addToast } = useToast();
  const theme = useTheme();

  const [localWhatsAppNumber, setLocalWhatsAppNumber] = useState(whatsAppNumber);
  const [showProductForm, setShowProductForm] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  
  const [localTheme, setLocalTheme] = useState({
      storeName: theme.storeName,
      storeDescription: theme.storeDescription,
      instagramUrl: theme.instagramUrl,
      facebookUrl: theme.facebookUrl,
      tiktokUrl: theme.tiktokUrl,
  });
  const [localBgImage, setLocalBgImage] = useState<string | null>(null);
  
  const [localPopupSettings, setLocalPopupSettings] = useState(theme.popupSettings);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const settingsFileInputRef = useRef<HTMLInputElement>(null);


  const handleSaveSettings = () => {
    setWhatsAppNumber(localWhatsAppNumber);
    addToast('Pengaturan dasar berhasil disimpan!');
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
            setLocalBgImage(reader.result as string);
        };
        reader.readAsDataURL(file);
    }
  };

  const handleSaveTheme = () => {
      theme.updateThemeSettings(localTheme);
      if (localBgImage) {
          theme.updateThemeSettings({ backgroundImage: localBgImage });
      }
      addToast('Pengaturan tampilan disimpan!');
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

  const handleSavePopupSettings = () => {
    if (localPopupSettings.enabled && !localPopupSettings.linkProductId) {
        addToast('Pilih produk untuk ditautkan ke popup.', 'error');
        return;
    }
    theme.updateThemeSettings({ popupSettings: localPopupSettings });
    addToast('Pengaturan popup berhasil disimpan!');
  };

  const handleResetBg = () => {
      theme.resetBackgroundImage();
      setLocalBgImage(null);
      addToast('Background direset ke default.');
  };

  const handleExport = (data: any, defaultFileName: string) => {
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', defaultFileName);
    linkElement.click();
  };
  
  const handleExportProducts = () => {
    handleExport(products, 'products.json');
    addToast('Data produk diekspor!');
  };

  const handleExportSettings = () => {
    const settingsData = {
      whatsAppNumber: localWhatsAppNumber,
      theme: {
        ...localTheme,
        backgroundImage: theme.backgroundImage, // Export the saved one
        popupSettings: theme.popupSettings
      }
    };
    handleExport(settingsData, 'settings.json');
    addToast('Data pengaturan diekspor!');
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleImportSettingsClick = () => {
    settingsFileInputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result;
          if (typeof text === 'string') {
            const importedData = JSON.parse(text);
            if (Array.isArray(importedData) && importedData.every(p => p.id && p.name && typeof p.price !== 'undefined')) {
               importProducts(importedData);
               addToast('Produk berhasil diimpor!');
            } else {
               throw new Error('Invalid file format');
            }
          }
        } catch (error) {
          addToast('Gagal mengimpor: File tidak valid.', 'error');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleSettingsFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result;
          if (typeof text === 'string') {
            const settings = JSON.parse(text);
            if(settings.whatsAppNumber) {
                setLocalWhatsAppNumber(settings.whatsAppNumber);
                setWhatsAppNumber(settings.whatsAppNumber);
            }
            if(settings.theme) {
                setLocalTheme({
                    storeName: settings.theme.storeName || '',
                    storeDescription: settings.theme.storeDescription || '',
                    instagramUrl: settings.theme.instagramUrl || '',
                    facebookUrl: settings.theme.facebookUrl || '',
                    tiktokUrl: settings.theme.tiktokUrl || '',
                });
                theme.updateThemeSettings(settings.theme);
            }
            addToast('Pengaturan berhasil diimpor!');
          }
        } catch (error) {
          addToast('Gagal mengimpor: File tidak valid.', 'error');
        }
      };
      reader.readAsText(file);
    }
  };
  
  const handleSaveProduct = (product: Product) => {
    if (productToEdit) {
      updateProduct(product);
      addToast('Produk berhasil diperbarui!');
    } else {
      addProduct(product);
      addToast('Produk baru berhasil ditambahkan!');
    }
    setShowProductForm(false);
    setProductToEdit(null);
  };
  
  const handleForceSaveProducts = () => {
    saveProducts();
    addToast('Perubahan pada daftar produk telah disimpan!');
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

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Panel Admin</h1>

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
          <button onClick={handleSaveSettings} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary">
            Simpan Pengaturan
          </button>
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
                  {(localBgImage || theme.backgroundImage) && (
                      <div className="mt-2">
                          <p className="text-sm text-gray-500 mb-1">Preview:</p>
                          <img src={localBgImage || theme.backgroundImage} alt="Background Preview" className="h-24 w-48 rounded-md object-cover border" />
                      </div>
                  )}
              </div>
              <div className="flex space-x-2">
                  <button onClick={handleSaveTheme} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary">Simpan Tampilan</button>
                  <button onClick={handleResetBg} className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600">Reset Background</button>
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
             <button onClick={handleSavePopupSettings} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary">
                Simpan Pengaturan Popup
            </button>
        </div>
      </div>


      {/* Product Management */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Manajemen Produk</h2>
            <button onClick={handleAddNewClick} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary">
                + Tambah Produk
            </button>
        </div>

        {showProductForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
                <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                    <h3 className="text-xl font-bold mb-4">{productToEdit ? 'Edit Produk' : 'Formulir Produk Baru'}</h3>
                    <ProductForm onSave={handleSaveProduct} onCancel={handleCancelForm} productToEdit={productToEdit} />
                </div>
            </div>
        )}
        
        <div className="mt-4 space-y-3">
            {products.length > 0 ? products.map(product => (
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
                        <button onClick={() => deleteProduct(product.id)} className="font-semibold text-red-500 hover:text-red-700">
                            Hapus
                        </button>
                    </div>
                </div>
            )) : <p className="text-gray-500">Belum ada produk.</p>}
        </div>

        <div className="mt-6 border-t pt-4 flex justify-end">
            <button 
                onClick={handleForceSaveProducts} 
                className="inline-flex items-center px-4 py-2 bg-secondary text-white rounded-md hover:bg-primary font-semibold shadow-sm transition-colors"
            >
                <SaveIcon />
                Simpan Produk
            </button>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Manajemen Data</h2>
        
        <div className="p-4 bg-amber-50 border-l-4 border-amber-400 text-amber-800 rounded-r-lg mb-4">
            <h3 className="font-bold">Penting: Cara Menyimpan Perubahan Secara Permanen</h3>
            <p className="text-sm mt-1">Perubahan yang Anda buat di sini (produk, nomor WA, dll.) hanya tersimpan di browser Anda. Agar semua pengunjung bisa melihat perubahan tersebut, Anda harus:</p>
            <ol className="list-decimal list-inside text-sm mt-2 space-y-1">
                <li>Setelah selesai mengedit, klik tombol <strong>Ekspor</strong> di bawah untuk mengunduh data.</li>
                <li>Berikan file <strong>.json</strong> yang terunduh kepada developer Anda.</li>
                <li>Developer akan memperbarui kode sumber aplikasi dan melakukan deploy ulang.</li>
            </ol>
        </div>
        
        <div className="flex flex-wrap gap-4">
            <button onClick={handleExportProducts} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Ekspor Produk (.json)
            </button>
            <button onClick={handleImportClick} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                Impor Produk (.json)
            </button>
            <button onClick={handleExportSettings} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Ekspor Pengaturan (.json)
            </button>
            <button onClick={handleImportSettingsClick} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                Impor Pengaturan (.json)
            </button>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".json"
                className="hidden"
            />
             <input
                type="file"
                ref={settingsFileInputRef}
                onChange={handleSettingsFileChange}
                accept=".json"
                className="hidden"
            />
        </div>
      </div>

    </div>
  );
};

export default AdminView;
