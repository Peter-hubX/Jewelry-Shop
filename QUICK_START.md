# Quick Start Guide - Get Your App Running

## ✅ Current Status
All code fixes have been applied! The application should work, but you need to complete a few setup steps.

---

## 🚀 Setup Steps (5 minutes)

### Step 1: Create Environment File
Create a `.env` file in the root directory:

```env
# Database (required)
DATABASE_URL="file:./db/custom.db"

# API Secrets (required - change these!)
ADMIN_API_SECRET="dev-secret-change-me"
GOLD_PRICE_UPDATE_SECRET="dev-secret-change-me"

# External APIs (optional - app works without these)
# METALS_API_KEY="your-key-here"
# EXCHANGE_RATE_API_KEY="your-key-here"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**Note**: The app will work with just the required variables. API keys are optional but recommended for accurate gold prices.

---

### Step 2: Install Dependencies (if not already done)
```bash
npm install
```

---

### Step 3: Setup Database
```bash
# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push

# Seed the database with sample products
npm run db:seed
```

---

### Step 4: Start the Development Server
```bash
npm run dev
```

The app will be available at: **http://localhost:3000**

---

## ✅ What Should Work Now

1. **Homepage** - Should display correctly
2. **Products** - Should show all products with images
3. **Gold Prices** - Should display (uses fallback price if no API key)
4. **Categories** - Should work
5. **Image Display** - Should show images with fallback placeholders

---

## 🔍 Testing the Application

### Test 1: View Products
- Go to http://localhost:3000
- Click on "المنتجات" (Products)
- You should see products with images

### Test 2: View Gold Prices
- Click on "أسعار الذهب" (Gold Prices)
- You should see prices for 18K, 21K, and 24K gold

### Test 3: Test API (Optional)
```bash
# Get products
curl http://localhost:3000/api/products

# Get gold prices
curl http://localhost:3000/api/gold-prices
```

---

## ⚠️ Common Issues & Solutions

### Issue: "Database not found"
**Solution**: Run `npm run db:push` and `npm run db:seed`

### Issue: "Products not showing"
**Solution**: Make sure you ran `npm run db:seed` to populate the database

### Issue: "Gold prices showing 0 or wrong values"
**Solution**: 
- This is normal if you don't have API keys
- The app uses fallback prices (4500 EGP/gram)
- To get real-time prices, add API keys to `.env`

### Issue: "Images not loading"
**Solution**: 
- Check that images exist in the `public/` folder
- The app has fallback placeholders, so it should still work

### Issue: "Authentication errors when creating products"
**Solution**: 
- POST endpoints now require authentication
- Use the Bearer token: `Authorization: Bearer dev-secret-change-me`
- Or update the secret in `.env` and use that

---

## 🎯 What's Working vs What Needs API Keys

### ✅ Works Without API Keys:
- Product display
- Image display (with fallbacks)
- Category filtering
- All GET endpoints
- Gold prices (uses fallback: 4500 EGP/gram)

### 🔑 Needs API Keys (Optional):
- Real-time gold prices (Metals API)
- Real-time currency conversion (Exchange Rate API)

**The app is fully functional without API keys!** API keys just make prices more accurate.

---

## 📝 Next Steps (Optional)

1. **Get API Keys** (for accurate prices):
   - Metals API: https://metals.live/ (free tier available)
   - Exchange Rate API: https://www.exchangerate-api.com/ (free tier available)

2. **Change Default Secrets**:
   - Update `ADMIN_API_SECRET` and `GOLD_PRICE_UPDATE_SECRET` in `.env`
   - Use strong, random strings

3. **Update Gold Prices**:
   - Call POST `/api/gold-prices` with authentication
   - Or set up a cron job to call `/api/gold-prices/schedule`

---

## ✨ Summary

**The app should work right now!** Just:
1. ✅ Create `.env` file (copy the template above)
2. ✅ Run `npm install` (if needed)
3. ✅ Run `npm run db:push` and `npm run db:seed`
4. ✅ Run `npm run dev`
5. ✅ Open http://localhost:3000

That's it! 🎉

