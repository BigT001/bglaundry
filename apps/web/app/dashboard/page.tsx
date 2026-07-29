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
  ChevronDown,
  Info,
  User,
  X,
  MapPinned
} from '@/lib/icons';

type TabType = 'BOOK' | 'ACTIVE' | 'HISTORY';
type ServiceCategory = 'Clothing' | 'Household' | 'Additional';

interface BasketItem {
  serviceName: string;
  quantity: number;
  price: number;
}

const BASKET_STORAGE_KEY = 'bglaundry-dashboard-basket';

const fallbackServices = [
  { id: 'fallback-tshirt', name: 'T-Shirt / Polo', category: 'Clothing', hasWash: true, hasIron: true, hasWashIron: true, washPrice: 500, ironPrice: 300, washIronPrice: 700 },
  { id: 'fallback-shirt', name: 'Dress Shirt', category: 'Clothing', hasWash: true, hasIron: true, hasWashIron: true, washPrice: 700, ironPrice: 400, washIronPrice: 1000 },
  { id: 'fallback-trouser', name: 'Trouser', category: 'Clothing', hasWash: true, hasIron: true, hasWashIron: true, washPrice: 500, ironPrice: 300, washIronPrice: 700 },
  { id: 'fallback-jeans', name: 'Jeans', category: 'Clothing', hasWash: true, hasIron: true, hasWashIron: true, washPrice: 700, ironPrice: 400, washIronPrice: 1000 },
  { id: 'fallback-shorts', name: 'Shorts', category: 'Clothing', hasWash: true, hasIron: true, hasWashIron: true, washPrice: 300, ironPrice: 200, washIronPrice: 500 },
  { id: 'fallback-casual-shirt', name: 'Casual/Formal Shirt', category: 'Clothing', hasWash: true, hasIron: true, hasWashIron: true, washPrice: 500, ironPrice: 300, washIronPrice: 800 },
  { id: 'fallback-blouse', name: 'Blouse', category: 'Clothing', hasWash: true, hasIron: true, hasWashIron: true, washPrice: 500, ironPrice: 300, washIronPrice: 800 },
  { id: 'fallback-dress', name: 'Dress', category: 'Clothing', hasWash: true, hasIron: true, hasWashIron: true, washPrice: 1300, ironPrice: 700, washIronPrice: 2000 },
  { id: 'fallback-suit', name: 'Two-Piece Suit', category: 'Clothing', hasWash: true, hasIron: true, hasWashIron: true, washPrice: 2500, ironPrice: 1200, washIronPrice: 3500 },
  { id: 'fallback-blazer', name: 'Blazer', category: 'Clothing', hasWash: true, hasIron: true, hasWashIron: true, washPrice: 1000, ironPrice: 600, washIronPrice: 1500 },
  { id: 'fallback-senator', name: 'Senator Wear (2 pcs)', category: 'Clothing', hasWash: true, hasIron: true, hasWashIron: true, washPrice: 1000, ironPrice: 500, washIronPrice: 1500 },
  { id: 'fallback-agbada', name: 'Agbada (Complete Set)', category: 'Clothing', hasWash: true, hasIron: true, hasWashIron: true, washPrice: 2500, ironPrice: 1200, washIronPrice: 3500 },
  { id: 'fallback-kaftan', name: 'Kaftan', category: 'Clothing', hasWash: true, hasIron: true, hasWashIron: true, washPrice: 1300, ironPrice: 700, washIronPrice: 2000 },
  { id: 'fallback-jacket', name: 'Jacket', category: 'Clothing', hasWash: true, hasIron: true, hasWashIron: true, washPrice: 1000, ironPrice: 600, washIronPrice: 1500 },
  { id: 'fallback-tie', name: 'Tie', category: 'Clothing', hasWash: false, hasIron: true, hasWashIron: true, washPrice: 0, ironPrice: 300, washIronPrice: 300 },
  { id: 'fallback-duvet', name: 'Duvet (Large/King)', category: 'Household', hasWash: true, hasIron: false, hasWashIron: true, washPrice: 3500, ironPrice: 0, washIronPrice: 4000 },
  { id: 'fallback-bedsheet', name: 'Bed Sheet', category: 'Household', hasWash: true, hasIron: false, hasWashIron: true, washPrice: 1000, ironPrice: 0, washIronPrice: 1500 },
  { id: 'fallback-duvet-small', name: 'Duvet (Small)', category: 'Household', hasWash: true, hasIron: false, hasWashIron: true, washPrice: 2500, ironPrice: 0, washIronPrice: 3000 },
  { id: 'fallback-duvet-medium', name: 'Duvet (Medium)', category: 'Household', hasWash: true, hasIron: false, hasWashIron: true, washPrice: 3500, ironPrice: 0, washIronPrice: 4000 },
  { id: 'fallback-blanket', name: 'Blanket', category: 'Household', hasWash: true, hasIron: false, hasWashIron: true, washPrice: 3000, ironPrice: 0, washIronPrice: 3500 },
  { id: 'fallback-pillow', name: 'Pillow', category: 'Household', hasWash: true, hasIron: false, hasWashIron: true, washPrice: 600, ironPrice: 0, washIronPrice: 800 },
  { id: 'fallback-curtain', name: 'Curtain (Per Panel)', category: 'Household', hasWash: true, hasIron: false, hasWashIron: true, washPrice: 1500, ironPrice: 0, washIronPrice: 2000 },
  { id: 'fallback-towel', name: 'Bath Towel', category: 'Household', hasWash: true, hasIron: false, hasWashIron: true, washPrice: 600, ironPrice: 0, washIronPrice: 800 },
  { id: 'fallback-shoe', name: 'Shoe Cleaning', category: 'Additional', hasWash: true, hasIron: false, hasWashIron: false, washPrice: 4000, ironPrice: 0, washIronPrice: 0 },
  { id: 'fallback-stain', name: 'Stain Removal', category: 'Additional', hasWash: true, hasIron: false, hasWashIron: false, washPrice: 1000, ironPrice: 0, washIronPrice: 0 },
  { id: 'fallback-spot', name: 'Spot Cleaning', category: 'Additional', hasWash: true, hasIron: false, hasWashIron: false, washPrice: 500, ironPrice: 0, washIronPrice: 0 },
  { id: 'fallback-softener', name: 'Fabric Softener Treatment', category: 'Additional', hasWash: true, hasIron: false, hasWashIron: false, washPrice: 200, ironPrice: 0, washIronPrice: 0 },
  { id: 'fallback-fragrance', name: 'Premium Fragrance Finish', category: 'Additional', hasWash: true, hasIron: false, hasWashIron: false, washPrice: 200, ironPrice: 0, washIronPrice: 0 },
  { id: 'fallback-folding', name: 'Folding Only', category: 'Additional', hasWash: true, hasIron: false, hasWashIron: false, washPrice: 200, ironPrice: 0, washIronPrice: 0 },
  { id: 'fallback-bag', name: 'Bag Cleaning', category: 'Additional', hasWash: true, hasIron: false, hasWashIron: false, washPrice: 4000, ironPrice: 0, washIronPrice: 0 },
  { id: 'fallback-gown', name: 'Wedding Gown Care', category: 'Additional', hasWash: true, hasIron: false, hasWashIron: false, washPrice: 15000, ironPrice: 0, washIronPrice: 0 },
];

const mergeWithStandardCatalog = (catalog: any[]) => {
  const standardServices = new Map(fallbackServices.map((service) => [service.name.toLowerCase(), service]));
  catalog.forEach((service) => standardServices.set(service.name.toLowerCase(), service));
  return Array.from(standardServices.values());
};

export default function CustomerDashboard() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  
  const [activeTab, setActiveTab] = useState<TabType>('BOOK');
  const [categoryTab, setCategoryTab] = useState<ServiceCategory>('Clothing');
  
  const [services, setServices] = useState<any[]>(fallbackServices);
  const [activeOrders, setActiveOrders] = useState<any[]>([]);
  const [historyOrders, setHistoryOrders] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [paymentReceipt, setPaymentReceipt] = useState<{
    reference: string;
    orderNumber: string;
    amount: number;
  } | null>(null);
  
  const [basket, setBasket] = useState<Record<string, BasketItem>>({});
  const [basketReady, setBasketReady] = useState(false);
  const [pickupAddress, setPickupAddress] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [useSameAddress, setUseSameAddress] = useState(true);
  const [bookingStep, setBookingStep] = useState<'SELECT' | 'SCHEDULE'>('SELECT');
  const [mobileBasketOpen, setMobileBasketOpen] = useState(false);
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profileHomeAddress, setProfileHomeAddress] = useState('');
  const [profileOfficeAddress, setProfileOfficeAddress] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

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

  useEffect(() => {
    try {
      const savedBasket = localStorage.getItem(BASKET_STORAGE_KEY);
      if (savedBasket) {
        const parsedBasket = JSON.parse(savedBasket);
        if (parsedBasket && typeof parsedBasket === 'object' && !Array.isArray(parsedBasket)) {
          setBasket((currentBasket) => ({ ...parsedBasket, ...currentBasket }));
        }
      }
    } catch (err) {
      console.warn('Unable to restore basket:', err);
    } finally {
      setBasketReady(true);
    }
  }, []);

  useEffect(() => {
    if (!basketReady) return;
    try {
      localStorage.setItem(BASKET_STORAGE_KEY, JSON.stringify(basket));
    } catch (err) {
      console.warn('Unable to save basket:', err);
    }
  }, [basket, basketReady]);

  useEffect(() => {
    if (!token || !user) return;
    
    setLoading(true);
    axios.get('/api/v1/admin/services')
      .then((res) => {
        const catalog = res.data.services || [];
        setServices(mergeWithStandardCatalog(catalog));
      })
      .catch((err) => {
        console.error('Failed to load services:', err);
        setServices(fallbackServices);
      })
      .finally(() => setLoading(false));

    refreshOrders();
  }, [token, user]);

  useEffect(() => {
    if (user) {
      setProfileName(user.fullName || '');
      setProfilePhone(user.phoneNumber || '');
      setProfileEmail(user.email || '');
      setProfileHomeAddress(user.homeAddress || '');
      setProfileOfficeAddress(user.officeAddress || '');

      if (!user.homeAddress && !user.officeAddress && user.pickupAddress) {
        if (user.addressType === 'OFFICE') {
          setProfileOfficeAddress(user.pickupAddress);
        } else {
          setProfileHomeAddress(user.pickupAddress);
        }
      }

      const savedAddress = user.homeAddress || user.pickupAddress || user.officeAddress || '';
      if (savedAddress) {
        setPickupAddress((current) => current || savedAddress);
        setDeliveryAddress((current) => current || savedAddress);
      }
    }
  }, [user]);

  const refreshOrders = () => {
    if (!token || !user) return;
    setOrdersLoading(true);

    axios.get(`/api/v1/orders/customer/${user.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => {
        setActiveOrders(res.data || []);
      })
      .catch((err) => console.error('Active orders error:', err));

    axios.get(`/api/v1/orders/customer/${user.id}?history=true`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => {
        setHistoryOrders(res.data || []);
      })
      .catch((err) => console.error('History orders error:', err))
      .finally(() => setOrdersLoading(false));
  };

  useEffect(() => {
    if (!token || !user?.id) return;
    const timer = window.setInterval(() => {
      axios.get(`/api/v1/orders/customer/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then((res) => setActiveOrders(res.data || [])).catch(() => {});
    }, 15000);
    return () => window.clearInterval(timer);
  }, [token, user?.id]);

  const handleLogout = () => {
    localStorage.removeItem('customerToken');
    localStorage.removeItem('customerUser');
    router.push('/login');
  };

  const syncLocalUser = (updatedFields: Record<string, any>) => {
    const updatedUser = { ...user, ...updatedFields };
    setUser(updatedUser);
    if (typeof window !== 'undefined') {
      localStorage.setItem('customerUser', JSON.stringify(updatedUser));
    }
    return updatedUser;
  };

  const handleSaveProfile = async () => {
    setProfileSaving(true);
    setError('');
    setSuccess('');

    try {
      if (token) {
        const response = await axios.patch(
          '/api/v1/users/profile',
          {
            fullName: profileName,
            phoneNumber: profilePhone,
            email: profileEmail,
            pickupAddress: profileHomeAddress || profileOfficeAddress,
            addressType: profileHomeAddress ? 'HOME' : 'OFFICE',
          },
          { headers: { Authorization: `Bearer ${token}` } },
        );
        syncLocalUser({
          ...response.data.user,
          homeAddress: profileHomeAddress,
          officeAddress: profileOfficeAddress,
        });
      }

      setSuccess('Profile details updated successfully.');
      setTimeout(() => setSuccess(''), 3200);
      setProfileDrawerOpen(false);
    } catch (err: any) {
      console.error('Failed to save profile:', err);
      const message = err.response?.data?.error || 'Unable to save profile details right now.';
      setError(message);
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordFeedback(null);
    if (newPassword !== confirmNewPassword) {
      setPasswordFeedback({ type: 'error', message: 'The new passwords do not match.' });
      return;
    }
    if (!token) {
      setPasswordFeedback({ type: 'error', message: 'Please sign in again before changing your password.' });
      return;
    }

    setPasswordSaving(true);
    try {
      const response = await axios.post(
        '/api/v1/users/change-password',
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setPasswordFeedback({ type: 'success', message: response.data.message });
    } catch (err: any) {
      setPasswordFeedback({
        type: 'error',
        message: err.response?.data?.error || 'Unable to change your password right now.',
      });
    } finally {
      setPasswordSaving(false);
    }
  };

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

  const adjustBasketQuantity = (basketKey: string, change: number) => {
    setBasket((prev) => {
      const current = prev[basketKey];
      if (!current) return prev;
      const nextQuantity = current.quantity + change;
      if (nextQuantity <= 0) {
        const next = { ...prev };
        delete next[basketKey];
        return next;
      }
      return {
        ...prev,
        [basketKey]: {
          ...current,
          quantity: nextQuantity
        }
      };
    });
  };

  const handleRemoveFromBasket = (basketKey: string) => adjustBasketQuantity(basketKey, -1);

  const handleIncreaseBasketItem = (basketKey: string) => adjustBasketQuantity(basketKey, 1);

  const getBasketTotal = () => {
    return (Object.values(basket) as BasketItem[]).reduce((sum: number, item) => sum + item.price * item.quantity, 0);
  };

  const basketItems = Object.values(basket) as BasketItem[];
  const basketTotal = getBasketTotal();

  const getBasketCount = () => {
    return basketItems.reduce((sum: number, item) => sum + item.quantity, 0);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !user) return;
    if (Object.keys(basket).length === 0) return;

    setLoading(true);
    setError('');
    setSuccess('');
    setPaymentReceipt(null);
    const checkoutWindow = window.open('', 'bglaundry-payment', 'popup,width=520,height=760');
    if (!checkoutWindow) {
      setError('Payment window was blocked. Allow pop-ups and try again.');
      setLoading(false);
      return;
    }

    try {
      const bookingData = {
        pickupAddress: pickupAddress.trim(),
        deliveryAddress: deliveryAddress.trim(),
        pickupDate,
        items: (Object.values(basket) as BasketItem[]).map((item) => ({
          serviceName: item.serviceName,
          quantity: item.quantity,
          price: item.price
        }))
      };

      const orderResponse = await axios.post('/api/v1/orders/book', bookingData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const paymentResponse = await axios.post(
        '/api/v1/payments/initialize',
        { orderId: orderResponse.data.id },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      checkoutWindow.location.href = paymentResponse.data.checkoutUrl;

      let receipt: any = null;
      for (let attempt = 0; attempt < 90; attempt += 1) {
        await new Promise((resolve) => window.setTimeout(resolve, 2000));
        const statusResponse = await axios.get('/api/v1/payments/status', {
          params: { reference: paymentResponse.data.payment.reference },
          headers: { Authorization: `Bearer ${token}` },
        });
        if (statusResponse.data.status === 'SUCCESSFUL') {
          receipt = statusResponse.data;
          break;
        }
        if (statusResponse.data.status === 'FAILED') {
          throw new Error('Payment was not successful. Your order was not placed.');
        }
      }
      if (!receipt) {
        throw new Error('Payment is still awaiting confirmation. The order will remain inactive until payment is verified.');
      }

      checkoutWindow.close();
      setPaymentReceipt({
        reference: receipt.reference,
        orderNumber: receipt.order.orderNumber,
        amount: receipt.amount,
      });
      setSuccess('Payment confirmed. Your order has been placed and sent to operations.');
      setBasket({});
      const savedAddress = user.homeAddress || user.pickupAddress || user.officeAddress || '';
      setPickupAddress(savedAddress);
      setDeliveryAddress(savedAddress);
      setUseSameAddress(true);
      setPickupDate('');
      setBookingStep('SELECT');
      setMobileBasketOpen(false);
      setActiveTab('ACTIVE');
      refreshOrders();
    } catch (err: any) {
      checkoutWindow?.close();
      console.error('Booking failed:', err);
      setError(err.response?.data?.error || err.message || 'Payment could not be completed. Your order was not placed.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val: number) => {
    return `₦${val.toLocaleString('en-US')}`;
  };

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
      case 'PICKUP_IN_PROGRESS': return 'Driver en route';
      case 'PICKED_UP': return 'Collected';
      case 'PROCESSING': return 'Cleaning in Progress';
      case 'DELIVERY_PENDING': return 'Ready to Deliver';
      case 'DELIVERY_IN_PROGRESS': return 'Out for Delivery';
      case 'DELIVERED': return 'Delivered';
      case 'CANCELLED': return 'Cancelled';
      default: return status;
    }
  };

  const filteredServices = services.filter((svc) => svc.category === categoryTab);
  const initials = user?.fullName ? user.fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : 'U';
  const preferredAddress = user?.homeAddress || user?.pickupAddress || user?.officeAddress || '';

  return (
    <div className="dashboard-shell" style={{ minHeight: '100vh', backgroundColor: '#FAF9F7', color: '#0D0D0D', display: 'flex', flexDirection: 'column' }}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

      <style dangerouslySetInnerHTML={{ __html: `
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; -webkit-font-smoothing: antialiased; }
        
        .profile-drawer-overlay { display: none; position: fixed; inset: 0; background: rgba(15,23,42,0.52); backdrop-filter: blur(5px); z-index: 150; animation: fadeIn 0.25s ease; }
        .profile-drawer-container { position: fixed; top: 50%; left: 50%; width: min(820px, calc(100vw - 40px)); max-height: min(90vh, 860px); overflow: hidden; background: #F7F8FA; z-index: 151; border: 1px solid rgba(255,255,255,.72); border-radius: 26px; box-shadow: 0 32px 90px rgba(15,23,42,.28); transform: translate(-50%, -50%) scale(0.98); opacity: 0; transition: opacity 0.24s ease, transform 0.24s ease; display: flex; flex-direction: column; }
        .profile-drawer-container.open { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        .profile-drawer-header { display:flex; justify-content:space-between; align-items:center; gap:18px; padding:22px 26px; background:#FFFFFF; border-bottom:1px solid #E7E9ED; flex-shrink:0; }
        .profile-identity { display:flex; align-items:center; gap:14px; min-width:0; }
        .profile-modal-avatar { width:48px; height:48px; flex-shrink:0; display:grid; place-items:center; border-radius:15px; background:linear-gradient(145deg,#1565C0,#0F4F9A); color:#FFFFFF; font-size:14px; font-weight:800; box-shadow:0 7px 18px rgba(21,101,192,.22); }
        .profile-drawer-title { font-size:20px; line-height:1.2; font-weight:800; color:#0D0D0D; margin:0; letter-spacing:-.45px; }
        .profile-drawer-subtitle { margin-top:4px; font-size:12px; color:#6B7280; line-height:1.4; }
        .profile-drawer-close { width:40px; height:40px; flex-shrink:0; border-radius:12px; display:grid; place-items:center; border:1px solid #E5E7EB; background:#F8FAFC; color:#475569; cursor:pointer; transition:background .18s,color .18s; }
        .profile-drawer-close:hover { background:#EEF2F7; color:#0D0D0D; }
        .profile-drawer-body { overflow-y:auto; overscroll-behavior:contain; padding:22px 26px 26px; }
        .profile-section-card { background:#FFFFFF; border:1px solid #E5E7EB; border-radius:18px; padding:20px; margin-bottom:16px; box-shadow:0 3px 10px rgba(15,23,42,.025); }
        .profile-section-heading { display:flex; justify-content:space-between; align-items:flex-start; gap:16px; margin-bottom:18px; }
        .profile-section-title { font-size:15px; font-weight:800; color:#111827; letter-spacing:-.2px; }
        .profile-section-copy { margin-top:3px; font-size:11px; color:#7C8798; line-height:1.45; }
        .profile-fields-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:15px; }
        .profile-field-wide { grid-column:1/-1; }
        .profile-drawer-section { margin:0; min-width:0; }
        .profile-drawer-section label { display:block; font-size:10px; font-weight:800; color:#64748B; text-transform:uppercase; letter-spacing:1.15px; margin-bottom:7px; }
        .profile-drawer-input, .profile-drawer-textarea { width:100%; padding:12px 14px; border-radius:12px; border:1.5px solid #E2E5E9; outline:none; background:#FCFCFD; color:#0D0D0D; font-size:14px; font-family:'DM Sans',sans-serif; transition:border-color .18s,box-shadow .18s,background .18s; }
        .profile-drawer-input { height:48px; }
        .profile-drawer-input:focus, .profile-drawer-textarea:focus { border-color:#1565C0; background:#FFFFFF; box-shadow:0 0 0 3px rgba(21,101,192,.10); }
        .profile-drawer-textarea { min-height:88px; resize:vertical; line-height:1.45; }
        .profile-drawer-action { min-height:48px; padding:12px 20px; border:none; border-radius:12px; background:#0D0D0D; color:#FAF9F7; font-size:14px; font-weight:700; cursor:pointer; font-family:'DM Sans',sans-serif; }
        .profile-primary-actions { display:flex; justify-content:flex-end; margin:2px 0 16px; }
        .profile-primary-actions .profile-drawer-action { width:min(220px,100%); }
        .profile-security-card { background:#F2F7FD; border-color:#DCE8F7; }
        .profile-security-title { font-size:15px; font-weight:800; color:#0D0D0D; }
        .profile-security-copy { font-size:11px; color:#64748B; line-height:1.45; margin-top:3px; }
        .profile-security-fields { grid-template-columns:repeat(3,minmax(0,1fr)); }
        .profile-security-action { margin-top:16px; display:flex; justify-content:flex-end; }
        .profile-security-action .profile-drawer-action { min-width:190px; background:#173F83; }
        .profile-password-feedback { padding:10px 12px; border-radius:10px; font-size:12px; line-height:1.45; margin-bottom:14px; }
        .profile-password-feedback.success { background:#ECFDF5; color:#047857; border:1px solid #A7F3D0; }
        .profile-password-feedback.error { background:#FEF2F2; color:#B91C1C; border:1px solid #FECACA; }
        .profile-logout { width:100%; min-height:46px; padding:12px 18px; border-radius:12px; border:1px solid #E5E7EB; background:#FFFFFF; color:#475569; font:700 13px 'DM Sans',sans-serif; cursor:pointer; }
        .profile-logout:hover { color:#B91C1C; border-color:#FECACA; background:#FEF2F2; }
        
        .sidebar { width: 282px; min-height:100vh; background: #fff; border-right: 1px solid #EAE8E3; padding: 28px 18px 22px; display: flex; flex-direction: column; gap: 8px; }
        .sidebar-brand { display:flex; align-items:center; gap:11px; padding:0 10px 28px; border-bottom:1px solid #F0EEEA; margin-bottom:18px; cursor:pointer; }
        .sidebar-brand img { width:44px; height:44px; object-fit:contain; }.sidebar-brand span { color:#0D0D0D; font-size:19px; font-weight:800; letter-spacing:-.6px; }
        .sidebar-label { color:#9CA3AF; font-size:10px; font-weight:800; letter-spacing:1.4px; text-transform:uppercase; padding:0 14px 8px; }
        .sidebar-btn { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border: none; border-radius: 12px; background: transparent; color: #6B7280; font-size: 14px; font-weight: 600; text-align: left; cursor: pointer; transition: all 0.2s ease; width: 100%; }
        .sidebar-btn.active { background: #0D0D0D; color: #FAF9F7; }
        .sidebar-btn:hover:not(.active) { background: #F3F1ED; color: #0D0D0D; }
        .sidebar-footer { margin-top:auto; padding-top:18px; border-top:1px solid #F0EEEA; }.sidebar-profile { width:100%; padding:12px; border:0; background:#FAF9F7; border-radius:14px; display:flex; align-items:center; gap:10px; text-align:left; cursor:pointer; font-family:'DM Sans',sans-serif; }.sidebar-avatar { width:34px;height:34px;border-radius:50%;background:#1565C0;color:white;display:grid;place-items:center;font-size:11px;font-weight:800;flex-shrink:0; }.sidebar-profile-name{font-size:13px;font-weight:700;color:#0D0D0D;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}.sidebar-profile-copy{font-size:11px;color:#6B7280;margin-top:2px;}.sidebar-logout{margin-top:10px;width:100%;padding:10px 12px;border:0;background:transparent;color:#6B7280;display:flex;gap:10px;align-items:center;font:600 12px 'DM Sans',sans-serif;cursor:pointer;border-radius:10px;}.sidebar-logout:hover{background:#FEF2F2;color:#B91C1C;}

        .cat-scroll-container { display: flex; gap: 8px; margin-bottom: 24px; border-bottom: 1px solid #EAE8E3; padding-bottom: 12px; overflow-x: auto; -webkit-overflow-scrolling: touch; }
        .cat-scroll-container::-webkit-scrollbar { display: none; }
        .cat-tab { padding: 8px 18px; border: none; border-radius: 100px; background: transparent; color: #6B7280; font-weight: 600; font-size: 13px; cursor: pointer; white-space: nowrap; transition: all 0.2s ease; }
        .cat-tab.active { background: #0D0D0D; color: #FAF9F7; }

        .service-card { background: #fff; border: 1px solid #EAE8E3; border-radius: 18px; overflow:hidden; transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease; }
        .service-card:hover { transform: translateY(-3px); border-color:#B9D5FF; box-shadow: 0 16px 32px rgba(21,101,192,0.10); }
        .service-card-header { display:flex; align-items:center; gap:13px; padding:18px 20px 16px; background:linear-gradient(135deg,#F8FBFF 0%,#F1F7FF 100%); border-bottom:1px solid #E8F0FC; }
        .service-card-icon { width:42px;height:42px;border-radius:13px;background:#FFFFFF;border:1px solid #D8E8FF;color:#1565C0;display:grid;place-items:center;box-shadow:0 4px 10px rgba(21,101,192,.08);flex-shrink:0; }
        .service-card-title { font-size:16px;font-weight:800;color:#0D0D0D;letter-spacing:-.35px; }.service-card-subtitle { font-size:11px;color:#64748B;margin-top:3px; }
        .service-options { padding:4px 20px 10px; }.service-option { display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 0;border-bottom:1px solid #F0F1F3; }.service-option:last-child{border-bottom:0;}.service-option-name{font-size:12px;font-weight:700;color:#475569;}.service-option-price{font-size:15px;font-weight:800;color:#0D0D0D;margin-top:2px;letter-spacing:-.2px;}.service-add{min-width:72px;padding:8px 13px;border-radius:9px;border:1px solid #1565C0;background:#1565C0;color:#fff;font:700 12px 'DM Sans',sans-serif;cursor:pointer;transition:all .18s;}.service-add:hover{background:#0E56AD;box-shadow:0 5px 11px rgba(21,101,192,.2);}.service-quantity{display:flex;align-items:center;gap:9px;background:#F2F7FF;padding:4px;border-radius:10px;}.service-quantity .btn-round-adjust{border:0;background:#fff;box-shadow:0 1px 4px rgba(15,23,42,.1);}.service-quantity-count{font-size:13px;font-weight:800;color:#1565C0;min-width:12px;text-align:center;}

        .btn-action-sm { padding: 6px 14px; border-radius: 8px; border: none; background: #0D0D0D; color: #FAF9F7; font-size: 12px; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: opacity 0.2s; }
        .btn-action-sm:hover { opacity: 0.85; }

        .btn-round-adjust { width: 28px; height: 28px; border-radius: 50%; border: 1.5px solid #EAE8E3; background: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #0D0D0D; transition: all 0.15s; }
        .btn-round-adjust:hover { border-color: #0D0D0D; background: #FAF9F7; }
        .workspace-header-row{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;}.workspace-title{font-size:30px;font-weight:800;letter-spacing:-1.1px;color:#0D0D0D;margin-bottom:8px;}.workspace-copy{font-size:14px;color:#6B7280;line-height:1.55;margin-bottom:28px;}.catalog-count{display:inline-flex;align-items:center;padding:5px 10px;border-radius:100px;background:#EFF6FF;color:#1565C0;font-size:11px;font-weight:700;margin-left:8px;vertical-align:middle;}.mobile-cart-button{display:none;}

        .field-label { display: block; font-size: 11px; font-weight: 600; color: #6B7280; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px; }
        .field-input { width: 100%; padding: 12px 14px; font-size: 14px; font-family: 'DM Sans', sans-serif; color: #0D0D0D; background: #fff; border: 1.5px solid #EAE8E3; border-radius: 10px; outline: none; transition: all 0.18s; }
        .field-input:focus { border-color: #0D0D0D; box-shadow: 0 0 0 3px rgba(13,13,13,0.05); }
        .checkout-container{box-shadow:0 14px 36px rgba(15,23,42,.055);}.checkout-eyebrow{display:flex;align-items:center;gap:7px;color:#1565C0;font-size:11px;font-weight:800;letter-spacing:1.1px;text-transform:uppercase;margin-bottom:10px;}.checkout-copy{font-size:14px;color:#64748B;line-height:1.55;margin:-14px 0 25px;}.checkout-summary{padding:18px;border:1px solid #EAE8E3;background:#FAFBFC;border-radius:14px;margin-bottom:24px;}.checkout-summary-title{font-size:11px;font-weight:800;color:#64748B;text-transform:uppercase;letter-spacing:1.2px;margin-bottom:12px;}.checkout-item-row{display:flex;justify-content:space-between;gap:12px;font-size:13px;color:#334155;padding:7px 0;border-bottom:1px solid #EEF0F2;}.checkout-item-row:last-child{border-bottom:0;padding-bottom:0;}.checkout-total-card{min-width:152px;padding:16px;border-radius:14px;background:#0D0D0D;color:white;}.checkout-total-label{font-size:10px;text-transform:uppercase;letter-spacing:1px;color:rgba(255,255,255,.62);margin-bottom:6px;}.checkout-total-value{font-size:24px;font-weight:800;letter-spacing:-.5px;}.saved-address-note{display:flex;align-items:flex-start;gap:8px;background:#EFF6FF;border:1px solid #D8E8FF;border-radius:10px;padding:10px 12px;margin:-8px 0 4px;color:#275D9A;font-size:12px;line-height:1.45;}.same-address-row{display:flex;align-items:center;gap:8px;font-size:12px;font-weight:600;color:#475569;margin-top:-9px;cursor:pointer;}.same-address-row input{width:16px;height:16px;accent-color:#1565C0;}

        .timeline-vertical { display: flex; flex-direction: column; gap: 16px; position: relative; margin-top: 24px; padding-left: 20px; }
        .timeline-vertical-line { position: absolute; left: 6px; top: 8px; bottom: 8px; width: 2px; background: #EAE8E3; }
        .timeline-vertical-progress { position: absolute; left: 6px; top: 8px; width: 2px; background: #0055FF; transition: height 0.4s ease; }
        .timeline-node-v { display: flex; gap: 16px; align-items: flex-start; position: relative; z-index: 2; }
        .timeline-dot-v { width: 14px; height: 14px; border-radius: 50%; background: #FAF9F7; border: 3px solid #EAE8E3; flex-shrink: 0; margin-top: 3px; transition: all 0.3s; }
        .timeline-dot-v.passed { border-color: #0055FF; background: #0055FF; }
        .timeline-dot-v.current { border-color: #0055FF; background: #FAF9F7; box-shadow: 0 0 0 3px rgba(0,85,255,0.2); }
        .active-orders-list { display:flex; flex-direction:column; gap:24px; }
        .active-order-card { background:#FFFFFF; border:1px solid #EAE8E3; border-radius:16px; overflow:hidden; }
        .active-order-summary { width:100%; display:flex; justify-content:space-between; align-items:flex-start; padding:24px; border:0; border-bottom:1px solid #F3F1ED; background:#FFFFFF; text-align:left; font-family:'DM Sans',sans-serif; color:inherit; pointer-events:none; }
        .active-order-content { padding:20px 24px 24px; }
        .mobile-order-position, .mobile-order-toggle { display:none; }

        /* Mobile bottom nav */
        .mobile-bottom-nav { display: none; position: fixed; bottom: 0; left: 0; right: 0; min-height: 76px; background: #fff; border-top: 1px solid #EAE8E3; z-index: 100; justify-content: space-around; align-items: flex-start; padding: 8px 8px max(8px, env(safe-area-inset-bottom)); box-shadow:0 -6px 22px rgba(15,23,42,.06); }
        .mobile-nav-item { min-height:52px; display: flex; flex-direction: column; align-items: center; justify-content:center; gap: 3px; background: none; border: none; color: #9CA3AF; cursor: pointer; width: 72px; border-radius:12px; font-family: 'DM Sans', sans-serif; touch-action:manipulation; }
        .mobile-nav-item svg { width:27px; height:27px; stroke-width:2.2; }
        .mobile-nav-item.active { color: #0D0D0D; }
        .mobile-nav-label { font-size: 11px; font-weight: 700; letter-spacing: -0.1px; }

        /* Floating Mobile Basket Bar */
        .mobile-basket-bar { display: none; position: fixed; bottom: 80px; left: 16px; right: 16px; background: #0D0D0D; color: #FAF9F7; padding: 14px 20px; border-radius: 100px; z-index: 99; align-items: center; justify-content: space-between; box-shadow: 0 8px 30px rgba(0,0,0,0.18); cursor: pointer; animation: fadeUp 0.3s ease; }

        /* Drawer Overlay */
        .drawer-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 150; animation: fadeIn 0.25s ease; }
        .drawer-container { position: fixed; bottom: 0; left: 0; right: 0; background: #fff; border-top-left-radius: 24px; border-top-right-radius: 24px; z-index: 151; padding: 32px 24px 40px; max-height: 85vh; overflow-y: auto; box-shadow: 0 -8px 40px rgba(0,0,0,0.12); transform: translateY(100%); transition: transform 0.3s cubic-bezier(0.16,1,0.3,1); }
        .drawer-container.open { transform: translateY(0); }

        /* Responsive Layouts */
        @media (max-width: 900px) {
          .profile-drawer-container { top:auto; bottom:0; left:0; width:100%; max-height:calc(100dvh - 16px); border-radius:24px 24px 0 0; border-bottom:0; transform:translateY(100%); }
          .profile-drawer-container.open { transform:translateY(0); }
          .profile-drawer-header { padding:17px 18px 15px; }
          .profile-modal-avatar { width:42px; height:42px; border-radius:13px; font-size:12px; }
          .profile-drawer-title { font-size:18px; }
          .profile-drawer-subtitle { font-size:11px; }
          .profile-drawer-body { padding:16px 14px max(20px,env(safe-area-inset-bottom)); }
          .profile-section-card { padding:16px; border-radius:16px; margin-bottom:12px; }
          .profile-section-heading { margin-bottom:15px; }
          .profile-fields-grid, .profile-security-fields { grid-template-columns:1fr; gap:13px; }
          .profile-field-wide { grid-column:auto; }
          .profile-drawer-input { height:50px; font-size:16px; }
          .profile-drawer-textarea { min-height:78px; font-size:16px; }
          .profile-primary-actions, .profile-security-action { display:block; }
          .profile-primary-actions .profile-drawer-action, .profile-security-action .profile-drawer-action { width:100%; }
          .dashboard-shell { min-height:100dvh !important; height:auto !important; }
          .desktop-layout { flex-direction: column !important; flex:0 0 auto !important; min-height:0 !important; }
          .sidebar { display: none !important; }
          .desktop-basket { display: none !important; }
          .main-content { height:auto !important; min-height:0 !important; overflow:visible !important; padding: 24px 16px calc(96px + env(safe-area-inset-bottom)) !important; }
          .mobile-bottom-nav { display: flex; }
          .header-nav { padding: 16px 20px !important; }
          .services-grid { grid-template-columns: 1fr !important; }
          .mobile-basket-bar.show { display: flex; }
          .checkout-container { max-width: 100% !important; }
          .workspace-title { font-size:24px; line-height:1.12; letter-spacing:-.7px; }
          .workspace-header-row { margin-bottom:4px; }
          .mobile-cart-button { width:46px; height:46px; border:1px solid #D7E7FC; background:#EFF6FF; color:#1565C0; border-radius:14px; display:grid; place-items:center; position:relative; flex-shrink:0; cursor:pointer; }
          .mobile-cart-button:active { transform:scale(.96); }
          .mobile-cart-badge { position:absolute; top:-5px; right:-5px; min-width:19px; height:19px; padding:0 5px; border-radius:10px; background:#1565C0; color:#fff; border:2px solid #FAF9F7; display:grid; place-items:center; font-size:10px; font-weight:800; }
          .active-orders-list { gap:14px; }
          .active-order-card { border:1.5px solid #DDE3EA; border-radius:18px; box-shadow:0 5px 18px rgba(15,23,42,.045); }
          .active-order-card.expanded { border-color:#B8D2FF; box-shadow:0 8px 26px rgba(0,85,255,.09); }
          .active-order-summary { padding:18px; cursor:pointer; align-items:center; border-bottom:0; pointer-events:auto; }
          .active-order-card.expanded .active-order-summary { background:#F8FBFF; border-bottom:1px solid #E2ECFC; }
          .active-order-content { display:none; padding:20px 18px 24px; }
          .active-order-card.expanded .active-order-content { display:block; animation:fadeIn .2s ease; }
          .order-card-inner { gap:14px !important; }
          .mobile-order-position { display:block; margin-bottom:5px; color:#64748B; font-size:10px; font-weight:800; letter-spacing:1.1px; text-transform:uppercase; }
          .mobile-order-toggle { width:34px; height:34px; flex-shrink:0; margin-left:12px; border-radius:50%; background:#EFF5FF; color:#0055FF; display:grid; place-items:center; transition:transform .2s ease; }
          .active-order-card.expanded .mobile-order-toggle { transform:rotate(180deg); background:#0055FF; color:#FFFFFF; }
          .order-tracker-h { display: none !important; }
          .order-tracker-v { display: block !important; }
        }

        @media (min-width: 901px) {
          .dashboard-shell { height:100dvh; overflow:hidden; }
          .desktop-layout { min-height:0; overflow:hidden; }
          .sidebar { position:sticky; top:0; height:100dvh; overflow-y:auto; flex-shrink:0; }
          .main-content { height:100dvh; overflow-y:auto; min-width:0; padding:48px !important; }
          .booking-workspace { display:flex; gap:40px; align-items:flex-start; }
          .desktop-basket { position:sticky !important; top:32px !important; align-self:flex-start; flex-shrink:0; }
          .order-tracker-v { display: none !important; }
        }
      `}} />

      {/* ═══════════════════════════════════════
          MAIN WRAPPER
      ═══════════════════════════════════════ */}
      <div className="desktop-layout" style={{ display: 'flex', flex: 1 }}>
        
        {/* DESKTOP SIDEBAR */}
        <aside className="sidebar">
          <div className="sidebar-brand" onClick={() => router.push('/')}>
            <img src="/bglogo.png" alt="BG Laundry" />
            <span>BG Laundry</span>
          </div>
          <p className="sidebar-label">Workspace</p>
          <button
            onClick={() => { setActiveTab('BOOK'); setSuccess(''); setError(''); }}
            className={`sidebar-btn ${activeTab === 'BOOK' ? 'active' : ''}`}
          >
            <ShoppingBag size={18} />
            Book Laundry
          </button>

          <button
            onClick={() => { setActiveTab('ACTIVE'); setSuccess(''); setError(''); refreshOrders(); }}
            className={`sidebar-btn ${activeTab === 'ACTIVE' ? 'active' : ''}`}
          >
            <Activity size={18} />
            Active Bookings
            {activeOrders.length > 0 && (
              <span style={{
                marginLeft: 'auto',
                backgroundColor: activeTab === 'ACTIVE' ? '#0D0D0D' : '#EAE8E3',
                color: activeTab === 'ACTIVE' ? '#FAF9F7' : '#0D0D0D',
                fontSize: '11px',
                padding: '2px 7px',
                borderRadius: '100px',
                fontWeight: '700'
              }}>
                {activeOrders.length}
              </span>
            )}
          </button>

          <button
            onClick={() => { setActiveTab('HISTORY'); setSuccess(''); setError(''); refreshOrders(); }}
            className={`sidebar-btn ${activeTab === 'HISTORY' ? 'active' : ''}`}
          >
            <History size={18} />
            Order History
          </button>
          <div className="sidebar-footer">
            <button className="sidebar-profile" onClick={() => setProfileDrawerOpen(true)}>
              <span className="sidebar-avatar">{initials}</span>
              <span style={{ minWidth:0 }}><span className="sidebar-profile-name">{user?.fullName || 'Your Profile'}</span><span className="sidebar-profile-copy">Manage your details</span></span>
            </button>
            <button className="sidebar-logout" onClick={handleLogout}><LogOut size={15} /> Sign out</button>
          </div>
        </aside>

        {/* WORKSPACE AREA */}
        <main className="main-content" style={{ flex: 1, padding: '48px' }}>
          
          {success && (
            <div style={{
              padding: '14px 18px',
              backgroundColor: '#F0FDF4',
              border: '1px solid #BBF7D0',
              color: '#166534',
              borderRadius: '12px',
              marginBottom: '28px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '14px'
            }}>
              <Check size={16} />
              <span>{success}</span>
            </div>
          )}
          {paymentReceipt && (
            <div style={{
              background: '#FFFFFF', border: '1px solid #DCE7F7', borderRadius: '14px',
              padding: '16px 18px', marginTop: '-16px', marginBottom: '28px',
              display: 'flex', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap'
            }}>
              <div>
                <div style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '1px' }}>Payment receipt</div>
                <div style={{ fontSize: '15px', fontWeight: '800', marginTop: '4px' }}>{paymentReceipt.orderNumber}</div>
                <div style={{ fontSize: '11px', color: '#64748B', marginTop: '3px' }}>Ref: {paymentReceipt.reference}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '11px', color: '#64748B' }}>Amount paid</div>
                <div style={{ fontSize: '18px', fontWeight: '800', marginTop: '3px' }}>{formatCurrency(paymentReceipt.amount)}</div>
              </div>
            </div>
          )}

          {error && (
            <div style={{
              padding: '14px 18px',
              backgroundColor: '#FEF2F2',
              border: '1px solid #FECACA',
              color: '#B91C1C',
              borderRadius: '12px',
              marginBottom: '28px',
              fontSize: '14px'
            }}>
              <span>{error}</span>
            </div>
          )}

          {/* ═══════════════════════════════════════
              TAB 1: BOOK VIEW
          ═══════════════════════════════════════ */}
          {activeTab === 'BOOK' && (
            <div className="booking-workspace">
              
              <div style={{ flex: 1 }}>
                {bookingStep === 'SELECT' ? (
                  <>
                    <div className="workspace-header-row">
                      <h1 className="workspace-title">Book your laundry <span className="catalog-count">{filteredServices.length} services</span></h1>
                      <button className="mobile-cart-button" onClick={() => setMobileBasketOpen(true)} aria-label="Open basket">
                        <ShoppingBag size={21} />
                        {getBasketCount() > 0 && <span className="mobile-cart-badge">{getBasketCount()}</span>}
                      </button>
                    </div>
                    <p className="workspace-copy">Select the items you need cleaned, choose your preferred service, and we’ll handle the rest.</p>
                    <div className="cat-scroll-container">
                      {(['Clothing', 'Household', 'Additional'] as ServiceCategory[]).map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setCategoryTab(cat)}
                          className={`cat-tab ${categoryTab === cat ? 'active' : ''}`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    {loading ? (
                      <div style={{ display: 'flex', justifyContent: 'center', padding: '64px' }}>
                        <Loader2 size={28} style={{ animation: 'spin 0.8s linear infinite', color: '#0D0D0D' }} />
                      </div>
                    ) : (
                      <div className="services-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                        {filteredServices.map((svc) => {
                          const options = [];
                          if (svc.hasWashIron) options.push({ type: 'Wash & Iron', price: svc.washIronPrice });
                          if (svc.hasWash) options.push({ type: 'Wash Only', price: svc.washPrice });
                          if (svc.hasIron) options.push({ type: 'Iron Only', price: svc.ironPrice });

                          return (
                            <div key={svc.id} className="service-card">
                              <div className="service-card-header">
                                <div className="service-card-icon">
                                  <Shirt size={16} />
                                </div>
                                <div><h3 className="service-card-title">{svc.name}</h3><p className="service-card-subtitle">Expert care, cleaned your way</p></div>
                              </div>

                              <div className="service-options">
                                {options.map((opt, idx) => {
                                  const key = `${svc.name} - ${opt.type}`;
                                  const basketQty = basket[key]?.quantity || 0;

                                  return (
                                    <div key={idx} className="service-option">
                                      <div>
                                        <div className="service-option-name">{opt.type}</div>
                                        <div className="service-option-price">{formatCurrency(opt.price)}</div>
                                      </div>

                                      {basketQty > 0 ? (
                                        <div className="service-quantity">
                                          <button onClick={() => handleRemoveFromBasket(key)} className="btn-round-adjust">
                                            <Minus size={11} />
                                          </button>
                                          <span className="service-quantity-count">{basketQty}</span>
                                          <button onClick={() => handleAddToBasket(svc.name, opt.type, opt.price)} className="btn-round-adjust">
                                            <Plus size={11} />
                                          </button>
                                        </div>
                                      ) : (
                                        <button onClick={() => handleAddToBasket(svc.name, opt.type, opt.price)} className="service-add">
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
                  /* SCHEDULE OPTION STEP */
                  <div className="checkout-container" style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    border: '1px solid #EAE8E3',
                    padding: '32px',
                    maxWidth: '560px'
                  }}>
                    <div className="checkout-eyebrow"><Calendar size={14} /> Final step</div>
                    <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0D0D0D', marginBottom: '18px', letterSpacing: '-0.7px' }}>
                      Schedule your pickup
                    </h2>
                    <p className="checkout-copy">Confirm where and when we should collect your laundry. You can update these details whenever you need to.</p>

                    <form onSubmit={handlePlaceOrder}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div className="checkout-summary" style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                          <div style={{ flex: 1, minWidth: '200px' }}>
                            <div className="checkout-summary-title">Selected items</div>
                            {basketItems.length === 0 ? (
                              <div style={{ fontSize: '13px', color: '#9CA3AF' }}>No items selected yet. Go back to choose services.</div>
                            ) : (
                              <div style={{ display: 'grid', gap: '10px' }}>
                                {basketItems.map((item) => (
                                  <div key={item.serviceName} className="checkout-item-row">
                                    <span>{item.serviceName}</span>
                                    <span style={{ fontWeight: '800', whiteSpace: 'nowrap' }}>
                                      {item.quantity} × {formatCurrency(item.price)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="checkout-total-card">
                            <div className="checkout-total-label">Order total</div>
                            <div className="checkout-total-value">{formatCurrency(basketTotal)}</div>
                          </div>
                        </div>

                        {preferredAddress && <div className="saved-address-note"><MapPin size={15} style={{ flexShrink: 0, marginTop: '1px' }} /><span>Your saved address has been added below. Edit it if this pickup needs a different location.</span></div>}

                        <div>
                          <label className="field-label">Pickup Address</label>
                          <input
                            type="text"
                            required
                            value={pickupAddress}
                            onChange={(e) => { setPickupAddress(e.target.value); if (useSameAddress) setDeliveryAddress(e.target.value); }}
                            placeholder="e.g. Apt 4, 16B Maria Okor Street, Ejibo"
                            className="field-input"
                          />
                        </div>

                        <div>
                          <label className="field-label">Delivery Address</label>
                          <input
                            type="text"
                            required
                            value={deliveryAddress}
                            onChange={(e) => { setDeliveryAddress(e.target.value); setUseSameAddress(false); }}
                            placeholder="e.g. Same as pickup address"
                            className="field-input"
                          />
                          <label className="same-address-row"><input type="checkbox" checked={useSameAddress} onChange={(e) => { setUseSameAddress(e.target.checked); if (e.target.checked) setDeliveryAddress(pickupAddress); }} /> Use the pickup address for delivery</label>
                        </div>

                        <div>
                          <label className="field-label">Pickup Date & Time</label>
                          <input
                            type="datetime-local"
                            required
                            value={pickupDate}
                            onChange={(e) => setPickupDate(e.target.value)}
                            className="field-input"
                          />
                        </div>

                        <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                          <button
                            type="button"
                            onClick={() => setBookingStep('SELECT')}
                            style={{
                              flex: 1, padding: '14px', border: '1.5px solid #D6D3CD',
                              borderRadius: '12px', backgroundColor: '#FFFFFF',
                              color: '#0D0D0D', fontSize: '14px', fontWeight: '600',
                              cursor: 'pointer', fontFamily: 'DM Sans'
                            }}
                          >
                            Back
                          </button>
                          <button
                            type="submit"
                            disabled={loading}
                            style={{
                              flex: 2, padding: '14px', border: 'none',
                              borderRadius: '12px', backgroundColor: '#0D0D0D',
                              color: '#FAF9F7', fontSize: '14px', fontWeight: '600',
                              cursor: loading ? 'not-allowed' : 'pointer',
                              fontFamily: 'DM Sans', opacity: loading ? 0.7 : 1
                            }}
                          >
                            {loading ? 'Booking...' : 'Confirm Order'}
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                )}
              </div>

              {/* DESKTOP SIDE BAR BASKET */}
              {bookingStep === 'SELECT' && (
                <div className="desktop-basket" style={{
                  width: '320px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid #EAE8E3',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  maxHeight: '75vh',
                  position: 'sticky',
                  top: '100px'
                }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0D0D0D', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShoppingBag size={16} />
                    Basket
                  </h3>

                  {Object.keys(basket).length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '32px 0', color: '#9CA3AF' }}>
                      <p style={{ fontSize: '13px' }}>Your basket is empty.</p>
                    </div>
                  ) : (
                    <>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto', flex: 1, marginBottom: '20px', paddingRight: '4px' }}>
                        {(Object.values(basket) as BasketItem[]).map((item) => (
                          <div key={item.serviceName} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #F3F1ED', paddingBottom: '10px' }}>
                            <div style={{ flex: 1, paddingRight: '8px' }}>
                              <div style={{ fontSize: '13px', fontWeight: '600', color: '#0D0D0D' }}>{item.serviceName}</div>
                              <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '2px' }}>
                                {item.quantity} × {formatCurrency(item.price)}
                              </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '13px', fontWeight: '700', color: '#0D0D0D', marginBottom: '6px' }}>
                                {formatCurrency(item.price * item.quantity)}
                              </div>
                              <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                <button type="button" onClick={() => handleRemoveFromBasket(item.serviceName)} className="btn-round-adjust" aria-label={`Remove one ${item.serviceName}`} style={{ width: '28px', height: '28px' }}>
                                  <Minus size={9} />
                                </button>
                                <button type="button" onClick={() => handleIncreaseBasketItem(item.serviceName)} className="btn-round-adjust" aria-label={`Add one ${item.serviceName}`} style={{ width: '28px', height: '28px' }}>
                                  <Plus size={9} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div style={{ borderTop: '1.5px dashed #EAE8E3', paddingTop: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                          <span style={{ fontSize: '13px', fontWeight: '500', color: '#6B7280' }}>Total:</span>
                          <span style={{ fontSize: '18px', fontWeight: '700', color: '#0D0D0D' }}>
                            {formatCurrency(getBasketTotal())}
                          </span>
                        </div>

                        <button
                          onClick={() => setBookingStep('SCHEDULE')}
                          style={{
                            width: '100%', padding: '14px', backgroundColor: '#0D0D0D',
                            color: '#FAF9F7', border: 'none', borderRadius: '12px',
                            fontSize: '14px', fontWeight: '600', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '6px',
                            justifyContent: 'center', fontFamily: 'DM Sans'
                          }}
                        >
                          Checkout <ChevronRight size={15} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ═══════════════════════════════════════
              TAB 2: ACTIVE ORDER TRACKING
          ═══════════════════════════════════════ */}
          {activeTab === 'ACTIVE' && (
            <div>
              <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#0D0D0D', marginBottom: '24px', letterSpacing: '-0.5px' }}>
                Active Bookings
              </h2>

              {ordersLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
                  <Loader2 size={28} style={{ animation: 'spin 0.8s linear infinite', color: '#0D0D0D' }} />
                </div>
              ) : activeOrders.length === 0 ? (
                <div style={{
                  textAlign: 'center', padding: '56px 24px',
                  backgroundColor: '#FFFFFF', borderRadius: '16px',
                  border: '1px solid #EAE8E3', color: '#6B7280'
                }}>
                  <ShoppingBag size={40} style={{ color: '#C4C1BA', marginBottom: '16px' }} />
                  <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#0D0D0D', marginBottom: '6px' }}>No Active Orders</h3>
                  <p style={{ fontSize: '13px', maxWidth: '300px', margin: '0 auto 20px' }}>You don't have any pending or ongoing laundry bookings right now.</p>
                  <button onClick={() => setActiveTab('BOOK')} className="btn-action-sm" style={{ padding: '10px 20px', borderRadius: '100px' }}>
                    Schedule a Pickup
                  </button>
                </div>
              ) : (
                <div className="active-orders-list">
                  {activeOrders.map((order, orderIndex) => {
                    const currentStep = getStatusStep(order.status);
                    const isExpanded = expandedOrderId === order.id;

                    return (
                      <article
                        key={order.id}
                        className={`active-order-card ${isExpanded ? 'expanded' : ''}`}
                      >
                        <button
                          type="button"
                          className="active-order-summary"
                          aria-expanded={isExpanded}
                          aria-controls={`order-details-${order.id}`}
                          onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                        >
                        <div className="order-card-inner" style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                          flex: 1
                        }}>
                          <div>
                            <span className="mobile-order-position">
                              Order {orderIndex + 1} of {activeOrders.length}
                            </span>
                            <span style={{ fontSize: '15px', fontWeight: '700', color: '#0D0D0D' }}>
                              {order.orderNumber}
                            </span>
                            <span style={{ fontSize: '11px', color: '#9CA3AF', display: 'block', marginTop: '2px' }}>
                              Placed on {new Date(order.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                            <div>
                              <div style={{ fontSize: '11px', color: '#9CA3AF' }}>Total</div>
                              <div style={{ fontSize: '14px', fontWeight: '600', color: '#0D0D0D', marginTop: '1px' }}>
                                {formatCurrency(order.totalAmount)}
                              </div>
                            </div>
                            <div>
                              <div style={{ fontSize: '11px', color: '#9CA3AF' }}>Status</div>
                              <span style={{
                                fontSize: '11px', fontWeight: '600',
                                color: order.status === 'CANCELLED' ? '#EF4444' : '#0055FF',
                                backgroundColor: order.status === 'CANCELLED' ? '#FEF2F2' : '#F0F5FF',
                                padding: '3px 8px', borderRadius: '6px', display: 'inline-block', marginTop: '1px'
                              }}>
                                {getStatusLabel(order.status)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <span className="mobile-order-toggle" aria-hidden="true">
                          <ChevronDown size={18} />
                        </span>
                        </button>

                        <div
                          id={`order-details-${order.id}`}
                          className="active-order-content"
                        >

                        {/* Garment list & verification code */}
                        <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap', marginBottom: '24px' }}>
                          <div style={{ flex: 1, minWidth: '220px' }}>
                            <div style={{ fontSize: '12px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>
                              Garments List
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              {(order.items || []).map((item: any) => (
                                <div key={item.id || `${item.serviceName}-${item.quantity}`} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                                  <span style={{ color: '#374151' }}>{item.serviceName}</span>
                                  <span style={{ color: '#0D0D0D', fontWeight: '500' }}>Qty: {item.quantity}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Verification OTP */}
                          {order.status !== 'CANCELLED' && (
                            <div style={{
                              width: '260px', backgroundColor: '#FAFAF9',
                              border: '1.5px solid #F1F0ED', borderRadius: '12px',
                              padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6B7280', fontSize: '12px', fontWeight: '600' }}>
                                <Info size={13} />
                                Driver Verification Code
                              </div>

                              {currentStep <= 2 ? (
                                <div>
                                  <div style={{ fontSize: '11px', color: '#9CA3AF' }}>Provide code to driver at PICKUP:</div>
                                  <div style={{ fontSize: '20px', fontWeight: '700', color: '#0D0D0D', letterSpacing: '1.5px', marginTop: '2px' }}>
                                    {order.pickupOTP || '----'}
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  <div style={{ fontSize: '11px', color: '#9CA3AF' }}>Provide code to driver at DELIVERY:</div>
                                  <div style={{ fontSize: '20px', fontWeight: '700', color: '#0055FF', letterSpacing: '1.5px', marginTop: '2px' }}>
                                    {order.deliveryOTP || '----'}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* DESKTOP TIMELINE */}
                        {order.status !== 'CANCELLED' && (
                          <div className="order-tracker-h" style={{ marginTop: '28px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', marginBottom: '8px' }}>
                              
                              <div style={{ position: 'absolute', top: '10px', left: '16px', right: '16px', height: '2px', backgroundColor: '#EAE8E3', zIndex: 0 }} />
                              <div style={{ position: 'absolute', top: '10px', left: '16px', width: `${((currentStep - 1) / 5) * 100}%`, height: '2px', backgroundColor: '#0055FF', zIndex: 0, transition: 'width 0.4s ease' }} />

                              {[
                                { label: 'Booked', step: 1 },
                                { label: 'Assigned', step: 2 },
                                { label: 'Collected', step: 3 },
                                { label: 'Cleaning', step: 4 },
                                { label: 'Out to Deliver', step: 5 },
                                { label: 'Delivered', step: 6 }
                              ].map((node) => {
                                const isPassed = currentStep >= node.step;
                                const isCurrent = currentStep === node.step;

                                return (
                                  <div key={node.step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10, width: '70px' }}>
                                    <div style={{
                                      width: '20px', height: '20px', borderRadius: '50%',
                                      backgroundColor: isPassed ? '#0055FF' : '#EAE8E3',
                                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                                      color: '#FFFFFF', fontSize: '9px', fontWeight: '700',
                                      boxShadow: isCurrent ? '0 0 0 3px rgba(0,85,255,0.18)' : 'none'
                                    }}>
                                      {isPassed && node.step < currentStep ? '✓' : node.step}
                                    </div>
                                    <span style={{
                                      fontSize: '10px', fontWeight: isPassed ? '600' : '400',
                                      color: isPassed ? '#0D0D0D' : '#9CA3AF', textAlign: 'center',
                                      marginTop: '6px', lineHeight: '1.2'
                                    }}>
                                      {node.label}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* MOBILE TIMELINE */}
                        {order.status !== 'CANCELLED' && (
                          <div className="order-tracker-v" style={{ marginTop: '16px' }}>
                            <div style={{ fontSize: '12px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                              Tracking Status
                            </div>
                            <div className="timeline-vertical">
                              <div className="timeline-vertical-line" />
                              <div className="timeline-vertical-progress" style={{ height: `${((currentStep - 1) / 5) * 100}%` }} />
                              
                              {[
                                { label: 'Laundry order placed successfully', step: 1 },
                                { label: 'Pickup driver assigned & en route', step: 2 },
                                { label: 'Garments collected by driver', step: 3 },
                                { label: 'Garments inside our cleaning facility', step: 4 },
                                { label: 'Cleaned laundry out for delivery', step: 5 },
                                { label: 'Delivered back to your address', step: 6 }
                              ].map((node) => {
                                const isPassed = currentStep >= node.step;
                                const isCurrent = currentStep === node.step;
                                return (
                                  <div key={node.step} className="timeline-node-v">
                                    <div className={`timeline-dot-v ${isPassed && node.step < currentStep ? 'passed' : isCurrent ? 'current' : ''}`} />
                                    <div>
                                      <p style={{ fontSize: '13px', fontWeight: isCurrent ? '600' : '400', color: isCurrent ? '#0D0D0D' : isPassed ? '#4B5563' : '#9CA3AF' }}>
                                        {node.label}
                                      </p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ═══════════════════════════════════════
              TAB 3: ORDER HISTORY
          ═══════════════════════════════════════ */}
          {activeTab === 'HISTORY' && (
            <div>
              <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#0D0D0D', marginBottom: '24px', letterSpacing: '-0.5px' }}>
                Completed Bookings
              </h2>

              {ordersLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
                  <Loader2 size={28} style={{ animation: 'spin 0.8s linear infinite', color: '#0D0D0D' }} />
                </div>
              ) : historyOrders.length === 0 ? (
                <div style={{
                  textAlign: 'center', padding: '56px 24px',
                  backgroundColor: '#FFFFFF', borderRadius: '16px',
                  border: '1px solid #EAE8E3', color: '#6B7280'
                }}>
                  <History size={40} style={{ color: '#C4C1BA', marginBottom: '16px' }} />
                  <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#0D0D0D', marginBottom: '6px' }}>No Order History</h3>
                  <p style={{ fontSize: '13px' }}>You haven't completed any bookings yet.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {historyOrders.map((order) => (
                    <div key={order.id} style={{
                      backgroundColor: '#FFFFFF', borderRadius: '16px',
                      border: '1px solid #EAE8E3', padding: '20px',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      flexWrap: 'wrap', gap: '16px'
                    }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '14px', fontWeight: '700', color: '#0D0D0D' }}>{order.orderNumber}</span>
                          <span style={{
                            fontSize: '10px', fontWeight: '600',
                            backgroundColor: '#F0FDF4', color: '#166534',
                            padding: '2px 6px', borderRadius: '4px'
                          }}>
                            Delivered
                          </span>
                        </div>
                        <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '4px' }}>
                          Completed on {new Date(order.updatedAt).toLocaleDateString()}
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        {(order.items || []).map((item: any) => (
                          <div key={item.id || `${item.serviceName}-${item.quantity}`} style={{ fontSize: '12px', color: '#4B5563' }}>
                            {item.serviceName} × {item.quantity}
                          </div>
                        ))}
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '11px', color: '#9CA3AF' }}>Total paid</div>
                        <div style={{ fontSize: '15px', fontWeight: '700', color: '#0D0D0D', marginTop: '1px' }}>
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

      {/* ═══════════════════════════════════════
          MOBILE BASKET STICKY BAR
      ═══════════════════════════════════════ */}
      {activeTab === 'BOOK' && bookingStep === 'SELECT' && getBasketCount() > 0 && (
        <div
          className={`mobile-basket-bar ${getBasketCount() > 0 ? 'show' : ''}`}
          onClick={() => setMobileBasketOpen(true)}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              backgroundColor: '#FAF9F7', color: '#0D0D0D',
              borderRadius: '50%', width: '22px', height: '22px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '11px', fontWeight: '700'
            }}>
              {getBasketCount()}
            </div>
            <span style={{ fontSize: '14px', fontWeight: '600' }}>View Basket</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '14px', fontWeight: '700' }}>{formatCurrency(getBasketTotal())}</span>
            <ChevronRight size={16} />
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════
          MOBILE BOTTOM NAVIGATION TAB BAR
      ═══════════════════════════════════════ */}
      <div className="mobile-bottom-nav">
        <button
          onClick={() => { setActiveTab('BOOK'); setSuccess(''); setError(''); }}
          className={`mobile-nav-item ${activeTab === 'BOOK' ? 'active' : ''}`}
        >
          <ShoppingBag size={27} />
          <span className="mobile-nav-label">Book</span>
        </button>

        <button
          onClick={() => { setActiveTab('ACTIVE'); setSuccess(''); setError(''); refreshOrders(); }}
          className={`mobile-nav-item ${activeTab === 'ACTIVE' ? 'active' : ''}`}
        >
          <div style={{ position: 'relative' }}>
            <Activity size={27} />
            {activeOrders.length > 0 && (
              <div style={{
                position: 'absolute', top: '-4px', right: '-8px',
                width: '6px', height: '6px', borderRadius: '50%',
                backgroundColor: '#0055FF'
              }} />
            )}
          </div>
          <span className="mobile-nav-label">Active</span>
        </button>

        <button
          onClick={() => { setActiveTab('HISTORY'); setSuccess(''); setError(''); refreshOrders(); }}
          className={`mobile-nav-item ${activeTab === 'HISTORY' ? 'active' : ''}`}
        >
          <History size={27} />
          <span className="mobile-nav-label">History</span>
        </button>

        <button
          onClick={() => setProfileDrawerOpen(true)}
          className={`mobile-nav-item ${profileDrawerOpen ? 'active' : ''}`}
        >
          <User size={27} />
          <span className="mobile-nav-label">Profile</span>
        </button>
      </div>

      {/* ═══════════════════════════════════════
          MOBILE SLIDE-UP BASKET DRAWER
      ═══════════════════════════════════════ */}
      {mobileBasketOpen && (
        <>
          <div className="drawer-overlay" style={{ display: 'block' }} onClick={() => setMobileBasketOpen(false)} />
          <div className={`drawer-container ${mobileBasketOpen ? 'open' : ''}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0D0D0D', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShoppingBag size={18} />
                Selected Items
              </h3>
              <button
                onClick={() => setMobileBasketOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}
              >
                <X size={20} />
              </button>
            </div>

            {basketItems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 0 32px', color: '#64748B' }}>
                <ShoppingBag size={34} style={{ color: '#94A3B8', marginBottom: '12px' }} />
                <p style={{ fontSize: '15px', fontWeight: '700', color: '#0D0D0D', marginBottom: '6px' }}>Your basket is empty</p>
                <p style={{ fontSize: '13px' }}>Add a service to see it here.</p>
              </div>
            ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '28px' }}>
              {basketItems.map((item) => (
                <div key={item.serviceName} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #F3F1ED', paddingBottom: '14px' }}>
                  <div style={{ flex: 1, paddingRight: '12px' }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#0D0D0D' }}>{item.serviceName}</div>
                    <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>
                      {item.quantity} × {formatCurrency(item.price)}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#0D0D0D', marginBottom: '8px' }}>
                      {formatCurrency(item.price * item.quantity)}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button type="button" onClick={() => handleRemoveFromBasket(item.serviceName)} className="btn-round-adjust" aria-label={`Remove one ${item.serviceName}`} style={{ width: '38px', height: '38px' }}>
                        <Minus size={16} />
                      </button>
                      <button type="button" onClick={() => handleIncreaseBasketItem(item.serviceName)} className="btn-round-adjust" aria-label={`Add one ${item.serviceName}`} style={{ width: '38px', height: '38px' }}>
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            )}

            {basketItems.length > 0 && <div style={{ borderTop: '1.5px dashed #EAE8E3', paddingTop: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                <span style={{ fontSize: '14px', fontWeight: '500', color: '#6B7280' }}>Total Amount:</span>
                <span style={{ fontSize: '20px', fontWeight: '700', color: '#0D0D0D' }}>
                  {formatCurrency(getBasketTotal())}
                </span>
              </div>

              <button
                onClick={() => { setBookingStep('SCHEDULE'); setMobileBasketOpen(false); }}
                style={{
                  width: '100%', padding: '16px', backgroundColor: '#0D0D0D',
                  color: '#FAF9F7', border: 'none', borderRadius: '100px',
                  fontSize: '14px', fontWeight: '600', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  fontFamily: 'DM Sans'
                }}
              >
                Checkout <ChevronRight size={16} />
              </button>
            </div>
            }
          </div>
        </>
      )}

      {profileDrawerOpen && (
        <>
          <div className="profile-drawer-overlay" style={{ display: 'block' }} onClick={() => setProfileDrawerOpen(false)} />
          <div className={`profile-drawer-container ${profileDrawerOpen ? 'open' : ''}`} role="dialog" aria-modal="true" aria-labelledby="profile-dialog-title">
            <div className="profile-drawer-header">
              <div className="profile-identity">
                <span className="profile-modal-avatar" aria-hidden="true">{initials}</span>
                <div>
                  <p className="profile-drawer-title" id="profile-dialog-title">Account profile</p>
                  <p className="profile-drawer-subtitle">Manage your contact details, addresses, and password.</p>
                </div>
              </div>
              <button className="profile-drawer-close" onClick={() => setProfileDrawerOpen(false)} aria-label="Close profile drawer">
                <X size={18} />
              </button>
            </div>

            <div className="profile-drawer-body">
              <section className="profile-section-card">
                <div className="profile-section-heading">
                  <div>
                    <h2 className="profile-section-title">Contact details</h2>
                    <p className="profile-section-copy">Used for order updates and account recovery.</p>
                  </div>
                </div>
                <div className="profile-fields-grid">
                  <div className="profile-drawer-section">
                    <label htmlFor="profile-name">Full name</label>
                    <input id="profile-name" className="profile-drawer-input" autoComplete="name" value={profileName} onChange={(e) => setProfileName(e.target.value)} />
                  </div>
                  <div className="profile-drawer-section">
                    <label htmlFor="profile-phone">Phone number</label>
                    <input id="profile-phone" className="profile-drawer-input" type="tel" inputMode="tel" autoComplete="tel" value={profilePhone} onChange={(e) => setProfilePhone(e.target.value)} />
                  </div>
                  <div className="profile-drawer-section profile-field-wide">
                    <label htmlFor="profile-email">Email address</label>
                    <input id="profile-email" className="profile-drawer-input" type="email" inputMode="email" autoComplete="email" placeholder="you@example.com" value={profileEmail} onChange={(e) => setProfileEmail(e.target.value)} />
                  </div>
                </div>
              </section>

              <section className="profile-section-card">
                <div className="profile-section-heading">
                  <div>
                    <h2 className="profile-section-title">Saved addresses</h2>
                    <p className="profile-section-copy">Keep your regular pickup locations ready for faster booking.</p>
                  </div>
                </div>
                <div className="profile-fields-grid">
                  <div className="profile-drawer-section">
                    <label htmlFor="profile-home-address">Home address</label>
                    <textarea id="profile-home-address" className="profile-drawer-textarea" autoComplete="street-address" placeholder="Enter your home address" value={profileHomeAddress} onChange={(e) => setProfileHomeAddress(e.target.value)} />
                  </div>
                  <div className="profile-drawer-section">
                    <label htmlFor="profile-office-address">Office address</label>
                    <textarea id="profile-office-address" className="profile-drawer-textarea" placeholder="Enter your office address" value={profileOfficeAddress} onChange={(e) => setProfileOfficeAddress(e.target.value)} />
                  </div>
                </div>
              </section>

              <div className="profile-primary-actions">
                <button className="profile-drawer-action" onClick={handleSaveProfile} disabled={profileSaving} style={{ opacity: profileSaving ? 0.7 : 1 }}>
                  {profileSaving ? 'Saving changes...' : 'Save profile'}
                </button>
              </div>

              <section className="profile-section-card profile-security-card">
                <div className="profile-section-heading">
                  <div>
                    <h2 className="profile-security-title">Password & security</h2>
                    <p className="profile-security-copy">Confirm your current password, then choose a new password with at least eight characters, one letter, and one number.</p>
                  </div>
                </div>

                {passwordFeedback && (
                  <div className={`profile-password-feedback ${passwordFeedback.type}`} role={passwordFeedback.type === 'error' ? 'alert' : 'status'}>
                    {passwordFeedback.message}
                  </div>
                )}

                <div className="profile-fields-grid profile-security-fields">
                  <div className="profile-drawer-section">
                    <label htmlFor="profile-current-password">Current password</label>
                    <input id="profile-current-password" className="profile-drawer-input" type="password" autoComplete="current-password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                  </div>
                  <div className="profile-drawer-section">
                    <label htmlFor="profile-new-password">New password</label>
                    <input id="profile-new-password" className="profile-drawer-input" type="password" autoComplete="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                  </div>
                  <div className="profile-drawer-section">
                    <label htmlFor="profile-confirm-password">Confirm password</label>
                    <input id="profile-confirm-password" className="profile-drawer-input" type="password" autoComplete="new-password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} />
                  </div>
                </div>
                <div className="profile-security-action">
                  <button
                    className="profile-drawer-action"
                    onClick={handleChangePassword}
                    disabled={passwordSaving || !currentPassword || newPassword.length < 8 || !confirmNewPassword}
                    style={{ opacity: passwordSaving || !currentPassword || newPassword.length < 8 || !confirmNewPassword ? 0.55 : 1 }}
                  >
                    {passwordSaving ? 'Changing password...' : 'Update password'}
                  </button>
                </div>
              </section>

              <button
                className="profile-logout"
                onClick={() => { handleLogout(); setProfileDrawerOpen(false); }}
              >
                Log out of this account
              </button>
            </div>
          </div>
        </>
      )}

    </div>
  );
}
