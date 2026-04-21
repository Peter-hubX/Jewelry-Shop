# Michiel Jewelry - Web App vs Mobile App Comparison

**Last Updated:** April 20, 2026  
**Purpose:** Track design & data consistency between platforms

---

## 📱 Platform Overview

| Aspect | Web App | Mobile App |
|--------|---------|-----------|
| **Framework** | Next.js 14 (React) | Expo (React Native) |
| **Styling** | Tailwind CSS | React Native + Linear Gradient |
| **Animation Library** | Framer Motion | React Native Reanimated |
| **Language** | TypeScript | TypeScript |
| **Package Manager** | npm | npm |
| **Location** | `/src/` | `/michiel-jewelry-app/` |

---

## 🎯 NAVIGATION STRUCTURE

### Web App - Tab Navigation (Top + Footer)
**Location:** `src/app/page.tsx` + `src/components/layout/Navbar.tsx`

```
Home Page (/)
├── Navbar (fixed, top)
│   ├── Home (الرئيسية)
│   ├── Products (المنتجات)
│   ├── Gold Prices (أسعار الذهب)
│   ├── About (من نحن)
│   └── Contact (تواصل معنا)
├── Content (dynamically rendered by activeTab)
└── Footer (bottom)
```

**Implementation:** Single-page app with `activeTab` state. Tabs switch content via `AnimatePresence` + Framer Motion.

---

### Mobile App - Bottom Tab Navigation
**Location:** `michiel-jewelry-app/app/(tabs)/_layout.tsx`

```
Tab Navigator (bottom)
├── Home (index.tsx) - 🏠 الرئيسية
├── Catalog (catalog.tsx) - 💍 المنتجات
├── Gold Prices (gold-prices.tsx) - 📈 أسعار الذهب
├── Wishlist (wishlist.tsx) - ❤️ المفضلة (MODAL)
└── Store (store.tsx) - 📍 فرعنا
```

**Implementation:** Expo Router with bottom tab navigation. Each screen is a separate file.

---

## 🎨 DESIGN SYSTEM COMPARISON

### Color Palette

#### Both Apps Use (IDENTICAL):
```ts
Primary: Gold #C8952C (warm antique gold)
Mid-Gold: #DBA83A
Light Gold: #F0C060
Bright Gold: #FFD580
Dark Gold: #7A5618

Background: #0B0B12 (warm near-black)
Surface: #141420
Text Primary: #EDE8DF (warm cream)
Text Secondary: #9C9080
Text Muted: #5A5248

Success: #52C47A
Error: #E05555
```

**Where:** 
- Web: `tailwind.config.ts` (CSS variables) + `src/globals.css`
- Mobile: `michiel-jewelry-app/constants/theme.ts` (exported as constants)

#### Key Difference:
- **Web:** Uses Tailwind classes (`gold-text`, `gold-gradient`)
- **Mobile:** Direct color constants with RGB/RGBA for transparency

---

### Typography

#### Web
- Font: `Cairo` (from `next/font/google`)
- Imported in `src/app/layout.tsx`
- Applied via Tailwind class `font-cairo`

#### Mobile
- Font: System default (no custom font loaded currently)
- **⚠️ INCONSISTENCY:** Mobile doesn't load Cairo font

---

### Animations

#### Web
- **Library:** Framer Motion
- **Examples:**
  - Page transitions: `AnimatePresence` + `motion.div`
  - Tab button highlight: `layoutId="activeTab"` with spring animation
  - Product grid: staggered animations

#### Mobile
- **Library:** React Native Reanimated 3
- **Examples:**
  - Hero section: shared values with `useAnimatedStyle`
  - Product cards: stagger animations
  - Sections: fade-in with `withTiming` + `withDelay`

---

## 📊 DATA MODELS

### Product Type Definition

Both platforms define product types identically:

```ts
type ProductType = 'ring' | 'necklace' | 'bracelet' | 'earrings' | 'bar';
type Karat = '24K' | '21K' | '18K';
```

**Locations:**
- Web: `src/lib/productTypeTranslations.ts` + inline interfaces
- Mobile: `michiel-jewelry-app/types/index.ts`

---

### Product Object Structure

#### Web App
```ts
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
```

#### Mobile App
```ts
type Product = {
  id: string;
  name: string;
  nameAr: string;
  description?: string;
  descriptionAr?: string;
  weight: number;
  karat: Karat;
  craftPremium: number;
  images: string[];
  category: string;
  categoryNameAr?: string;
  inStock: boolean;
  featured?: boolean;
  calculatedPrice: number;
  productType?: ProductType;
};
```

#### Differences:
| Field | Web | Mobile |
|-------|-----|--------|
| `name` (English) | ❌ Not stored | ✅ Included |
| `karat` type | `number` | `Karat` (typed) |
| `craftPremium` | ❌ Not in interface | ✅ Included |
| `inStock` | ❌ Not in interface | ✅ Included |
| `calculatedPrice` | ❌ Not in interface | ✅ Included (pre-calculated) |
| `category` | Complex object | Simple string |

---

### Gold Price Type

#### Web
```ts
interface GoldPrice {
  karat24: number;
  karat21: number;
  karat18: number;
  currency: 'EGP';
  updatedAt: string;
  isMarketOpen: boolean;
}
```

#### Mobile
```ts
type GoldPrice = {
  karat24: number;
  karat21: number;
  karat18: number;
  currency: 'EGP';
  updatedAt: string;
  isMarketOpen: boolean;
};
```

✅ **IDENTICAL** (both use same type)

---

## 🎯 FEATURES COMPARISON

### Navigation & Routing

| Feature | Web | Mobile |
|---------|-----|--------|
| Page navigation | Tab-based (single page) | Screen-based (expo-router) |
| URL persistence | ✅ Query params (`?tab=products`) | ❌ Not in same way |
| Back button behavior | Browser history | Native back stack |
| Product detail link | `window.location.href = /product/{id}` | `router.push(/product/[id])` |
| Return from product detail | Reads `?tab=products` from URL | Uses React Navigation stack |

---

### Wishlist Feature

| Feature | Web | Mobile |
|---------|-----|--------|
| Wishlist exists | ❌ **NOT IMPLEMENTED** | ✅ **FULLY IMPLEMENTED** |
| Storage | N/A | LocalStorage (via `useWishlist` hook) |
| UI Component | N/A | `WishlistContext` provider + `WishlistButton` |
| Wishlist page | N/A | ✅ Modal screen at `/wishlist` |
| Heart button | ❌ Not visible | ✅ Visible on product cards |
| Wishlist count in header | N/A | ✅ Shows in tab bar |

**⚠️ MAJOR GAP:** Web app has no wishlist functionality. Should be added for parity.

---

### Product Filtering

#### Web
- Filter by Karat: 18, 21, 24
- Filter by Type: ring, necklace, bracelet, earrings, bar
- Filter by Category Name
- No search functionality in ProductGrid

**Location:** `src/components/products/ProductGrid.tsx`

#### Mobile
- Filter by Karat: 18K, 21K, 24K
- Filter by Type: ring, necklace, bracelet, earrings, bar
- **Sort:** Default, Price Ascending, Price Descending
- **Search:** Text search by product name
- **Clear filters:** One-click clear all

**Location:** `michiel-jewelry-app/app/(tabs)/catalog.tsx`

**Difference:** Mobile has search + sort, Web doesn't.

---

### Gold Price Display

#### Both Show:
- Market status (open/closed) with countdown
- Price per gram for 24K, 21K, 18K
- USD rate (in mobile)
- Auto-refresh every 60 seconds

#### Web
- **Location:** `src/components/gold/GoldPrices.tsx`
- Uses `getMarketStatus()` function to check Cairo market hours
- Displays as cards with animation

#### Mobile
- **Location:** `michiel-jewelry-app/app/(tabs)/gold-prices.tsx`
- Same market status logic
- Uses glass cards with gradient backgrounds

**✅ SIMILAR IMPLEMENTATION**

---

### Store Location Feature

| Feature | Web | Mobile |
|---------|-----|--------|
| Store page | ❌ Not visible (in "About" tab) | ✅ Separate tab with map integration |
| Address display | ✅ In About section | ✅ Full store screen |
| Map integration | ❌ No | ✅ Likely (separate store.tsx file) |

---

## 🎨 UI COMPONENT COMPARISON

### Button Styling

#### Web
```tsx
// Tailwind-based
<button className="gold-gradient text-black font-bold shadow-lg shadow-yellow-500/20">
  Browse Collection
</button>
```

#### Mobile
```tsx
// React Native + LinearGradient
<LinearGradient
  colors={[Colors.goldLight, Colors.gold, Colors.goldDark]}
  style={styles.ctaGrad}
>
  <Text style={styles.ctaText}>تصفح المجموعة</Text>
</LinearGradient>
```

---

### Product Card Layout

#### Web
- Horizontal image + info layout (grid)
- Hover effects with overlay quick view
- Category pill overlay
- Price display below title

**File:** `src/components/products/ProductGrid.tsx`

#### Mobile
- Vertical image stack layout
- Wishlist button (heart) in top-right
- Karat badge in top-left (gold gradient)
- Category pill bottom-right
- Price + weight in footer

**File:** `michiel-jewelry-app/components/ProductCard.tsx`

---

### Navbar/Header

#### Web
- Fixed horizontal navbar at top
- Logo + name on left
- Navigation items in center (desktop) / hamburger (mobile)
- Rounded pill background with gradient active state

#### Mobile
- Header only shows wishlist button (header right)
- Main navigation: Bottom tab bar with emoji icons
- Safe area padding at top

**Styling Difference:** Web uses horizontal layout, Mobile uses vertical bottom tabs.

---

## 🔄 DATA FETCHING

### Product API Endpoint

**Both use:** `/api/products` (same backend)

#### Web
```ts
// fetch with filters as query params
const response = await fetch(
  `/api/products?karat=${karat}&type=${type}&category=${category}`
);
```

#### Mobile
```ts
// Same approach via useProducts hook
const { data, isLoading } = useProducts({ karat, productType, search });
```

---

### Gold Price API Endpoint

**Both use:** `/api/gold-prices` (same backend)

Response structure: ✅ **IDENTICAL**

---

## 📝 TRANSLATION/LOCALIZATION

### Arabic Translations

#### Web
- `src/lib/productTypeTranslations.ts` - Translation map
- Example: `{ 'ring': 'خاتم', 'necklace': 'قلادة' }`

#### Mobile
- `michiel-jewelry-app/types/index.ts` - `PRODUCT_TYPE_LABELS` constant
- Example: `{ ring: 'خواتم', necklace: 'قلائد' }`

**⚠️ INCONSISTENCY:** Web uses singular form (`خاتم`), Mobile uses plural (`خواتم`). Should standardize.

---

## 📱 Responsive Design

### Web App
- Mobile-first Tailwind approach
- Breakpoints: `sm`, `md`, `lg`, `xl`
- Navbar hamburger menu on mobile
- Product grid: 1 col mobile → 4 cols desktop

### Mobile App
- Native mobile layout only
- Safe area insets via `react-native-safe-area-context`
- No desktop breakpoints needed (native only)

---

## 🚀 Performance & Loading

### Web
- Service Worker registration (PWA)
- Lazy loading components
- Scroll-based animations

### Mobile
- Pull-to-refresh on home screen
- Skeleton loading screens
- Haptic feedback on interactions

---

## 🔐 Storage & State Management

| Feature | Web | Mobile |
|---------|-----|--------|
| Tab state | React state + URL query params | React Navigation stack |
| Wishlist storage | N/A | AsyncStorage (via useWishlist) |
| Product cache | React state | React Query (TanStack Query) |
| Gold prices cache | React state | React Query |

---

## 📋 ACCESSIBILITY & LOCALIZATION

### Right-to-Left (RTL) Support

#### Web
```tsx
<html lang="ar" dir="rtl">
```
✅ Fully RTL via `dir="rtl"` attribute

#### Mobile
- React Native handles RTL automatically based on system locale
✅ Built-in RTL support

---

## ⚠️ CRITICAL INCONSISTENCIES

### 🔴 **Priority 1 - Feature Gaps**

1. **Wishlist Feature**
   - ❌ Missing from web app
   - ✅ Fully implemented in mobile
   - **Action:** Implement wishlist context + storage in web app

2. **Search Functionality**
   - ❌ Missing from web ProductGrid
   - ✅ Implemented in mobile catalog
   - **Action:** Add search to web ProductGrid

3. **Product Sorting**
   - ❌ Missing from web
   - ✅ Sort by price (asc/desc) in mobile
   - **Action:** Add sorting to web ProductGrid

---

### 🟡 **Priority 2 - Data Model Mismatches**

1. **Product Data Structure**
   - Web lacks: `name`, `craftPremium`, `inStock`, `calculatedPrice`
   - Mobile includes all fields
   - **Action:** Ensure API returns all fields; update web interfaces

2. **Karat Type Definitions**
   - Web: `karat: number` (loose)
   - Mobile: `karat: Karat` (typed as '24K' | '21K' | '18K')
   - **Action:** Standardize to strict typing

3. **Category Structure**
   - Web: `category: { nameAr, type }` (object)
   - Mobile: `category: string` (just name)
   - **Action:** Standardize on one approach; consider enriching mobile version

---

### 🟡 **Priority 3 - UI/Design Inconsistencies**

1. **Font Loading**
   - Web: ✅ Cairo font loaded
   - Mobile: ❌ Not loaded (using system default)
   - **Action:** Add Cairo font to mobile app via Expo

2. **Arabic Text Translations**
   - Web: Singular forms (`خاتم`)
   - Mobile: Plural forms (`خواتم`)
   - **Action:** Unify to one standard (recommend plural for product categories)

3. **Button Styling**
   - Different visual implementations (gradient application differs)
   - **Action:** Consider extracting shared component library or design tokens

---

### 🟢 **Priority 4 - Minor Differences**

1. Navigation approach (tab vs screen-based) - acceptable for platform differences
2. Animation libraries (Framer Motion vs Reanimated) - platform-appropriate
3. Styling approach (Tailwind vs React Native) - platform-appropriate

---

## 📐 SHARED COMPONENTS & UTILITIES

### Existing in Both

- `ProductCard` (different implementations)
- `SkeletonCard` (loading placeholder)
- `AmbientBackground` (animated background)
- `GlassCard` (frosted glass effect)
- Gold price display logic
- Product type labels & icons

### Missing Parity

- `WishlistButton` - Mobile only
- Search input - Mobile only
- Sort dropdown - Mobile only

---

## 🎯 ACTION ITEMS

### Immediate (This Sprint)
- [ ] Add wishlist feature to web app
- [ ] Standardize product data structure (ensure web receives all mobile fields)
- [ ] Add search functionality to web ProductGrid
- [ ] Update karat type definitions to strict typing

### Short-term (Next Sprint)
- [ ] Add sorting to web ProductGrid
- [ ] Load Cairo font in mobile app
- [ ] Unify Arabic text translations (singular/plural)
- [ ] Add store location page to web app (or enhance About section)

### Medium-term (Monthly Review)
- [ ] Extract shared design tokens
- [ ] Create component library for consistency
- [ ] Consider Tailwind RN bridge for unified styling
- [ ] Standardize product category data structure

### Documentation
- [ ] Keep this file updated quarterly
- [ ] Document new features immediately
- [ ] Track API response schema changes

---

## 🔗 RELATED FILES

### Web App
- Main page: `src/app/page.tsx`
- Navbar: `src/components/layout/Navbar.tsx`
- Footer: `src/components/layout/Footer.tsx`
- Product grid: `src/components/products/ProductGrid.tsx`
- Gold prices: `src/components/gold/GoldPrices.tsx`
- Design tokens: `tailwind.config.ts`, `src/globals.css`

### Mobile App
- Root layout: `michiel-jewelry-app/app/_layout.tsx`
- Tab layout: `michiel-jewelry-app/app/(tabs)/_layout.tsx`
- Home screen: `michiel-jewelry-app/app/(tabs)/index.tsx`
- Catalog: `michiel-jewelry-app/app/(tabs)/catalog.tsx`
- Gold prices: `michiel-jewelry-app/app/(tabs)/gold-prices.tsx`
- Wishlist: `michiel-jewelry-app/app/wishlist.tsx`
- Design tokens: `michiel-jewelry-app/constants/theme.ts`
- Types: `michiel-jewelry-app/types/index.ts`

---

**Last reviewed:** April 20, 2026  
**Reviewed by:** Dev Team  
**Next review:** May 20, 2026
