import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { getBasket, subscribeBasket, addToBasket, removeFromBasket, getBasketItemsCount } from '../booking/basketState';
import axios from 'axios';

const formatNaira = (amount: number) => {
  return '₦' + amount.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

type TabType = 'Clothing' | 'Household' | 'Additional';

interface ServiceOption {
  service: string;
  price: number;
}

interface ItemData {
  name: string;
  icon: string;
  description?: string;
  options: ServiceOption[];
}

const DEFAULT_SERVICES_DATA: Record<TabType, ItemData[]> = {
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
    { name: 'Stain Removal', icon: 'water-percent', description: 'Deep stain targeting treatment (From ₦1,000)', options: [{ service: 'Stain Removal', price: 1000 }] },
    { name: 'Spot Cleaning', icon: 'selection-ellipse', description: 'Localized spot cleaning treatment (From ₦500)', options: [{ service: 'Spot Cleaning', price: 500 }] },
    { name: 'Fabric Softener Treatment', icon: 'spray', description: 'Premium fabric softening rinse (₦200 / item)', options: [{ service: 'Softener', price: 200 }] },
    { name: 'Premium Fragrance Finish', icon: 'flower-outline', description: 'Long-lasting signature scent (₦200 / item)', options: [{ service: 'Fragrance', price: 200 }] },
    { name: 'Folding Only', icon: 'content-save-move-outline', description: 'Professional folding & packaging (₦200 / item)', options: [{ service: 'Folding Only', price: 200 }] },
    { name: 'Shoe Cleaning', icon: 'shoe-sneaker', description: 'Premium shoe wash & conditioning (From ₦4,000)', options: [{ service: 'Shoe Cleaning', price: 4000 }] },
    { name: 'Bag Cleaning', icon: 'bag-personal', description: 'Premium bag cleaning & care (From ₦4,000)', options: [{ service: 'Bag Cleaning', price: 4000 }] },
    { name: 'Wedding Gown Care', icon: 'cards-heart', description: 'Delicate care, wash & preservation (From ₦15,000)', options: [{ service: 'Gown Care', price: 15000 }] }
  ]
};

export default function ServicesScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('Clothing');
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [servicesData, setServicesData] = useState<Record<TabType, ItemData[]>>(DEFAULT_SERVICES_DATA);
  
  // Basket State Sync
  const [basket, setBasket] = useState(getBasket());
  const [basketCount, setBasketCount] = useState(getBasketItemsCount());
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  useEffect(() => {
    // Subscribe to basket changes
    const unsubscribe = subscribeBasket(() => {
      setBasket({ ...getBasket() });
      setBasketCount(getBasketItemsCount());
    });

    // 1. Initialize static defaults
    const defaults: Record<string, string> = {};
    Object.keys(DEFAULT_SERVICES_DATA).forEach((cat) => {
      DEFAULT_SERVICES_DATA[cat as TabType].forEach((item) => {
        defaults[item.name] = item.options[0]?.service || 'Wash Only';
      });
    });
    setSelectedOptions(defaults);

    // 2. Fetch dynamic values from database API
    const API_URL = 'http://localhost:4000/api/v1';
    axios.get(`${API_URL}/admin/services`)
      .then((res) => {
        const dbServices = res.data.services || [];
        if (dbServices.length > 0) {
          const grouped: Record<TabType, ItemData[]> = {
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

            const itemData: ItemData = {
              name: item.name,
              icon: item.icon,
              options
            };

            if (item.category === 'Clothing') {
              grouped.Clothing.push(itemData);
            } else if (item.category === 'Household') {
              grouped.Household.push(itemData);
            } else if (item.category === 'Additional') {
              itemData.description = `${item.name} Service (₦${options[0]?.price || 0})`;
              grouped.Additional.push(itemData);
            }
          });
          setServicesData(grouped);

          // Update defaults for items that might be new
          const newDefaults: Record<string, string> = {};
          Object.keys(grouped).forEach((cat) => {
            grouped[cat as TabType].forEach((item) => {
              newDefaults[item.name] = item.options[0]?.service || 'Wash Only';
            });
          });
          setSelectedOptions(newDefaults);
        }
      })
      .catch((err) => console.log('Failed to fetch pricing database:', err));

    return unsubscribe;
  }, []);

  const handleSelectOption = (itemName: string, optionName: string) => {
    setSelectedOptions(prev => ({
      ...prev,
      [itemName]: optionName
    }));
  };

  const toggleDropdown = (itemName: string) => {
    setOpenDropdown(prev => prev === itemName ? null : itemName);
  };

  const selectServiceOption = (itemName: string, serviceName: string) => {
    handleSelectOption(itemName, serviceName);
    setOpenDropdown(null);
  };

  const handleIncrement = (item: ItemData, serviceName: string, price: number) => {
    // Determine service code based on active tab or service name
    let serviceCode = 'DRY_CLEAN';
    if (serviceName === 'Wash Only') {
      serviceCode = 'WASH_ONLY';
    } else if (serviceName === 'Iron Only') {
      serviceCode = 'IRONING';
    } else if (serviceName === 'Wash & Iron') {
      serviceCode = 'WASH_IRON';
    } else if (activeTab === 'Additional') {
      serviceCode = 'ADDITIONAL_SERVICE';
    }
    
    addToBasket(item.name, serviceCode, serviceName, price);
  };

  const handleDecrement = (itemName: string, serviceName: string) => {
    removeFromBasket(itemName, serviceName);
  };

  const activeItems = servicesData[activeTab];

  return (
    <SafeAreaView style={styles.container}>
      {/* Clean Minimal Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          {/* Highlight Banner / Promises */}
          <View style={styles.highlightBanner}>
            <View style={styles.highlightCol}>
              <MaterialCommunityIcons name="truck-delivery" size={14} color="#0066FF" />
              <Text style={styles.highlightText}>Free Pickup</Text>
            </View>
            <View style={styles.highlightDivider} />
            <View style={styles.highlightCol}>
              <MaterialCommunityIcons name="motorbike" size={14} color="#0066FF" />
              <Text style={styles.highlightText}>Free Delivery</Text>
            </View>
            <View style={styles.highlightDivider} />
            <View style={styles.highlightCol}>
              <MaterialCommunityIcons name="shield-check" size={14} color="#0066FF" />
              <Text style={styles.highlightText}>Premium Care</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.basketBtn} onPress={() => router.push('/booking/basket')}>
            <Feather name="shopping-bag" size={20} color="#0066FF" />
            {basketCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{basketCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Categories Navigation */}
      <View style={styles.tabBar}>
        {(['Clothing', 'Household', 'Additional'] as TabType[]).map((tab) => {
          const isActive = activeTab === tab;
          let label = 'Clothing';
          if (tab === 'Household') label = 'Household';
          if (tab === 'Additional') label = 'Additional';

          return (
            <TouchableOpacity
              key={tab}
              style={[styles.tabItem, isActive && styles.tabItemActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {label}
              </Text>
              {isActive && <View style={styles.tabIndicator} />}
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Title of the Active Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {activeTab === 'Clothing' ? 'Clothing & Wearables' : activeTab === 'Household' ? 'Household Items' : 'Additional Services'}
          </Text>
        </View>

        {/* List of items under active tab */}
        <View style={styles.itemsContainer}>
          {activeItems.map((item, idx) => {
            const currentService = selectedOptions[item.name] || item.options[0].service;
            const activeOption = item.options.find(o => o.service === currentService) || item.options[0];
            const basketKey = `${item.name} (${currentService})`;
            const qtyInBasket = basket[basketKey]?.quantity || 0;
            const isSelected = qtyInBasket > 0;
            const isDropdownOpen = openDropdown === item.name;
            const allowDropdown = item.options.length > 1;

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
                    <MaterialCommunityIcons name={item.icon as any} size={22} color="#0066FF" />
                  </View>

                  {/* Garment Info & Dropdown Trigger */}
                  <View style={styles.garmentInfo}>
                    <Text style={styles.garmentName}>{item.name}</Text>
                    {item.description && <Text style={styles.itemDesc}>{item.description}</Text>}
                    <Text style={styles.garmentPrice}>{formatNaira(activeOption.price)}</Text>

                    {allowDropdown ? (
                      <TouchableOpacity 
                        style={styles.dropdownBtn}
                        onPress={() => toggleDropdown(item.name)}
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
                    {qtyInBasket > 0 ? (
                      <View style={styles.counterRow}>
                        <TouchableOpacity style={styles.counterBtn} onPress={() => handleDecrement(item.name, currentService)}>
                          <Feather name="minus" size={14} color="#0066FF" />
                        </TouchableOpacity>
                        <Text style={styles.counterText}>{qtyInBasket}</Text>
                        <TouchableOpacity style={styles.counterBtn} onPress={() => handleIncrement(item, currentService, activeOption.price)}>
                          <Feather name="plus" size={14} color="#0066FF" />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity style={styles.addBtn} onPress={() => handleIncrement(item, currentService, activeOption.price)}>
                        <Feather name="plus" size={16} color="#FFFFFF" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                {/* Dynamic Dropdown Options List */}
                {allowDropdown && isDropdownOpen && (
                  <View style={styles.dropdownOptionsContainer}>
                    {item.options.map((opt) => {
                      const isOptActive = currentService === opt.service;
                      return (
                        <TouchableOpacity 
                          key={opt.service} 
                          style={styles.dropdownOptionRow}
                          onPress={() => selectServiceOption(item.name, opt.service)}
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

        {/* Branded Flyers Policies / Guidelines Note */}
        <View style={styles.noteCard}>
          <View style={styles.noteHeader}>
            <Feather name="info" size={16} color="#0066FF" style={{ marginRight: 8 }} />
            <Text style={styles.noteTitle}>ORDER POLICY & NOTES</Text>
          </View>
          
          <View style={styles.noteRow}>
            <Feather name="check-circle" size={12} color="#64748B" style={styles.noteIcon} />
            <Text style={styles.noteText}>
              <Text style={styles.boldText}>FREE PICKUP & DELIVERY</Text> starts from <Text style={styles.boldText}>10 PCS</Text> of clothes and above.
            </Text>
          </View>
          
          <View style={styles.noteRow}>
            <Feather name="check-circle" size={12} color="#64748B" style={styles.noteIcon} />
            <Text style={styles.noteText}>
              Orders below 10 pieces attract a delivery fee based on location.
            </Text>
          </View>

          <View style={styles.noteRow}>
            <Feather name="check-circle" size={12} color="#64748B" style={styles.noteIcon} />
            <Text style={styles.noteText}>
              Standard turnaround time: <Text style={styles.boldText}>24 - 48 HOURS</Text>
            </Text>
          </View>

          <View style={styles.noteRow}>
            <Feather name="check-circle" size={12} color="#64748B" style={styles.noteIcon} />
            <Text style={styles.noteText}>
              Express service: <Text style={styles.boldText}>WITHIN 24 HOURS</Text> (<Text style={styles.boldText}>+50%</Text> of the service charge).
            </Text>
          </View>
        </View>

        {/* Footer contact details */}
        <View style={styles.footerBranding}>
          <Text style={styles.footerText}>CLEANER CLOTHES. BETTER LOOK. BETTER YOU.</Text>
          <Text style={styles.footerContact}>0805 825 5555  |  www.bglaundry.com</Text>
        </View>
      </ScrollView>

      {/* View Basket Floating Action Button */}
      {basketCount > 0 && (
        <View style={styles.floatingFooter}>
          <TouchableOpacity 
            style={styles.floatingBasketBtn}
            onPress={() => router.push('/booking/basket')}
          >
            <View style={styles.floatingLeft}>
              <View style={styles.whiteBadge}>
                <Text style={styles.whiteBadgeText}>{basketCount}</Text>
              </View>
              <Text style={styles.floatingLabel}>View Basket</Text>
            </View>
            <Feather name="arrow-right" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  basketBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E6F0FA',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#0066FF',
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  highlightBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F1F5F9',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
  },
  highlightCol: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  highlightText: {
    color: '#475569',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 6,
  },
  highlightDivider: {
    width: 1,
    height: 12,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    position: 'relative',
  },
  tabItemActive: {
    backgroundColor: '#FAFCFF',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#0066FF',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 20,
    right: 20,
    height: 3,
    backgroundColor: '#0066FF',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 90,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  itemsContainer: {
    marginBottom: 20,
  },
  itemRowWrapper: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
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
  itemDesc: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 14,
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
  noteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 6,
  },
  noteTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  noteIcon: {
    marginRight: 6,
    marginTop: 2,
  },
  noteText: {
    fontSize: 11,
    color: '#475569',
    flex: 1,
    lineHeight: 15,
  },
  boldText: {
    fontWeight: '700',
    color: '#0F172A',
  },
  footerBranding: {
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 10,
  },
  footerText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 1.5,
  },
  footerContact: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    marginTop: 2,
  },
  floatingFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  floatingBasketBtn: {
    backgroundColor: '#0066FF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 6,
  },
  floatingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  whiteBadge: {
    backgroundColor: '#FFFFFF',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  whiteBadgeText: {
    color: '#0066FF',
    fontSize: 10,
    fontWeight: '900',
  },
  floatingLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
