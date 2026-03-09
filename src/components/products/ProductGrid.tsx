'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import ProductQuickView from './ProductQuickView';

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
    initialKarat?: number | null;
    initialType?: string | null;
    initialCategoryName?: string | null;
}

export function ProductGrid({ initialKarat, initialType, initialCategoryName }: ProductGridProps) {
    const [selectedKarat, setSelectedKarat] = useState<number | null>(initialKarat || null);
    const [selectedType, setSelectedType] = useState<string | null>(initialType || null);
    const [selectedCategoryName, setSelectedCategoryName] = useState<string | null>(initialCategoryName || null);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (initialKarat !== undefined) setSelectedKarat(initialKarat);
        if (initialType !== undefined) setSelectedType(initialType);
    }, [initialKarat, initialType]);

    useEffect(() => {
        if (initialCategoryName) {
            setSelectedCategoryName(initialCategoryName);
            setSelectedKarat(null);
            setSelectedType(null);
        }
    }, [initialCategoryName]);

    const fetchProducts = async (karat?: number, type?: string, categoryName?: string) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (karat) params.set('karat', karat.toString());
            if (type) params.set('type', type);
            if (categoryName) params.set('category', categoryName);

            const response = await fetch(`/api/products?${params.toString()}`);
            if (!response.ok) throw new Error(`Status ${response.status}`);
            const text = await response.text();
            const data = text ? JSON.parse(text) : [];
            setProducts(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching products:', error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts(selectedKarat || undefined, selectedType || undefined, selectedCategoryName || undefined);
    }, [selectedKarat, selectedType, selectedCategoryName]);

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

    return (
        <section className="py-24 px-4 min-h-screen">
            <div className="container mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h2 className="text-4xl md:text-5xl font-bold mb-4 gold-text leading-normal pb-1">
                        {selectedType
                            ? `${selectedType === 'bar' ? 'سبائك' : getProductTypes(selectedKarat || 24).find(t => t.id === selectedType)?.nameAr || ''} ${selectedKarat} عيار`
                            : selectedKarat
                                ? `منتجات ${selectedKarat} عيار`
                                : 'منتجات مختارة'
                        }
                    </h2>
                    <p className="text-gray-400 text-lg">
                        {selectedType
                            ? `أجمل تصاميم${selectedType === 'bar' ? ' السبائك' : ' ' + (getProductTypes(selectedKarat || 24).find(t => t.id === selectedType)?.nameAr || '')} ${selectedKarat} عيار`
                            : selectedKarat
                                ? `أجمل تصاميمنا الذهبية ${selectedKarat} عيار`
                                : 'مجموعة مختارة من أجمل تصاميمنا الذهبية'
                        }
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
                                    onClick={() => setSelectedKarat(karat)}
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
                                        onClick={() => setSelectedType(type.id)}
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

                {/* Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <div key={i} className="h-[400px] bg-white/5 rounded-xl animate-pulse border border-white/5"></div>
                        ))}
                    </div>
                ) : products.length > 0 ? (
                    <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                                        <CardContent className="p-4 flex flex-col h-full">
                                            {/* Image container */}
                                            <div className="aspect-square bg-gradient-to-br from-yellow-900/15 to-yellow-600/10 rounded-lg mb-4 overflow-hidden relative border border-white/5">
                                                <div className="absolute inset-0 bg-yellow-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>

                                                {product.images && product.images.length > 0 ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img
                                                        src={product.images[0]}
                                                        alt={product.nameAr}
                                                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                                        onError={(e) => {
                                                            const target = e.currentTarget;
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

                                                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4 z-20">
                                                    <ProductQuickView product={product as any} />
                                                </div>
                                            </div>

                                            <div className="mt-auto">
                                                <div className="flex items-center gap-2 mb-3 flex-wrap">
                                                    <span className="text-xs uppercase tracking-[0.18em] text-yellow-500/80">{product.productType || product.category.type}</span>
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
                ) : (
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
                )}
            </div>
        </section>
    );
}
