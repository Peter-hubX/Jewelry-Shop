'use client';

import { GoldPrices } from '@/components/gold/GoldPrices';
import { About } from '@/components/home/About';
import { Categories } from '@/components/home/Categories';
import { Contact } from '@/components/home/Contact';
import { Hero } from '@/components/home/Hero';
import { TrendingCollections } from '@/components/home/TrendingCollections';
import { Wishlist } from '@/components/home/Wishlist';
import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import { ProductGrid } from '@/components/products/ProductGrid';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

export default function Home() {
  useEffect(() => {
    // Only register service worker in production to avoid dev SW bundling issues
    if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('Service Worker registered:', registration);
          })
          .catch((error) => {
            console.error('Service Worker registration failed:', error);
          });
      });
    }
  }, []);

  const [activeTab, setActiveTab] = useState<'home' | 'products' | 'gold-info' | 'about' | 'contact' | 'wishlist'>('home');
  const [selectedKarat, setSelectedKarat] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedCategoryName, setSelectedCategoryName] = useState<string | null>(null);
  const productGridRef = useRef<HTMLDivElement>(null);

  const trustItems = [
    'شهادات معتمدة 24/21/18',
    'ضمان الأصالة والاستبدال',
    'دعم واتساب فوري'
  ];

  // Read tab parameter from URL on mount
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      const tabParam = url.searchParams.get('tab');
      if (tabParam && ['home', 'products', 'gold-info', 'about', 'contact', 'wishlist'].includes(tabParam)) {
        setActiveTab(tabParam as 'home' | 'products' | 'gold-info' | 'about' | 'contact' | 'wishlist');
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const handleProductClick = (product: any) => {
    // Navigate to product detail page
    window.location.href = `/product/${product.id}`;
  };

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    // reflect in URL so other pages (product detail) can navigate here via ?tab=
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', tab);
      window.history.pushState({}, '', url.toString());
    } catch (e) {
      // ignore
    }
  };

  const handleExploreClick = () => {
    // Switch to products tab and scroll to product grid
    setActiveTab('products');
    // Trigger recompilation
    setTimeout(() => {
      productGridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 600);
  };

  const handleCategoryClick = (karat: number) => {
    setSelectedKarat(karat);
    setSelectedType(null);
    setActiveTab('products');
    // Wait for tab switch animation then scroll to grid
    setTimeout(() => {
      productGridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 600);
  };

  // Scroll to top when activeTab changes (but not when just filtering within products)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  // Scroll to product grid when a collection is selected within the products tab
  const handleCollectionSelect = (categoryNameAr: string) => {
    setSelectedCategoryName(categoryNameAr);
    setSelectedKarat(null);
    setSelectedType(null);
    // Wait for framer-motion page transition (500ms) + render, then scroll
    setTimeout(() => {
      productGridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 600);
  };

  return (
    <div className="min-h-screen bg-black text-white font-cairo selection:bg-yellow-500/30 selection:text-yellow-500">
      <aside className="bg-gradient-to-r from-yellow-900/15 via-black to-yellow-900/15 border-b border-yellow-900/20 text-xs sm:text-sm text-yellow-100/80 px-4 sm:px-6 py-2 flex flex-wrap gap-3 justify-center">
        {trustItems.map((item) => (
          <span key={item} className="pill px-3 py-1 rounded-full flex items-center gap-2">
            <span className="glow-dot" />
            {item}
          </span>
        ))}
      </aside>

      <Navbar activeTab={activeTab} onTabChange={handleTabChange} />

      <main className="pt-20">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Hero onExploreClick={handleExploreClick} onProductClick={handleProductClick} />
              <Categories selectedKarat={selectedKarat} onSelectKarat={handleCategoryClick} />
            </motion.div>
          )}

          {activeTab === 'products' && (
            <motion.div
              key="products"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <TrendingCollections onSelect={handleCollectionSelect} />
              <div ref={productGridRef}>
                <ProductGrid initialKarat={selectedKarat} initialType={selectedType} initialCategoryName={selectedCategoryName} />
              </div>
            </motion.div>
          )}

          {activeTab === 'wishlist' && (
            <motion.div
              key="wishlist"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <Wishlist />
            </motion.div>
          )}

          {activeTab === 'gold-info' && (
            <motion.div
              key="gold-info"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <GoldPrices />
            </motion.div>
          )}

          {activeTab === 'about' && (
            <motion.div
              key="about"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <About />
            </motion.div>
          )}

          {activeTab === 'contact' && (
            <motion.div
              key="contact"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <Contact />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer onNavigate={setActiveTab} />
    </div>
  );
}