# Gold Price Update System Documentation

## Overview
This system automatically updates gold prices for all products in the Michiel Jewelry Shop based on current market prices in Egypt.

## Features

### 1. Real-Time Price Updates
- **API Endpoint**: `/api/gold-prices` (POST)
- **Function**: Fetches current gold prices from web search
- **Updates**: All 24K, 21K, and 18K products automatically
- **Pricing Logic**:
  - 24K Gold: Base market price + 15% manufacturing premium
  - 21K Gold: (24K price × 0.875) + 25% design costs
  - 18K Gold: (24K price × 0.75) + 30% design costs

### 2. Admin Panel
- **Location**: Bottom of the main page, before footer
- **Features**:
  - Manual price update button
  - Last update timestamp
  - Product count display
  - Success/error messages
  - Real-time UI updates

### 3. Automated Updates
- **API Endpoint**: `/api/gold-prices/schedule` (POST)
- **Purpose**: For cron jobs or automated schedulers
- **Security**: Requires Bearer token authentication
- **Usage**: Can be called by external scheduling services

## How It Works

### Price Detection
1. Uses ZAI web search to find current gold prices in Egypt
2. Searches for "سعر الذهب اليوم في مصر 24 عيار جرام"
3. Extracts price from search results using regex patterns
4. Falls back to 4500 EGP/gram if web search fails

### Price Calculation
1. **24K Gold Bars**: `weight × basePrice × 1.15`
2. **21K Jewelry**: `weight × (basePrice × 0.875) × 1.25`
3. **18K Jewelry**: `weight × (basePrice × 0.75) × 1.30`

### Database Updates
- Updates all products in real-time
- Sets `updatedAt` timestamp for each product
- Maintains price history through database logs

## Setup Instructions

### 1. Environment Variables
Add to your `.env.local` file:
```env
GOLD_PRICE_UPDATE_SECRET=your-secret-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Manual Updates
- Go to the main page
- Scroll to "لوحة تحديث الأسعار" section
- Click "تحديث أسعار الذهب الآن"
- Wait for completion message

### 3. Automated Updates (Optional)
Set up a cron job to call:
```bash
curl -X POST http://localhost:3000/api/gold-prices/schedule \
  -H "Authorization: Bearer your-secret-key-here" \
  -H "Content-Type: application/json"
```

Example cron schedule (update twice daily):
```bash
0 9,17 * * * curl -X POST http://localhost:3000/api/gold-prices/schedule -H "Authorization: Bearer your-secret-key-here" -H "Content-Type: application/json"
```

## API Responses

### Success Response
```json
{
  "success": true,
  "message": "Gold prices updated successfully",
  "data": {
    "basePricePerGram": 4500,
    "karat21Price": 3937,
    "karat18Price": 3375,
    "updatedGoldBars": [...],
    "totalProductsUpdated": 25,
    "lastUpdated": "2024-01-15T10:30:00.000Z"
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Failed to update gold prices",
  "message": "Detailed error message"
}
```

## Gold Bar Products Available
- 0.5 gram, 1 gram, 2 gram, 4 gram
- 8 gram, 16 gram, 32 gram, 64 gram, 100 gram
- All bars are LBMA certified
- Manufacturers: PAMP Suisse, Valcambi, Metalor

## Security Considerations
- Schedule endpoint requires authentication
- Rate limiting recommended for production
- Audit logging enabled for all updates
- Fallback prices prevent service disruption

## Monitoring
- Check browser console for update logs
- Monitor database `updatedAt` timestamps
- Track API response times
- Set up alerts for failed updates

## Benefits
1. **Always Accurate**: Prices reflect current market rates
2. **Automated**: Minimal manual intervention required
3. **Comprehensive**: Updates all product types simultaneously
4. **Transparent**: Clear feedback on update status
5. **Scalable**: Can handle thousands of products
6. **Reliable**: Fallback mechanisms ensure service continuity

## Future Enhancements
- Integration with dedicated gold price APIs
- Historical price tracking
- Price trend analysis
- Automated email notifications
- Mobile app notifications
- Advanced reporting dashboard