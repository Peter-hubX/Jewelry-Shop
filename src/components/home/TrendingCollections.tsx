'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface Category {
    id: string;
    name: string;
    nameAr: string;
    description?: string | null;
    descriptionAr?: string | null;
    karat: number;
    type: string;
}

interface TrendingCollectionsProps {
    onSelect?: (categoryNameAr: string) => void;
}

export function TrendingCollections({ onSelect }: TrendingCollectionsProps) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch('/api/categories');
                const data = await response.json();
                // Get all 21K categories (the trending collections)
                const trendingCategories = data.filter((cat: Category) => cat.karat === 21 && cat.type === 'jewelry');
                setCategories(trendingCategories);
            } catch (error) {
                console.error('Failed to fetch categories:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    const getCollectionGradient = (name: string) => {
        if (name.includes('Youth') || name.includes('الشباب')) {
            return 'from-cyan-900/20 to-blue-600/20';
        } else if (name.includes('Bridal') || name.includes('العرائس')) {
            return 'from-pink-900/20 to-rose-600/20';
        } else if (name.includes('Festival') || name.includes('المناسبات')) {
            return 'from-purple-900/20 to-violet-600/20';
        }
        return 'from-yellow-800/20 to-yellow-500/20';
    };

    const getCollectionIcon = (name: string) => {
        if (name.includes('Youth') || name.includes('الشباب')) {
            return '✨';
        } else if (name.includes('Bridal') || name.includes('العرائس')) {
            return '💍';
        } else if (name.includes('Festival') || name.includes('المناسبات')) {
            return '🎉';
        }
        return '💎';
    };

    const getCollectionImage = (category: Category) => {
        if (category.name.includes('Youth') || category.nameAr.includes('الشباب')) return '/images/collection-youth.svg';
        if (category.name.includes('Bridal') || category.nameAr.includes('العرائس')) return '/images/collection-bridal.svg';
        if (category.name.includes('Festival') || category.nameAr.includes('المناسبات')) return '/images/collection-festival.svg';
        return '/images/logo.png';
    };

    if (loading) {
        return null;
    }

    if (categories.length === 0) {
        return null;
    }

    return (
        <section className="py-24 px-4 bg-gradient-to-b from-black/30 to-black/50">
            <div className="container mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-bold mb-4 gold-text">التجميعات الرائجة</h2>
                    <p className="text-gray-400 text-lg">اكتشف مجموعاتنا الحصرية والتجميعات الأنيقة</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {categories.map((category, index) => (
                        <motion.div
                            key={category.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            <div className="block h-full" onClick={() => onSelect ? onSelect(category.nameAr) : undefined}>
                                <Card
                                    className={cn(
                                        "relative overflow-hidden border-yellow-600/30 bg-gradient-to-br cursor-pointer group transition-all duration-500 h-full hover:shadow-2xl",
                                        getCollectionGradient(category.name),
                                        'hover:border-yellow-500/50'
                                    )}
                                >
                                    <div className="absolute inset-0 bg-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                                    <CardContent className="p-4 text-center relative z-10 h-full flex flex-col justify-between">
                                        <div className="mb-4 w-full h-44 rounded-lg overflow-hidden bg-gray-800 flex items-center justify-center">
                                            <img src={getCollectionImage(category)} alt={category.nameAr} className="object-cover w-full h-full" />
                                        </div>

                                        <div className="p-4">
                                            <h3 className="text-2xl font-bold mb-3 gold-text">{category.nameAr}</h3>
                                            <p className="text-gray-400 group-hover:text-gray-300 transition-colors text-sm mb-4">{category.descriptionAr || category.description}</p>
                                        </div>

                                        <motion.div
                                            whileHover={{ scale: 1.05 }}
                                            transition={{ type: "spring", stiffness: 300 }}
                                        >
                                            <Badge className="bg-yellow-500 text-black font-bold hover:bg-yellow-400 cursor-pointer">
                                                استكشف المجموعة
                                            </Badge>
                                        </motion.div>
                                    </CardContent>
                                </Card>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
