import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWindowDimensions } from 'react-native';

// Import web app
import WebApp from '../web/app';

// Mock data - in production, this would come from your web app API
const mockGoldPrices = {
  karat18: 5535,
  karat21: 6458,
  karaat24: 7380,
  lastUpdated: new Date().toISOString()
};

const mockProducts = [
  {
    id: '1',
    nameAr: 'خاتم ذهبي عصري',
    price: 15069,
    weight: 3,
    karat: 18,
    type: 'ring',
    images: ['18k-ring.jpg']
  },
  {
    id: '2',
    nameAr: 'قلادة ذهبية معاصرة',
    price: 23180,
    weight: 8,
    karat: 18,
    type: 'necklace',
    images: ['/18k-necklace.jpg']
  },
  // Add more products...
];

const App = () => {
  const [isWebMode, setIsWebMode] = useState(true);
  const [showWebQR, setShowWebQR] = useState(false);
  const [showMobileQR, setShowMobileQR] = useState(false);
  const { width, height } = useWindowDimensions();

  useEffect(() => {
    setIsMobile(width < 768);
    setIsWebMode(width >= 768);
  }, [width, height]);

  const switchToWeb = () => {
    setIsWebMode(true);
    setShowWebQR(false);
    setShowMobileQR(false);
  };

  const switchToMobile = () => {
    setIsWebMode(false);
    setShowWebQR(false);
    setShowMobileQR(true);
  };

  const renderQRCode = () => {
    const qrData = JSON.stringify({
      app: 'com.michiel.jewelry',
      type: 'mobile',
      version: '1.0.0'
      timestamp: new Date().toISOString()
    });

    return (
      <View style={styles.qrContainer}>
        <Text style={styles.qrTitle}>مسح التطبيق</Text>
        <Text style={styles.qrDescription}>
          امسح هذا الكود للوصول إلى تطبيق الموبايل
        </Text>
        <View style={styles.qrCode}>
          <Text style={styles.qrCodeText}>{qrData}</Text>
        </View>
        <TouchableOpacity 
          style={styles.downloadButton}
          onPress={() => Alert.alert('حفظ الكود', 'سيتم نسخ الكود بنجاح!')}
        >
          <Text style={styles.downloadButtonText}>حفظ الكود</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderWebApp = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.appTitle}>مجوهرات ميشيل</Text>
        <Text style={styles.subtitle}>التطبيق الموبايل</Text>
        <TouchableOpacity 
          style={[styles.switchButton, !isWebMode ? styles.webButton : styles.mobileButton]}
          onPress={switchToMobile}
        >
          <Text style={styles.switchButtonText}>
            {isWebMode ? '🌐 عرض التطبيق' : '📱 عرض التطبيق'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ممميزات التطبيق</Text>
          <Text style={styles.sectionDescription}>
            {isWebMode 
              ? 'تطبيق الويب يعمل بسرعة وأداء على جميع الأجهزة' 
              : 'تطبيق الموبايل يوفر تجربة استخدام أفضل'}
          </Text>
        </View>

        <View style={styles.features}>
          <View style={styles.feature}>
            <Text style={styles.featureTitle}>📱 تطبيق ويب</Text>
            <Text style={styles.featureDesc}>يعمل بسرعة فائقة</Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureTitle}>🔄 تحديث تلقائي</Text>
            <Text style={styles.featureDesc}>أسعار الذهب المباشرة</Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureTitle}>💾 حفظ غير متصل</Text>
            <Text style={styles.featureDesc}>يعمل بدون اتصال</Text>
          </View>
        </View>
        </View>

        <View style={styles.features}>
          <View style={styles.feature}>
            <Text style={styles.featureTitle}>🎨 أداء فائقة</Text>
            <Text style={styles.featureDesc}>دفع آمن وسريع</Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureTitle}>📱 متجر إشعارات</Text>
            <Text style={styles.featureDesc}>إشعارات فورية</Text>
          </View>
        </View>
        </View>
      </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📱 تطبيق موبايل</Text>
          <Text style={styles.sectionDescription}>
            {isWebMode 
              ? 'معلومات عن تطبيق الويب' 
              : 'معلومات عن تطبيق الموبايل'}
          </Text>
        </View>

        <View style={styles.ctaContainer}>
          <TouchableOpacity 
            style={styles.ctaButton}
            onPress={() => Alert.alert('تنزيل التطبيق', 'سيتم تنزيل التطبيق بنجاح!')}
          >
            <Text style={styles.ctaButtonText}>تنزيل التطبيق</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📱 عرض التطبيق</Text>
          <Text style={styles.sectionDescription}>
            اختر الطريقة التي تفضلها:
          </Text>
        </View>

        <View style={styles.platformButtons}>
          <TouchableOpacity 
            style={[styles.platformButton, isWebMode ? styles.webButtonActive : styles.platformButton]}
            onPress={switchToWeb}
          >
            <Text style={styles.platformButtonText}>🌐 الويب</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.platformButton, !isWebMode ? styles.platformButton : styles.platformButtonActive]}
            onPress={switchToMobile}
          >
            <Text style={styles.platformButtonText}>📱 الموبايل</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.qrSection}>
          <Text style={styles.qrTitle}>مسح التطبيق</Text>
          <Text style={styles.qrDescription}>
            {isWebMode 
              ? 'امسح هذا الكود للوصول إلى تطبيق الويب' 
              : 'امسح هذا الكود للوصول إلى تطبيق الموبايل'}
          </Text>
          <Text style={styles.qrCodeText}>{showWebQR ? renderQRCode() : showMobileQR ? renderMobileQRCode() : null}</Text>
        </View>
        </View>
      </ScrollView>
    </View>
  );

  const renderMobileApp = () => (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.appTitle}>مجوهرات ميشيل</Text>
        <Text style={styles.subtitle}>التطبيق الموبايل</Text>
        <TouchableOpacity 
          style={[styles.switchButton, !isWebMode ? styles.webButton : styles.mobileButton]}
          onPress={switchToWeb}
        >
          <Text style={styles.switchButtonText}>
            {!isWebMode ? '🌐 عرض التطبيق' : '📱 عرض التطبيق'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ممميزات التطبيق</Text>
          <Text style={styles.sectionDescription}>
            {isWebMode 
              ? 'تطبيق الموبايل يوفر تجربة استخدام أفضل' 
              : 'تطبيق الموبايل يوفر تجربة استخدام أفضل'}
          </Text>
        </View>

        <View style={styles.features}>
          <View style={styles.feature}>
            <Text style={styles.featureTitle}>📱 تطبيق ويب</Text>
            <Text style={styles.featureDesc}>يعمل بسرعة فائقة</Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureTitle}>🔄 تحديث تلقائي</Text>
            <Text style={styles.featureDesc}>أسعار الذهب المباشرة</Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureTitle}>💾 حفظ غير متصل</Text>
            <Text style={styles.featureDesc}>يعمل بدون اتصال</Text>
          </View>
        </View>

        <View style={styles.features}>
          <View style={styles.feature}>
            <Text style={styles.featureTitle}>🎨 أداء فائقة</Text>
            <Text style={styles.featureDesc}>دفع آمن وسريع</Text>
          </View>
          <View style={styles.feature}>
            <text style={styles.featureDesc}>إشعارات فورية</Text>
          </View>
        </View>
        </View>
      </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📱 حول التطبيق</Text>
          <Text style={styles.sectionDescription}>
            {isWebMode 
              ? 'معلومات عن تطبيق الويب' 
              : 'معلومات عن تطبيق الموبايل'}
          </Text>
        </View>

        <View style={styles.ctaContainer}>
          <TouchableOpacity 
            style={styles.ctaButton}
            onPress={() => Alert.alert('تنزيل التطبيق', 'سيتم تنزيل التطبيق بنجاح!')}
          >
            <Text style={styles.ctaButtonText}>تنزيل التطبيق</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  </SafeAreaView>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#000000',
      paddingTop: Platform.OS === 'ios' ? 50 : 30,
    },
    header: {
      alignItems: 'center',
      paddingVertical: 20,
      backgroundColor: '#D4AF37',
      borderBottomWidth: 1,
      borderBottomColor: '#D4AF37',
    },
    appTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#FFFFFF',
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 16,
      color: '#D4AF37',
      textAlign: 'center',
      marginBottom: 8,
    },
    switchButton: {
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 8,
      borderWidth: 1,
      alignItems: 'center',
    },
    webButton: {
      backgroundColor: '#D4AF37',
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#D4AF37',
      alignItems: 'center',
    },
    webButtonActive: {
      backgroundColor: '#1C1C1C',
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#1C1C1C',
      alignItems: 'center',
    },
    mobileButton: {
      backgroundColor: '#000000',
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#333333',
      alignItems: 'center',
    },
    platformButton: {
      backgroundColor: '#000000',
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#333333',
      alignItems: 'center',
    },
    platformButtonActive: {
      backgroundColor: '#1C1C1C',
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#1C1C1C',
      alignItems: 'center',
    },
    switchButtonText: {
      fontSize: 14,
      fontWeight: 'bold',
      color: isWebMode ? '#000000' : '#FFFFFF',
      textAlign: 'center',
    },
    switchButtonText: {
      fontSize: 14,
      fontWeight: 'bold',
      color: isWebMode ? '#000000' : '#FFFFFF',
      textAlign: 'center',
    },
    section: {
      marginBottom: 30,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#D4AF37',
      textAlign: 'center',
      marginBottom: 16,
    },
    sectionDescription: {
      fontSize: 16,
      color: '#FFFFFF',
      textAlign: 'center',
      lineHeight: 24,
      paddingHorizontal: 20,
    },
    features: {
      backgroundColor: '#1C1C1C',
      padding: 20,
      borderRadius: 12,
      marginBottom: 20,
    },
    featureTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#D4AF37',
      textAlign: 'center',
      marginBottom: 12,
    },
    featureDesc: {
      fontSize: 14,
      color: '#FFFFFF',
      textAlign: 'center',
      lineHeight: 20,
      paddingHorizontal: 20,
    },
    feature: {
      alignItems: 'center',
      marginBottom: 8,
    },
    qrContainer: {
      alignItems: 'center',
      backgroundColor: '#1C1C1C',
      padding: 20,
      borderRadius: 12,
      marginBottom: 20,
    },
    qrTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#D4AF37',
      textAlign: 'center',
      marginBottom: 16,
    },
    qrDescription: {
      fontSize: 14,
      color: '#FFFFFF',
      textAlign: 'center',
      lineHeight: 20,
      paddingHorizontal: 20,
    },
    qrCodeText: {
      fontSize: 12,
      color: '#D4AF37',
      textAlign: 'center',
      fontFamily: 'monospace',
      padding: 10,
      backgroundColor: '#000000',
      borderRadius: 8,
    },
    ctaContainer: {
      alignItems: 'center',
      marginTop: 30,
    },
    ctaButton: {
      backgroundColor: '#D4AF37',
      paddingHorizontal: 20,
      paddingVertical: 15,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#D4AF37',
      alignItems: 'center',
    },
    ctaButtonText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#000000',
      textAlign: 'center',
    },
    },
    platformButtons: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 10,
      marginTop: 20,
    },
    content: {
      flex: 1,
      padding: 20,
    },
    scrollView: {
      flex: 1,
    },
  });
};

export default function App() {
  return (
    <View style={styles.container}>
      {isWebMode ? renderWebApp() : renderMobileApp()}
    </View>
  );
}