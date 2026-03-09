'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface NavbarProps {
    activeTab: 'home' | 'products' | 'gold-info' | 'about' | 'contact';
    onTabChange: (tab: 'home' | 'products' | 'gold-info' | 'about' | 'contact') => void;
}

export function Navbar({ activeTab, onTabChange }: NavbarProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const navItems = [
        { id: 'home', label: 'الرئيسية' },
        { id: 'products', label: 'المنتجات' },
        { id: 'gold-info', label: 'أسعار الذهب' },
        { id: 'about', label: 'من نحن' },
        { id: 'contact', label: 'تواصل معنا' },
    ] as const;

    const handleTabChange = (tab: typeof activeTab) => {
        onTabChange(tab);
        setIsMenuOpen(false);
    };

    return (
        <nav className="fixed top-0 w-full bg-black/90 backdrop-blur-md z-50 border-b border-yellow-600/20 shadow-lg shadow-yellow-900/5">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <div
                        className="flex items-center space-x-3 space-x-reverse cursor-pointer"
                        onClick={() => handleTabChange('home')}
                    >
                        <div className="w-12 h-12 relative">
                            <img
                                src="/images/michiel-logo.png"
                                alt="مجوهرات ميشيل"
                                className="w-full h-full object-contain drop-shadow-[0_0_10px_rgba(212,175,55,0.3)]"
                            />
                        </div>
                        <div className="text-right hidden sm:block">
                            <h1 className="text-xl font-bold gold-text tracking-wide">مجوهرات ميشيل</h1>
                            <p className="text-[10px] text-yellow-600/80 tracking-wider">حرفية تمتد عبر الزمن</p>
                        </div>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-1 space-x-reverse bg-white/5 rounded-full px-2 py-1 border border-white/5">
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => handleTabChange(item.id)}
                                className={cn(
                                    "relative px-6 py-2 rounded-full text-sm font-medium transition-all duration-300",
                                    activeTab === item.id
                                        ? "text-black font-bold"
                                        : "text-gray-300 hover:text-white hover:bg-white/5"
                                )}
                            >
                                {activeTab === item.id && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute inset-0 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] rounded-full"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <span className="relative z-10">{item.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden text-yellow-500 p-2 hover:bg-white/5 rounded-full transition-colors"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden border-t border-yellow-600/20 bg-black/95 backdrop-blur-xl overflow-hidden"
                    >
                        <div className="flex flex-col p-4 space-y-2">
                            {navItems.map((item, index) => (
                                <motion.button
                                    key={item.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    onClick={() => handleTabChange(item.id)}
                                    className={cn(
                                        "text-right px-4 py-3 rounded-xl transition-all",
                                        activeTab === item.id
                                            ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"
                                            : "text-gray-300 hover:bg-white/5 hover:text-white"
                                    )}
                                >
                                    {item.label}
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
