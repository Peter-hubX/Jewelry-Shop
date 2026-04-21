'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useWishlistContext } from '@/context/WishlistContext';
import { translateProductType } from '@/lib/productTypeTranslations';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import ProductQuickView from './ProductQuickView';
import { ProductSkeletonGrid } from './ProductSkeleton';
import { useDebounce } from '@/hooks/useDebounce';
import Image from 'next/image';

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

interface ProductGridProps {
    readonly initialKarat?: number | null;
    readonly initialType?: string | null;
    readonly initialCategoryName?: string | null;
}

export function ProductGrid({ initialKarat, initialType, initialCategoryName }: Readonly<ProductGridProps>) {
    const [selectedKarat, setSelectedKarat] = useState<number | null>(() => {
        if (typeof window !== 'undefined') {
            const k = new URLSearchParams(window.location.search).get('karat');
            return k ? parseInt(k) : (initialKarat || null);
        }
        return initialKarat || null;
    });
    const [selectedType, setSelectedType] = useState<string | null>(() => {
        if (typeof window !== 'undefined') {
            const t = new URLSearchParams(window.location.search).get('type');
            return t || initialType || null;
        }
        return initialType || null;
    });
    const [selectedCategoryName, setSelectedCategoryName] = useState<string | null>(() => {
        if (typeof window !== 'undefined') {
            const c = new URLSearchParams(window.location.search).get('category');
            return c || initialCategoryName || null;
        }
        return initialCategoryName || null;
    });
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearchQuery = useDebounce(searchQuery, 400);
    const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc' | 'trending'>('trending');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        // Only update from parent if passed values are truthy to prevent overriding URL params on first mount
        if (initialKarat) setSelectedKarat(initialKarat);
        if (initialType) setSelectedType(initialType);
    }, [initialKarat, initialType]);

    useEffect(() => {
        if (initialCategoryName) {
            setSelectedCategoryName(initialCategoryName);
            setSelectedKarat(null);
            setSelectedType(null);
        }
    }, [initialCategoryName]);

    // Sync state changes back to URL
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const url = new URL(window.location.href);
        const searchParams = url.searchParams;

        if (selectedKarat) searchParams.set('karat', selectedKarat.toString());
        else searchParams.delete('karat');

        if (selectedType) searchParams.set('type', selectedType);
        else searchParams.delete('type');

        if (selectedCategoryName) searchParams.set('category', selectedCategoryName);
        else searchParams.delete('category');

        window.history.replaceState({}, '', url.toString());
    }, [selectedKarat, selectedType, selectedCategoryName]);

    // Progress bar animation
    useEffect(() => {
        if (!loading) {
            // When done loading, jump to 100% then reset
            setProgress(100);
            const timer = setTimeout(() => setProgress(0), 800);
            return () => clearTimeout(timer);
        }

        // While loading, increment progress gradually
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev > 90) return prev; // Cap at 90% until truly done
                return prev + Math.random() * 20;
            });
        }, 200);

        return () => clearInterval(interval);
    }, [loading]);

    const abortRef = useRef<AbortController | null>(null);

    const fetchProducts = async (karat?: number, type?: string, categoryName?: string, search?: string, fetchPage: number = 1, shouldReset: boolean = false) => {
        if (shouldReset || fetchPage === 1) {
            abortRef.current?.abort();
            const controller = new AbortController();
            abortRef.current = controller;
        }
        setLoading(true);

        try {
            const params = new URLSearchParams();
            if (karat) params.set('karat', karat.toString());
            if (type) params.set('type', type);
            if (categoryName) params.set('category', categoryName);
            if (search) params.set('search', search.trim());
            params.set('sortBy', sortBy);
            params.set('page', fetchPage.toString());
            params.set('limit', '12');

            const response = await fetch(`/api/products?${params.toString()}`, {
                signal: abortRef.current?.signal,
            });
            if (!response.ok) throw new Error(`Status ${response.status}`);
            const text = await response.text();
            
            // The API now returns { data, total, page, totalPages } when 'page' is provided
            const result = text ? JSON.parse(text) : { data: [], totalPages: 1 };
            const newData = result.data || [];

            if (shouldReset || fetchPage === 1) {
                setProducts(newData);
            } else {
                setProducts(prev => {
                    // Prevent duplicates if API returns the same items
                    const existingIds = new Set(prev.map(p => p.id));
                    const filteredNew = newData.filter((p: Product) => !existingIds.has(p.id));
                    return [...prev, ...filteredNew];
                });
            }
            
            setHasMore(fetchPage < (result.totalPages || 1));
            setPage(fetchPage);
        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') return;
            console.error('Error fetching products:', error);
            if (shouldReset || fetchPage === 1) setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        
        // Haptic feedback - vibrate pattern on click
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
            navigator.vibrate(10);
        }
        
        await fetchProducts(selectedKarat || undefined, selectedType || undefined, selectedCategoryName || undefined, debouncedSearchQuery, 1, true);
        
        // Success haptic feedback - double pulse
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
            navigator.vibrate([10, 20, 10]);
        }
        
        setIsRefreshing(false);
    };

    const handleHaptic = (pattern: number | number[] = 10) => {
        // Haptic feedback for all interactions
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
            navigator.vibrate(pattern);
        }
    };

    useEffect(() => {
        fetchProducts(selectedKarat || undefined, selectedType || undefined, selectedCategoryName || undefined, debouncedSearchQuery, 1, true);
    }, [selectedKarat, selectedType, selectedCategoryName, debouncedSearchQuery, sortBy]);

    const getProductTypes = (karat: number) => {
        if (karat === 24) {
            return [{ id: 'bar', name: 'Bars', nameAr: 'سبائك' }];
        }
        return [
            { id: 'ring', name: 'Rings', nameAr: 'خواتم' },
            { id: 'necklace', name: 'Necklaces', nameAr: 'قلادات' },
            { id: 'bracelet', name: 'Bracelets', nameAr: 'أساور' },
            { id: 'earrings', name: 'Earrings', nameAr: 'حلقان' }
        ];
    };

    const formatPrice = (price: number | null) => {
        if (price === null) return 'تواصل للسعر';
        return `${price.toLocaleString('ar-EG')} ج.م`;
    };

    const getPageTitle = () => {
        if (selectedType) {
            const typeName = selectedType === 'bar' 
              ? 'سبائك' 
              : getProductTypes(selectedKarat || 24).find(t => t.id === selectedType)?.nameAr || '';
            return `${typeName} ${selectedKarat} عيار`;
        }
        if (selectedKarat) return `منتجات ${selectedKarat} عيار`;
        return 'منتجات مختارة';
    };

    const getPageSubtitle = () => {
        if (selectedType) {
            const typeName = selectedType === 'bar'
              ? ' السبائك'
              : ` ${getProductTypes(selectedKarat || 24).find(t => t.id === selectedType)?.nameAr || ''}`;
            return `أجمل تصاميم${typeName} ${selectedKarat} عيار`;
        }
        if (selectedKarat) return `أجمل تصاميمنا الذهبية ${selectedKarat} عيار`;
        return 'مجموعة مختارة من أجمل تصاميمنا الذهبية';
    };

    const { isWishlisted, toggle } = useWishlistContext();

    return (
        <section className="py-24 px-4 min-h-screen relative">
            {/* Progress Bar */}
            <motion.div
                className="fixed top-0 left-0 h-1 bg-gradient-to-r from-yellow-500 to-yellow-600 z-50"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
            />
            
            <div className="container mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12 relative"
                >
                    {/* Refresh Button */}
                    <motion.button
                        onClick={handleRefresh}
                        disabled={loading || isRefreshing}
                        animate={{ rotate: isRefreshing ? 360 : 0 }}
                        transition={{ duration: 1, repeat: isRefreshing ? Infinity : 0 }}
                        className="absolute top-0 right-0 p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-yellow-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        title="تحديث المنتجات"
                    >
                        <svg
                            className="w-5 h-5 text-yellow-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                        </svg>
                    </motion.button>

                    <h2 className="text-4xl md:text-5xl font-bold mb-4 gold-text leading-normal pb-1">
                        {getPageTitle()}
                    </h2>
                    <p className="text-gray-400 text-lg">
                        {getPageSubtitle()}
                    </p>

                    {(selectedKarat || selectedType) && (
                        <Button
                            onClick={() => { setSelectedKarat(null); setSelectedType(null); }}
                            variant="outline"
                            className="mt-6 border-yellow-500/50 text-yellow-500 hover:bg-yellow-500 hover:text-black transition-all"
                        >
                            عرض كل المنتجات
                        </Button>
                    )}
                </motion.div>

                {/* Filters */}
                <div className="mb-12 space-y-8">
                    {!selectedKarat && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-wrap justify-center gap-4">
                            {[18, 21, 24].map((karat) => (
                                <Button
                                    key={karat}
                                    onClick={() => {
                                        handleHaptic(10);
                                        setSelectedKarat(karat);
                                    }}
                                    variant="outline"
                                    className="border-yellow-600/50 text-yellow-500 hover:bg-yellow-600 hover:text-black min-w-[100px]"
                                >
                                    {karat} عيار
                                </Button>
                            ))}
                        </motion.div>
                    )}

                    {selectedKarat && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="text-center">
                            <h3 className="text-xl font-bold mb-6 gold-text">تصفية حسب النوع</h3>
                            <div className="flex flex-wrap justify-center gap-3">
                                {getProductTypes(selectedKarat).map((type) => (
                                    <Button
                                        key={type.id}
                                        onClick={() => {
                                            handleHaptic(15);
                                            setSelectedType(type.id);
                                        }}
                                        variant={selectedType === type.id ? "default" : "outline"}
                                        className={cn(
                                            "transition-all duration-300",
                                            selectedType === type.id
                                                ? 'gold-gradient text-black font-bold shadow-lg shadow-yellow-500/20'
                                                : 'border-yellow-600/30 text-yellow-500 hover:bg-yellow-600/10'
                                        )}
                                    >
                                        {type.nameAr}
                                    </Button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Search & Sort Controls */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12 flex flex-col sm:flex-row gap-4 items-center justify-center"
                >
                    {/* Search Input */}
                    <div className="w-full sm:w-64 relative">
                        <input
                            type="text"
                            placeholder="ابحث عن المنتجات..."
                            value={searchQuery}
                            onChange={(e) => {
                                handleHaptic(5);
                                setSearchQuery(e.target.value);
                            }}
                            className="w-full px-4 py-2 pl-10 pr-10 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all"
                        />
                        <svg
                            className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                        </svg>
                        {searchQuery && (
                            <button
                                onClick={() => {
                                    handleHaptic(10);
                                    setSearchQuery('');
                                }}
                                className="absolute right-3 top-2.5 text-gray-400 hover:text-white transition-colors text-lg font-bold"
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    {/* Sort Dropdown */}
                    <select
                        value={sortBy}
                        onChange={(e) => {
                            handleHaptic(10);
                            setSortBy(e.target.value as 'newest' | 'price-asc' | 'price-desc' | 'trending');
                        }}
                        className="w-full sm:w-auto px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all cursor-pointer [&>option]:bg-gray-900 [&>option]:text-white"
                    >
                        <option value="trending">الترتيب: الأكثر طلباً</option>
                        <option value="newest">الأحدث أولاً</option>
                        <option value="price-asc">السعر: من الأقل للأعلى</option>
                        <option value="price-desc">السعر: من الأعلى للأقل</option>
                    </select>
                </motion.div>

                {/* Grid */}
                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      layout
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    >
                      <ProductSkeletonGrid count={8} />
                    </motion.div>
                  ) : products.length > 0 ? (
                    <motion.div
                      key="loaded"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5 }}
                      className="w-full"
                    >
                      <motion.div
                        layout
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                      >
                        <AnimatePresence mode="popLayout">
                          {products.map((product) => (
                          <motion.div
                            layout
                            key={product.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.3 }}
                          >
                                    <Card className="panel panel-hover transition-all duration-300 group h-full backdrop-blur-sm hover:scale-[1.02]">
                                        <CardContent className="p-4 flex flex-col h-full animate-blur-in">
                                            {/* Image container */}
                                            <div className="aspect-square bg-gradient-to-br from-yellow-900/15 to-yellow-600/10 rounded-lg mb-4 overflow-hidden relative border border-white/5">
                                                <div className="absolute inset-0 bg-yellow-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>

                                                {product.images && product.images.length > 0 ? (
                                                    <Image
                                                        src={product.images[0]}
                                                        alt={product.nameAr}
                                                        fill
                                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                        className="object-cover transform group-hover:scale-110 transition-transform duration-500 animate-image-load"
                                                        onError={(e) => {
                                                            const target = e.currentTarget as HTMLElement;
                                                            target.style.display = 'none';
                                                            const fallback = target.nextElementSibling as HTMLElement;
                                                            if (fallback) fallback.style.display = 'flex';
                                                        }}
                                                    />
                                                ) : null}

                                                {/* Fallback shown when no image or image fails to load */}
                                                <div
                                                    className="absolute inset-0 flex items-center justify-center bg-gray-900"
                                                    style={{ display: (product.images && product.images.length > 0) ? 'none' : 'flex' }}
                                                >
                                                    <div className="w-20 h-20 gold-gradient rounded-full shadow-lg flex items-center justify-center">
                                                        <span className="text-black font-bold text-xl">{product.karat}K</span>
                                                    </div>
                                                </div>

                                                {product.featured && (
                                                    <div className="absolute top-2 right-2 z-20">
                                                        <Badge variant="secondary" className="bg-yellow-500 text-black font-bold shadow-lg">
                                                            مميز
                                                        </Badge>
                                                    </div>
                                                )}

                                                {/* Wishlist Button */}
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        handleHaptic(15);
                                                        toggle(product as any);
                                                    }}
                                                    className="absolute top-2 left-2 z-30 p-2 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm transition-all duration-200 group/btn hover:scale-110 active:scale-95"
                                                    title={isWishlisted(product.id) ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
                                                    type="button"
                                                >
                                                    <svg
                                                        className={cn(
                                                            'w-5 h-5 transition-colors duration-200',
                                                            isWishlisted(product.id)
                                                                ? 'fill-red-500 text-red-500'
                                                                : 'fill-none text-white group-hover/btn:text-red-400'
                                                        )}
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                                        />
                                                    </svg>
                                                </button>

                                                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4 z-20">
                                                    <ProductQuickView product={product as any} />
                                                </div>
                                            </div>

                                            <div className="mt-auto">
                                                <div className="flex items-center gap-2 mb-3 flex-wrap">
                                                    <span className="text-xs uppercase tracking-[0.18em] text-yellow-500/80">{translateProductType(product.productType || product.category.type)}</span>
                                                    <span className="text-[11px] px-2 py-1 rounded-full pill">{product.karat} عيار</span>
                                                    {product.weight && (
                                                        <span className="text-[11px] px-2 py-1 rounded-full pill">{product.weight} جم</span>
                                                    )}
                                                </div>

                                                <h3 className="text-lg font-bold mb-2 text-yellow-100 group-hover:text-yellow-500 transition-colors">{product.nameAr}</h3>
                                                <p className="text-sm text-gray-400 mb-2">{product.category.nameAr}</p>

                                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                                                    <span className="text-yellow-500 font-bold text-lg">{formatPrice(product.price)}</span>
                                                    <span className="text-xs text-gray-400 bg-white/5 px-2 py-1 rounded">
                                                        {product.price ? 'متاح الآن' : 'تواصل للطلب'}
                                                    </span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                      </motion.div>
                      
                      {hasMore && (
                          <div className="flex justify-center mt-12 mb-8">
                              <Button 
                                  onClick={() => {
                                      handleHaptic(10);
                                      fetchProducts(selectedKarat || undefined, selectedType || undefined, selectedCategoryName || undefined, debouncedSearchQuery, page + 1, false);
                                  }}
                                  variant="outline"
                                  className="border-yellow-500/50 text-yellow-500 hover:bg-yellow-500 hover:text-black transition-all px-8 py-4 rounded-full font-bold text-lg"
                                  disabled={loading}
                              >
                                  {loading ? 'جاري التحميل...' : 'عرض المزيد من المنتجات'}
                              </Button>
                          </div>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="col-span-full"
                    >
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-24 bg-white/5 rounded-2xl border border-white/5"
                    >
                        <div className="text-6xl mb-4">💎</div>
                        <p className="text-gray-400 text-xl">لا توجد منتجات متاحة حالياً</p>
                        <Button
                            onClick={() => { setSelectedKarat(null); setSelectedType(null); }}
                            variant="link"
                            className="text-yellow-500 mt-4"
                        >
                            العودة لكل المنتجات
                        </Button>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
            </div>
        </section>
    );
}
