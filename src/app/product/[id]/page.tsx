'use client';

import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useWishlistContext } from '@/context/WishlistContext';
import { translateProductType } from '@/lib/productTypeTranslations';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
    ArrowRight,
    ChevronLeft,
    ChevronRight,
    Mail,
    MessageCircle,
    Phone
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { CONTACT_INFO } from '../../../../michiel-jewelry-app/constants/Config';

interface Product {
    id: string;
    name: string;
    nameAr: string;
    description: string;
    descriptionAr: string;
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
    category: {
        id: string;
        name: string;
        nameAr: string;
        type: string;
    };
}

export default function ProductDetail() {
    const params = useParams();
    const router = useRouter();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [activeTab, setActiveTab] = useState<'home' | 'products' | 'gold-info' | 'about' | 'contact' | 'wishlist'>('products');
    const { isWishlisted, toggle } = useWishlistContext();

    const handleTabChange = (tab: typeof activeTab) => {
        // update local active tab state and navigate back to home with tab param
        // Use window.location.href for a full navigation to avoid hydration mismatches
        setActiveTab(tab);
        // Small delay to ensure React finishes its updates before navigating away
        setTimeout(() => {
            window.location.href = `/?tab=${tab}`;
        }, 0);
    };

    useEffect(() => {
        const fetchProduct = async () => {
            if (!params.id) return;

            try {
                const response = await fetch(`/api/products/${params.id}`);
                if (response.ok) {
                    const data = await response.json();
                    setProduct(data);
                } else {
                    console.error('Product not found');
                    router.push('/');
                }
            } catch (error) {
                console.error('Failed to fetch product:', error);
                router.push('/');
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [params.id, router]);

    const formatPrice = (price: number | null) => {
        if (price === null) return 'تواصل للسعر';
        return `${price.toLocaleString('ar-EG')} ج.م`;
    };

    const nextImage = () => {
        if (!product?.images?.length) return;
        setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
    };

    const prevImage = () => {
        if (!product?.images?.length) return;
        setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white">
                <Navbar activeTab={activeTab} onTabChange={handleTabChange} />
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
                </div>
                <Footer onNavigate={handleTabChange} />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-black text-white">
                <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold mb-4">المنتج غير موجود</h2>
                        <Button onClick={() => router.push('/')} className="gold-gradient text-black">
                            العودة للرئيسية
                        </Button>
                    </div>
                </div>
                <Footer onNavigate={setActiveTab} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white font-cairo">
            <Navbar activeTab={activeTab} onTabChange={handleTabChange} />

            <main className="pt-20 pb-16">
                <div className="container mx-auto px-4">
                    {/* Back Button */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="mb-8"
                    >
                        <Button
                            onClick={() => router.back()}
                            variant="outline"
                            className="border-yellow-500/50 text-yellow-500 hover:bg-yellow-500 hover:text-black transition-all"
                        >
                            <ArrowRight className="w-4 h-4 mr-2" />
                            العودة
                        </Button>
                    </motion.div>

                    <div className="grid lg:grid-cols-2 gap-12">
                        {/* Product Images */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                            className="space-y-4"
                        >
                            <div className="relative aspect-square bg-gradient-to-br from-yellow-900/15 to-yellow-600/10 rounded-2xl overflow-hidden">
                                {product.images && product.images.length > 0 ? (
                                    <Image
                                        src={product.images[currentImageIndex]}
                                        alt={product.nameAr}
                                        fill
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                        className="object-cover"
                                        onError={(e) => {
                                            const target = e.currentTarget as HTMLElement;
                                            target.style.display = 'none';
                                            const fallback = target.nextElementSibling as HTMLElement;
                                            if (fallback) fallback.style.display = 'flex';
                                        }}
                                    />
                                ) : null}

                                {/* Fallback */}
                                <div
                                    className="absolute inset-0 flex items-center justify-center bg-gray-900"
                                    style={{ display: (product.images && product.images.length > 0) ? 'none' : 'flex' }}
                                >
                                    <div className="w-32 h-32 gold-gradient rounded-full shadow-lg flex items-center justify-center">
                                        <span className="text-black font-bold text-4xl">{product.karat}K</span>
                                    </div>
                                </div>

                                {/* Navigation Arrows */}
                                {product.images && product.images.length > 1 && (
                                    <>
                                        <Button
                                            onClick={prevImage}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2"
                                            size="sm"
                                        >
                                            <ChevronRight className="w-5 h-5" />
                                        </Button>
                                        <Button
                                            onClick={nextImage}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2"
                                            size="sm"
                                        >
                                            <ChevronLeft className="w-5 h-5" />
                                        </Button>
                                    </>
                                )}

                                {product.featured && (
                                    <Badge className="absolute top-4 right-4 bg-yellow-500 text-black font-bold">
                                        مميز
                                    </Badge>
                                )}

                                {/* Wishlist Button */}
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        toggle(product as any);
                                    }}
                                    className="absolute top-4 left-4 z-30 p-2 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm transition-all duration-200 hover:scale-110 active:scale-95"
                                    title={isWishlisted(product.id) ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
                                    type="button"
                                >
                                    <svg
                                        className={cn(
                                            'w-6 h-6 transition-colors duration-200',
                                            isWishlisted(product.id) ? 'fill-red-500 text-red-500' : 'fill-none text-white hover:text-red-400'
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

                            {/* Image Thumbnails */}
                            {product.images && product.images.length > 1 && (
                                <div className="flex space-x-2 space-x-reverse overflow-x-auto pb-2">
                                    {product.images.map((image, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentImageIndex(index)}
                                            className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                                                index === currentImageIndex
                                                    ? 'border-yellow-500 scale-105'
                                                    : 'border-white/20 hover:border-white/40'
                                            }`}
                                        >
                                            <Image
                                                src={image}
                                                alt={`${product.nameAr} ${index + 1}`}
                                                sizes="64px"
                                                fill
                                                className="object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </motion.div>

                        {/* Product Info */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="space-y-6"
                        >
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="text-sm uppercase tracking-[0.18em] text-yellow-500/80">
                                        {translateProductType(product.productType || product.category.type)}
                                    </span>
                                    <span className="text-sm px-3 py-1 rounded-full pill">
                                        {product.karat} عيار
                                    </span>
                                    {product.weight && (
                                        <span className="text-sm px-3 py-1 rounded-full pill">
                                            {product.weight} جم
                                        </span>
                                    )}
                                    {!product.inStock && (
                                        <span className="text-sm px-3 py-1 rounded-full bg-red-500/20 text-red-400">
                                            غير متوفر
                                        </span>
                                    )}
                                </div>

                                <h1 className="text-3xl md:text-4xl font-bold text-yellow-100 mb-4">
                                    {product.nameAr}
                                </h1>

                                <div className="text-3xl font-bold text-yellow-500 mb-6">
                                    {formatPrice(product.price)}
                                </div>

                                <p className="text-gray-300 text-lg leading-relaxed mb-6">
                                    {product.descriptionAr}
                                </p>
                            </div>

                            <Separator className="bg-white/10" />

                            {/* Product Details */}
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold text-yellow-100 mb-4">تفاصيل المنتج</h3>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white/5 rounded-lg p-4">
                                        <div className="text-sm text-gray-400 mb-1">العيار</div>
                                        <div className="font-semibold">{product.karat} عيار</div>
                                    </div>

                                    <div className="bg-white/5 rounded-lg p-4">
                                        <div className="text-sm text-gray-400 mb-1">الوزن</div>
                                        <div className="font-semibold">
                                            {product.weight ? `${product.weight} جرام` : 'غير محدد'}
                                        </div>
                                    </div>

                                    <div className="bg-white/5 rounded-lg p-4">
                                        <div className="text-sm text-gray-400 mb-1">النوع</div>
                                        <div className="font-semibold">{product.category.nameAr}</div>
                                    </div>

                                    <div className="bg-white/5 rounded-lg p-4">
                                        <div className="text-sm text-gray-400 mb-1">الحالة</div>
                                        <div className="font-semibold">
                                            {product.inStock ? 'متوفر' : 'غير متوفر'}
                                        </div>
                                    </div>
                                </div>

                                {product.purity && (
                                    <div className="bg-white/5 rounded-lg p-4">
                                        <div className="text-sm text-gray-400 mb-1">النقاوة</div>
                                        <div className="font-semibold">{product.purity}</div>
                                    </div>
                                )}

                                {product.certificate && (
                                    <div className="bg-white/5 rounded-lg p-4">
                                        <div className="text-sm text-gray-400 mb-1">الشهادة</div>
                                        <div className="font-semibold">{product.certificate}</div>
                                    </div>
                                )}

                                {product.manufacturer && (
                                    <div className="bg-white/5 rounded-lg p-4">
                                        <div className="text-sm text-gray-400 mb-1">الشركة المصنعة</div>
                                        <div className="font-semibold">{product.manufacturer}</div>
                                    </div>
                                )}
                            </div>

                            <Separator className="bg-white/10" />

                            {/* Contact Actions */}
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold text-yellow-100 mb-4">تواصل معنا</h3>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Button
                                        onClick={() => window.location.href = `tel:${CONTACT_INFO.phoneNumber}`}
                                        className="gold-gradient text-black font-bold py-3 hover:scale-105 transition-transform"
                                    >
                                        <Phone className="w-4 h-4 mr-2" />
                                        اتصل الآن
                                    </Button>

                                    <Button
                                        variant="outline"
                                        onClick={() => window.open(`https://wa.me/${CONTACT_INFO.whatsappNumber.replace('+', '')}`, '_blank')}
                                        className="border-yellow-500/50 text-yellow-500 hover:bg-yellow-500 hover:text-black py-3"
                                    >
                                        <MessageCircle className="w-4 h-4 mr-2" />
                                        واتساب
                                    </Button>

                                    <Button
                                        variant="outline"
                                        onClick={() => window.location.href = `mailto:info@michieljewelry.com?subject=${encodeURIComponent('استفسار عن ' + (product.name || product.nameAr))}`}
                                        className="border-yellow-500/50 text-yellow-500 hover:bg-yellow-500 hover:text-black py-3"
                                    >
                                        <Mail className="w-4 h-4 mr-2" />
                                        بريد إلكتروني
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </main>

            <Footer onNavigate={handleTabChange} />
        </div>
    );
}