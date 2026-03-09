'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Phone, 
  MessageCircle, 
  Mail, 
  MapPin, 
  Clock, 
  Award, 
  Shield, 
  Star,
  Instagram,
  ChevronDown,
  Menu,
  X,
  RefreshCw
} from 'lucide-react';

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
}

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedKarat, setSelectedKarat] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [isUpdatingPrice, setIsUpdatingPrice] = useState(false);
  const [priceUpdateMessage, setPriceUpdateMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'products' | 'gold-info' | 'about' | 'contact'>('home');
  const [goldPrices, setGoldPrices] = useState<{basePrice: number, karat18: number, karat21: number, karat24: number, usdRate: number} | null>(null);
  const [timeUntilClosing, setTimeUntilClosing] = useState<string>('');

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  const switchTab = (tab: typeof activeTab) => {
    setActiveTab(tab);
    setIsMenuOpen(false);
  };

  // Fetch gold prices and USD rate
  const fetchGoldPrices = async () => {
    try {
      const response = await fetch('/api/gold-prices');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setGoldPrices({
            basePrice: data.data.basePricePerGram,
            karat18: data.data.karat18Price,
            karat21: data.data.karat21Price,
            karat24: data.data.basePricePerGram,
            usdRate: 48.5 // This would come from a currency API in production
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch gold prices:', error);
    }
  };

  // Countdown timer for market closing
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const timeDiff = tomorrow.getTime() - now.getTime();
      const hours = Math.floor(timeDiff / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
      
      setTimeUntilClosing(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch gold prices on component mount
  useEffect(() => {
    fetchGoldPrices();
  }, []);

  const fetchProducts = async (karat?: number, type?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (karat) params.set('karat', karat.toString());
      if (type) params.set('type', type);
      params.set('featured', 'true');
      
      const response = await fetch(`/api/products?${params.toString()}`);
      const data = await response.json();
      console.log('API Response:', data); // Debug log
      setProducts(Array.isArray(data) ? data : []); // Ensure it's an array
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(selectedKarat || undefined, selectedType || undefined);
  }, [selectedKarat, selectedType]);

  const handleCategoryClick = (karat: number) => {
    setSelectedKarat(karat);
    setSelectedType(null); // Reset type when changing karat
    scrollToSection('products');
  };

  const handleTypeClick = (type: string) => {
    setSelectedType(type);
    scrollToSection('products');
  };

  const formatPrice = (price: number | null) => {
    if (price === null) return 'تواصل للسعر';
    return `${price.toLocaleString('ar-EG')} ج.م`;
  };

  const getProductTypes = (karat: number) => {
    if (karat === 24) {
      return [
        { id: 'bar', name: 'سبائك', nameAr: 'سبائك' }
      ];
    }
    return [
      { id: 'ring', name: 'Rings', nameAr: 'خواتم' },
      { id: 'necklace', name: 'Necklaces', nameAr: 'قلادات' },
      { id: 'bracelet', name: 'Bracelets', nameAr: 'أساور' },
      { id: 'earrings', name: 'Earrings', nameAr: 'حلقان' }
    ];
  };

  const handlePriceUpdate = async () => {
    setIsUpdatingPrice(true);
    setPriceUpdateMessage(null);

    try {
      const response = await fetch('/api/gold-prices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.success) {
        setPriceUpdateMessage({
          type: 'success',
          text: `تم تحديث ${result.data.totalProductsUpdated} منتج بنجاح! سعر الجرام: ${result.data.basePricePerGram} ج.م`
        });
        
        // Update the last update time
        const lastUpdateElement = document.getElementById('lastUpdate');
        if (lastUpdateElement) {
          lastUpdateElement.textContent = new Date().toLocaleString('ar-EG');
        }

        // Update product count
        const productCountElement = document.getElementById('productCount');
        if (productCountElement) {
          productCountElement.textContent = result.data.totalProductsUpdated.toString();
        }

        // Refresh the products display
        fetchProducts(selectedKarat || undefined, selectedType || undefined);
      } else {
        setPriceUpdateMessage({
          type: 'error',
          text: result.error || 'فشل تحديث الأسعار'
        });
      }
    } catch (error) {
      console.error('Price update error:', error);
      setPriceUpdateMessage({
        type: 'error',
        text: 'حدث خطأ أثناء تحديث الأسعار'
      });
    } finally {
      setIsUpdatingPrice(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-cairo">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-black/95 backdrop-blur-sm z-50 border-b border-yellow-600/20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="w-10 h-10 relative">
                <img
                  src="/michiel-logo.png"
                  alt="مجوهرات ميشيل"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="text-right">
                <h1 className="text-xl font-bold gold-text">مجوهرات ميشيل</h1>
                <p className="text-xs text-yellow-600">حرفية تمتد عبر الزمن</p>
              </div>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8 space-x-reverse">
              <button 
                onClick={() => switchTab('home')}
                className={`transition-colors px-6 py-2 ${
                  activeTab === 'home' ? 'text-yellow-500' : 'text-white hover:text-yellow-500'
                }`}
              >
                الرئيسية
              </button>
              <button 
                onClick={() => switchTab('products')}
                className={`transition-colors px-6 py-2 ${
                  activeTab === 'products' ? 'text-yellow-500' : 'text-white hover:text-yellow-500'
                }`}
              >
                المنتجات
              </button>
              <button 
                onClick={() => switchTab('gold-info')}
                className={`transition-colors px-6 py-2 ${
                  activeTab === 'gold-info' ? 'text-yellow-500' : 'text-white hover:text-yellow-500'
                }`}
              >
                أسعار الذهب
              </button>
              <button 
                onClick={() => switchTab('about')}
                className={`transition-colors px-6 py-2 ${
                  activeTab === 'about' ? 'text-yellow-500' : 'text-white hover:text-yellow-500'
                }`}
              >
                من نحن
              </button>
              <button 
                onClick={() => switchTab('contact')}
                className={`transition-colors px-6 py-2 ${
                  activeTab === 'contact' ? 'text-yellow-500' : 'text-white hover:text-yellow-500'
                }`}
              >
                تواصل معنا
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-yellow-600/20">
              <div className="flex flex-col space-y-4 space-y-reverse">
                <button 
                  onClick={() => switchTab('home')}
                  className={`transition-colors text-right ${
                    activeTab === 'home' ? 'text-yellow-500' : 'text-white hover:text-yellow-500'
                  }`}
                >
                  الرئيسية
                </button>
                <button 
                  onClick={() => switchTab('products')}
                  className={`transition-colors text-right ${
                    activeTab === 'products' ? 'text-yellow-500' : 'text-white hover:text-yellow-500'
                  }`}
                >
                  المنتجات
                </button>
                <button 
                  onClick={() => switchTab('gold-info')}
                  className={`transition-colors text-right ${
                    activeTab === 'gold-info' ? 'text-yellow-500' : 'text-white hover:text-yellow-500'
                  }`}
                >
                  أسعار الذهب
                </button>
                <button 
                  onClick={() => switchTab('about')}
                  className={`transition-colors text-right ${
                    activeTab === 'about' ? 'text-yellow-500' : 'text-white hover:text-yellow-500'
                  }`}
                >
                  من نحن
                </button>
                <button 
                  onClick={() => switchTab('contact')}
                  className={`transition-colors text-right ${
                    activeTab === 'contact' ? 'text-yellow-500' : 'text-white hover:text-yellow-500'
                  }`}
                >
                  تواصل معنا
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/90 to-black"></div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-8 gold-text leading-tight">
            مجوهرات ميشيل
          </h1>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-yellow-500 leading-tight">
            حرفية تمتد عبر الزمن
          </h2>
          <p className="text-gray-300 text-lg mb-8 leading-relaxed">
            لأكثر من ستين عامًا، نقدم في مجوهرات ميشيل أجمل المجوهرات الذهبية التي تعكس الأصالة والذوق الرفيع. 
            كل قطعة نعرضها مختارة بعناية لتدوم وتُخلّد جمالك في كل لحظة.
          </p>
          <Button 
            onClick={() => scrollToSection('products')}
            className="gold-gradient text-black font-bold px-8 py-4 text-lg luxury-shadow hover:scale-105 transition-transform"
          >
            استكشف مجموعتنا
          </Button>
        </div>
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown className="text-yellow-500" size={32} />
        </div>
      </section>

      {/* Quick Categories */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card 
              className={`bg-gradient-to-br from-yellow-900/20 to-yellow-600/20 border-yellow-600/30 luxury-shadow hover:scale-105 transition-all cursor-pointer group ${
                selectedKarat === 18 ? 'ring-2 ring-yellow-500' : ''
              }`}
              onClick={() => handleCategoryClick(18)}
            >
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 gold-gradient rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-black font-bold text-2xl">18</span>
                </div>
                <h3 className="text-2xl font-bold mb-2 gold-text">18 عيار</h3>
                <p className="text-gray-300">تصميمات حديثة</p>
                {selectedKarat === 18 && (
                  <Badge className="mt-2 bg-yellow-500 text-black">محدد</Badge>
                )}
              </CardContent>
            </Card>

            <Card 
              className={`bg-gradient-to-br from-yellow-900/20 to-yellow-600/20 border-yellow-600/30 luxury-shadow hover:scale-105 transition-all cursor-pointer group ${
                selectedKarat === 21 ? 'ring-2 ring-yellow-500' : ''
              }`}
              onClick={() => handleCategoryClick(21)}
            >
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 gold-gradient rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-black font-bold text-2xl">21</span>
                </div>
                <h3 className="text-2xl font-bold mb-2 gold-text">21 عيار</h3>
                <p className="text-gray-300">تصميمات كلاسيكية</p>
                {selectedKarat === 21 && (
                  <Badge className="mt-2 bg-yellow-500 text-black">محدد</Badge>
                )}
              </CardContent>
            </Card>

            <Card 
              className={`bg-gradient-to-br from-yellow-900/20 to-yellow-600/20 border-yellow-600/30 luxury-shadow hover:scale-105 transition-all cursor-pointer group ${
                selectedKarat === 24 ? 'ring-2 ring-yellow-500' : ''
              }`}
              onClick={() => handleCategoryClick(24)}
            >
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 gold-gradient rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-black font-bold text-2xl">24</span>
                </div>
                <h3 className="text-2xl font-bold mb-2 gold-text">سبائك 24</h3>
                <p className="text-gray-300">ذهب معتمد</p>
                {selectedKarat === 24 && (
                  <Badge className="mt-2 bg-yellow-500 text-black">محدد</Badge>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Product Type Filter - Shows when karat is selected */}
      {selectedKarat && (
        <section className="py-8 px-4 bg-gradient-to-b from-gray-900 to-black">
          <div className="container mx-auto">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-4 gold-text">اختر النوع</h3>
              <p className="text-gray-400">تصفية حسب نوع المنتج</p>
            </div>
            <div className="flex flex-wrap justify-center gap-3 mb-6">
              {getProductTypes(selectedKarat).map((type) => (
                <Button
                  key={type.id}
                  onClick={() => handleTypeClick(type.id)}
                  variant={selectedType === type.id ? "default" : "outline"}
                  className={`${
                    selectedType === type.id 
                      ? 'gold-gradient text-black' 
                      : 'border-yellow-600 text-yellow-500 hover:bg-yellow-600 hover:text-black'
                  } transition-all`}
                >
                  {type.nameAr}
                </Button>
              ))}
            </div>
            {selectedType && (
              <div className="text-center">
                <Button 
                  onClick={() => setSelectedType(null)}
                  variant="outline"
                  className="border-gray-600 text-gray-400 hover:bg-gray-600 hover:text-white"
                >
                  عرض كل أنواع {selectedKarat} عيار
                </Button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section id="products" className="py-20 px-4 bg-gradient-to-b from-black to-gray-900">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 gold-text">
              {selectedType 
                ? `${selectedType === 'bar' ? 'سبائك' : getProductTypes(selectedKarat || 24).find(t => t.id === selectedType)?.nameAr || ''} ${selectedKarat} عيار`
                : selectedKarat 
                ? `منتجات ${selectedKarat} عيار` 
                : 'منتجات مختارة'
              }
            </h2>
            <p className="text-gray-300 text-lg">
              {selectedType 
                ? `أجمل تصاميم${selectedType === 'bar' ? ' السبائك' : ' ' + (getProductTypes(selectedKarat || 24).find(t => t.id === selectedType)?.nameAr || '')} ${selectedKarat} عيار`
                : selectedKarat 
                ? `أجمل تصاميمنا الذهبية ${selectedKarat} عيار`
                : 'مجموعة مختارة من أجمل تصاميمنا الذهبية'
              }
            </p>
            {(selectedKarat || selectedType) && (
              <Button 
                onClick={() => {
                  setSelectedKarat(null);
                  setSelectedType(null);
                }}
                variant="outline"
                className="mt-4 border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black"
              >
                عرض كل المنتجات
              </Button>
            )}
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-300">جاري التحميل...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <Card key={product.id} className="bg-gray-900/50 border-yellow-600/20 luxury-shadow hover:scale-105 transition-all group">
                  <CardContent className="p-4">
                    <div className="aspect-square bg-gradient-to-br from-yellow-900/30 to-yellow-600/30 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                      {product.productType === 'ring' && product.karat === 18 ? (
                        <img src="/18k-ring.jpg" alt={product.nameAr} className="w-full h-full object-cover" />
                      ) : product.productType === 'necklace' && product.karat === 18 ? (
                        <img src="/18k-necklace.jpg" alt={product.nameAr} className="w-full h-full object-cover" />
                      ) : product.productType === 'bracelet' && product.karat === 21 ? (
                        <img src="/21k-bracelet.jpg" alt={product.nameAr} className="w-full h-full object-cover" />
                      ) : product.productType === 'earrings' && product.karat === 21 ? (
                        <img src="/21k-earrings.jpg" alt={product.nameAr} className="w-full h-full object-cover" />
                      ) : product.productType === 'bar' ? (
                        <img src="/24k-bar-1g.jpg" alt={product.nameAr} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-16 h-16 gold-gradient rounded-full"></div>
                      )}
                    </div>
                    <h3 className="text-lg font-bold mb-2 text-yellow-500">{product.nameAr}</h3>
                    <p className="text-sm text-gray-400 mb-1">{product.category.nameAr}</p>
                    {product.weight && (
                      <p className="text-xs text-yellow-400 mb-2">
                        الوزن: {product.weight} جرام
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-yellow-500 font-bold">{formatPrice(product.price)}</span>
                      {product.featured && (
                        <Badge variant="secondary" className="bg-yellow-600/20 text-yellow-500">
                          مميز
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 gold-text">عن مجوهرات ميشيل</h2>
              <p className="text-lg text-gray-300 mb-6 leading-relaxed">
                منذ أكثر من ستين عامًا، ونحن في مجوهرات ميشيل لا نصنع المجوهرات الذهبية فحسب، 
                بل نصنع علاقات دائمة مع عملائنا. بدأت رحلتنا كمتجر صغير يخدم أفراد العائلة والأصدقاء، 
                واليوم أصبحنا وجهة لكل من يبحث عن الأصالة والجودة والخدمة الاستثنائية.
              </p>
              <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                نفخر بأن كل قطعة تخرج من متجرنا ليست مجرد منتج، بل هي قصة من الثقة والاهتمام. 
                فريقنا من الخبراء يكرس وقته لفهم احتياجاتك وتقديم المشورة الصادقة، 
                ليساعدك في اختيار القطعة المثالية التي تعبر عن ذوقك وتلبي متطلباتك.
              </p>
              <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                خدمتنا لا تنتهي عند البيع، بل تبدأ معك رحلة من الثقة والرضا. 
                نقدم لك الضمان والصيانة والاستشارات المستمرة، لأننا نؤمن أن عميلنا هو شريكنا في النجاح.
              </p>
              <Button className="gold-gradient text-black font-bold px-6 py-3">
                اكتشف قصتنا
              </Button>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-yellow-900/20 to-yellow-600/20 rounded-2xl luxury-shadow flex items-center justify-center">
                <div className="text-center">
                  <div className="w-32 h-32 gold-gradient rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-black font-bold text-4xl">60</span>
                  </div>
                  <p className="text-yellow-500 text-xl font-bold">عاماً من الخدمة المميزة</p>
                  <p className="text-gray-300 mt-2">آلاف العملاء السعداء</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 px-4 bg-gradient-to-b from-gray-900 to-black">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 gold-text">لماذا مجوهرات ميشيل؟</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-gray-900/50 border-yellow-600/20 text-center p-6">
              <CardContent className="p-0">
                <Award className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2 text-yellow-500">خبرة عريقة</h3>
                <p className="text-gray-300">أكثر من 60 عاماً من الحرفية الذهبية الأصيلة</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-yellow-600/20 text-center p-6">
              <CardContent className="p-0">
                <Star className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2 text-yellow-500">تصاميم فاخرة</h3>
                <p className="text-gray-300">تجمع بين الفخامة والتراث العريق</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-yellow-600/20 text-center p-6">
              <CardContent className="p-0">
                <Shield className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2 text-yellow-500">ضمان معتمد</h3>
                <p className="text-gray-300">شهادات نقاء ومعايرة لكل منتج</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-yellow-600/20 text-center p-6">
              <CardContent className="p-0">
                <Award className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2 text-yellow-500">حرفة يدوية</h3>
                <p className="text-gray-300">تفاصيل دقيقة وصناعة متقنة</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-yellow-600/20 text-center p-6">
              <CardContent className="p-0">
                <Star className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2 text-yellow-500">قطع فريدة</h3>
                <p className="text-gray-300">تصاميم حصرية للعاشقين للتميز</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-yellow-600/20 text-center p-6">
              <CardContent className="p-0">
                <Shield className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2 text-yellow-500">ثقة وضمان</h3>
                <p className="text-gray-300">سياسة استبدال واضحة وخدمة ما بعد البيع</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Gold Bars Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 gold-text">سبائك ذهب معتمدة 24</h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              نوفر سبائك ذهب 24 عيار معتمدة بأوزان مختلفة، 
              مناسبة للادخار أو الاستثمار الآمن.
            </p>
          </div>

          <div className="mb-8 text-center">
            <img 
              src="/24k-bars-collection.jpg" 
              alt="مجموعة سبائك ذهب 24 عيار" 
              className="max-w-2xl mx-auto rounded-2xl luxury-shadow"
              onError={(e) => {
                e.currentTarget.src = '/btc-gold-bars.jpg';
              }}
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products
                .filter(product => product.productType === 'bar')
                .slice(0, 8) // Show first 8 gold bars as cards
                .map((product) => (
                <Card key={product.id} className="bg-gray-900/50 border-yellow-600/20 luxury-shadow hover:scale-105 transition-all group">
                  <CardContent className="p-4">
                    <div className="aspect-square bg-gradient-to-br from-yellow-900/30 to-yellow-600/30 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                      <img 
                        src={product.images && product.images.length > 0 ? product.images[0] : '/24k-bar-1g.jpg'} 
                        alt={product.nameAr} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <h3 className="text-lg font-bold mb-2 text-yellow-500">{product.nameAr}</h3>
                    <p className="text-sm text-gray-400 mb-3">{product.weight} جرام</p>
                    <div className="flex items-center justify-between">
                      <span className="text-yellow-500 font-bold">{formatPrice(product.price)}</span>
                      {product.featured && (
                        <Badge variant="secondary" className="bg-yellow-600/20 text-yellow-500">
                          مميز
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
        </div>
      </section>

      {/* Instagram Gallery */}
      <section className="py-20 px-4 bg-gradient-to-b from-black to-gray-900">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 gold-text">معرض إنستغرام</h2>
            <p className="text-gray-300 text-lg">تابع أحدث تصاميمنا ومعارضنا</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="aspect-square bg-gradient-to-br from-yellow-900/30 to-yellow-600/30 rounded-lg flex items-center justify-center group cursor-pointer hover:scale-105 transition-all">
                <Instagram className="w-8 h-8 text-yellow-500 group-hover:text-yellow-400" />
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button className="gold-gradient text-black font-bold px-6 py-3">
              <Instagram className="w-5 h-5 ml-2" />
              تابعنا على إنستغرام
            </Button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 gold-text">تواصل معنا</h2>
            <p className="text-gray-300 text-lg">نحن هنا لخدمتكم وتقديم الاستشارات حول منتجاتنا.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <Card className="bg-gray-900/50 border-yellow-600/20 text-center p-6 luxury-shadow">
              <CardContent className="p-0">
                <Phone className="w-10 h-10 text-yellow-500 mx-auto mb-3" />
                <h3 className="font-bold mb-2 text-yellow-500">الهاتف</h3>
                <p className="text-gray-300">0100-000-0000</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-yellow-600/20 text-center p-6 luxury-shadow">
              <CardContent className="p-0">
                <MessageCircle className="w-10 h-10 text-yellow-500 mx-auto mb-3" />
                <h3 className="font-bold mb-2 text-yellow-500">واتساب</h3>
                <p className="text-gray-300">0100-000-0000</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-yellow-600/20 text-center p-6 luxury-shadow">
              <CardContent className="p-0">
                <Mail className="w-10 h-10 text-yellow-500 mx-auto mb-3" />
                <h3 className="font-bold mb-2 text-yellow-500">البريد</h3>
                <p className="text-gray-300">info@michiel.com</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-yellow-600/20 text-center p-6 luxury-shadow">
              <CardContent className="p-0">
                <MapPin className="w-10 h-10 text-yellow-500 mx-auto mb-3" />
                <h3 className="font-bold mb-2 text-yellow-500">العنوان</h3>
                <p className="text-gray-300">القاهرة – مصر</p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-8">
            <Card className="inline-block bg-gray-900/50 border-yellow-600/20 p-6 luxury-shadow">
              <CardContent className="p-0 flex items-center justify-center space-x-4 space-x-reverse">
                <Clock className="w-6 h-6 text-yellow-500" />
                <p className="text-gray-300">
                  لخدمتكم يوميًا من <span className="text-yellow-500 font-bold">10 صباحًا</span> إلى <span className="text-yellow-500 font-bold">10 مساءً</span>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Admin Price Update Panel */}
      <section className="py-12 px-4 bg-gradient-to-b from-black to-gray-900">
        <div className="container mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 gold-text">لوحة تحديث الأسعار</h2>
            <p className="text-gray-300">تحديث أسعار الذهب تلقائياً بناءً على أسعار السوق الحالية</p>
          </div>
          
          <div className="max-w-md mx-auto">
            <Card className="bg-gray-900/50 border-yellow-600/20 p-6 luxury-shadow">
              <CardContent className="p-0">
                <div className="text-center space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-400">آخر تحديث: <span id="lastUpdate">غير متوفر</span></p>
                    <p className="text-sm text-gray-400">عدد المنتجات: <span id="productCount">غير متوفر</span></p>
                  </div>
                  
                  <Button 
                    onClick={handlePriceUpdate}
                    disabled={isUpdatingPrice}
                    className="w-full bg-yellow-600 hover:bg-yellow-700 text-black font-bold"
                  >
                    {isUpdatingPrice ? (
                      <>
                        <RefreshCw className="w-4 h-4 ml-2 animate-spin" />
                        جاري التحديث...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 ml-2" />
                        تحديث أسعار الذهب الآن
                      </>
                    )}
                  </Button>
                  
                  {priceUpdateMessage && (
                    <div className={`text-sm p-3 rounded-lg ${
                      priceUpdateMessage.type === 'success' 
                        ? 'bg-green-900/50 text-green-300 border border-green-700/50' 
                        : 'bg-red-900/50 text-red-300 border border-red-700/50'
                    }`}>
                      {priceUpdateMessage.text}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-yellow-600/20 py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4 gold-text">Michiel Jewelry</h3>
              <p className="text-gray-400 text-sm">حرفية تمتد عبر الزمن - أكثر من 60 عاماً من الأصالة والجودة</p>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-yellow-500">روابط سريعة</h4>
              <ul className="space-y-2">
                <li><button onClick={() => scrollToSection('home')} className="text-gray-400 hover:text-yellow-500 transition-colors">الرئيسية</button></li>
                <li><button onClick={() => scrollToSection('products')} className="text-gray-400 hover:text-yellow-500 transition-colors">المنتجات</button></li>
                <li><button onClick={() => scrollToSection('about')} className="text-gray-400 hover:text-yellow-500 transition-colors">من نحن</button></li>
                <li><button onClick={() => scrollToSection('contact')} className="text-gray-400 hover:text-yellow-500 transition-colors">تواصل معنا</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-yellow-500">الفئات</h4>
              <ul className="space-y-2">
                <li><span className="text-gray-400">ذهب 18 عيار</span></li>
                <li><span className="text-gray-400">ذهب 21 عيار</span></li>
                <li><span className="text-gray-400">سبائك 24 عيار</span></li>
                <li><span className="text-gray-400">تصاميم خاصة</span></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-yellow-500">تابعنا</h4>
              <div className="flex space-x-4 space-x-reverse">
                <button className="w-10 h-10 gold-gradient rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                  <Instagram className="w-5 h-5 text-black" />
                </button>
              </div>
            </div>
          </div>

          <Separator className="bg-yellow-600/20 mb-8" />

          <div className="text-center text-gray-400 text-sm">
            <p>&copy; 2024 مجوهرات ميشيل. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>

      {/* WhatsApp Floating Button */}
      <a 
        href="https://wa.me/201000000000" 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-6 left-6 w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all z-40"
      >
        <MessageCircle className="w-6 h-6 text-white" />
      </a>
    </div>
  );
}