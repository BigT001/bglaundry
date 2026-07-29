import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import type { RiderOrder } from '@bglaundry/rider-core';
import { destinationFor, jobKind } from '@bglaundry/rider-core';
import { API_URL } from '../../lib/config';
import { riderToken } from '../../lib/session';

export default function DriverDashboard() {
  const router = useRouter();
  const [orders, setOrders] = useState<RiderOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const token = await riderToken();
      if (!token) return router.replace('/(auth)/login');
      const { data } = await axios.get(`${API_URL}/riders/me/orders`, { headers: { Authorization: `Bearer ${token}` } });
      setOrders(data);
    } catch (error: any) {
      if (error.response?.status === 401) router.replace('/(auth)/login');
      else Alert.alert('Assignments unavailable', error.response?.data?.error || 'Pull down to try again.');
    } finally { setLoading(false); }
  }, [router]);

  useEffect(() => { void load(); const timer = setInterval(load, 15000); return () => clearInterval(timer); }, [load]);

  if (loading) return <View style={styles.loading}><ActivityIndicator color="#002B7F"/><Text>Loading assigned customers…</Text></View>;
  return <View style={styles.container}>
    <View style={styles.summary}><Text style={styles.heading}>Assigned route</Text><Text style={styles.count}>{orders.length} active stop{orders.length === 1 ? '' : 's'}</Text></View>
    <FlatList
      data={orders}
      keyExtractor={item => item.id}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load}/>}
      ListEmptyComponent={<View style={styles.empty}><Text style={styles.heading}>No active assignments</Text><Text>New customer stops will appear automatically.</Text></View>}
      renderItem={({ item, index }) => <TouchableOpacity style={styles.card} onPress={() => router.push({ pathname: '/orders/[id]/route', params: { id: item.id } })}>
        <View style={styles.number}><Text>{index + 1}</Text></View>
        <View style={styles.copy}><View style={styles.row}><Text style={styles.customer}>{item.customer.fullName}</Text><Text style={styles.badge}>{jobKind(item.status)}</Text></View><Text style={styles.order}>{item.orderNumber}</Text><Text style={styles.address}>⌖ {destinationFor(item)}</Text><Text style={styles.time}>{new Date(item.pickupDate).toLocaleString()}</Text></View>
        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>}
    />
  </View>;
}

const styles = StyleSheet.create({
  container:{flex:1,backgroundColor:'#F7F9FC',padding:16},loading:{flex:1,alignItems:'center',justifyContent:'center',gap:12},summary:{marginBottom:16},heading:{fontSize:21,fontWeight:'800',color:'#14213D'},count:{fontSize:14,color:'#64748B',marginTop:3},card:{flexDirection:'row',alignItems:'center',gap:12,backgroundColor:'#FFF',borderWidth:1,borderColor:'#DFE6EF',borderRadius:14,padding:15,marginBottom:10},number:{width:34,height:34,borderRadius:17,backgroundColor:'#E2EBFC',alignItems:'center',justifyContent:'center'},copy:{flex:1},row:{flexDirection:'row',justifyContent:'space-between',gap:8},customer:{fontSize:16,fontWeight:'800',color:'#172036',flex:1},badge:{fontSize:10,fontWeight:'800',color:'#174A91',backgroundColor:'#E8F0FD',paddingHorizontal:7,paddingVertical:4,borderRadius:10},order:{fontSize:12,color:'#315B9E',fontWeight:'700',marginTop:2},address:{fontSize:14,color:'#33415C',lineHeight:20,marginTop:8},time:{fontSize:11,color:'#8490A3',marginTop:5},arrow:{fontSize:28,color:'#8090A8'},empty:{alignItems:'center',padding:48,gap:6},
});
