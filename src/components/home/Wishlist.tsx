'use client';

import { useWishlistContext } from '@/context/WishlistContext';
import { translateProductType } from '@/lib/productTypeTranslations';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
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

export function Wishlist() {
    const router = useRouter();
    const { wishlist, isWishlisted, toggle } = useWishlistContext();
    const [mounted, setMounted] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const fetchWishlistProducts = async () => {
            if (!mounted || wishlist.length === 0) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                // Fetch all products from wishlist
                const response = await fetch(`/api/products`);
                if (response.ok) {
                    const allProducts = await response.json();
                    // Filter to only include products in the wishlist
                    const wishlistProducts = allProducts.filter((p: Product) =>
                        wishlist.some(w => w.id === p.id)
                    );
                    setProducts(wishlistProducts);
                } else {
                    setProducts([]);
                }
            } catch (error) {
                console.error('Failed to fetch wishlist products:', error);
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchWishlistProducts();
    }, [wishlist, mounted]);

    if (!mounted) {
        return (
            <div className="min-h-screen bg-black text-white">
                <div className="container mx-auto px-4 py-12 text-center">
                    <div className="animate-pulse">جاري التحميل...</div>
                </div>
            </div>
        );
    }

    if (wishlist.length === 0) {
        return (
            <section className="py-24 px-4 min-h-screen bg-black">
                <div className="container mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center space-y-8"
                    >
                        <div className="w-24 h-24 mx-auto bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 rounded-full flex items-center justify-center">
                            <Heart className="w-12 h-12 text-yellow-500" />
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-4xl md:text-5xl font-bold gold-text">قائمة المفضلة فارغة</h2>
                            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                                لم تضف أي منتجات إلى قائمة مفضلتك حتى الآن. ابدأ باستكشاف منتجاتنا الفاخرة!
                            </p>
                        </div>

                        <motion.button
                            onClick={() => router.push('/?tab=products')}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="inline-flex items-center gap-2 px-8 py-3 rounded-full gold-gradient text-black font-bold transition-all hover:shadow-lg hover:shadow-yellow-500/30"
                        >
                            <ShoppingBag className="w-5 h-5" />
                            تصفح المنتجات
                        </motion.button>
                    </motion.div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-24 px-4 min-h-screen bg-black">
            <div className="container mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-bold mb-4 gold-text leading-normal pb-1">
                        قائمة مفضلتي
                    </h2>
                    <p className="text-gray-400 text-lg">
                        {wishlist.length} {wishlist.length === 1 ? 'منتج' : 'منتجات'} في قائمة المفضلة
                    </p>
                </motion.div>

                {/* Loading */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <div className="aspect-square bg-white/5 rounded-2xl mb-4" />
                                <div className="h-4 bg-white/5 rounded w-3/4 mb-2" />
                                <div className="h-4 bg-white/5 rounded w-1/2" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {products.map((product, index) => (
                            <motion.div
                                key={product.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="group cursor-pointer"
                                onClick={() => router.push(`/product/${product.id}`)}
                            >
                                <div className="relative aspect-square bg-gradient-to-br from-yellow-900/15 to-yellow-600/10 rounded-2xl overflow-hidden mb-4">
                                    {product.images && product.images.length > 0 ? (
                                        <Image
                                            src={product.images[0]}
                                            alt={product.nameAr}
                                            fill
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-900">
                                            <div className="w-20 h-20 gold-gradient rounded-full flex items-center justify-center">
                                                <span className="text-black font-bold text-2xl">{product.karat}K</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Featured Badge */}
                                    {product.featured && (
                                        <div className="absolute top-3 right-3 px-3 py-1 bg-yellow-500 text-black text-xs font-bold rounded-full">
                                            مميز
                                        </div>
                                    )}

                                    {/* Wishlist Button */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggle(product);
                                        }}
                                        className="absolute top-3 left-3 p-2 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm transition-all duration-200 hover:scale-110 active:scale-95"
                                        title="إزالة من المفضلة"
                                        type="button"
                                    >
                                        <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-xs text-yellow-500/80 uppercase tracking-wider">
                                            {translateProductType(product.productType || product.category.type)}
                                        </span>
                                        <span className="text-xs px-2 py-1 rounded-full pill">
                                            {product.karat} عيار
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-bold text-yellow-100 group-hover:text-yellow-400 transition-colors line-clamp-1">
                                        {product.nameAr}
                                    </h3>

                                    <p className="text-gray-400 text-sm line-clamp-2">
                                        {product.descriptionAr}
                                    </p>

                                    {product.price !== null ? (
                                        <div className="text-xl font-bold text-yellow-500 pt-2">
                                            {product.price.toLocaleString('ar-EG')} ج.م
                                        </div>
                                    ) : (
                                        <div className="text-lg font-semibold text-yellow-500 pt-2">
                                            تواصل للسعر
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
