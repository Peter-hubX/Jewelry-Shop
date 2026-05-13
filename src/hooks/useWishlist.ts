// src/hooks/useWishlist.ts
import type { WishlistProduct } from '@/types/product';
import { useCallback, useEffect, useState } from 'react';

const WISHLIST_KEY = 'michiel:wishlist';

export function useWishlist() {
  const [wishlist, setWishlist] = useState<WishlistProduct[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(WISHLIST_KEY);
      if (raw) setWishlist(JSON.parse(raw));
    } catch (error) {
      console.error('Failed to load wishlist:', error);
    } finally {
      setLoaded(true);
    }
  }, []);

  // Persist to localStorage whenever wishlist changes (after initial load)
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
    } catch (error) {
      console.error('Failed to save wishlist:', error);
    }
  }, [wishlist, loaded]);

  const isWishlisted = useCallback(
    (id: string) => wishlist.some(p => p.id === id),
    [wishlist]
  );

  const toggle = useCallback((product: WishlistProduct) => {
    setWishlist(prev =>
      prev.some(p => p.id === product.id)
        ? prev.filter(p => p.id !== product.id)
        : [...prev, product]
    );
  }, []);

  const remove = useCallback((id: string) => {
    setWishlist(prev => prev.filter(p => p.id !== id));
  }, []);

  const clear = useCallback(() => {
    setWishlist([]);
  }, []);

  return { wishlist, isWishlisted, toggle, remove, clear, loaded };
}
