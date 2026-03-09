'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AnimatePresence, motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';

// Egyptian gold market hours: Sunday–Thursday 10:00–18:00 Cairo time (UTC+2)
function getMarketStatus(): { isOpen: boolean; label: string; nextEvent: string } {
    const now = new Date();
    // Cairo is UTC+2
    const cairoOffset = 2 * 60;
    const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
    const cairoMinutes = (utcMinutes + cairoOffset) % (24 * 60);
    const cairoDay = new Date(now.getTime() + cairoOffset * 60000).getUTCDay(); // 0=Sun

    const openMinutes = 10 * 60;  // 10:00
    const closeMinutes = 18 * 60; // 18:00
    const isWeekday = cairoDay >= 0 && cairoDay <= 4; // Sun–Thu
    const isOpen = isWeekday && cairoMinutes >= openMinutes && cairoMinutes < closeMinutes;

    const pad = (n: number) => String(n).padStart(2, '0');
    const fmt = (totalMins: number) => {
        const diff = totalMins * 60000;
        const h = Math.floor(Math.abs(totalMins) / 60);
        const m = Math.abs(totalMins) % 60;
        return `${pad(h)}:${pad(m)}`;
    };

    let nextEvent = '';
    if (isOpen) {
        const minsToClose = closeMinutes - cairoMinutes;
        const h = Math.floor(minsToClose / 60);
        const m = minsToClose % 60;
        nextEvent = `${pad(h)}:${pad(m)}:00`;
    } else {
        // Show time until next open
        let minsToOpen = openMinutes - cairoMinutes;
        if (minsToOpen <= 0) minsToOpen += 24 * 60;
        const h = Math.floor(minsToOpen / 60);
        const m = minsToOpen % 60;
        nextEvent = `${pad(h)}:${pad(m)}:00`;
    }

    return { isOpen, label: isOpen ? 'سوق الذهب مفتوح' : 'سوق الذهب مغلق', nextEvent };
}

export function GoldPrices() {
    const [goldPrices, setGoldPrices] = useState<{ basePrice: number, karat18: number, karat21: number, karat24: number, usdRate: number } | null>(null);
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [marketStatus, setMarketStatus] = useState(getMarketStatus());
    const [countdown, setCountdown] = useState<string>('');

    const fetchGoldPrices = async () => {
        setIsUpdating(true);
        try {
            const response = await fetch('/api/gold-prices');
            if (!response.ok) throw new Error(`Status ${response.status}`);
            const text = await response.text();
            if (!text) throw new Error('Empty response');
            const data = JSON.parse(text);
            if (data.success) {
                setGoldPrices({
                    basePrice: data.data.karat24Price,
                    karat18: data.data.karat18Price,
                    karat21: data.data.karat21Price,
                    karat24: data.data.karat24Price,
                    usdRate: data.data.usdRate || 50.5
                });
            }
        } catch (error) {
            console.error('Failed to fetch gold prices:', error);
        } finally {
            setIsUpdating(false);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGoldPrices();
        const interval = setInterval(fetchGoldPrices, 60000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const tick = () => {
            const status = getMarketStatus();
            setMarketStatus(status);
            setCountdown(status.nextEvent);
        };
        tick();
        const interval = setInterval(tick, 1000);
        return () => clearInterval(interval);
    }, []);

    const priceCards = [
        { karat: 24, label: 'ذهب 24 عيار', price: goldPrices?.karat24, color: 'text-yellow-400' },
        { karat: 21, label: 'ذهب 21 عيار', price: goldPrices?.karat21, color: 'text-yellow-500' },
        { karat: 18, label: 'ذهب 18 عيار', price: goldPrices?.karat18, color: 'text-yellow-600' },
    ];

    return (
        <section className="py-24 px-4 min-h-screen">
            <div className="container mx-auto max-w-6xl">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <div className="flex items-center justify-center gap-4 mb-4">
                        <h2 className="text-4xl md:text-5xl font-bold gold-text leading-normal pb-1">أسعار الذهب اليوم</h2>
                        <motion.div
                            animate={{ rotate: isUpdating ? 360 : 0 }}
                            transition={{ duration: 1, repeat: isUpdating ? Infinity : 0, ease: "linear" }}
                        >
                            <RefreshCw className={`w-6 h-6 ${isUpdating ? 'text-yellow-500' : 'text-gray-600'}`} />
                        </motion.div>
                    </div>
                    <p className="text-gray-400 text-lg">تحديث لحظي من السوق المصري</p>
                </motion.div>

                {/* Market Status */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-16 flex justify-center"
                >
                    <div className={`bg-gradient-to-r ${marketStatus.isOpen ? 'from-green-900/40 to-green-800/40 border-green-500/30' : 'from-red-900/40 to-red-800/40 border-red-500/30'} border rounded-2xl p-8 backdrop-blur-sm max-w-md w-full text-center relative overflow-hidden`}>
                        <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent ${marketStatus.isOpen ? 'via-green-500' : 'via-red-500'} to-transparent opacity-50`}></div>
                        <h3 className={`text-2xl font-bold mb-4 ${marketStatus.isOpen ? 'text-green-400' : 'text-red-400'} flex items-center justify-center gap-2`}>
                            <span className={`w-3 h-3 rounded-full ${marketStatus.isOpen ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                            {marketStatus.label}
                        </h3>
                        <div className="text-5xl font-bold text-white mb-2 font-mono tracking-wider">
                            {countdown}
                        </div>
                        <p className={`${marketStatus.isOpen ? 'text-green-400/60' : 'text-red-400/60'} text-sm`}>
                            {marketStatus.isOpen ? 'الوقت المتبقي للإغلاق' : 'الوقت المتبقي للفتح'}
                        </p>
                        <p className="text-gray-500 text-xs mt-2">أوقات العمل: الأحد – الخميس | ١٠:٠٠ – ١٨:٠٠</p>
                    </div>
                </motion.div>

                {/* Prices Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    <AnimatePresence mode="wait">
                        {loading ? (
                            [1, 2, 3].map((i) => (
                                <div key={i} className="h-48 bg-white/5 rounded-2xl animate-pulse"></div>
                            ))
                        ) : (
                            priceCards.map((card, index) => (
                                <motion.div
                                    key={card.karat}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Card className="bg-gray-900/40 border-yellow-600/20 luxury-shadow overflow-hidden relative group">
                                        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                        <CardContent className="p-8 text-center relative z-10">
                                            <button
                                                type="button"
                                                className="w-16 h-16 gold-gradient rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg shadow-black/50 cursor-pointer select-none"
                                                aria-label={`عرض أسعار ${card.karat} عيار`}
                                            >
                                                <span className="text-black font-bold text-xl select-none pointer-events-none">{card.karat}</span>
                                            </button>
                                            <h3 className="text-xl font-bold mb-4 text-gray-300">{card.label}</h3>
                                            <motion.div
                                                key={card.price}
                                                initial={{ scale: 1.2, color: '#fff' }}
                                                animate={{ scale: 1, color: '#eab308' }}
                                                className="text-4xl font-bold mb-2"
                                            >
                                                {card.price?.toLocaleString('ar-EG') || '0'} <span className="text-lg text-gray-500">ج.م / جرام</span>
                                            </motion.div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>

                <div className="text-center">
                    <p className="text-sm text-gray-500 mb-4">
                        آخر تحديث: {new Date().toLocaleString('ar-EG')}
                    </p>
                    <Button
                        onClick={fetchGoldPrices}
                        disabled={isUpdating}
                        className="gold-gradient text-black font-bold px-8 py-6 rounded-full hover:scale-105 transition-transform"
                    >
                        {isUpdating ? 'جاري التحديث...' : 'تحديث الأسعار الآن'}
                    </Button>
                </div>
            </div>
        </section>
    );
}
