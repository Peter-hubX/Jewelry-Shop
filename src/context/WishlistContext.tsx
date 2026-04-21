'use client';

import { useWishlist } from '@/hooks/useWishlist';
import { createContext, ReactNode, useContext } from 'react';

interface Product {
  id: string;
  nameAr: string;
  descriptionAr: string;
  price: number | null;
  karat: number;
  productType: string | null;
  category: {
    nameAr: string;
    type: string;
  };
  images: string[];
  featured: boolean;
  weight?: number | null;
}

interface WishlistContextType {
  wishlist: Product[];
  isWishlisted: (id: string) => boolean;
  toggle: (product: Product) => void;
  remove: (id: string) => void;
  clear: () => void;
  loaded: boolean;
}

const WishlistContext = createContext<WishlistContextType | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const value = useWishlist();
  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlistContext() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlistContext must be used inside WishlistProvider');
  }
  return context;
}
