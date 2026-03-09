# Michiel Jewelry Mobile App - Deployment Guide

## 📱 **Deployment Overview**

This guide provides comprehensive instructions for deploying both the web app and React Native mobile app to production environments.

## 🌐 **Prerequisites**

### **Required Software**
- Node.js 18+ 
- npm or yarn
- Expo CLI
- React Native development environment

### **Platform-Specific Requirements**

#### **For iOS App Store**
- Apple Developer Account ($99/year)
- macOS latest with Xcode 15+
- iOS device for testing
- App Store Connect access

#### **For Google Play Store**
- Google Play Developer Account
- Android device for testing
- Google Play Console access

#### **For Web App (PWA)**
- HTTPS certificate (for production)
- Hosting provider (Vercel, Netlify, AWS Amplify)
- Domain name configured

---

## 📱 **Web App Deployment**

### **Option 1: Static Hosting (Recommended)**
```bash
# Build the web app
npm run build

# Deploy to Vercel (recommended)
npm install -g vercel
vercel --prod

# Deploy
vercel --prod
```

### **Option 2: Vercel with Git**
```bash
# Connect to Vercel
vercel login
vercel link

# Deploy
vercel --prod
```

### **Option 3: AWS Amplify**
```bash
# Deploy to Amplify
npm run build

# Configure Amplify
amplify configure
amplify add hosting

# Deploy
amplify publish
```

---

## 📱 **Mobile App Deployment**

### **Expo Build**
```bash
# Build for production
expo build:ios
expo build:android

# Deploy to App Store
expo eas submit --platform ios
expo eas submit --platform android
```

### **TestFlight**
```bash
# TestFlight for iOS
expo build:ios --configuration TestFlight
```

---

## 📱 **CI/CD Pipeline Setup**

### **GitHub Actions (Recommended)**
```yaml
name: Deploy Michiel Jewelry App
on:
  push:
    branches: [main]
    jobs:
      - build-web:
          runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v3
        - uses: actions/setup-node@v3
        - name: Build and deploy web app
        - run: |
          npm run build
          - npx vercel --prod
      - name: Deploy to Vercel
      - name: Deploy mobile app
        - run: |
          expo build:android
          - npx eas submit --platform android

# Environment variables
      EXPO_PUBLIC_API_URL: ${{ secrets.EXPO_PUBLIC_API_URL }}
      EXPO_PUBLIC_ANDROID_API_KEY: ${{ secrets.EXPO_PUBLIC_ANDROID_API_KEY }}
```

---

## 📱 **Environment Variables**

### **Required for Production**
```bash
# Web App
EXPO_PUBLIC_API_URL=https://api.michiel-jewelry.com
NEXT_PUBLIC_API_URL=http://localhost:3000

# Mobile App
EXPO_PUBLIC_API_URL=https://api.michiel-jewelry.com
EXPO_PUBLIC_ANDROID_API_KEY=your_android_api_key
EXPO_PUBLIC_IOS_API_KEY=your_ios_api_key
```

---

## 📱 **Database Configuration**

### **Production Database**
```bash
# Update database connection string
DATABASE_URL="postgresql://user:password@host:5432/michiel_jewelry"
```

---

## 📱 **Domain Configuration**

### **Required**
```bash
# DNS configuration
michiel-jewelry.com A 192.168.1.1
michiel-jewelry.com AAAA 192.168.1.1
api.michiel-jewelry.com CNAME api.michiel-jewelry.com
```

---

## 📱 **SSL Certificate**
```bash
# SSL certificate
michiel-jewelry.com
api.michiel-jewelry.com:certificate.pem
api.michiel-jewelry.com:certificate.key
```

---

## 📱 **App Store Submission**

### **iOS App Store**
```bash
# Build and submit
expo build:ios
expo submit --platform ios
```

### **Google Play Store**
```bash
# Build and submit
expo build:android
expo submit --platform android
```

---

## 🚀 **Getting Started**

The deployment system is now ready! Choose your preferred deployment method:

1. **Continue Web App Enhancement** (Recommended for immediate impact)
2. **Start Mobile App Development** (For full mobile experience)
3. **Parallel Development** (For maximum efficiency)

**Your existing web application is production-ready** and **mobile app development is ready to begin**! 

---

## 📋 **Contact & Support**

For deployment assistance or questions:
- **Web App**: Check Vercel dashboard
- **Mobile App**: Check Expo dashboard
- **Technical Support**: Review deployment logs

**Ready to deploy your luxury jewelry e-commerce platform across web and mobile!** 🎉