'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import {
  LogOut,
  ShoppingBag,
  MapPin,
  Calendar,
  Activity,
  History,
  Plus,
  Minus,
  Check,
  Loader2,
  Clock,
  Shirt,
  Sparkles,
  ChevronRight,
  Info
} from 'lucide-react';

// Tab configuration
type TabType = 'BOOK' | 'ACTIVE' | 'HISTORY';
type ServiceCategory = 'Clothing' | 'Household' | 'Additional';

interface BasketItem {
  serviceName: string;
  quantity: number;
  price: number;
}

export default function CustomerDashboard() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  
  // Dashboard navigation tab
  const [activeTab, setActiveTab] = useState<TabType>('BOOK');
  const [categoryTab, setCategoryTab] = useState<ServiceCategory>('Clothing');
  
  // Fetch lists
  const [services, setServices] = useState<any[]>([]);
  const [activeOrders, setActiveOrders] = useState<any[]>([]);
  const [historyOrders, setHistoryOrders] = useState<any[]>([]);
  
  // Loading & Error states
  const [loading, setLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Basket & Schedule states
  const [basket, setBasket] = useState<Record<string, BasketItem>>({});
  const [pickupAddress, setPickupAddress] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [bookingStep, setBookingStep] = useState<'SELECT' | 'SCHEDULE'>('SELECT');

  // Verify auth session on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('customerToken');
      const storedUser = localStorage.getItem('customerUser');
      
      if (!storedToken || !storedUser) {
        router.push('/login');
      } else {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    }
  }, [router]);

  // Fetch Services & Customer data
  useEffect(() => {
    if (!token || !user) return;
    
    // 1. Fetch Laundry Services Catalog
    setLoading(true);
    axios.get('/api/v1/admin/services')
      .then((res) => {
        setServices(res.data.services || []);
      })
      .catch((err) => {
        console.error('Failed to load services:', err);
        setError('Unable to load laundry service catalog.');
      })
      .finally(() => setLoading(false));

    // 2. Fetch Active Bookings & History
    refreshOrders();
  }, [token, user]);

  const refreshOrders = () => {
    if (!token || !user) return;
    setOrdersLoading(true);

    // Active bookings
    axios.get(`/api/v1/orders/customer/${user.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => {
        setActiveOrders(res.data || []);
      })
      .catch((err) => console.error('Active orders error:', err));

    // Completed History
    axios.get(`/api/v1/orders/customer/${user.id}?history=true`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => {
        setHistoryOrders(res.data || []);
      })
      .catch((err) => console.error('History orders error:', err))
      .finally(() => setOrdersLoading(false));
  };

  const handleLogout = () => {
    localStorage.removeItem('customerToken');
    localStorage.removeItem('customerUser');
    router.push('/login');
  };

  // Basket Handlers
  const handleAddToBasket = (serviceName: string, optionName: string, price: number) => {
    const basketKey = `${serviceName} - ${optionName}`;
    setBasket((prev) => {
      const current = prev[basketKey];
      return {
        ...prev,
        [basketKey]: {
          serviceName: basketKey,
          quantity: current ? current.quantity + 1 : 1,
          price
        }
      };
    });
  };

  const handleRemoveFromBasket = (basketKey: string) => {
    setBasket((prev) => {
      const current = prev[basketKey];
      if (!current) return prev;
      if (current.quantity <= 1) {
        const next = { ...prev };
        delete next[basketKey];
        return next;
      }
      return {
        ...prev,
        [basketKey]: {
          ...current,
          quantity: current.quantity - 1
        }
      };
    });
  };

  const getBasketTotal = () => {
    return Object.values(basket).reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !user) return;
    if (Object.keys(basket).length === 0) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const bookingData = {
        customerId: user.id,
        pickupAddress: pickupAddress.trim(),
        deliveryAddress: deliveryAddress.trim(),
        pickupDate,
        items: Object.values(basket).map((item) => ({
          serviceName: item.serviceName,
          quantity: item.quantity,
          price: item.price
        }))
      };

      await axios.post('/api/v1/orders/book', bookingData);
      
      setSuccess('Laundry booking placed successfully! A driver will be assigned shortly.');
      setBasket({});
      setPickupAddress('');
      setDeliveryAddress('');
      setPickupDate('');
      setBookingStep('SELECT');
      setActiveTab('ACTIVE');
      refreshOrders();
    } catch (err: any) {
      console.error('Booking failed:', err);
      setError(err.response?.data?.error || 'Failed to submit booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Helper to format currency
  const formatCurrency = (val: number) => {
    return `₦${val.toLocaleString('en-US')}`;
  };

  // Helper to resolve laundry status pipelines
  const getStatusStep = (status: string) => {
    switch (status) {
      case 'PICKUP_PENDING': return 1;
      case 'PICKUP_IN_PROGRESS': return 2;
      case 'PICKED_UP': return 3;
      case 'PROCESSING': return 4;
      case 'DELIVERY_PENDING':
      case 'DELIVERY_IN_PROGRESS': return 5;
      case 'DELIVERED': return 6;
      default: return 1;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PICKUP_PENDING': return 'Waiting for Driver';
      case 'PICKUP_IN_PROGRESS': return 'Driver en route for pickup';
      case 'PICKED_UP': return 'Picked up';
      case 'PROCESSING': return 'Cleaning in Progress';
      case 'DELIVERY_PENDING': return 'Ready for Delivery';
      case 'DELIVERY_IN_PROGRESS': return 'Out for Delivery';
      case 'DELIVERED': return 'Delivered';
      case 'CANCELLED': return 'Cancelled';
      default: return status;
    }
  };

  // Filter services by category
  const filteredServices = services.filter((svc) => svc.category === categoryTab);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      {/* Top Header Navigation Bar */}
      <header style={{
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        padding: '16px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#002B7F', display: 'flex', alignItems: 'center', gap: '8px' }}>
          BG Laundry Portal
        </div>
        
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#0F172A' }}>{user.fullName}</div>
              <div style={{ fontSize: '12px', color: '#64748B' }}>{user.phoneNumber}</div>
            </div>
            
            <button
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                border: '1px solid #E2E8F0',
                borderRadius: '6px',
                backgroundColor: '#FFFFFF',
                color: '#EF4444',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FEF2F2'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        )}
      </header>

      {/* Main Dashboard Layout */}
      <div style={{ display: 'flex', flex: 1 }}>
        {/* Left Navigation Sidebar */}
        <aside style={{
          width: '260px',
          backgroundColor: '#FFFFFF',
          borderRight: '1px solid #E2E8F0',
          padding: '24px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <button
            onClick={() => { setActiveTab('BOOK'); setSuccess(''); setError(''); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              border: 'none',
              borderRadius: '8px',
              backgroundColor: activeTab === 'BOOK' ? '#F0F5FF' : 'transparent',
              color: activeTab === 'BOOK' ? '#002B7F' : '#64748B',
              fontSize: '15px',
              fontWeight: '600',
              textAlign: 'left',
              cursor: 'pointer',
              width: '100%',
              transition: 'background-color 0.2s'
            }}
          >
            <ShoppingBag size={18} />
            Book Laundry
          </button>

          <button
            onClick={() => { setActiveTab('ACTIVE'); setSuccess(''); setError(''); refreshOrders(); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              border: 'none',
              borderRadius: '8px',
              backgroundColor: activeTab === 'ACTIVE' ? '#F0F5FF' : 'transparent',
              color: activeTab === 'ACTIVE' ? '#002B7F' : '#64748B',
              fontSize: '15px',
              fontWeight: '600',
              textAlign: 'left',
              cursor: 'pointer',
              width: '100%',
              transition: 'background-color 0.2s'
            }}
          >
            <Activity size={18} />
            Active Bookings
            {activeOrders.length > 0 && (
              <span style={{
                marginLeft: 'auto',
                backgroundColor: '#0066FF',
                color: '#FFFFFF',
                fontSize: '11px',
                padding: '2px 6px',
                borderRadius: '10px'
              }}>
                {activeOrders.length}
              </span>
            )}
          </button>

          <button
            onClick={() => { setActiveTab('HISTORY'); setSuccess(''); setError(''); refreshOrders(); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              border: 'none',
              borderRadius: '8px',
              backgroundColor: activeTab === 'HISTORY' ? '#F0F5FF' : 'transparent',
              color: activeTab === 'HISTORY' ? '#002B7F' : '#64748B',
              fontSize: '15px',
              fontWeight: '600',
              textAlign: 'left',
              cursor: 'pointer',
              width: '100%',
              transition: 'background-color 0.2s'
            }}
          >
            <History size={18} />
            Order History
          </button>
        </aside>

        {/* Content Workspace Area */}
        <main style={{ flex: 1, padding: '40px' }}>
          {/* Global Messaging banner */}
          {success && (
            <div style={{
              padding: '16px',
              backgroundColor: '#F0FDF4',
              border: '1px solid #86EFAC',
              color: '#166534',
              borderRadius: '8px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Check size={18} />
              <span>{success}</span>
            </div>
          )}

          {error && (
            <div style={{
              padding: '16px',
              backgroundColor: '#FEF2F2',
              border: '1px solid #FCA5A5',
              color: '#B91C1C',
              borderRadius: '8px',
              marginBottom: '24px'
            }}>
              <span>{error}</span>
            </div>
          )}

          {/* TAB 1: BOOK LAUNDRY VIEW */}
          {activeTab === 'BOOK' && (
            <div style={{ display: 'flex', gap: '32px', height: '100%', alignItems: 'flex-start' }}>
              
              {/* Left Column: Catalog selection */}
              <div style={{ flex: 1 }}>
                {bookingStep === 'SELECT' ? (
                  <>
                    <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0F172A', margin: '0 0 24px 0' }}>
                      Select Services
                    </h2>
                    
                    {/* Category tabs */}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid #E2E8F0', paddingBottom: '12px' }}>
                      {(['Clothing', 'Household', 'Additional'] as ServiceCategory[]).map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setCategoryTab(cat)}
                          style={{
                            padding: '8px 16px',
                            border: 'none',
                            borderRadius: '20px',
                            backgroundColor: categoryTab === cat ? '#002B7F' : 'transparent',
                            color: categoryTab === cat ? '#FFFFFF' : '#64748B',
                            fontWeight: '600',
                            fontSize: '14px',
                            cursor: 'pointer'
                          }}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    {/* Services cards grid */}
                    {loading ? (
                      <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                        <Loader2 size={32} className="animate-spin" style={{ color: '#002B7F' }} />
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                        {filteredServices.map((svc) => {
                          const options = [];
                          if (svc.hasWashIron) options.push({ type: 'Wash & Iron', price: svc.washIronPrice });
                          if (svc.hasWash) options.push({ type: 'Wash Only', price: svc.washPrice });
                          if (svc.hasIron) options.push({ type: 'Iron Only', price: svc.ironPrice });

                          return (
                            <div key={svc.id} style={{
                              backgroundColor: '#FFFFFF',
                              borderRadius: '12px',
                              border: '1px solid #E2E8F0',
                              padding: '20px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '12px'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                  width: '36px',
                                  height: '36px',
                                  borderRadius: '8px',
                                  backgroundColor: '#F0F5FF',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: '#002B7F',
                                  fontWeight: 'bold'
                                }}>
                                  <Shirt size={18} />
                                </div>
                                <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#0F172A', margin: 0 }}>
                                  {svc.name}
                                </h3>
                              </div>

                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                                {options.map((opt, idx) => {
                                  const key = `${svc.name} - ${opt.type}`;
                                  const basketQty = basket[key]?.quantity || 0;

                                  return (
                                    <div key={idx} style={{
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'center',
                                      padding: '8px 12px',
                                      backgroundColor: '#F8FAFC',
                                      borderRadius: '8px',
                                      border: '1px solid #F1F5F9'
                                    }}>
                                      <div>
                                        <div style={{ fontSize: '13px', fontWeight: '500', color: '#0F172A' }}>{opt.type}</div>
                                        <div style={{ fontSize: '12px', fontWeight: '700', color: '#0066FF' }}>{formatCurrency(opt.price)}</div>
                                      </div>

                                      {basketQty > 0 ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                          <button
                                            onClick={() => handleRemoveFromBasket(key)}
                                            style={{
                                              width: '28px',
                                              height: '28px',
                                              borderRadius: '14px',
                                              border: '1px solid #E2E8F0',
                                              backgroundColor: '#FFFFFF',
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                              cursor: 'pointer'
                                            }}
                                          >
                                            <Minus size={12} />
                                          </button>
                                          <span style={{ fontSize: '14px', fontWeight: '700' }}>{basketQty}</span>
                                          <button
                                            onClick={() => handleAddToBasket(svc.name, opt.type, opt.price)}
                                            style={{
                                              width: '28px',
                                              height: '28px',
                                              borderRadius: '14px',
                                              border: '1px solid #E2E8F0',
                                              backgroundColor: '#FFFFFF',
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                              cursor: 'pointer'
                                            }}
                                          >
                                            <Plus size={12} />
                                          </button>
                                        </div>
                                      ) : (
                                        <button
                                          onClick={() => handleAddToBasket(svc.name, opt.type, opt.price)}
                                          style={{
                                            padding: '6px 12px',
                                            borderRadius: '6px',
                                            border: 'none',
                                            backgroundColor: '#002B7F',
                                            color: '#FFFFFF',
                                            fontSize: '12px',
                                            fontWeight: 'bold',
                                            cursor: 'pointer'
                                          }}
                                        >
                                          Add
                                        </button>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                ) : (
                  // Schedule details step
                  <div style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    padding: '32px',
                    maxWidth: '600px'
                  }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#0F172A', margin: '0 0 24px 0' }}>
                      Schedule Laundry Pickup
                    </h2>

                    <form onSubmit={handlePlaceOrder}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#0F172A', marginBottom: '8px' }}>
                            Pickup Address
                          </label>
                          <input
                            type="text"
                            required
                            value={pickupAddress}
                            onChange={(e) => setPickupAddress(e.target.value)}
                            placeholder="e.g. Apartment 4, 16B Maria Okor Street, Ejibo"
                            style={{
                              width: '100%',
                              padding: '12px',
                              border: '1px solid #E2E8F0',
                              borderRadius: '6px',
                              fontSize: '14px',
                              boxSizing: 'border-box'
                            }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#0F172A', marginBottom: '8px' }}>
                            Delivery Address
                          </label>
                          <input
                            type="text"
                            required
                            value={deliveryAddress}
                            onChange={(e) => setDeliveryAddress(e.target.value)}
                            placeholder="e.g. Same as pickup address"
                            style={{
                              width: '100%',
                              padding: '12px',
                              border: '1px solid #E2E8F0',
                              borderRadius: '6px',
                              fontSize: '14px',
                              boxSizing: 'border-box'
                            }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#0F172A', marginBottom: '8px' }}>
                            Pickup Date & Time
                          </label>
                          <input
                            type="datetime-local"
                            required
                            value={pickupDate}
                            onChange={(e) => setPickupDate(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '12px',
                              border: '1px solid #E2E8F0',
                              borderRadius: '6px',
                              fontSize: '14px',
                              boxSizing: 'border-box'
                            }}
                          />
                        </div>

                        <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
                          <button
                            type="button"
                            onClick={() => setBookingStep('SELECT')}
                            style={{
                              flex: 1,
                              padding: '14px',
                              border: '1px solid #E2E8F0',
                              borderRadius: '6px',
                              backgroundColor: '#FFFFFF',
                              color: '#0F172A',
                              fontSize: '15px',
                              fontWeight: '600',
                              cursor: 'pointer'
                            }}
                          >
                            Back to Items
                          </button>
                          <button
                            type="submit"
                            disabled={loading}
                            style={{
                              flex: 2,
                              padding: '14px',
                              border: 'none',
                              borderRadius: '6px',
                              backgroundColor: '#0066FF',
                              color: '#FFFFFF',
                              fontSize: '15px',
                              fontWeight: 'bold',
                              cursor: loading ? 'not-allowed' : 'pointer',
                              opacity: loading ? 0.7 : 1
                            }}
                          >
                            {loading ? 'Submitting booking...' : 'Confirm & Book Laundry'}
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                )}
              </div>

              {/* Right Column: Basket details */}
              {bookingStep === 'SELECT' && (
                <div style={{
                  width: '320px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  maxHeight: '80vh'
                }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#0F172A', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShoppingBag size={18} />
                    Basket
                  </h3>

                  {Object.keys(basket).length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94A3B8' }}>
                      <p style={{ margin: 0, fontSize: '14px' }}>Your basket is currently empty.</p>
                    </div>
                  ) : (
                    <>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', flex: 1, marginBottom: '24px' }}>
                        {Object.values(basket).map((item) => (
                          <div key={item.serviceName} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #F1F5F9', paddingBottom: '12px' }}>
                            <div style={{ flex: 1, paddingRight: '12px' }}>
                              <div style={{ fontSize: '13px', fontWeight: '600', color: '#0F172A' }}>{item.serviceName}</div>
                              <div style={{ fontSize: '12px', color: '#64748B' }}>
                                {item.quantity} × {formatCurrency(item.price)}
                              </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '13px', fontWeight: '700', color: '#002B7F', marginBottom: '8px' }}>
                                {formatCurrency(item.price * item.quantity)}
                              </div>
                              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                <button
                                  onClick={() => handleRemoveFromBasket(item.serviceName)}
                                  style={{
                                    width: '20px',
                                    height: '20px',
                                    borderRadius: '10px',
                                    border: '1px solid #E2E8F0',
                                    backgroundColor: '#FFFFFF',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer'
                                  }}
                                >
                                  <Minus size={10} />
                                </button>
                                <button
                                  onClick={() => handleAddToBasket(item.serviceName.split(' - ')[0], item.serviceName.split(' - ')[1], item.price)}
                                  style={{
                                    width: '20px',
                                    height: '20px',
                                    borderRadius: '10px',
                                    border: '1px solid #E2E8F0',
                                    backgroundColor: '#FFFFFF',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer'
                                  }}
                                >
                                  <Plus size={10} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div style={{ borderTop: '2px dashed #E2E8F0', paddingTop: '16px', marginBottom: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                          <span style={{ fontSize: '14px', fontWeight: '600', color: '#64748B' }}>Total:</span>
                          <span style={{ fontSize: '20px', fontWeight: '800', color: '#002B7F' }}>
                            {formatCurrency(getBasketTotal())}
                          </span>
                        </div>

                        <button
                          onClick={() => setBookingStep('SCHEDULE')}
                          style={{
                            width: '100%',
                            padding: '14px',
                            backgroundColor: '#0066FF',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '15px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                          }}
                        >
                          Checkout
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ACTIVE TRACKINGS VIEW */}
          {activeTab === 'ACTIVE' && (
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0F172A', marginBottom: '24px' }}>
                Active Bookings
              </h2>

              {ordersLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                  <Loader2 size={32} className="animate-spin" style={{ color: '#002B7F' }} />
                </div>
              ) : activeOrders.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '60px 40px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                  color: '#64748B'
                }}>
                  <ShoppingBag size={48} style={{ color: '#94A3B8', marginBottom: '16px' }} />
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 8px 0' }}>No Active Orders</h3>
                  <p style={{ margin: 0, fontSize: '14px' }}>You do not have any laundry orders being processed right now.</p>
                  <button
                    onClick={() => setActiveTab('BOOK')}
                    style={{
                      marginTop: '20px',
                      padding: '10px 20px',
                      backgroundColor: '#002B7F',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    Schedule a Pickup
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {activeOrders.map((order) => {
                    const currentStep = getStatusStep(order.status);

                    return (
                      <div key={order.id} style={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '12px',
                        border: '1px solid #E2E8F0',
                        padding: '24px'
                      }}>
                        {/* Order info summary line */}
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          borderBottom: '1px solid #F1F5F9',
                          paddingBottom: '16px',
                          marginBottom: '20px',
                          flexWrap: 'wrap',
                          gap: '16px'
                        }}>
                          <div>
                            <div style={{ fontSize: '16px', fontWeight: '800', color: '#002B7F' }}>
                              {order.orderNumber}
                            </div>
                            <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>
                              Placed on {new Date(order.createdAt).toLocaleDateString()}
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                            <div>
                              <div style={{ fontSize: '12px', color: '#64748B' }}>Total Cost</div>
                              <div style={{ fontSize: '15px', fontWeight: '700', color: '#0F172A' }}>
                                {formatCurrency(order.totalAmount)}
                              </div>
                            </div>
                            <div>
                              <div style={{ fontSize: '12px', color: '#64748B' }}>Current Status</div>
                              <div style={{
                                fontSize: '12px',
                                fontWeight: '700',
                                color: order.status === 'CANCELLED' ? '#EF4444' : '#0066FF',
                                backgroundColor: order.status === 'CANCELLED' ? '#FEF2F2' : '#F0F5FF',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                display: 'inline-block',
                                marginTop: '2px'
                              }}>
                                {getStatusLabel(order.status)}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Middle section: items list & OTP keys side-by-side */}
                        <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap', marginBottom: '24px' }}>
                          <div style={{ flex: 1, minWidth: '260px' }}>
                            <div style={{ fontSize: '13px', fontWeight: '700', color: '#475569', marginBottom: '12px' }}>
                              Garments List
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              {order.items.map((item: any) => (
                                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                                  <span style={{ color: '#0F172A' }}>{item.serviceName}</span>
                                  <span style={{ color: '#64748B', fontWeight: '600' }}>Qty: {item.quantity}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Security OTP codes display */}
                          {order.status !== 'CANCELLED' && (
                            <div style={{
                              width: '280px',
                              backgroundColor: '#F8FAFC',
                              border: '1px dashed #E2E8F0',
                              borderRadius: '8px',
                              padding: '16px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '12px'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontSize: '12px', fontWeight: '600' }}>
                                <Info size={14} />
                                Driver Verification Codes
                              </div>

                              {currentStep <= 2 ? (
                                <div>
                                  <div style={{ fontSize: '11px', color: '#64748B' }}>Give code to driver at PICKUP:</div>
                                  <div style={{ fontSize: '24px', fontWeight: '800', color: '#002B7F', letterSpacing: '2px', marginTop: '4px' }}>
                                    {order.pickupOTP || '----'}
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  <div style={{ fontSize: '11px', color: '#64748B' }}>Give code to driver at DELIVERY:</div>
                                  <div style={{ fontSize: '24px', fontWeight: '800', color: '#0066FF', letterSpacing: '2px', marginTop: '4px' }}>
                                    {order.deliveryOTP || '----'}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Bottom Section: Sleek step progress bar */}
                        {order.status !== 'CANCELLED' && (
                          <div style={{ marginTop: '32px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', marginBottom: '8px' }}>
                              
                              {/* Background Bar */}
                              <div style={{
                                position: 'absolute',
                                top: '12px',
                                left: '16px',
                                right: '16px',
                                height: '4px',
                                backgroundColor: '#E2E8F0',
                                zIndex: 0
                              }} />
                              
                              {/* Filled Progress Bar */}
                              <div style={{
                                position: 'absolute',
                                top: '12px',
                                left: '16px',
                                width: `${((currentStep - 1) / 5) * 100}%`,
                                height: '4px',
                                backgroundColor: '#0066FF',
                                zIndex: 0,
                                transition: 'width 0.4s ease'
                              }} />

                              {/* Progress Nodes */}
                              {[
                                { label: 'Submitted', step: 1 },
                                { label: 'Assigned', step: 2 },
                                { label: 'Collected', step: 3 },
                                { label: 'Cleaning', step: 4 },
                                { label: 'Out for Delivery', step: 5 },
                                { label: 'Delivered', step: 6 }
                              ].map((node) => {
                                const isPassed = currentStep >= node.step;
                                const isCurrent = currentStep === node.step;

                                return (
                                  <div key={node.step} style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    zIndex: 10,
                                    width: '60px'
                                  }}>
                                    <div style={{
                                      width: '24px',
                                      height: '24px',
                                      borderRadius: '12px',
                                      backgroundColor: isPassed ? '#0066FF' : '#E2E8F0',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      color: '#FFFFFF',
                                      fontSize: '11px',
                                      fontWeight: 'bold',
                                      border: isCurrent ? '4px solid #F0F5FF' : 'none'
                                    }}>
                                      {isPassed && node.step < currentStep ? '✓' : node.step}
                                    </div>
                                    <span style={{
                                      fontSize: '10px',
                                      fontWeight: isPassed ? 'bold' : 'normal',
                                      color: isPassed ? '#002B7F' : '#64748B',
                                      textAlign: 'center',
                                      marginTop: '8px',
                                      lineHeight: '1.2'
                                    }}>
                                      {node.label}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ORDER HISTORY VIEW */}
          {activeTab === 'HISTORY' && (
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0F172A', marginBottom: '24px' }}>
                Completed Bookings
              </h2>

              {ordersLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                  <Loader2 size={32} className="animate-spin" style={{ color: '#002B7F' }} />
                </div>
              ) : historyOrders.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '60px 40px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                  color: '#64748B'
                }}>
                  <History size={48} style={{ color: '#94A3B8', marginBottom: '16px' }} />
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 8px 0' }}>No Order History</h3>
                  <p style={{ margin: 0, fontSize: '14px' }}>You have not completed any bookings yet.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {historyOrders.map((order) => (
                    <div key={order.id} style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '12px',
                      border: '1px solid #E2E8F0',
                      padding: '20px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '16px'
                    }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '14px', fontWeight: '700', color: '#002B7F' }}>{order.orderNumber}</span>
                          <span style={{
                            fontSize: '11px',
                            fontWeight: '600',
                            backgroundColor: '#F0FDF4',
                            color: '#166534',
                            padding: '2px 6px',
                            borderRadius: '4px'
                          }}>
                            Delivered
                          </span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>
                          Completed on {new Date(order.updatedAt).toLocaleDateString()}
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {order.items.map((item: any) => (
                          <div key={item.id} style={{ fontSize: '12px', color: '#475569' }}>
                            {item.serviceName} × {item.quantity}
                          </div>
                        ))}
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '12px', color: '#64748B' }}>Total Amount Paid</div>
                        <div style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', marginTop: '2px' }}>
                          {formatCurrency(order.totalAmount)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
