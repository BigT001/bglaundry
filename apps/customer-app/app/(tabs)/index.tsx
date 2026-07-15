import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getBasketItemsCount, subscribeBasket } from '../booking/basketState';
import axios from 'axios';

// Comprehensive fallback service items list for offline searching
const FALLBACK_SEARCH_ITEMS = [
  { name: 'T-Shirt / Polo', category: 'Clothing', icon: 'tshirt-crew', price: 700, code: 'WASH_IRON', hasWashIron: true },
  { name: 'Dress Shirt', category: 'Clothing', icon: 'tshirt-v', price: 1000, code: 'WASH_IRON', hasWashIron: true },
  { name: 'Trouser', category: 'Clothing', icon: 'hanger', price: 700, code: 'WASH_IRON', hasWashIron: true },
  { name: 'Jeans', category: 'Clothing', icon: 'hanger', price: 1000, code: 'WASH_IRON', hasWashIron: true },
  { name: 'Shorts', category: 'Clothing', icon: 'hanger', price: 500, code: 'WASH_IRON', hasWashIron: true },
  { name: 'Casual/Formal Shirt', category: 'Clothing', icon: 'tshirt-v', price: 800, code: 'WASH_IRON', hasWashIron: true },
  { name: 'Blouse', category: 'Clothing', icon: 'tshirt-v', price: 800, code: 'WASH_IRON', hasWashIron: true },
  { name: 'Dress', category: 'Clothing', icon: 'hanger', price: 2000, code: 'WASH_IRON', hasWashIron: true },
  { name: 'Two-Piece Suit', category: 'Clothing', icon: 'tie', price: 3500, code: 'WASH_IRON', hasWashIron: true },
  { name: 'Blazer', category: 'Clothing', icon: 'hanger', price: 1500, code: 'WASH_IRON', hasWashIron: true },
  { name: 'Senator Wear (2 pcs)', category: 'Clothing', icon: 'account', price: 1500, code: 'WASH_IRON', hasWashIron: true },
  { name: 'Agbada (Complete Set)', category: 'Clothing', icon: 'account', price: 3500, code: 'WASH_IRON', hasWashIron: true },
  { name: 'Kaftan', category: 'Clothing', icon: 'account', price: 2000, code: 'WASH_IRON', hasWashIron: true },
  { name: 'Jacket', category: 'Clothing', icon: 'hanger', price: 1500, code: 'WASH_IRON', hasWashIron: true },
  { name: 'Tie', category: 'Clothing', icon: 'tie', price: 300, code: 'WASH_IRON', hasIron: true },
  { name: 'Bed Sheet', category: 'Household', icon: 'bed-empty', price: 1500, code: 'HOUSEHOLD' },
  { name: 'Duvet (Small)', category: 'Household', icon: 'bed-double-outline', price: 3000, code: 'HOUSEHOLD' },
  { name: 'Duvet (Medium)', category: 'Household', icon: 'bed-double-outline', price: 4000, code: 'HOUSEHOLD' },
  { name: 'Duvet (Large/King)', category: 'Household', icon: 'bed-double-outline', price: 4000, code: 'HOUSEHOLD' },
  { name: 'Blanket', category: 'Household', icon: 'bed-outline', price: 3500, code: 'HOUSEHOLD' },
  { name: 'Pillow', category: 'Household', icon: 'bed-outline', price: 800, code: 'HOUSEHOLD' },
  { name: 'Curtain (Per Panel)', category: 'Household', icon: 'bed-outline', price: 2000, code: 'HOUSEHOLD' },
  { name: 'Bath Towel', category: 'Household', icon: 'hanger', price: 800, code: 'HOUSEHOLD' },
  { name: 'Stain Removal', category: 'Additional', icon: 'water-percent', price: 1000, code: 'ADDITIONAL' },
  { name: 'Spot Cleaning', category: 'Additional', icon: 'selection-ellipse', price: 500, code: 'ADDITIONAL' },
  { name: 'Shoe Cleaning', category: 'Additional', icon: 'shoe-sneaker', price: 4000, code: 'ADDITIONAL' },
  { name: 'Bag Cleaning', category: 'Additional', icon: 'bag-personal', price: 4000, code: 'ADDITIONAL' },
];

const formatNaira = (amount: number) => {
  return '₦' + amount.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export default function HomeDashboard() {
  const router = useRouter();

  // Sync with global basket state
  const [basketCount, setBasketCount] = useState(getBasketItemsCount());
  const [userName, setUserName] = useState('Blessed');

  // Search functionality states
  const [searchQuery, setSearchQuery] = useState('');
  const [allServices, setAllServices] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Animation values for the Promo Banner
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Load stored user profile info
    const loadUserProfile = async () => {
      try {
        const userStr = await AsyncStorage.getItem('@bglaundry_user');
        if (userStr) {
          const user = JSON.parse(userStr);
          if (user.fullName) {
            const firstName = user.fullName.split(' ')[0] || 'Blessed';
            setUserName(firstName);
          }
        }
      } catch (err) {
        console.error('Failed to load user info:', err);
      }
    };
    loadUserProfile();

    // Sync basket count
    const unsubscribe = subscribeBasket(() => {
      setBasketCount(getBasketItemsCount());
    });

    // 1. Pulse discount text scale loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1.0,
          duration: 1000,
          useNativeDriver: true,
        })
      ])
    ).start();

    // 2. Floating badge translateY loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -4,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        })
      ])
    ).start();

    // 3. Fetch dynamic values from database API for search
    const API_URL = 'http://localhost:4000/api/v1';
    axios.get(`${API_URL}/admin/services`)
      .then((res) => {
        const dbServices = res.data.services || [];
        if (dbServices.length > 0) {
          setAllServices(dbServices);
        } else {
          setAllServices(FALLBACK_SEARCH_ITEMS);
        }
      })
      .catch((err) => {
        console.log('Failed to fetch pricing database for search:', err);
        setAllServices(FALLBACK_SEARCH_ITEMS);
      });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (text.trim() === '') {
      setSearchResults([]);
      return;
    }

    const query = text.toLowerCase();
    const filtered = allServices.filter((service) => {
      return service.name.toLowerCase().includes(query) || service.category.toLowerCase().includes(query);
    });
    setSearchResults(filtered);
  };

  const handleSelectSearchResult = (service: any) => {
    setSearchQuery('');
    setSearchResults([]);
    
    // Determine router code path
    let routeCode = 'WASH_IRON';
    if (service.category === 'Household') {
      routeCode = 'HOUSEHOLD';
    } else if (service.category === 'Additional') {
      routeCode = 'ADDITIONAL';
    } else {
      // If it is Clothing, pre-select depending on pricing availability
      if (service.hasWashIron) {
        routeCode = 'WASH_IRON';
      } else if (service.hasWash) {
        routeCode = 'WASH_ONLY';
      } else if (service.hasIron) {
        routeCode = 'IRONING';
      }
    }
    
    router.push(`/services/${routeCode}`);
  };

  const services = [
    { name: 'Wash & Iron', sublabel: 'Fresh & Crisp Combo', icon: 'washing-machine', code: 'WASH_IRON' },
    { name: 'Wash Only', sublabel: 'Clean & Folded Clothes', icon: 'water', code: 'WASH_ONLY' },
    { name: 'Iron Only', sublabel: 'Smoothly Pressed Wear', icon: 'iron', code: 'IRONING' },
    { name: 'Addition', sublabel: 'Specialist Premium Care', icon: 'tag-multiple-outline', code: 'ADDITIONAL' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* 1. Header Section: User Info, Basket & Notification */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {userName.substring(0, 2).toUpperCase()}
            </Text>
            <View style={styles.onlineDot} />
          </View>
          <View style={styles.userTextWrapper}>
            <Text style={styles.greeting}>Hello, {userName}</Text>
            <Text style={styles.memberStatus}>Let's clean your laundry today!</Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.actionBtnHeader} onPress={() => router.push('/booking/basket')}>
            <Feather name="shopping-bag" size={20} color="#0066FF" />
            {basketCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{basketCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtnHeader, { marginLeft: 10 }]}>
            <Feather name="bell" size={20} color="#0066FF" />
            <View style={styles.redDot} />
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. Search Services Bar */}
      <View style={{ zIndex: 100, position: 'relative', marginBottom: 20 }}>
        <View style={styles.searchBar}>
          <Feather name="search" size={18} color="#0066FF" style={{ marginRight: 8 }} />
          <TextInput 
            placeholder="Search services (e.g. blazer, duvet, shoe)" 
            placeholderTextColor="#94A3B8"
            style={styles.searchInput}
            editable={true}
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Feather name="x" size={16} color="#64748B" />
            </TouchableOpacity>
          )}
        </View>

        {searchResults.length > 0 && (
          <View style={styles.searchResultsContainer}>
            <ScrollView style={{ maxHeight: 220 }} keyboardShouldPersistTaps="handled" nestedScrollEnabled={true}>
              {searchResults.map((item, idx) => {
                // Find primary price
                let displayPrice = item.washIronPrice || item.washPrice || item.ironPrice || item.price || 0;
                
                return (
                  <TouchableOpacity
                    key={idx}
                    style={styles.searchResultItem}
                    onPress={() => handleSelectSearchResult(item)}
                  >
                    <View style={styles.searchResultLeft}>
                      <View style={styles.searchResultIconBg}>
                        <MaterialCommunityIcons name={item.icon as any} size={16} color="#0066FF" />
                      </View>
                      <View>
                        <Text style={styles.searchResultName}>{item.name}</Text>
                        <Text style={styles.searchResultCat}>{item.category}</Text>
                      </View>
                    </View>
                    <Text style={styles.searchResultPrice}>{formatNaira(displayPrice)}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}
      </View>

      {/* 3. Services 2x4 Grid */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Services</Text>
      </View>
      <View style={styles.servicesGrid}>
        {services.map((item, idx) => (
          <TouchableOpacity 
            key={idx} 
            style={styles.serviceCard}
            onPress={() => router.push(`/services/${item.code}`)}
          >
            <View style={styles.serviceCardIconBg}>
              <MaterialCommunityIcons name={item.icon as any} size={24} color="#0066FF" />
            </View>
            <Text style={styles.serviceCardLabel}>{item.name}</Text>
            <Text style={styles.serviceCardSublabel}>{item.sublabel}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 4. Animated Blue Gradient Promo Banner */}
      <View style={styles.promoCardShadow}>
        <View style={styles.promoCard}>
          {/* Decorative shapes */}
          <View style={styles.decoCircle1} />
          <View style={styles.decoCircle2} />

          <View style={styles.promoContent}>
            {/* Animated Floating Badge */}
            <Animated.View style={[styles.animatedBadge, { transform: [{ translateY: floatAnim }] }]}>
              <Feather name="zap" size={10} color="#FFFFFF" style={{ marginRight: 3 }} />
              <Text style={styles.promoBadgeText}>PREMIUM SERVICE</Text>
            </Animated.View>

            {/* Animated Pulsing Discount Text */}
            <Animated.Text style={[styles.promoPercentage, { transform: [{ scale: pulseAnim }] }]}>
              Premium Care
            </Animated.Text>
            
            <Text style={styles.promoTitle}>Fast, Fresh & Crisp Return</Text>
            <Text style={styles.promoCode}>All items returned within 24 hours</Text>
            <TouchableOpacity style={styles.promoButton} onPress={() => router.push('/services/WASH_IRON')}>
              <Text style={styles.promoButtonText}>Book Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* 5. Last Orders Timeline Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Last orders</Text>
      </View>
      
      <View style={styles.ordersList}>
        {/* Order 1 */}
        <TouchableOpacity 
          style={styles.orderCard} 
          onPress={() => router.push('/orders/BG-1002/track')}
        >
          <View style={styles.orderCardHeader}>
            <View style={styles.orderIconWrapper}>
              <Feather name="clock" size={20} color="#0066FF" />
            </View>
            <View style={styles.orderInfo}>
              <Text style={styles.orderTitle}>Order #BG-1002 <Text style={styles.orderBagsCount}>(3 items)</Text></Text>
              <Text style={styles.orderStatusLabel}>Pickup Pending</Text>
            </View>
            <Text style={styles.orderPrice}>₦7,500</Text>
          </View>
          
          {/* Tracking Timeline */}
          <View style={styles.timelineWrapper}>
            <View style={styles.timelineRow}>
              <View style={styles.timelineCol}>
                <Text style={styles.timelineTime}>10:00</Text>
                <Text style={styles.timelineDate}>Today, 10 Jul</Text>
              </View>
              
              <View style={styles.timelineLineWrapper}>
                <View style={[styles.timelineNode, styles.timelineNodeActive]} />
                <View style={styles.timelineLine} />
                <View style={styles.timelineNode} />
              </View>

              <View style={styles.timelineColEnd}>
                <Text style={styles.timelineTime}>10:00</Text>
                <Text style={styles.timelineDate}>Tomorrow, 11 Jul</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* Order 2 */}
        <TouchableOpacity 
          style={styles.orderCard} 
          onPress={() => router.push('/orders/BG-1001/track')}
        >
          <View style={styles.orderCardHeader}>
            <View style={styles.orderIconWrapper}>
              <Feather name="refresh-cw" size={20} color="#00B4D8" />
            </View>
            <View style={styles.orderInfo}>
              <Text style={styles.orderTitle}>Order #BG-1001 <Text style={styles.orderBagsCount}>(5 items)</Text></Text>
              <Text style={styles.orderStatusLabel}>In Processing</Text>
            </View>
            <Text style={styles.orderPrice}>₦15,000</Text>
          </View>
          
          {/* Tracking Timeline */}
          <View style={styles.timelineWrapper}>
            <View style={styles.timelineRow}>
              <View style={styles.timelineCol}>
                <Text style={styles.timelineTime}>14:00</Text>
                <Text style={styles.timelineDate}>Mon, 8 Jul</Text>
              </View>
              
              <View style={styles.timelineLineWrapper}>
                <View style={[styles.timelineNode, styles.timelineNodeActive]} />
                <View style={[styles.timelineLine, styles.timelineLineActive]} />
                <View style={styles.timelineNode} />
              </View>

              <View style={styles.timelineColEnd}>
                <Text style={styles.timelineTime}>14:00</Text>
                <Text style={styles.timelineDate}>Tue, 9 Jul</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFCFF',
  },
  contentContainer: {
    padding: 16,
    paddingTop: 48,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#002B7F',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  userTextWrapper: {
    marginLeft: 12,
  },
  greeting: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  memberStatus: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBtnHeader: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#0066FF',
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: 'bold',
  },
  redDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    padding: 0,
  },
  /* Services 2x4 Grid */
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  serviceCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
    marginBottom: 12,
  },
  serviceCardIconBg: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F0F7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  serviceCardLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  serviceCardSublabel: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  /* Animated Promo Card */
  promoCardShadow: {
    borderRadius: 16,
    backgroundColor: '#002B7F', 
    paddingBottom: 6,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  promoCard: {
    backgroundColor: '#0066FF',
    padding: 20,
    borderRadius: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  decoCircle1: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  decoCircle2: {
    position: 'absolute',
    bottom: -40,
    left: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  promoContent: {
    zIndex: 1,
  },
  animatedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  promoBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 0.8,
  },
  sectionHeader: {
    marginBottom: 12,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  promoPercentage: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    alignSelf: 'flex-start',
  },
  promoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E0F2FE',
    marginTop: 4,
  },
  promoCode: {
    fontSize: 12,
    color: '#93C5FD',
    marginTop: 2,
    marginBottom: 12,
    fontWeight: '600',
  },
  promoButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  promoButtonText: {
    color: '#0066FF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  /* Last Orders Section */
  ordersList: {
    gap: 16,
    marginBottom: 16,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 2,
  },
  orderCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  orderBagsCount: {
    fontSize: 12,
    fontWeight: 'normal',
    color: '#64748B',
  },
  orderStatusLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  orderPrice: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0066FF',
  },
  /* Timeline Grid */
  timelineWrapper: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timelineCol: {
    flex: 1,
  },
  timelineColEnd: {
    flex: 1,
    alignItems: 'flex-end',
  },
  timelineTime: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  timelineDate: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  timelineLineWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    position: 'relative',
  },
  timelineNode: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#CBD5E1',
    zIndex: 1,
  },
  timelineNodeActive: {
    backgroundColor: '#0066FF',
  },
  timelineLine: {
    position: 'absolute',
    height: 2,
    width: 64,
    backgroundColor: '#CBD5E1',
    top: 3,
  },
  timelineLineActive: {
    backgroundColor: '#0066FF',
  },
  /* Autocomplete Search Results */
  searchResultsContainer: {
    position: 'absolute',
    top: 56,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    padding: 6,
    zIndex: 999,
  },
  searchResultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
  },
  searchResultLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchResultIconBg: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F0F7FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchResultName: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#1E293B',
  },
  searchResultCat: {
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 1,
  },
  searchResultPrice: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0066FF',
  },
});
