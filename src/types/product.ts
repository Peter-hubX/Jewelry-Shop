/**
 * Single source of truth for the Product type.
 * Previously defined (with minor differences) in 4 separate files:
 *   - src/app/product/[id]/page.tsx
 *   - src/components/home/Wishlist.tsx
 *   - src/context/WishlistContext.tsx
 *   - src/hooks/useWishlist.ts
 *
 * Import from here instead: import type { Product } from '@/types/product';
 */

export interface ProductCategory {
  id: string;
  name: string;
  nameAr: string;
  type: string;
}

export interface Product {
  id: string;
  name: string;
  nameAr: string;
  description: string | null;
  descriptionAr: string | null;
  price: number | null;
  karat: number;
  purity: string | null;
  productType: string | null;
  images: string[];
  inStock: boolean;
  featured: boolean;
  weight: number | null;
  certificate: string | null;
  manufacturer: string | null;
  category: ProductCategory;
}

/**
 * Minimal product shape used by the Wishlist (subset of Product).
 * The wishlist only needs to persist enough to display the card.
 */
export type WishlistProduct = Pick<
  Product,
  'id' | 'nameAr' | 'descriptionAr' | 'price' | 'karat' | 'productType' | 'images' | 'featured' | 'weight'
> & {
  category: Pick<ProductCategory, 'nameAr' | 'type'>;
};
