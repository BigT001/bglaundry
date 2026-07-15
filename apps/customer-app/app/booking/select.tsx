import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import axios from 'axios';

const API_URL = 'http://localhost:4000/api/v1';

const formatNaira = (amount: number) => {
  return '₦' + amount.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

interface ClothesItem {
  name: string;
  icon: string;
  hasIroning: boolean;
  hasDryCleaning: boolean;
  dryCleanPrice: number;
  ironPrice: number;
}

export default function SelectItemsScreen() {
  const router = useRouter();

  // Active Category Tab
  const [activeTab, setActiveTab] = useState<'Man' | 'Woman' | 'Kids' | 'Household'>('Man');

  // Selected Service Type for each clothing item: defaults to 'Ironing Only' or 'Dry Cleaning'
  const [selectedServices, setSelectedServices] = useState<Record<string, 'Dry Cleaning' | 'Ironing Only'>>({
    'T-Shirt': 'Ironing Only',
    'Jeans': 'Ironing Only',
    'Shirt': 'Ironing Only',
    'Trouser': 'Ironing Only',
    'Jacket': 'Dry Cleaning',
    'Suit': 'Dry Cleaning',
    'Blouse': 'Ironing Only',
    'Dress': 'Ironing Only',
    'Skirt': 'Ironing Only',
    'Kids T-Shirt': 'Ironing Only',
    'Kids Trouser': 'Ironing Only',
    'Kids Dress': 'Ironing Only',
    'Duvet': 'Dry Cleaning',
    'Curtains': 'Dry Cleaning',
    'Bed Sheets': 'Dry Cleaning',
    'Wedding Gown': 'Dry Cleaning',
    'Leather Jacket': 'Dry Cleaning',
    'Sneakers': 'Dry Cleaning',
  });

  // Quantities selected state: key format is "Item Name (Service Type)"
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  // Active open dropdown for service selector
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Clothing database structure matching the categories
  const defaultClothesData: Record<'Man' | 'Woman' | 'Kids' | 'Household', ClothesItem[]> = {
    Man: [
      { name: 'T-Shirt', icon: 'tshirt-crew', hasIroning: true, hasDryCleaning: true, ironPrice: 1000, dryCleanPrice: 1500 },
      { name: 'Shirt', icon: 'tshirt-v', hasIroning: true, hasDryCleaning: true, ironPrice: 1000, dryCleanPrice: 1500 },
      { name: 'Trouser', icon: 'hanger', hasIroning: true, hasDryCleaning: true, ironPrice: 1000, dryCleanPrice: 1500 },
      { name: 'Jeans', icon: 'hanger', hasIroning: true, hasDryCleaning: true, ironPrice: 1000, dryCleanPrice: 1500 },
      { name: 'Suit', icon: 'tie', hasIroning: false, hasDryCleaning: true, ironPrice: 5000, dryCleanPrice: 5000 },
      { name: 'Jacket', icon: 'hanger', hasIroning: true, hasDryCleaning: true, ironPrice: 1000, dryCleanPrice: 1500 },
      { name: 'Leather Jacket', icon: 'shield-outline', hasIroning: false, hasDryCleaning: true, ironPrice: 7500, dryCleanPrice: 7500 },
    ],
    Woman: [
      { name: 'Blouse', icon: 'tshirt-v', hasIroning: true, hasDryCleaning: true, ironPrice: 1000, dryCleanPrice: 1500 },
      { name: 'Dress', icon: 'hanger', hasIroning: true, hasDryCleaning: true, ironPrice: 1500, dryCleanPrice: 2500 },
      { name: 'Skirt', icon: 'hanger', hasIroning: true, hasDryCleaning: true, ironPrice: 1000, dryCleanPrice: 1500 },
      { name: 'Jeans', icon: 'hanger', hasIroning: true, hasDryCleaning: true, ironPrice: 1000, dryCleanPrice: 1500 },
      { name: 'Suit', icon: 'tie', hasIroning: false, hasDryCleaning: true, ironPrice: 5000, dryCleanPrice: 5000 },
      { name: 'Jacket', icon: 'hanger', hasIroning: true, hasDryCleaning: true, ironPrice: 1000, dryCleanPrice: 1500 },
      { name: 'Wedding Gown', icon: 'cards-heart', hasIroning: false, hasDryCleaning: true, ironPrice: 15000, dryCleanPrice: 15000 },
      { name: 'Leather Jacket', icon: 'shield-outline', hasIroning: false, hasDryCleaning: true, ironPrice: 7500, dryCleanPrice: 7500 },
    ],
    Kids: [
      { name: 'Kids T-Shirt', icon: 'tshirt-crew', hasIroning: true, hasDryCleaning: true, ironPrice: 1000, dryCleanPrice: 1500 },
      { name: 'Kids Trouser', icon: 'hanger', hasIroning: true, hasDryCleaning: true, ironPrice: 1000, dryCleanPrice: 1500 },
      { name: 'Kids Dress', icon: 'hanger', hasIroning: true, hasDryCleaning: true, ironPrice: 1000, dryCleanPrice: 1500 },
    ],
    Household: [
      { name: 'Duvet', icon: 'bed-double-outline', hasIroning: false, hasDryCleaning: true, ironPrice: 5000, dryCleanPrice: 5000 },
      { name: 'Curtains', icon: 'bed-outline', hasIroning: false, hasDryCleaning: true, ironPrice: 5000, dryCleanPrice: 5000 },
      { name: 'Bed Sheets', icon: 'bed-empty', hasIroning: false, hasDryCleaning: true, ironPrice: 2000, dryCleanPrice: 2000 },
      { name: 'Sneakers', icon: 'shoe-sneaker', hasIroning: false, hasDryCleaning: true, ironPrice: 2500, dryCleanPrice: 2500 },
    ]
  };

  const [clothesData, setClothesData] = useState<Record<'Man' | 'Woman' | 'Kids' | 'Household', ClothesItem[]>>(defaultClothesData);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await axios.get(`${API_URL}/admin/services`);
        const list: any[] = res.data.services || [];
        if (list.length > 0) {
          // Group custom services by category
          const grouped: Record<'Man' | 'Woman' | 'Kids' | 'Household', ClothesItem[]> = {
            Man: [],
            Woman: [],
            Kids: [],
            Household: [],
          };
          list.forEach((s) => {
            const cat = s.category as 'Man' | 'Woman' | 'Kids' | 'Household';
            if (grouped[cat]) {
              grouped[cat].push({
                name: s.name,
                icon: s.icon,
                hasIroning: s.hasIroning,
                hasDryCleaning: s.hasDryCleaning,
                ironPrice: s.ironPrice,
                dryCleanPrice: s.dryCleanPrice,
              });
            }
          });
          setClothesData(grouped);
        }
      } catch (err) {
        console.warn('Failed to load dynamic pricing, running fallback data:', err);
      }
    };
    fetchServices();
  }, []);

  const handleIncrement = (itemName: string) => {
    const service = selectedServices[itemName];
    const key = `${itemName} (${service})`;
    setQuantities(prev => ({
      ...prev,
      [key]: (prev[key] || 0) + 1
    }));
  };

  const handleDecrement = (itemName: string) => {
    const service = selectedServices[itemName];
    const key = `${itemName} (${service})`;
    if (!quantities[key]) return;
    setQuantities(prev => {
      const next = { ...prev };
      next[key] = next[key] - 1;
      if (next[key] <= 0) {
        delete next[key];
      }
      return next;
    });
  };

  const toggleService = (itemName: string, service: 'Dry Cleaning' | 'Ironing Only') => {
    // Save current count of item if any
    const oldService = selectedServices[itemName];
    const oldKey = `${itemName} (${oldService})`;
    const currentQty = quantities[oldKey] || 0;

    setSelectedServices(prev => ({
      ...prev,
      [itemName]: service
    }));

    // Transfer quantity to new service type key
    if (currentQty > 0) {
      setQuantities(prev => {
        const next = { ...prev };
        delete next[oldKey];
        next[`${itemName} (${service})`] = currentQty;
        return next;
      });
    }
    setActiveDropdown(null);
  };

  // Compute total pricing dynamically based on key names and clothesData lookup
  const totalAmount = Object.keys(quantities).reduce((sum, key) => {
    const match = key.match(/^(.+) \((.+)\)$/);
    if (!match) return sum;
    const itemName = match[1];
    const serviceType = match[2];

    let foundPrice = 0;
    for (const category of Object.keys(clothesData) as ('Man' | 'Woman' | 'Kids' | 'Household')[]) {
      const item = clothesData[category].find(c => c.name === itemName);
      if (item) {
        foundPrice = serviceType === 'Dry Cleaning' ? item.dryCleanPrice : item.ironPrice;
        break;
      }
    }
    return sum + quantities[key] * foundPrice;
  }, 0);

  const totalItemsCount = Object.values(quantities).reduce((a, b) => a + b, 0);
  const hasItems = totalAmount > 0;

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Clothes</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Categories Horizontal Tabs */}
      <View style={styles.tabBar}>
        {(['Man', 'Woman', 'Kids', 'Household'] as const).map((tab) => {
          const isActive = activeTab === tab;
          return (
            <TouchableOpacity 
              key={tab} 
              style={[styles.tabItem, isActive && styles.tabItemActive]}
              onPress={() => {
                setActiveTab(tab);
                setActiveDropdown(null);
              }}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {tab === 'Household' ? 'Other' : tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={styles.list} keyboardShouldPersistTaps="handled">
        {clothesData[activeTab].map((item, idx) => {
          const service = selectedServices[item.name];
          const price = service === 'Dry Cleaning' ? item.dryCleanPrice : item.ironPrice;
          const key = `${item.name} (${service})`;
          const qty = quantities[key] || 0;
          const isSelected = qty > 0;
          const isDropdownOpen = activeDropdown === item.name;

          return (
            <View key={idx} style={[styles.itemCard, isSelected && styles.itemCardActive]}>
              <View style={styles.itemRow}>
                {/* Visual Icon */}
                <View style={styles.iconWrapper}>
                  <MaterialCommunityIcons name={item.icon as any} size={28} color="#475569" />
                </View>

                {/* Details Section */}
                <View style={styles.detailsCol}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  
                  {/* Service Dropdown Selector */}
                  <View style={styles.serviceSelectorWrapper}>
                    {item.hasIroning && item.hasDryCleaning ? (
                      <TouchableOpacity 
                        style={styles.dropdownTrigger} 
                        onPress={() => setActiveDropdown(isDropdownOpen ? null : item.name)}
                      >
                        <Text style={styles.dropdownText}>{service}</Text>
                        <Feather name="chevron-down" size={12} color="#0066FF" style={{ marginLeft: 3 }} />
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.dropdownStatic}>
                        <Text style={styles.dropdownTextStatic}>{service}</Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Price Display */}
                <Text style={styles.priceText}>{formatNaira(price)}</Text>

                {/* Tactile Counter Buttons */}
                <View style={styles.counterWrapper}>
                  {qty > 0 ? (
                    <View style={styles.pillCounter}>
                      <TouchableOpacity style={styles.pillBtn} onPress={() => handleDecrement(item.name)}>
                        <Feather name="minus" size={14} color="#0066FF" />
                      </TouchableOpacity>
                      <Text style={styles.pillQtyText}>{qty}</Text>
                      <TouchableOpacity style={styles.pillBtn} onPress={() => handleIncrement(item.name)}>
                        <Feather name="plus" size={14} color="#0066FF" />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity style={styles.addCircleBtn} onPress={() => handleIncrement(item.name)}>
                      <Feather name="plus" size={18} color="#FFFFFF" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Service Selection Dropdown Drop-list overlay */}
              {isDropdownOpen && (
                <View style={styles.dropdownOverlay}>
                  <TouchableOpacity 
                    style={styles.dropdownOption} 
                    onPress={() => toggleService(item.name, 'Ironing Only')}
                  >
                    <Feather name={service === 'Ironing Only' ? 'check' : 'circle'} size={14} color="#0066FF" />
                    <Text style={[styles.dropdownOptionText, service === 'Ironing Only' && styles.dropdownOptionTextActive]}>
                      Ironing Only ({formatNaira(item.ironPrice)})
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.dropdownOption} 
                    onPress={() => toggleService(item.name, 'Dry Cleaning')}
                  >
                    <Feather name={service === 'Dry Cleaning' ? 'check' : 'circle'} size={14} color="#0066FF" />
                    <Text style={[styles.dropdownOptionText, service === 'Dry Cleaning' && styles.dropdownOptionTextActive]}>
                      Dry Cleaning ({formatNaira(item.dryCleanPrice)})
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* Sticky footer checkout */}
      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <View>
            <Text style={styles.totalLabel}>Estimated Total</Text>
            <Text style={styles.itemCountText}>{totalItemsCount} items selected</Text>
          </View>
          <Text style={styles.totalVal}>{formatNaira(totalAmount)}</Text>
        </View>
        
        <TouchableOpacity
          style={[styles.proceedButton, !hasItems && styles.disabledButton]}
          disabled={!hasItems}
          onPress={() => router.push({
            pathname: '/booking/schedule',
            params: {
              itemsJson: JSON.stringify(quantities),
              total: totalAmount.toString(),
            }
          })}
        >
          <Text style={styles.proceedButtonText}>Select Delivery Schedule</Text>
          {hasItems && <Feather name="chevron-right" size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: '#00B4D8',
  },
  tabText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#00B4D8',
    fontWeight: 'bold',
  },
  list: {
    padding: 16,
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingVertical: 16,
    position: 'relative',
  },
  itemCardActive: {
    // Keep list items matching reference borderless but highlighted or styled neatly
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    width: 48,
    height: 48,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  detailsCol: {
    flex: 1,
    marginRight: 8,
  },
  itemName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  serviceSelectorWrapper: {
    marginTop: 4,
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  dropdownText: {
    fontSize: 12,
    color: '#00B4D8',
    fontWeight: '600',
  },
  dropdownStatic: {
    alignSelf: 'flex-start',
  },
  dropdownTextStatic: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  priceText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F172A',
    marginRight: 16,
  },
  counterWrapper: {
    minWidth: 40,
    alignItems: 'flex-end',
  },
  addCircleBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#00B4D8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F7FA',
    borderRadius: 16,
    padding: 2,
    borderWidth: 1,
    borderColor: '#B2EBF2',
  },
  pillBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillQtyText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#00838F',
    paddingHorizontal: 6,
  },
  dropdownOverlay: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    marginTop: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    gap: 8,
  },
  dropdownOptionText: {
    fontSize: 12,
    color: '#64748B',
  },
  dropdownOptionTextActive: {
    color: '#0066FF',
    fontWeight: 'bold',
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  itemCountText: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  totalVal: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  proceedButton: {
    backgroundColor: '#0066FF',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  disabledButton: {
    backgroundColor: '#CBD5E1',
  },
  proceedButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
