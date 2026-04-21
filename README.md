# 💍 Michiel Jewelry — مجوهرات ميشيل

> A premium Arabic-first gold jewelry catalog with real-time market pricing, a luxury React Native mobile app, and a Next.js backend.

---

## 📂 Which File Does What

| File | Who reads it | What it contains |
|:-----|:-------------|:-----------------|
| **`README.md`** | Everyone — GitHub visitors, new devs, presentations | Project overview, setup instructions, screen list, tech stack, roadmap |
| **`MICHIEL_PROJECT_KNOWLEDGE.md`** | AI assistants, developers continuing the project | Every bug + exact fix, security audit, file structure, copy-paste prompts, pre-launch checklist |

> **Starting a new AI session?** Upload `MICHIEL_PROJECT_KNOWLEDGE.md` and say *"read this before we start"* — the AI will have full context in seconds without you re-explaining anything.

---

## 🌟 What This Is

Michiel Jewelry is a real jewelry shop in Cairo. This project gives them a mobile app (iOS + Android) where customers can:

- Browse the full product catalog in Arabic with live gold-calculated prices
- See real-time gold prices (24K / 21K / 18K) updated every 60 seconds
- Save favorites to a wishlist
- Contact the shop directly via WhatsApp with a pre-filled Arabic inquiry message
- Find the store location and opening hours

**No checkout. No payments.** The app is a catalog + direct contact tool. All sales happen via WhatsApp or in-store.

---

## 🏗️ Architecture

Two codebases, one repository, both must run simultaneously:

```
Jewelry-Shop-main/                   ← Next.js 15 backend + web admin
├── src/app/api/                     ← REST API (products, gold prices, categories)
├── prisma/                          ← Database schema
├── db/custom.db                     ← SQLite database
└── michiel-jewelry-app/             ← Expo React Native mobile app
    ├── app/                         ← Screens (Expo Router file-based)
    │   ├── (tabs)/
    │   │   ├── index.tsx            ← Homepage
    │   │   ├── catalog.tsx          ← Product catalog
    │   │   ├── gold-prices.tsx      ← Live gold prices
    │   │   └── store.tsx            ← Store locator
    │   ├── product/[id].tsx         ← Product detail
    │   └── wishlist.tsx             ← Wishlist modal
    ├── components/                  ← ProductCard, SkeletonCard, GlassCard, AmbientBackground
    ├── hooks/                       ← useProducts, useGoldPrice, useWishlist
    ├── context/                     ← WishlistContext
    ├── services/api.ts              ← All network calls with 10s timeout
    ├── utils/haptics.ts             ← Haptic feedback wrapper
    └── constants/                   ← theme.ts, contact.ts, localImages.ts
```

### How the key files connect

| File | Role | Affects |
|:-----|:-----|:--------|
| `src/app/api/gold-prices/route.ts` | Fetches live gold spot price, updates DB | Every product price in the entire app |
| `src/app/api/products/[id]/route.ts` | Returns a single product with live calculated price | Product detail screen |
| `michiel-jewelry-app/services/api.ts` | All network calls from mobile → backend | Every screen that shows data |
| `michiel-jewelry-app/constants/theme.ts` | Colors, spacing, shadows, font sizes | The entire visual appearance |
| `michiel-jewelry-app/context/WishlistContext.tsx` | Wishlist state shared across all screens | Star button on cards and detail page |
| `michiel-jewelry-app/hooks/useGoldPrice.ts` | 60s polling with previous-value tracking | Homepage ticker + gold prices tab arrows |
| `michiel-jewelry-app/constants/contact.ts` | WhatsApp number + Arabic message builder | WhatsApp CTA on product detail |

---

## 🚀 Getting Started

### Prerequisites
- Node.js v20+ (v22 LTS recommended)
- Expo Go app on your phone for live testing

### Step 1 — Backend (Terminal 1)

```bash
cd Jewelry-Shop-main
npm install

# Create .env and add your keys
GOLDAPI_KEY=your_key_here
ADMIN_API_SECRET=your_secret_here

npx prisma db push
npm run dev
# → Runs on http://localhost:3000
```

### Step 2 — Mobile App (Terminal 2)

```bash
cd Jewelry-Shop-main/michiel-jewelry-app
npm install

# Create .env — must use your local network IP, not localhost
EXPO_PUBLIC_API_URL=http://192.168.X.X:3000
# Find your IP: ipconfig (Windows) or ifconfig (Mac)

npx expo start --clear
# → Scan QR code with Expo Go
```

> ⚠️ **The IP in `.env` changes when you switch Wi-Fi networks.** Always update it and restart with `--clear` when the app can't load products.

---

## 📱 Screens & Features

### Screens

| Screen | What it does |
|:-------|:-------------|
| **Homepage** | Hero image, live gold ticker with ▲▼ arrows, category quick-links, featured products row, karat tiles with live prices, store shortcut card |
| **Catalog** | Full product grid — search bar, product type pills, karat chips (18K/21K/24K), sort dropdown, skeleton loading, pull-to-refresh |
| **Gold Prices** | Live 24K/21K/18K price cards, market open/closed indicator, last-updated time, ▲▼ change vs previous fetch |
| **Store** | Branch name, address, opening hours, one-tap Google Maps, call button, WhatsApp button, payment/warranty info cards |
| **Product Detail** | Hero image, live calculated price, weight + karat + specs, price breakdown, WhatsApp CTA, share button, star favorite |
| **Wishlist** | All starred products, clear all, empty state with CTA — persisted across app restarts |

### Features

| Feature | Detail |
|:--------|:-------|
| ⭐ Wishlist | Star any product from card or detail — saved to device AsyncStorage |
| 💬 WhatsApp CTA | Pre-filled Arabic message: name, karat, weight, price |
| 📤 Share product | Native OS share sheet with product summary |
| 📍 Store locator | One-tap Maps, Call, WhatsApp from the store tab |
| ▲▼ Price change | Shows % change vs the previous 60-second fetch |
| 💀 Skeleton loading | Shimmer placeholder cards while products load |
| 🔄 Pull to refresh | Gold-colored spinner on catalog and homepage |
| 📳 Haptic feedback | Light/medium/success vibration on every interaction |
| 🔤 Arabic RTL | Full right-to-left layout across all screens |
| 🌙 Luxury theme | Dark bg, gold accents, glassmorphism cards, entrance animations |

---

## 💰 Pricing Engine

Prices are calculated dynamically on the backend every time a product is fetched:

```
calculatedPrice = weight (g) × pricePerGram × karatPremium
```

| Karat | Premium | Notes |
|:------|:--------|:------|
| 24K | 1.03 | Near-pure gold, investment grade |
| 21K | 1.20 | Most common jewelry karat in Egypt |
| 18K | 1.25 | Modern, durable pieces |

**Price source priority:** GoldAPI.io (live) → MetalpriceAPI (fallback) → last cached DB value (offline fallback)

---

## 🎨 Design System

```typescript
// constants/theme.ts — key colors
bg:          '#0B0B12'               // Warm near-black background
gold:        '#C8952C'               // Primary gold
goldBright:  '#F0C040'               // Bright gold for prices + highlights
textPrimary: '#F5F0E8'               // Warm white text
glass:       'rgba(255,255,255,0.06)'// Glassmorphism card background
open:        '#22C55E'               // Market open / in stock
closed:      '#EF4444'               // Market closed / out of stock
```

Animations via `react-native-reanimated` 4. Blur via `expo-blur`. Staggered entrance animations on all major screens.

---

## 🔒 Security Status

| Item | Status |
|:-----|:-------|
| API keys in mobile code | ✅ None — all keys on backend only |
| `.env` in `.gitignore` | ✅ Fixed |
| Wishlist data | ✅ Local device only, never sent to server |
| Certificate/key files | ✅ All in `.gitignore` |
| `ADMIN_API_SECRET` | ⚠️ Change from `dev-secret` before deploying backend |
| EAS project ID | ⚠️ Replace placeholder in `app.json` before EAS build |
| Production API URL | ⚠️ Set real URL in `eas.json` before production build |

---

## 🗺️ Roadmap

### Features pending
- [ ] In-stock badge on product cards (`نفذت الكمية`)
- [ ] Product image gallery — swipe through multiple images on detail page
- [ ] Recently viewed products — horizontal row on homepage
- [ ] Price range filter slider on catalog screen
- [ ] Push notifications for new collection alerts

### Pre-launch checklist
- [ ] Real WhatsApp number in `constants/contact.ts`
- [ ] Real store address + Google Maps link in `store.tsx`
- [ ] Real app icon (1024×1024 PNG, no transparency) and splash screen
- [ ] Deploy backend to Vercel (currently local only — app breaks when laptop is off)
- [ ] Set real `ADMIN_API_SECRET` in backend `.env`
- [ ] Set EAS project ID in `app.json`
- [ ] Set production API URL in `eas.json`
- [ ] Apple Developer Account ($99/yr)
- [ ] Google Play Developer Account ($25 one-time)
- [ ] Privacy Policy URL (required by both stores)

---

## 📦 Tech Stack

| Layer | Technology | Version |
|:------|:-----------|:--------|
| Mobile framework | Expo | SDK 55 |
| Mobile runtime | React Native | 0.83 |
| Navigation | Expo Router | 55 |
| Backend | Next.js | 15 |
| Database ORM | Prisma | — |
| Database | SQLite | — |
| Data fetching | TanStack Query | v5 |
| Animations | React Native Reanimated | 4 |
| Local storage | AsyncStorage | 2.2.0 |
| Haptics | expo-haptics | ~55.0.8 |
| Blur | expo-blur | ~55.0.9 |
| Images | expo-image | ~55.0.6 |
| Language | TypeScript | throughout |

---

## 📄 Documentation Files

| File | Read when... |
|:-----|:-------------|
| **`README.md`** | Setting up the project, understanding what it does, showing it to others |
| **`MICHIEL_PROJECT_KNOWLEDGE.md`** | Continuing development, handing to an AI, debugging, pre-launch security check |

---

*Built for Michiel Jewelry, Cairo, Egypt · March 2026*
