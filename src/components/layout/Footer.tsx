'use client';

import { Facebook, Instagram, Mail, MapPin, Phone, Twitter } from 'lucide-react';

interface FooterProps {
    onNavigate: (tab: 'home' | 'products' | 'gold-info' | 'about' | 'contact') => void;
}

export function Footer({ onNavigate }: FooterProps) {
    const handleNavigation = (tab: 'home' | 'products' | 'gold-info' | 'about' | 'contact') => {
        onNavigate(tab);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <footer className="bg-black border-t border-yellow-900/20 pt-16 pb-8" suppressHydrationWarning>
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div className="text-right">
                        <h2 className="text-2xl font-bold gold-text mb-4">مجوهرات ميشيل</h2>
                        <p className="text-gray-400 leading-relaxed mb-6">
                            حرفية تمتد عبر الزمن. نقدم أجمل المجوهرات الذهبية التي تعكس الأصالة والذوق الرفيع منذ أكثر من 60 عاماً.
                        </p>
                        <div className="flex gap-4 justify-end">
                            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-yellow-500 hover:text-black transition-all">
                                <Instagram size={20} />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-yellow-500 hover:text-black transition-all">
                                <Facebook size={20} />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-yellow-500 hover:text-black transition-all">
                                <Twitter size={20} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="text-right">
                        <h3 className="text-lg font-bold text-white mb-6">روابط سريعة</h3>
                        <ul className="space-y-3">
                            <li>
                                <button onClick={() => handleNavigation('home')} className="text-gray-400 hover:text-yellow-500 transition-colors">
                                    الرئيسية
                                </button>
                            </li>
                            <li>
                                <button onClick={() => handleNavigation('products')} className="text-gray-400 hover:text-yellow-500 transition-colors">
                                    المنتجات
                                </button>
                            </li>
                            <li>
                                <button onClick={() => handleNavigation('gold-info')} className="text-gray-400 hover:text-yellow-500 transition-colors">
                                    أسعار الذهب
                                </button>
                            </li>
                            <li>
                                <button onClick={() => handleNavigation('about')} className="text-gray-400 hover:text-yellow-500 transition-colors">
                                    من نحن
                                </button>
                            </li>
                            <li>
                                <button onClick={() => handleNavigation('contact')} className="text-gray-400 hover:text-yellow-500 transition-colors">
                                    تواصل معنا
                                </button>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="text-right">
                        <h3 className="text-lg font-bold text-white mb-6 text-right leading-normal pb-1">تواصل معنا</h3>
                        <ul className="space-y-4">
                            <li className="grid grid-cols-[auto_1fr] items-center gap-3 text-gray-400">
                                <Phone size={18} className="text-yellow-500 justify-self-end" />
                                <span className="text-right">+20 123 456 7890</span>
                            </li>
                            <li className="grid grid-cols-[auto_1fr] items-center gap-3 text-gray-400">
                                <Mail size={18} className="text-yellow-500 justify-self-end" />
                                <span className="text-right">info@michiel-jewelry.com</span>
                            </li>
                            <li className="grid grid-cols-[auto_1fr] items-center gap-3 text-gray-400">
                                <MapPin size={18} className="text-yellow-500 justify-self-end" />
                                <span className="text-right">القاهرة، مصر</span>
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div className="text-right">
                        <h3 className="text-lg font-bold text-white mb-6">النشرة البريدية</h3>
                        <p className="text-gray-400 mb-4">اشترك ليصلك كل جديد عن منتجاتنا وعروضنا</p>
                        <div className="flex gap-2">
                            <button className="bg-yellow-500 text-black px-4 py-2 rounded-l-lg font-bold hover:bg-yellow-400 transition-colors">
                                اشتراك
                            </button>
                            <input
                                type="email"
                                placeholder="بريدك الإلكتروني"
                                className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 w-full text-right focus:outline-none focus:border-yellow-500/50"
                            />
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-8 text-center">
                    <p className="text-gray-500 text-sm">
                        © {new Date().getFullYear()} مجوهرات ميشيل. جميع الحقوق محفوظة.
                    </p>
                </div>
            </div>
        </footer>
    );
}
