'use client';

import { useWishlist } from '@/hooks/useWishlist';
import type { WishlistProduct } from '@/types/product';
import { createContext, ReactNode, useContext } from 'react';

interface WishlistContextType {
  wishlist: WishlistProduct[];
  isWishlisted: (id: string) => boolean;
  toggle: (product: WishlistProduct) => void;
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
