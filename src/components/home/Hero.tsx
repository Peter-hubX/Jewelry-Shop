'use client';

import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { ProductCarousel } from './ProductCarousel';

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

interface HeroProps {
    onExploreClick: () => void;
    onProductClick?: (product: Product) => void;
}

export function Hero({ onExploreClick, onProductClick }: HeroProps) {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
            {/* Background with overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-900/20 via-black to-black z-0"></div>
            {/* Noise texture removed - was causing 404 */}

            {/* Animated Glow */}
            <motion.div
                animate={{
                    opacity: [0.3, 0.5, 0.3],
                    scale: [1, 1.1, 1],
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-yellow-600/10 rounded-full blur-[100px] z-0"
            />

            <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <h1 className="text-5xl md:text-8xl font-bold mb-6 gold-text leading-tight tracking-tight">
                        مجوهرات ميشيل
                    </h1>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                >
                    <h2 className="text-2xl md:text-4xl font-light mb-8 text-yellow-100/80 leading-tight">
                        حرفية تمتد عبر الزمن
                    </h2>
                </motion.div>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                    className="text-gray-400 text-lg md:text-xl mb-10 leading-relaxed max-w-2xl mx-auto"
                >
                    لأكثر من ستين عامًا، نقدم في مجوهرات ميشيل أجمل المجوهرات الذهبية التي تعكس الأصالة والذوق الرفيع.
                    كل قطعة نعرضها مختارة بعناية لتدوم وتُخلّد جمالك في كل لحظة.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                >
                    <Button
                        onClick={onExploreClick}
                        className="gold-gradient text-black font-bold px-10 py-6 text-lg rounded-full luxury-shadow hover:scale-105 transition-transform duration-300 relative overflow-hidden group"
                    >
                        <span className="relative z-10">استكشف مجموعتنا</span>
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                    </Button>
                </motion.div>
            </div>

            {/* Product Carousel */}
            {onProductClick && (
                <ProductCarousel onProductClick={onProductClick} />
            )}

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 1 }}
                className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
            >
                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                    <ChevronDown className="text-yellow-500/50" size={32} />
                </motion.div>
            </motion.div>
        </section>
    );
}
