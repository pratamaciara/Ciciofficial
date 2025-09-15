import React, { useState, useEffect } from 'react';
import { Product, Variant } from '../types';
import { GoogleGenAI } from "@google/genai";
import { formatCurrency } from '../utils/formatter';

interface ProductFormProps {
    onSave: (product: Product | Omit<Product, 'id'>) => void;
    onCancel: () => void;
    productToEdit?: Product | null;
}

const SparklesIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5 mr-2"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.562L16.25 21.75l-.648-1.188a2.25 2.25 0 00-1.684-1.684L12.75 18.25l1.188-.648a2.25 2.25 0 001.684-1.684L16.25 15l.648 1.188a2.25 2.25 0 001.684 1.684l1.188.648-1.188.648a2.25 2.25 0 00-1.684 1.684z" />
    </svg>
);


const ProductForm: React.FC<ProductFormProps> = ({ onSave, onCancel, productToEdit }) => {
    const isDiscounted = productToEdit && productToEdit.originalPrice && productToEdit.originalPrice > productToEdit.price;
    
    const [name, setName] = useState(productToEdit?.name || '');
    const [priceInput, setPriceInput] = useState(isDiscounted ? productToEdit.originalPrice! : productToEdit?.price || 0);
    const [discountType, setDiscountType] = useState<'none' | 'percentage' | 'fixed'>(isDiscounted ? 'fixed' : 'none');
    const [discountValue, setDiscountValue] = useState(isDiscounted ? productToEdit.originalPrice! - productToEdit.price : 0);
    const [calculatedPrice, setCalculatedPrice] = useState(productToEdit?.price || 0);
    
    const [stock, setStock] = useState(productToEdit?.stock ?? 1);
    const [salesCount, setSalesCount] = useState(productToEdit?.salesCount || 0);
    const [category, setCategory] = useState(productToEdit?.category || '');
    const [description, setDescription] = useState(productToEdit?.description || '');
    const [aiKeywords, setAiKeywords] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [imageUrl, setImageUrl] = useState(productToEdit?.imageUrl || '');
    const [whatsappImageUrl, setWhatsappImageUrl] = useState(productToEdit?.whatsappImageUrl || '');
    const [variants, setVariants] = useState<Variant[]>(
        productToEdit?.variants && productToEdit.variants.length > 0
            ? productToEdit.variants
            : [{ id: Date.now().toString(), name: '', priceModifier: 0 }]
    );
    
    useEffect(() => {
        let finalPrice = priceInput;
        if (discountType === 'percentage') {
            finalPrice = priceInput - (priceInput * (discountValue / 100));
        } else if (discountType === 'fixed') {
            finalPrice = priceInput - discountValue;
        }
        setCalculatedPrice(Math.max(0, Math.round(finalPrice)));
    }, [priceInput, discountType, discountValue]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setImageState: React.Dispatch<React.SetStateAction<string>>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageState(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleVariantChange = (index: number, field: keyof Variant, value: string | number) => {
        const newVariants = [...variants];
        if (field === 'priceModifier') {
            newVariants[index][field] = Number(value);
        } else {
            (newVariants[index][field] as string) = value as string;
        }
        setVariants(newVariants);
    };

    const addVariant = () => {
        setVariants([...variants, { id: Date.now().toString(), name: '', priceModifier: 0 }]);
    };

    const removeVariant = (index: number) => {
        setVariants(variants.filter((_, i) => i !== index));
    };

    const handleGenerateDescription = async () => {
        if (!name) {
            alert('Masukkan Nama Produk terlebih dahulu.');
            return;
        }
        setIsGenerating(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `Buat deskripsi produk yang menarik dan persuasif untuk sebuah toko online di Indonesia.
            Nama Produk: "${name}"
            Kata Kunci: "${aiKeywords || 'tidak ada'}"
            
            Gaya bahasa: Ramah, informatif, dan mengajak untuk membeli. Jelaskan keunggulan produk dengan singkat dan jelas.
            Panjang: Sekitar 2-4 paragraf pendek.
            Format: Teks biasa, gunakan paragraf untuk keterbacaan.
            
            Deskripsi Produk:`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            
            setDescription(response.text.trim());
        } catch (error) {
            console.error("Error generating description:", error);
            alert('Gagal membuat deskripsi. Coba lagi nanti.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!imageUrl) {
            alert('Gambar Utama wajib diunggah.');
            return;
        }
        const hasDiscount = discountType !== 'none' && discountValue > 0 && priceInput > calculatedPrice;
        
        const productData = {
            name,
            price: calculatedPrice,
            originalPrice: hasDiscount ? priceInput : undefined,
            category, imageUrl, description, stock,
            salesCount: salesCount > 0 ? salesCount : undefined,
            whatsappImageUrl: whatsappImageUrl || undefined,
            variants: variants.filter(v => v.name.trim() !== '')
        };

        if (productToEdit) {
            onSave({ ...productData, id: productToEdit.id });
        } else {
            onSave(productData);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Nama Produk</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary" />
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-700">Harga Normal / Asli</label>
                <input type="number" value={priceInput} onChange={e => setPriceInput(Number(e.target.value))} required min="0" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary" />
            </div>

            <div className="border-t border-b py-4 space-y-2">
                <h4 className="text-md font-medium text-gray-800">Diskon (Opsional)</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-600">Tipe Diskon</label>
                        <select value={discountType} onChange={e => setDiscountType(e.target.value as any)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:ring-primary focus:border-primary">
                            <option value="none">Tidak Ada Diskon</option>
                            <option value="percentage">Persentase (%)</option>
                            <option value="fixed">Potongan Tetap (Rp)</option>
                        </select>
                    </div>
                    {discountType !== 'none' && (
                        <div>
                            <label className="block text-xs font-medium text-gray-600">Nilai Diskon</label>
                            <input type="number" value={discountValue} onChange={e => setDiscountValue(Number(e.target.value))} min="0" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:ring-primary focus:border-primary" />
                        </div>
                    )}
                </div>
                 <div className="mt-3 p-3 bg-gray-100 rounded-md text-center">
                    <p className="text-sm font-medium text-gray-600">Harga Jual Final (Setelah Diskon)</p>
                    <p className="text-2xl font-bold text-primary">{formatCurrency(calculatedPrice)}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Kategori</label>
                    <input type="text" value={category} onChange={e => setCategory(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Stok Produk</label>
                    <input type="number" value={stock} onChange={e => setStock(Number(e.target.value))} min="0" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Jumlah Terjual (Sort)</label>
                    <input type="number" value={salesCount} onChange={e => setSalesCount(Number(e.target.value))} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary" />
                </div>
            </div>

            <div className="border-t pt-4 space-y-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Deskripsi Produk</label>
                <textarea
                    id="description"
                    rows={5}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary"
                    placeholder="Jelaskan keunggulan produk Anda..."
                />
                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                    <h4 className="text-sm font-semibold text-emerald-800 flex items-center mb-2"><SparklesIcon className="h-4 w-4 mr-1.5 text-emerald-600"/>Bantuan AI</h4>
                    <label htmlFor="aiKeywords" className="block text-xs font-medium text-gray-600">Kata Kunci (opsional, pisahkan koma)</label>
                    <input
                        type="text"
                        id="aiKeywords"
                        value={aiKeywords}
                        onChange={e => setAiKeywords(e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm py-1.5 px-2 text-sm focus:ring-primary focus:border-primary"
                        placeholder="Contoh: nyaman, katun, premium"
                    />
                    <button
                        type="button"
                        onClick={handleGenerateDescription}
                        disabled={isGenerating}
                        className="mt-2 inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-secondary hover:bg-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {isGenerating ? 'Membuat...' : 'Buat Deskripsi'}
                    </button>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Gambar Utama</label>
                <input 
                    type="file" 
                    accept="image/*"
                    onChange={e => handleImageUpload(e, setImageUrl)}
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer" 
                />
                 {imageUrl && <img src={imageUrl} alt="Preview" className="mt-2 h-24 w-24 rounded-md object-cover" />}
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Gambar WA (Opsional)</label>
                <input 
                    type="file" 
                    accept="image/*"
                    onChange={e => handleImageUpload(e, setWhatsappImageUrl)}
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                />
                {whatsappImageUrl && <img src={whatsappImageUrl} alt="Preview WA" className="mt-2 h-24 w-24 rounded-md object-cover" />}
            </div>

            <div className="border-t pt-4">
                <h3 className="text-lg font-medium text-gray-900">Varian Produk</h3>
                {variants.map((variant, index) => (
                    <div key={index} className="flex items-center space-x-2 mt-2">
                        <input type="text" placeholder="Nama Varian (e.g. Merah, L)" value={variant.name} onChange={e => handleVariantChange(index, 'name', e.target.value)} className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
                        <input type="number" placeholder="Pengubah Harga (+/-)" value={variant.priceModifier} onChange={e => handleVariantChange(index, 'priceModifier', e.target.value)} className="block w-1/3 border border-gray-300 rounded-md shadow-sm py-2 px-3" />
                        <button type="button" onClick={() => removeVariant(index)} className="text-red-500 hover:text-red-700">Hapus</button>
                    </div>
                ))}
                <button type="button" onClick={addVariant} className="mt-2 text-sm text-primary hover:underline">Tambah Varian</button>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Batal</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary">Simpan Produk</button>
            </div>
        </form>
    );
};

export default ProductForm;