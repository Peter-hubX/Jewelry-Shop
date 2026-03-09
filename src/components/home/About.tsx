'use client';

import { motion } from 'framer-motion';

export function About() {
    return (
        <section className="py-24 px-4 min-h-screen flex items-center">
            <div className="container mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="order-2 lg:order-1"
                    >
                        <div className="relative">
                            <div className="absolute inset-0 bg-yellow-500/20 blur-3xl rounded-full"></div>
                            <img
                                src="/images/michiel-logo.png"
                                alt="عن مجوهرات ميشيل"
                                className="relative z-10 rounded-2xl shadow-2xl border border-white/10 hover:scale-105 transition-all duration-700 w-full"
                            />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-right order-1 lg:order-2"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold mb-8 gold-text leading-normal">عن مجوهرات ميشيل</h2>
                        <div className="space-y-6 text-lg text-gray-300 leading-relaxed">
                            <p>
                                منذ أكثر من ستين عامًا، ونحن في مجوهرات ميشيل لا نصنع المجوهرات الذهبية فحسب،
                                بل نصنع علاقات دائمة مع عملائنا. بدأت رحلتنا كمتجر صغير يخدم أفراد العائلة والأصدقاء،
                                واليوم أصبحنا وجهة لكل من يبحث عن الأصالة والجودة والخدمة الاستثنائية.
                            </p>
                            <p>
                                نفخر بأن كل قطعة تخرج من متجرنا ليست مجرد منتج، بل هي قصة من الثقة والاهتمام.
                                فريقنا من الخبراء يكرس وقته لفهم احتياجاتك وتقديم المشورة الصادقة،
                                ليساعدك في اختيار القطعة المثالية التي تعبر عن ذوقك وتلبي متطلباتك.
                            </p>
                            <p>
                                نحن نؤمن بأن الذهب ليس مجرد زينة، بل هو استثمار في الجمال والمستقبل.
                                لذلك نحرص على تقديم أفضل الأسعار وأعلى معايير النقاء، مع ضمانات موثوقة وخدمة ما بعد البيع متميزة.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
