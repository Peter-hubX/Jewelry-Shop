'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Clock, Mail, MapPin, Phone } from 'lucide-react';

export function Contact() {
    return (
        <section className="py-24 px-4 min-h-screen">
            <div className="container mx-auto max-w-6xl">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-bold mb-4 gold-text leading-normal pb-1">تواصل معنا</h2>
                    <p className="text-gray-400 text-lg">نحن هنا لمساعدتك في اختيار مجوهراتك المفضلة</p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Contact Info Cards */}
                    <div className="lg:col-span-1 space-y-6">
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                            <Card className="bg-gray-900/40 border-yellow-600/20 luxury-shadow">
                                <CardContent className="p-6 flex items-center gap-4 text-right">
                                    <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500 shrink-0">
                                        <Phone size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white mb-1">اتصل بنا</h3>
                                        <p className="text-gray-400 text-sm" dir="ltr">+20 123 456 7890</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                            <Card className="bg-gray-900/40 border-yellow-600/20 luxury-shadow">
                                <CardContent className="p-6 flex items-center gap-4 text-right">
                                    <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500 shrink-0">
                                        <Mail size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white mb-1">البريد الإلكتروني</h3>
                                        <p className="text-gray-400 text-sm">info@michiel-jewelry.com</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                            <Card className="bg-gray-900/40 border-yellow-600/20 luxury-shadow">
                                <CardContent className="p-6 flex items-center gap-4 text-right">
                                    <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500 shrink-0">
                                        <MapPin size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white mb-1">العنوان</h3>
                                        <p className="text-gray-400 text-sm">شارع الصاغة، الحسين، القاهرة</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                            <Card className="bg-gray-900/40 border-yellow-600/20 luxury-shadow">
                                <CardContent className="p-6 flex items-center gap-4 text-right">
                                    <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500 shrink-0">
                                        <Clock size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white mb-1">ساعات العمل</h3>
                                        <p className="text-gray-400 text-sm">يومياً من 11 صباحاً - 10 مساءً</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>

                    {/* Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="lg:col-span-2"
                    >
                        <Card className="bg-gray-900/40 border-yellow-600/20 luxury-shadow h-full">
                            <CardContent className="p-8">
                                <h3 className="text-2xl font-bold text-white mb-6 text-right">أرسل لنا رسالة</h3>
                                <form className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2 text-right">
                                            <label className="text-sm text-gray-400">الاسم</label>
                                            <input type="text" className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-yellow-500 focus:outline-none transition-colors text-right" />
                                        </div>
                                        <div className="space-y-2 text-right">
                                            <label className="text-sm text-gray-400">رقم الهاتف</label>
                                            <input type="tel" className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-yellow-500 focus:outline-none transition-colors text-right" />
                                        </div>
                                    </div>
                                    <div className="space-y-2 text-right">
                                        <label className="text-sm text-gray-400">البريد الإلكتروني</label>
                                        <input type="email" className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-yellow-500 focus:outline-none transition-colors text-right" />
                                    </div>
                                    <div className="space-y-2 text-right">
                                        <label className="text-sm text-gray-400">الرسالة</label>
                                        <textarea rows={5} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-yellow-500 focus:outline-none transition-colors text-right resize-none"></textarea>
                                    </div>
                                    <Button className="w-full gold-gradient text-black font-bold py-6 text-lg hover:scale-[1.02] transition-transform">
                                        إرسال الرسالة
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
