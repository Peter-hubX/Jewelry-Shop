# Michiel Jewelry — Mobile App Project Knowledge File
> Hand this file to any AI at the start of a new session to get full context immediately.
> Last updated: March 2026

---

## 1. Project Overview

**What it is:** A React Native + Expo mobile app for an Arabic-first gold jewelry shop in Egypt called Michiel Jewelry (مجوهرات ميشيل). The app is a catalog browser — no checkout or payments. Customers browse products, see live gold prices, and contact the shop via WhatsApp.

**What exists:** Two separate codebases that must both run together:
- `Jewelry-Shop-main/` — Next.js 15 backend (web admin + REST API + Prisma/SQLite database)
- `Jewelry-Shop-main/michiel-jewelry-app/` — Expo mobile app (the client)

**Stack:**
- Mobile: Expo SDK 55, Expo Router 55, React Native 0.83, React 19, Reanimated 4, TanStack Query v5
- Backend: Next.js 15, Prisma, SQLite (`db/custom.db`), TypeScript
- State: TanStack Query for server state, AsyncStorage for local persistence

---

## 2. How to Run the Project

**Both must run simultaneously. Two terminals required:**

```bash
# Terminal 1 — backend
cd Jewelry-Shop-main
npm run dev
# Runs on http://localhost:3000 (or http://{YOUR_IP}:3000 for device testing)

# Terminal 2 — mobile
cd Jewelry-Shop-main/michiel-jewelry-app
npx expo start --clear
```

**Critical: The `.env` file in `michiel-jewelry-app/` must point to your current local IP:**
```
EXPO_PUBLIC_API_URL=http://192.168.X.X:3000
```
This IP changes every time you switch networks. Run `ipconfig` (Windows) or `ifconfig` (Mac) to find current IP. Always restart Expo with `--clear` after changing `.env`.

---

## 3. Architecture & File Structure

### Mobile app (`michiel-jewelry-app/`)
```
app/
  _layout.tsx              ← Root: GestureHandlerRootView + QueryClient + WishlistProvider
  (tabs)/
    _layout.tsx            ← Tabs: home, catalog, gold-prices, store. Header has wishlist ⭐ button
    index.tsx              ← Homepage: hero, gold ticker, category pills, featured products, karat tiles, store section
    catalog.tsx            ← Product grid: search, type pills, karat chips, sort dropdown
    gold-prices.tsx        ← Live gold prices: 24K/21K/18K cards with change arrows
    store.tsx              ← Store locator: address, hours, map link, call, WhatsApp
  product/[id].tsx         ← Product detail: image, price, specs, WhatsApp, share, star favorite
  wishlist.tsx             ← Wishlist screen (modal)

components/
  ProductCard.tsx          ← Card used in catalog grid (has ⭐ star button)
  SkeletonCard.tsx         ← Shimmer loading placeholder
  WishlistButton.tsx       ← Reusable heart/star button (currently unused — star logic is inline)
  AmbientBackground.tsx
  GlassCard.tsx

hooks/
  useProducts.ts           ← TanStack Query for product list
  useGoldPrice.ts          ← TanStack Query with prev price tracking (60s refetch)
  useWishlist.ts           ← AsyncStorage-backed wishlist state

context/
  WishlistContext.tsx      ← Context provider wrapping useWishlist

services/
  api.ts                   ← BASE_URL from EXPO_PUBLIC_API_URL, fetch helpers with 10s timeout

utils/
  haptics.ts               ← expo-haptics wrapper (hapticLight, hapticMedium, hapticSuccess, hapticSelection)

constants/
  theme.ts                 ← Colors, Spacing, Radius, FontSize, Shadow, KaratPremiums, DEMO_IMAGES
  contact.ts               ← WHATSAPP_NUMBER, buildWhatsAppUrl(), buildProductInquiryMessage()
  localImages.ts           ← Local image registry (resolveLocalImage by product ID or type)
```

### Backend (`Jewelry-Shop-main/`)
```
src/app/api/
  products/route.ts        ← GET /api/products?karat=&type=&search=
  products/[id]/route.ts   ← GET/PUT/DELETE /api/products/:id (Next.js 15: await params)
  gold-prices/route.ts     ← GET /api/gold-prices
  categories/route.ts      ← GET /api/categories
```

---

## 4. Key Technical Facts

### Product IDs
**Product IDs are cuid strings** (e.g., `cmmj8e0eb0006fdakv2z7kh2l`), NOT integers.
- ❌ NEVER do `Number(id)` or `parseInt(id)`
- ✅ Always pass as `string`
- This was the main cause of the product detail page 404 bug

### Next.js 15 params must be awaited
```typescript
// ❌ WRONG (throws error in Next.js 15)
export async function GET(_req, { params }) {
  const { id } = params;

// ✅ CORRECT
export async function GET(_req, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
```

### Gold price calculation
```
calculatedPrice = weight × pricePerGram × karatPremium
KaratPremiums: { '24K': 1.03, '21K': 1.20, '18K': 1.25 }
```
The backend always returns `calculatedPrice` pre-computed based on live gold prices. The mobile app displays it directly.

### RTL handling
The app uses Arabic RTL. Horizontal scrolls use `transform: [{ scaleX: -1 }]` on the ScrollView and each item to achieve correct RTL scroll direction without breaking flex layout.

### Image resolution priority
```
local asset by product ID → API image URL → local asset by product type → Unsplash demo fallback
```

---

## 5. What's Been Built (Completed Features)

### UI/UX
- [x] Dark luxury theme: near-black bg (`#0B0B12`), gold accents (`#C8952C`)
- [x] Full Arabic RTL layout across all screens
- [x] Animated hero section with entrance animations (Reanimated 4)
- [x] Gold shimmer lines, corner accent ornaments
- [x] Hero quick stats (٥٠٠+ قطعة, ٣ عيارات, ١٠٠٪ ذهب حقيقي)
- [x] Blurred tab bar (`expo-blur`) with gold top border
- [x] Skeleton loading cards (shimmer animation, staggered)
- [x] Pull-to-refresh on homepage and catalog (gold colored spinner)
- [x] Haptic feedback on all interactive elements (expo-haptics)
- [x] Product cards with star ⭐ wishlist button
- [x] "جديد" badge on first 3 featured products

### Screens
- [x] **Homepage**: Hero + gold ticker + category pills + featured products + karat tiles + store section
- [x] **Catalog**: Search + type filter pills + karat chips + sort dropdown + product grid
- [x] **Gold Prices**: 24K/21K/18K cards with ▲▼ change arrows vs previous fetch
- [x] **Store Locator**: Map button, call button, WhatsApp, opening hours, info cards
- [x] **Product Detail**: Hero image, price card, WhatsApp CTA, share button, star favorite, specs grid, price breakdown
- [x] **Wishlist**: Modal screen with saved products grid, clear all, empty state CTA

### Features
- [x] Live gold prices (60s auto-refresh, market open/closed indicator)
- [x] Gold price change arrows (▲▼ vs previous fetch value, percentage)
- [x] Karat filter from homepage tiles navigates to catalog with filter applied
- [x] WhatsApp pre-filled Arabic inquiry message
- [x] Share product via native share sheet
- [x] Wishlist persisted to AsyncStorage (survives app restart)
- [x] AsyncStorage cache persistence for products (24h, offline-first)

---

## 6. Bugs We Hit & How We Fixed Them

### Bug 1: Product detail page showing blank
**Cause:** Backend route `GET /api/products/[id]` didn't exist at all.
**Fix:** Created `src/app/api/products/[id]/route.ts`
**Also:** Product IDs were being converted with `Number(id)` — they're cuid strings, not integers.

### Bug 2: Products not loading on mobile, `ERR_CONNECTION_TIMED_OUT`
**Cause:** `.env` had old IP address (`172.20.10.13`) but network changed to `192.168.0.195`.
**Fix:** Update `EXPO_PUBLIC_API_URL` in `.env` to current IP, then `npx expo start --clear`.

### Bug 3: `fadeStyle is not defined` crash in catalog
**Cause:** When adding the karat filter `useEffect`, the `fadeStyle` declaration was accidentally displaced.
**Fix:** Ensure `const fadeStyle = useAnimatedStyle(...)` appears immediately after `const fadeIn = useSharedValue(0)` before any useEffect.

### Bug 4: Karat filter from homepage tiles not applying
**Cause:** Catalog tab mounts once and `useState(params.karat)` only reads params on first mount. Subsequent navigation pushes new params but state doesn't update.
**Fix:** Add `useEffect` that watches `params.karat` and `params.type`:
```typescript
useEffect(() => {
  if (params.karat) setKarat(params.karat as ProductFilters['karat']);
  if (params.type)  setProductType(params.type as ProductType);
}, [params.karat, params.type]);
```

### Bug 5: `GestureHandlerRootView` module not found
**Cause:** Added `GestureHandlerRootView` wrapper in `_layout.tsx` before `react-native-gesture-handler` was installed.
**Fix:** Either install with `npx expo install react-native-gesture-handler` or remove the wrapper (it's optional at root level).

### Bug 6: Back button and star icon overlapping in catalog header
**Cause:** Catalog screen had its own back button AND the tab layout showed the wishlist star in the header — both appeared in top-right.
**Fix:** Remove the back button from the catalog screen entirely (it's a tab, there's nothing to go back to). The back button only belongs on `product/[id].tsx`.

### Bug 7: `shadow*` style props deprecated warnings
**Cause:** React Native web doesn't support `shadowColor`, `shadowOffset` etc. — use `boxShadow` instead.
**Impact:** Non-breaking warnings only. Fine for development, fix before production web build.

### Bug 8: `textShadow*` style props deprecated
**Same as Bug 7** — applies to `textShadowColor`, `textShadowOffset`, `textShadowRadius`.

---

## 7. Security Audit Results

### Fixed ✅
- `.env` added to `.gitignore` (was only ignoring `.env*.local`)
- Duplicate WhatsApp number removed from `app.json` `extra.whatsappNumber`
- 10-second fetch timeout added to `services/api.ts` json() function

### Still Needs Fixing Before Launch
| Issue | Where | Priority |
|-------|--------|----------|
| EAS project ID is placeholder | `app.json` → `extra.eas.projectId` | Before first EAS build |
| Production API URL not set | `eas.json` → preview + production env | Before first production build |
| `localhost` fallback in api.ts | `services/api.ts` → BASE_URL | Replace with hard error |
| Apple/Google store credentials | `eas.json` → submit.production | Before store submission |
| Backend ADMIN_API_SECRET is `dev-secret` | `Jewelry-Shop-main/.env` | Before deploying backend |
| Backend GOLD_PRICE_UPDATE_SECRET is `dev-secret` | `Jewelry-Shop-main/.env` | Before deploying backend |

### Good — Already Correct ✅
- No API keys in mobile code (GoldAPI key stays on backend only)
- Certificate/key files in `.gitignore`
- Wishlist stored locally only (AsyncStorage, never sent to server)
- No sensitive data in `app.json` extra

---

## 8. Remaining To-Do (Not Yet Built)

### Feature backlog
- [ ] **In-stock badge** on product cards (`نفذت الكمية` overlay) — waiting for real product data
- [ ] **Product image gallery** — swipe through multiple images on detail page
- [ ] **Recently viewed** — AsyncStorage, shown as horizontal row on homepage
- [ ] **Price range filter slider** on catalog screen
- [ ] **Push notifications** — Expo push for new collection alerts (backend endpoint needed)

### Pre-launch checklist
- [ ] Replace `WHATSAPP_NUMBER` in `constants/contact.ts` with real business number
- [ ] Update store address + Google Maps link in `app/(tabs)/store.tsx`
- [ ] Create real app icon (1024×1024 PNG, no transparency) — currently placeholder
- [ ] Create real splash screen — currently placeholder
- [ ] Deploy backend to Vercel (currently only runs locally — app breaks when laptop is off)
- [ ] Set real `ADMIN_API_SECRET` and `GOLD_PRICE_UPDATE_SECRET` in backend `.env`
- [ ] Set EAS project ID in `app.json`
- [ ] Set production API URL in `eas.json`
- [ ] Apple Developer Account ($99/yr)
- [ ] Google Play Developer Account ($25 one-time)
- [ ] Privacy Policy URL (required by both stores)

---

## 9. Package Versions (as of March 2026)

```json
{
  "expo": "~55.0.5",
  "react": "19.2.0",
  "react-native": "0.83.2",
  "expo-router": "~55.0.5",
  "react-native-reanimated": "4.2.1",
  "react-native-gesture-handler": "~2.30.0",
  "@tanstack/react-query": "^5.64.0",
  "@react-native-async-storage/async-storage": "2.2.0",
  "expo-haptics": "~55.0.8",
  "expo-blur": "~55.0.9",
  "expo-image": "~55.0.6",
  "expo-linear-gradient": "~55.0.8"
}
```

Node.js warning: v20.16.0 installed but packages prefer ≥20.19.4. Non-breaking — update to Node v22 LTS when convenient.

---

## 10. Prompts to Give the Next AI

### To continue where we left off
```
I'm building a React Native + Expo mobile app for an Arabic jewelry shop called Michiel Jewelry.
Read MICHIEL_PROJECT_KNOWLEDGE.md for full context. The latest app code is in Jewelry-Mobile-App-master.zip.
Backend is a Next.js 15 app in Jewelry-Shop-main/. 

Current status: app is fully functional with catalog, gold prices, wishlist, store locator, share, haptics, pull-to-refresh, skeleton loading, and price change arrows.

Next task: [describe what you want to build]
```

### To start push notifications
```
I need to add push notifications to my Expo React Native app (Michiel Jewelry).
When the admin adds a new product collection, all app users should get a notification.
Stack: Expo SDK 55, expo-notifications, Next.js 15 backend.
Steps needed: (1) register device token on app launch, (2) save token to backend DB, (3) add POST /api/push/send endpoint to Next.js, (4) add "notify customers" button in admin panel.
```

### To deploy backend to Vercel
```
I need to deploy my Next.js 15 app to Vercel. It uses Prisma with SQLite which won't work on Vercel's serverless.
I need to migrate from SQLite to a cloud database (suggest best option for a small Arabic jewelry shop).
Current schema uses: products, categories, goldPriceSetting tables.
```

---

## 11. Design System Reference

```typescript
Colors = {
  bg: '#0B0B12',           // Dark background
  gold: '#C8952C',         // Primary gold
  goldLight: '#D4A832',
  goldMid: '#C8952C',
  goldDark: '#8B6511',
  goldBright: '#F0C040',
  goldBorder: 'rgba(200,149,44,0.35)',
  glass: 'rgba(255,255,255,0.06)',
  glassBorder: 'rgba(255,255,255,0.10)',
  glassGold: 'rgba(200,149,44,0.12)',
  glassGoldBorder: 'rgba(200,149,44,0.30)',
  textPrimary: '#F5F0E8',
  textSecond: 'rgba(245,240,232,0.70)',
  textMuted: 'rgba(245,240,232,0.40)',
  open: '#22C55E',          // Market open / in stock green
  closed: '#EF4444',        // Market closed / out of stock red
  white: '#FFFFFF',
  surface: '#1A1A2E',
  surfaceAlt: '#141420',
}

KaratPremiums = { '24K': 1.03, '21K': 1.20, '18K': 1.25 }
```

---

*This file was generated from session transcripts covering March 10–15, 2026.*
