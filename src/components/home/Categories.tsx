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

interface CategoriesProps {
    selectedKarat: number | null;
    onSelectKarat: (karat: number) => void;
}

export function Categories({ selectedKarat, onSelectKarat }: CategoriesProps) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch('/api/categories');
                const data = await response.json();
                setCategories(data);
            } catch (error) {
                console.error('Failed to fetch categories:', error);
                // Fallback to default categories
                setCategories([
                    {
                        id: '1',
                        karat: 18,
                        name: '18 Karat Gold',
                        nameAr: 'ذهب 18 عيار',
                        description: 'Modern designs for contemporary taste',
                        descriptionAr: 'تصاميم حديثة للذوق العصري',
                        type: 'jewelry',
                    },
                    {
                        id: '2',
                        karat: 21,
                        name: '21 Karat Gold',
                        nameAr: 'ذهب 21 عيار',
                        description: 'Classic traditional designs',
                        descriptionAr: 'تصاميم كلاسيكية وتراثية',
                        type: 'jewelry',
                    },
                    {
                        id: '3',
                        karat: 24,
                        name: '24 Karat Gold Bars',
                        nameAr: 'سبائك ذهب 24 عيار',
                        description: 'Certified investment gold bars',
                        descriptionAr: 'سبائك ذهب معتمدة للاستثمار',
                        type: 'bar',
                    },
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    const getGradient = (karat: number) => {
        switch (karat) {
            case 18:
                return 'from-yellow-900/20 to-yellow-600/20';
            case 21:
                return 'from-yellow-800/20 to-yellow-500/20';
            case 24:
                return 'from-yellow-700/20 to-yellow-400/20';
            default:
                return 'from-yellow-800/20 to-yellow-500/20';
        }
    };

    if (loading) {
        return (
            <section className="py-24 px-4 bg-black/50">
                <div className="container mx-auto">
                    <div className="text-center text-gray-400">جاري التحميل...</div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-24 px-4 bg-black/50">
            <div className="container mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-bold mb-4 gold-text">فئات الذهب</h2>
                    <p className="text-gray-400 text-lg">اختر عيار الذهب المناسب لك</p>
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
                            <Card
                                className={cn(
                                    "relative overflow-hidden border-yellow-600/30 bg-gradient-to-br cursor-pointer group transition-all duration-500",
                                    getGradient(category.karat),
                                    selectedKarat === category.karat ? 'ring-2 ring-yellow-500 shadow-[0_0_30px_rgba(212,175,55,0.2)]' : 'hover:border-yellow-500/50'
                                )}
                                onClick={() => onSelectKarat(category.karat)}
                            >
                                <div className="absolute inset-0 bg-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                                <CardContent className="p-10 text-center relative z-10">
                                    <motion.div
                                        whileHover={{ scale: 1.1, rotate: 5 }}
                                        transition={{ type: "spring", stiffness: 300 }}
                                        className="w-24 h-24 gold-gradient rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg shadow-black/50"
                                    >
                                        <span className="text-black font-bold text-3xl font-serif">{category.karat}</span>
                                    </motion.div>

                                    <h3 className="text-2xl font-bold mb-3 gold-text">{category.nameAr}</h3>
                                    <p className="text-gray-400 group-hover:text-gray-300 transition-colors">{category.descriptionAr || category.description}</p>

                                    {selectedKarat === category.karat && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.5 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                        >
                                            <Badge className="mt-4 bg-yellow-500 text-black font-bold hover:bg-yellow-400">محدد</Badge>
                                        </motion.div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
