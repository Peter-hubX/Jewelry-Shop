import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'مجوهرات ميشيل',
            headerStyle: {
              backgroundColor: '#000000',
            },
            headerTintColor: '#D4AF37',
          }}
        />
        <Stack.Screen
          name="Products"
          component={ProductsScreen}
          options={{
            title: 'المنتجات',
          headerStyle: {
              backgroundColor: '#000000',
            },
            headerTintColor: '#D4AF37',
          }}
        />
        <Stack.Screen
          name="GoldPrices"
          component={GoldPricesScreen}
          options={{
            title: 'أسعار الذهب',
            headerStyle: {
              backgroundColor: '#000000',
            },
            headerTintColor: '#D4AF37',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>مجوهرات ميشيل</Text>
          <Text style={styles.subtitle}>حرفية تمتد عبر الزمن</Text>
        </View>
        
        <View style={styles.content}>
          <Text style={styles.description}>
            مرحباً بك في تطبيق مجوهرات ميشيل الموبايل!
          </Text>
          <Text style={styles.description}>
            هذا التطبيق تحت التطوير ويحتوي على:
          </Text>
          <Text style={styles.feature}>• عرض المنتجات</Text>
          <Text style={styles.feature}>• أسعار الذهب المباشرة</Text>
          <Text style={styles.feature}>• إشعارات تحديث الأسعار</Text>
          <Text style={styles.feature}>• وضع غير اتصال</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.button}
          onPress={() => Alert.alert('قريباً', 'التطبيق لا يزال متصلاً بعد. شكراً لصبركم!')}
        >
          <Text style={styles.buttonText}>العود إلى التطبيق الرئيسي</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function ProductsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>المنتجات</Text>
          <Text style={styles.subtitle}>تصفح مجموعتنا الذهبية</Text>
        </View>
        
        <View style={styles.content}>
          <Text style={styles.description}>
            هنا يمكنك استعراض جميع منتجاتنا الذهبية:
          </Text>
          <Text style={styles.feature}>• تصفية حسب العيار (18، 21، 24)</Text>
          <Text style={styles.feature}>• عرض الوزن والسعر</Text>
          <Text style={styles.feature}>• صور عالية الجودة</Text>
          <Text style={styles.feature}>• تفاصيل المنتجات</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function GoldPricesScreen() {
  const [prices, setPrices] = React.useState({
    karat18: 0,
    karat21: 0,
    karat24: 0,
    lastUpdated: null
  });

  React.useEffect(() => {
    // Fetch prices from web app
    fetch('https://michiel-jewelry.com/api/gold-prices')
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setPrices({
            karat18: data.data.karat18Price,
            karat21: data.data.karat21Price,
            karat24: data.data.karat24Price,
            lastUpdated: data.data.lastUpdated
          });
        }
      })
      .catch(error => {
        console.error('Error fetching prices:', error);
      });
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>أسعار الذهب</Text>
          <Text style={styles.subtitle}>الأسعار المباشرة من السوق</Text>
        </View>
        
        <View style={styles.content}>
          <Text style={styles.priceTitle}>18 عيار:</Text>
          <Text style={styles.price}>{prices.karat18} ج.م/جرام</Text>
          
          <Text style={styles.priceTitle}>21 عيار:</Text>
          <Text style={styles.price}>{prices.karat21} ج.م/جرام</Text>
          
          <Text style={styles.priceTitle}>24 عيار:</Text>
          <Text style={styles.price}>{prices.karat24} ج.م/جرام</Text>
          
          <Text style={styles.updateTime}>
            آخر تحديث: {prices.lastUpdated ? new Date(prices.lastUpdated).toLocaleString('ar-EG') : 'غير متوفر'}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#D4AF37',
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#D4AF37',
    marginBottom: 16,
    textAlign: 'center',
  },
  content: {
    padding: 20,
  },
  description: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  feature: {
    fontSize: 14,
    color: '#D4AF37',
    marginBottom: 8,
    textAlign: 'right',
  },
  button: {
    backgroundColor: '#D4AF37',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  priceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginBottom: 8,
    textAlign: 'center',
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
    backgroundColor: '#1C1C1C',
    padding: 10,
    borderRadius: 8,
  },
  updateTime: {
    fontSize: 12,
    color: '#D4AF37',
    textAlign: 'center',
    marginTop: 20,
  },
});