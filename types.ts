
export interface Variant {
  id: string;
  name: string;
  priceModifier: number; // e.g., 0 for base price, 5000 for +5000
}

export interface Product {
  id: string;
  created_at?: string; // Ditambahkan untuk pengurutan
  name: string;
  description?: string;
  price: number;
  originalPrice?: number; // For discounts
  salesCount?: number; // For best-selling sort
  stock: number; // For stock availability
  category: string;
  imageUrl: string;
  whatsappImageUrl?: string;
  variants: Variant[];
}

export interface CartItem {
  productId: string;
  variantId: string;
  quantity: number;
}

export const PaymentMethods = [
  "COD",
  "QRIS",
  "Transfer BRI",
  "Transfer SeaBank",
  "ShopeePay",
  "DANA"
];