import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { getBasket, subscribeBasket, addToBasket, removeFromBasket, getBasketItemsCount } from '../booking/basketState';
import axios from 'axios';

const formatNaira = (amount: number) => {
  return '₦' + amount.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

type TabType = 'Clothing' | 'Household' | 'Additional';
type ServiceType = string;

interface GarmentData {
  name: string;
  icon: string;
  options: {
    service: ServiceType;
    price: number;
  }[];
}

// Comprehensive unified garments database with rates for each service
const DEFAULT_CLOTHES_DB: Record<TabType, GarmentData[]> = {
  Clothing: [
    { name: 'T-Shirt / Polo', icon: 'tshirt-crew', options: [{ service: 'Wash & Iron', price: 700 }, { service: 'Wash Only', price: 500 }, { service: 'Iron Only', price: 300 }] },
    { name: 'Dress Shirt', icon: 'tshirt-v', options: [{ service: 'Wash & Iron', price: 1000 }, { service: 'Wash Only', price: 700 }, { service: 'Iron Only', price: 400 }] },
    { name: 'Trouser', icon: 'hanger', options: [{ service: 'Wash & Iron', price: 700 }, { service: 'Wash Only', price: 500 }, { service: 'Iron Only', price: 300 }] },
    { name: 'Jeans', icon: 'hanger', options: [{ service: 'Wash & Iron', price: 1000 }, { service: 'Wash Only', price: 700 }, { service: 'Iron Only', price: 400 }] },
    { name: 'Shorts', icon: 'hanger', options: [{ service: 'Wash & Iron', price: 500 }, { service: 'Wash Only', price: 300 }, { service: 'Iron Only', price: 200 }] },
    { name: 'Casual/Formal Shirt', icon: 'tshirt-v', options: [{ service: 'Wash & Iron', price: 800 }, { service: 'Wash Only', price: 500 }, { service: 'Iron Only', price: 300 }] },
    { name: 'Blouse', icon: 'tshirt-v', options: [{ service: 'Wash & Iron', price: 800 }, { service: 'Wash Only', price: 500 }, { service: 'Iron Only', price: 300 }] },
    { name: 'Dress', icon: 'hanger', options: [{ service: 'Wash & Iron', price: 2000 }, { service: 'Wash Only', price: 1300 }, { service: 'Iron Only', price: 700 }] },
    { name: 'Two-Piece Suit', icon: 'tie', options: [{ service: 'Wash & Iron', price: 3500 }, { service: 'Wash Only', price: 2500 }, { service: 'Iron Only', price: 1200 }] },
    { name: 'Blazer', icon: 'hanger', options: [{ service: 'Wash & Iron', price: 1500 }, { service: 'Wash Only', price: 1000 }, { service: 'Iron Only', price: 600 }] },
    { name: 'Senator Wear (2 pcs)', icon: 'account', options: [{ service: 'Wash & Iron', price: 1500 }, { service: 'Wash Only', price: 1000 }, { service: 'Iron Only', price: 500 }] },
    { name: 'Agbada (Complete Set)', icon: 'account', options: [{ service: 'Wash & Iron', price: 3500 }, { service: 'Wash Only', price: 2500 }, { service: 'Iron Only', price: 1200 }] },
    { name: 'Kaftan', icon: 'account', options: [{ service: 'Wash & Iron', price: 2000 }, { service: 'Wash Only', price: 1300 }, { service: 'Iron Only', price: 700 }] },
    { name: 'Jacket', icon: 'hanger', options: [{ service: 'Wash & Iron', price: 1500 }, { service: 'Wash Only', price: 1000 }, { service: 'Iron Only', price: 600 }] },
    { name: 'Tie', icon: 'tie', options: [{ service: 'Wash & Iron', price: 300 }, { service: 'Iron Only', price: 300 }] },
  ],
  Household: [
    { name: 'Bed Sheet', icon: 'bed-empty', options: [{ service: 'Wash & Iron', price: 1500 }, { service: 'Wash Only', price: 1000 }] },
    { name: 'Duvet (Small)', icon: 'bed-double-outline', options: [{ service: 'Wash & Iron', price: 3000 }, { service: 'Wash Only', price: 2500 }] },
    { name: 'Duvet (Medium)', icon: 'bed-double-outline', options: [{ service: 'Wash & Iron', price: 4000 }, { service: 'Wash Only', price: 3500 }] },
    { name: 'Duvet (Large/King)', icon: 'bed-double-outline', options: [{ service: 'Wash & Iron', price: 4000 }, { service: 'Wash Only', price: 3500 }] },
    { name: 'Blanket', icon: 'bed-outline', options: [{ service: 'Wash & Iron', price: 3500 }, { service: 'Wash Only', price: 3000 }] },
    { name: 'Pillow', icon: 'bed-outline', options: [{ service: 'Wash & Iron', price: 800 }, { service: 'Wash Only', price: 600 }] },
    { name: 'Curtain (Per Panel)', icon: 'bed-outline', options: [{ service: 'Wash & Iron', price: 2000 }, { service: 'Wash Only', price: 1500 }] },
    { name: 'Bath Towel', icon: 'hanger', options: [{ service: 'Wash & Iron', price: 800 }, { service: 'Wash Only', price: 600 }] }
  ],
  Additional: [
    { name: 'Stain Removal', icon: 'water-percent', options: [{ service: 'Stain Removal', price: 1000 }] },
    { name: 'Spot Cleaning', icon: 'selection-ellipse', options: [{ service: 'Spot Cleaning', price: 500 }] },
    { name: 'Fabric Softener Treatment', icon: 'spray', options: [{ service: 'Softener', price: 200 }] },
    { name: 'Premium Fragrance Finish', icon: 'flower-outline', options: [{ service: 'Fragrance', price: 200 }] },
    { name: 'Folding Only', icon: 'content-save-move-outline', options: [{ service: 'Folding Only', price: 200 }] },
    { name: 'Shoe Cleaning', icon: 'shoe-sneaker', options: [{ service: 'Shoe Cleaning', price: 4000 }] },
    { name: 'Bag Cleaning', icon: 'bag-personal', options: [{ service: 'Bag Cleaning', price: 4000 }] },
    { name: 'Wedding Gown Care', icon: 'cards-heart', options: [{ service: 'Gown Care', price: 15000 }] }
  ]
};

export default function ServiceDetailScreen() {
  const { code } = useLocalSearchParams();
  const router = useRouter();

  // Active Category Tab
  const [activeTab, setActiveTab] = useState<TabType>('Clothing');

  // Selected service type per garment name
  const [selectedServices, setSelectedServices] = useState<Record<string, ServiceType>>({});

  // Which garment currently has its service dropdown menu open
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Sync with global basket state
  const [basket, setBasket] = useState(getBasket());
  const [basketCount, setBasketCount] = useState(getBasketItemsCount());

  // Unified clothes database state
  const [clothesDb, setClothesDb] = useState<Record<TabType, GarmentData[]>>(DEFAULT_CLOTHES_DB);

  useEffect(() => {
    // 1. Subscribe to basket changes
    const unsubscribe = subscribeBasket(() => {
      setBasket({ ...getBasket() });
      setBasketCount(getBasketItemsCount());
    });

    // 2. Fetch dynamic values from database API
    const API_URL = 'http://localhost:4000/api/v1';
    axios.get(`${API_URL}/admin/services`)
      .then((res) => {
        const dbServices = res.data.services || [];
        if (dbServices.length > 0) {
          const grouped: Record<TabType, GarmentData[]> = {
            Clothing: [],
            Household: [],
            Additional: []
          };
          dbServices.forEach((item: any) => {
            const options = [];
            if (item.hasWashIron) {
              options.push({ service: 'Wash & Iron', price: item.washIronPrice });
            }
            if (item.hasWash) {
              options.push({ service: 'Wash Only', price: item.washPrice });
            }
            if (item.hasIron) {
              options.push({ service: 'Iron Only', price: item.ironPrice });
            }

            const garmentData: GarmentData = {
              name: item.name,
              icon: item.icon,
              options
            };

            if (item.category === 'Clothing') {
              grouped.Clothing.push(garmentData);
            } else if (item.category === 'Household') {
              grouped.Household.push(garmentData);
            } else if (item.category === 'Additional') {
              grouped.Additional.push(garmentData);
            }
          });
          setClothesDb(grouped);
        }
      })
      .catch((err) => console.log('Failed to fetch pricing database in details:', err));

    return unsubscribe;
  }, []);

  // Pre-select service and active tab based on URL entry point code
  useEffect(() => {
    let initialService: ServiceType = 'Wash & Iron';
    if (code === 'IRONING') {
      initialService = 'Iron Only';
    } else if (code === 'WASH_ONLY') {
      initialService = 'Wash Only';
    }

    // Auto-select correct category tab
    if (code === 'DUVETS' || code === 'HOUSEHOLD') {
      setActiveTab('Household');
    } else if (code === 'WEDDING_GOWNS' || code === 'SHOE_LAUNDRY' || code === 'LEATHER_SUEDE' || code === 'ADDITIONAL') {
      setActiveTab('Additional');
    } else {
      setActiveTab('Clothing');
    }

    const defaultServices: Record<string, ServiceType> = {};
    Object.values(clothesDb).forEach((categoryList) => {
      categoryList.forEach((garment) => {
        const supportsInitial = garment.options.some(o => o.service === initialService);
        defaultServices[garment.name] = supportsInitial ? initialService : (garment.options[0]?.service || 'Wash Only');
      });
    });
    setSelectedServices(defaultServices);
    setOpenDropdown(null);
  }, [code, clothesDb]);

  const activeItems = clothesDb[activeTab] || [];

  const handleIncrement = (garmentName: string, selectedService: ServiceType, price: number) => {
    addToBasket(garmentName, code as string, selectedService, price);
  };

  const handleDecrement = (garmentName: string, selectedService: ServiceType) => {
    removeFromBasket(garmentName, selectedService);
  };

  const toggleDropdown = (garmentName: string) => {
    if (code === 'IRONING' || code === 'WASH_ONLY') return; // Disable dropdown on locked screens
    setOpenDropdown(prev => (prev === garmentName ? null : garmentName));
  };

  const selectServiceOption = (garmentName: string, service: ServiceType) => {
    setSelectedServices(prev => ({
      ...prev,
      [garmentName]: service
    }));
    setOpenDropdown(null);
  };

  // Dynamic Header title matching service type parameter
  const getHeaderTitle = () => {
    if (code === 'IRONING') return 'Select Clothes | Iron Only';
    if (code === 'WASH_ONLY') return 'Select Clothes | Wash Only';
    if (code === 'SUITS') return 'Select Clothes | Suits';
    if (code === 'DUVETS') return 'Select Clothes | Duvets';
    if (code === 'WEDDING_GOWNS') return 'Select Clothes | Wedding Gowns';
    if (code === 'LEATHER_SUEDE') return 'Select Clothes | Leather Care';
    if (code === 'SHOE_LAUNDRY') return 'Select Clothes | Shoe Laundry';
    return 'Select Clothes';
  };

  return (
    <View style={styles.container}>
      {/* 1. Header with Cart Badge */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{getHeaderTitle()}</Text>
        
        <TouchableOpacity style={styles.cartBtn} onPress={() => router.push('/booking/basket')}>
          <Feather name="shopping-bag" size={22} color="#0F172A" />
          {basketCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{basketCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* 2. Horizontal Category Tabs Selector */}
      <View style={styles.tabContainer}>
        {(['Clothing', 'Household', 'Additional'] as TabType[]).map((tab) => {
          const isActive = activeTab === tab;
          return (
            <TouchableOpacity 
              key={tab} 
              style={[styles.tabButton, isActive && styles.tabButtonActive]}
              onPress={() => {
                setActiveTab(tab);
                setOpenDropdown(null);
              }}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {tab === 'Clothing' ? 'Clothing' : tab === 'Household' ? 'Household' : 'Additional'}
              </Text>
              {isActive && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 3. Items Selection list */}
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Add Clothes to Basket</Text>
        
        {activeItems.length > 0 ? (
          <View style={styles.itemsList}>
            {activeItems.map((garment, idx) => {
              const currentService = selectedServices[garment.name] || garment.options[0].service;
              const optionDetails = garment.options.find(o => o.service === currentService) || garment.options[0];
              
              const key = `${garment.name} (${currentService})`;
              const qty = basket[key]?.quantity || 0;
              const isSelected = qty > 0;
              const isDropdownOpen = openDropdown === garment.name;
              
              // Allow service dropdown on everything EXCEPT locked Ironing / Wash Only pages
              const allowDropdown = code !== 'IRONING' && code !== 'WASH_ONLY';

              return (
                <View 
                  key={idx} 
                  style={[
                    styles.itemRowWrapper,
                    isSelected && styles.itemRowActive
                  ]}
                >
                  <View style={styles.itemRow}>
                    {/* Garment Icon */}
                    <View style={styles.garmentIconBg}>
                      <MaterialCommunityIcons name={garment.icon as any} size={22} color="#0066FF" />
                    </View>

                    {/* Garment Info & Dropdown Trigger */}
                    <View style={styles.garmentInfo}>
                      <Text style={styles.garmentName}>{garment.name}</Text>
                      <Text style={styles.garmentPrice}>{formatNaira(optionDetails.price)}</Text>

                      {allowDropdown ? (
                        <TouchableOpacity 
                          style={styles.dropdownBtn}
                          onPress={() => toggleDropdown(garment.name)}
                        >
                          <Text style={styles.dropdownBtnText}>{currentService}</Text>
                          <Feather name={isDropdownOpen ? "chevron-up" : "chevron-down"} size={12} color="#0066FF" style={{ marginLeft: 4 }} />
                        </TouchableOpacity>
                      ) : (
                        <Text style={styles.fixedServiceText}>{currentService}</Text>
                      )}
                    </View>

                    {/* Tactile Counter Control */}
                    <View style={styles.counter}>
                      {qty > 0 ? (
                        <View style={styles.counterRow}>
                          <TouchableOpacity style={styles.counterBtn} onPress={() => handleDecrement(garment.name, currentService)}>
                            <Feather name="minus" size={14} color="#0066FF" />
                          </TouchableOpacity>
                          <Text style={styles.counterText}>{qty}</Text>
                          <TouchableOpacity style={styles.counterBtn} onPress={() => handleIncrement(garment.name, currentService, optionDetails.price)}>
                            <Feather name="plus" size={14} color="#0066FF" />
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <TouchableOpacity style={styles.addBtn} onPress={() => handleIncrement(garment.name, currentService, optionDetails.price)}>
                          <Feather name="plus" size={16} color="#FFFFFF" />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>

                  {/* Dynamic Dropdown Options List */}
                  {allowDropdown && isDropdownOpen && (
                    <View style={styles.dropdownOptionsContainer}>
                      {garment.options.map((opt) => {
                        const isOptActive = currentService === opt.service;
                        return (
                          <TouchableOpacity 
                            key={opt.service} 
                            style={styles.dropdownOptionRow}
                            onPress={() => selectServiceOption(garment.name, opt.service)}
                          >
                            <Text style={[
                              styles.optionLabel, 
                              isOptActive && styles.optionLabelActive
                            ]}>
                              {opt.service}
                            </Text>
                            <Text style={styles.optionPrice}>{formatNaira(opt.price)}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyItemsContainer}>
            <Feather name="info" size={32} color="#94A3B8" />
            <Text style={styles.emptyItemsText}>No items listed under this category.</Text>
          </View>
        )}
      </ScrollView>

      {/* 4. Action Footer */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.actionBtn}
          onPress={() => router.push('/booking/basket')}
        >
          <Text style={styles.actionBtnText}>
            {basketCount > 0 ? `View Basket (${basketCount} items)` : 'View Basket'}
          </Text>
          <Feather name="arrow-right" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFCFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  cartBtn: {
    width: 36,
    height: 36,
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1.5,
    borderBottomColor: '#E2E8F0',
    paddingHorizontal: 16,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    position: 'relative',
  },
  tabButtonActive: {},
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#0066FF',
    fontWeight: 'bold',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -1.5,
    height: 3,
    width: 48,
    borderRadius: 1.5,
    backgroundColor: '#0066FF',
  },
  content: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#64748B',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  itemsList: {
    gap: 12,
    marginBottom: 32,
  },
  itemRowWrapper: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 14,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  itemRowActive: {
    borderColor: '#93C5FD',
    backgroundColor: '#F0F7FF',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  garmentIconBg: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F0F7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  garmentInfo: {
    flex: 1,
  },
  garmentName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  garmentPrice: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '600',
  },
  dropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#E6F0FA',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginTop: 6,
  },
  dropdownBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0066FF',
  },
  fixedServiceText: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 6,
    fontWeight: '600',
  },
  dropdownOptionsContainer: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 8,
    gap: 8,
  },
  dropdownOptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  optionLabel: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
  },
  optionLabelActive: {
    color: '#0066FF',
    fontWeight: 'bold',
  },
  optionPrice: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  counter: {
    minWidth: 40,
    alignItems: 'flex-end',
  },
  addBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#0066FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 16,
    padding: 2,
  },
  counterBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0066FF',
    paddingHorizontal: 8,
  },
  emptyItemsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyItemsText: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 12,
    fontWeight: '500',
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  actionBtn: {
    backgroundColor: '#0066FF',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#0066FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
