'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useWishlistContext } from '@/context/WishlistContext';
import { translateProductType } from '@/lib/productTypeTranslations';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';

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

interface ProductCarouselProps {
    onProductClick: (product: Product) => void;
}

export function ProductCarousel({ onProductClick }: ProductCarouselProps) {
    const [products, setProducts] = useState<Product[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const { isWishlisted, toggle } = useWishlistContext();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // Fetch products from 18K and 21K karat
                const response = await fetch('/api/products?karat=18&karat=21&limit=6');
                if (response.ok) {
                    const data = await response.json();
                    if (data.length >= 6) {
                        setProducts(data.slice(0, 6));
                    } else {
                        // If not enough 18K/21K products, get additional products
                        const additionalResponse = await fetch('/api/products?limit=6');
                        if (additionalResponse.ok) {
                            const allData = await additionalResponse.json();
                            // Combine 18K/21K and other products, prioritizing 18K/21K ones
                            const combined = [...data, ...allData.filter(p => !data.find(dp => dp.id === p.id))];
                            setProducts(combined.slice(0, 6));
                        } else {
                            // Fallback to available products
                            setProducts(data);
                        }
                    }
                } else {
                    // Fallback to regular products if karat filter fails
                    const response = await fetch('/api/products?limit=6');
                    if (response.ok) {
                        const data = await response.json();
                        setProducts(data.slice(0, 6));
                    }
                }
            } catch (error) {
                console.error('Failed to fetch products:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    // Auto-rotate every 4 seconds
    useEffect(() => {
        if (products.length === 0) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % products.length);
        }, 4000);

        return () => clearInterval(interval);
    }, [products.length]);

    const nextProduct = () => {
        setCurrentIndex((prev) => (prev + 1) % products.length);
    };

    const prevProduct = () => {
        setCurrentIndex((prev) => (prev - 1 + products.length) % products.length);
    };

    const formatPrice = (price: number | null) => {
        if (price === null) return 'تواصل للسعر';
        return `${price.toLocaleString('ar-EG')} ج.م`;
    };

    if (loading) {
        return (
            <div className="w-full max-w-4xl mx-auto">
                <div className="aspect-[16/9] bg-white/5 rounded-2xl animate-pulse"></div>
            </div>
        );
    }

    if (products.length === 0) {
        return null;
    }

    const currentProduct = products[currentIndex];

    return (
        <div className="w-full max-w-6xl mx-auto mt-16 mb-8">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="text-center mb-8"
            >
                <h3 className="text-2xl md:text-3xl font-bold gold-text mb-2">
                    منتجات مميزة
                </h3>
                <p className="text-gray-400 text-sm md:text-base">
                    اكتشف أحدث تصاميمنا المختارة بعناية
                </p>
            </motion.div>

            <div className="relative">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.5 }}
                        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/10 luxury-shadow"
                    >
                        <div className="grid md:grid-cols-2 gap-0 min-h-[400px]">
                            {/* Product Image */}
                            <div className="relative overflow-hidden group cursor-pointer" onClick={() => onProductClick(currentProduct)}>
                                <div className="aspect-square bg-gradient-to-br from-yellow-900/15 to-yellow-600/10 relative">
                                    {currentProduct.images && currentProduct.images.length > 0 ? (
                                        <img
                                            src={currentProduct.images[0]}
                                            alt={currentProduct.nameAr}
                                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                            onError={(e) => {
                                                const target = e.currentTarget;
                                                target.style.display = 'none';
                                                const fallback = target.nextElementSibling as HTMLElement;
                                                if (fallback) fallback.style.display = 'flex';
                                            }}
                                        />
                                    ) : null}

                                    {/* Fallback */}
                                    <div
                                        className="absolute inset-0 flex items-center justify-center bg-gray-900"
                                        style={{ display: (currentProduct.images && currentProduct.images.length > 0) ? 'none' : 'flex' }}
                                    >
                                        <div className="w-24 h-24 gold-gradient rounded-full shadow-lg flex items-center justify-center">
                                            <span className="text-black font-bold text-2xl">{currentProduct.karat}K</span>
                                        </div>
                                    </div>

                                    {/* Overlay on hover */}
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                        <div className="text-white text-center">
                                            <div className="text-lg font-bold mb-2">عرض التفاصيل</div>
                                            <div className="text-sm">اضغط للمزيد من المعلومات</div>
                                        </div>
                                    </div>

                                    {currentProduct.featured && (
                                        <Badge className="absolute top-4 right-4 bg-yellow-500 text-black font-bold">
                                            مميز
                                        </Badge>
                                    )}

                                    {/* Wishlist Button */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggle(currentProduct as any);
                                        }}
                                        className="absolute top-4 left-4 p-2 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm transition-all duration-200 hover:scale-110 active:scale-95"
                                        title={isWishlisted(currentProduct.id) ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
                                        type="button"
                                    >
                                        <svg
                                            className={cn(
                                                'w-5 h-5 transition-colors duration-200',
                                                isWishlisted(currentProduct.id)
                                                    ? 'fill-red-500 text-red-500'
                                                    : 'fill-none text-white hover:text-red-400'
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
                                </div>
                            </div>

                            {/* Product Info */}
                            <div className="p-8 flex flex-col justify-center">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-xs uppercase tracking-[0.18em] text-yellow-500/80">{translateProductType(currentProduct.productType || currentProduct.category.type)}</span>
                                        <span className="text-sm px-3 py-1 rounded-full pill">{currentProduct.karat} عيار</span>
                                        {currentProduct.weight && (
                                            <span className="text-sm px-3 py-1 rounded-full pill">{currentProduct.weight} جم</span>
                                        )}
                                    </div>

                                    <h4 className="text-2xl md:text-3xl font-bold text-yellow-100 mb-2">
                                        {currentProduct.nameAr}
                                    </h4>

                                    <p className="text-gray-400 text-sm md:text-base mb-4 leading-relaxed">
                                        {currentProduct.descriptionAr}
                                    </p>

                                    <div className="flex items-center justify-between mb-6">
                                        <span className="text-yellow-500 font-bold text-2xl">
                                            {formatPrice(currentProduct.price)}
                                        </span>
                                        <span className="text-gray-400 text-sm">
                                            {currentProduct.category.nameAr}
                                        </span>
                                    </div>

                                    <Button
                                        onClick={() => onProductClick(currentProduct)}
                                        className="gold-gradient text-black font-bold px-6 py-3 rounded-full w-full hover:scale-105 transition-transform duration-300"
                                    >
                                        عرض التفاصيل
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Navigation Arrows */}
                {products.length > 1 && (
                    <>
                        <Button
                            onClick={nextProduct}
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white border border-white/20 rounded-full p-3 backdrop-blur-sm"
                            size="sm"
                            aria-label="التالي"
                            title="التالي"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </Button>

                        <Button
                            onClick={prevProduct}
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white border border-white/20 rounded-full p-3 backdrop-blur-sm"
                            size="sm"
                            aria-label="السابق"
                            title="السابق"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </Button>
                    </>
                )}

                {/* Dots Indicator: larger gap + bigger tappable area to avoid overlap */}
                {products.length > 1 && (
                    <div className="flex justify-center mt-6 gap-3">
                        {products.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                aria-label={`انتقال للمنتج ${index + 1}`}
                                className={`p-2 rounded-full transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-400`}
                            >
                                <span
                                    className={`inline-block rounded-full transition-all duration-200 ${
                                        index === currentIndex
                                            ? 'w-4 h-4 bg-yellow-500 scale-110'
                                            : 'w-3 h-3 bg-white/30 hover:bg-white/50'
                                    }`}
                                />
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}