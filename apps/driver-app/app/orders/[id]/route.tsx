import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import MapView, { Marker, Polyline } from 'react-native-maps';
import axios from 'axios';
import * as Location from 'expo-location';
import type { RiderOrder } from '@bglaundry/rider-core';
import { destinationFor } from '@bglaundry/rider-core';
import { API_URL, MAPBOX_TOKEN } from '../../../lib/config';
import { riderToken } from '../../../lib/session';

type Point = { latitude: number; longitude: number };
type LocatedStop = { order: RiderOrder; point: Point };

export default function RouteScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const mapRef = useRef<MapView>(null);
  const [orders, setOrders] = useState<RiderOrder[]>([]);
  const [stops, setStops] = useState<LocatedStop[]>([]);
  const [position, setPosition] = useState<Point | null>(null);
  const [route, setRoute] = useState<Point[]>([]);
  const selected = orders.find(order => order.id === id) || orders[0];

  useEffect(() => {
    let subscription: Location.LocationSubscription | undefined;
    void (async () => {
      try {
        const token = await riderToken();
        if (!token) return router.replace('/(auth)/login');
        const { data } = await axios.get<RiderOrder[]>(`${API_URL}/riders/me/orders`, { headers: { Authorization: `Bearer ${token}` } });
        setOrders(data);
        if (!MAPBOX_TOKEN) throw new Error('EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN is required for customer routing.');
        const located = (await Promise.all(data.map(async order => {
          const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(destinationFor(order))}.json?country=ng&autocomplete=false&limit=1&access_token=${MAPBOX_TOKEN}`);
          const match = (await response.json()).features?.[0]?.center;
          return Array.isArray(match) ? { order, point: { longitude: match[0], latitude: match[1] } } : null;
        }))).filter((stop): stop is LocatedStop => Boolean(stop));
        setStops(located);
        const permission = await Location.requestForegroundPermissionsAsync();
        if (permission.status !== 'granted') return Alert.alert('Location needed', 'Enable precise location so dispatch and routing can track this trip.');
        const first = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        setPosition({ latitude: first.coords.latitude, longitude: first.coords.longitude });
        subscription = await Location.watchPositionAsync({ accuracy: Location.Accuracy.High, distanceInterval: 10, timeInterval: 5000 }, location => {
          const next = { latitude: location.coords.latitude, longitude: location.coords.longitude };
          setPosition(next);
          void axios.patch(`${API_URL}/riders/me`, { currentLat: next.latitude, currentLng: next.longitude, isOnline: true }, { headers: { Authorization: `Bearer ${token}` } });
        });
      } catch (error: any) { Alert.alert('Route unavailable', error.response?.data?.error || error.message); }
    })();
    return () => subscription?.remove();
  }, [router]);

  useEffect(() => {
    if (!position || !stops.length || !MAPBOX_TOKEN) return;
    const ordered = [...stops].sort((a, b) => a.order.id === id ? -1 : b.order.id === id ? 1 : 0).slice(0, 24);
    const points = [position, ...ordered.map(stop => stop.point)];
    mapRef.current?.fitToCoordinates(points, { edgePadding: { top: 70, right: 50, bottom: 70, left: 50 }, animated: true });
    const coordinates = points.map(point => `${point.longitude},${point.latitude}`).join(';');
    void fetch(`https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${coordinates}?geometries=geojson&overview=full&access_token=${MAPBOX_TOKEN}`)
      .then(response => response.json())
      .then(data => setRoute((data.routes?.[0]?.geometry?.coordinates || []).map(([longitude, latitude]: number[]) => ({ latitude, longitude }))))
      .catch(() => setRoute([]));
  }, [id, position?.latitude, position?.longitude, stops]);

  if (!selected) return <View style={styles.loading}><ActivityIndicator/><Text>Loading assigned route…</Text></View>;
  const destination = destinationFor(selected);
  const routeNotStarted = selected.status === 'PICKUP_PENDING' || selected.status === 'DELIVERY_PENDING';
  const advance = async () => {
    if (!routeNotStarted) return router.push({ pathname: '/orders/[id]/confirm', params: { id: selected.id, status: selected.status } });
    try {
      const token = await riderToken();
      const status = selected.status === 'PICKUP_PENDING' ? 'PICKUP_IN_PROGRESS' : 'DELIVERY_IN_PROGRESS';
      await axios.patch(`${API_URL}/riders/orders/${selected.id}/status`, { status }, { headers: { Authorization: `Bearer ${token}` } });
      setOrders(current => current.map(order => order.id === selected.id ? { ...order, status } as RiderOrder : order));
      Alert.alert('Route started', 'Dispatch can now follow your live movement to this customer.');
    } catch (error: any) { Alert.alert('Could not start route', error.response?.data?.error || 'Try again.'); }
  };
  return <View style={styles.container}>
    <MapView ref={mapRef} style={styles.map}>
      {position && <Marker coordinate={position} title="My live location" pinColor="#18A66C"/>}
      {stops.map((stop, index) => <Marker key={stop.order.id} coordinate={stop.point} title={`${index + 1}. ${stop.order.customer.fullName}`} description={destinationFor(stop.order)} pinColor={stop.order.id === selected.id ? '#174DA7' : '#68758F'} onPress={() => router.setParams({ id: stop.order.id })}/>)}
      {route.length > 1 && <Polyline coordinates={route} strokeColor="#174DA7" strokeWidth={5}/>}
    </MapView>
    <View style={styles.card}><Text style={styles.kicker}>{stops.length} ASSIGNED CUSTOMER STOPS</Text><Text style={styles.title}>{selected.customer.fullName}</Text><Text style={styles.address}>{destination}</Text>
      <TouchableOpacity style={styles.navigate} onPress={() => Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}&travelmode=driving`)}><Text style={styles.navigateText}>Open turn-by-turn navigation</Text></TouchableOpacity>
      <TouchableOpacity style={styles.arrived} onPress={advance}><Text style={styles.arrivedText}>{routeNotStarted ? 'Start this customer route' : 'Confirm customer handover'}</Text></TouchableOpacity>
    </View>
  </View>;
}

const styles = StyleSheet.create({
  container:{flex:1,backgroundColor:'#FFF'},map:{flex:1},loading:{flex:1,alignItems:'center',justifyContent:'center',gap:10},card:{padding:18,borderTopWidth:1,borderTopColor:'#DFE6EF'},kicker:{fontSize:10,fontWeight:'800',color:'#75839A',letterSpacing:1},title:{fontSize:20,fontWeight:'800',color:'#172036',marginTop:7},address:{fontSize:14,lineHeight:20,color:'#4D5B72',marginTop:5,marginBottom:14},navigate:{backgroundColor:'#174DA7',padding:14,borderRadius:9,alignItems:'center'},navigateText:{color:'#FFF',fontSize:14,fontWeight:'800'},arrived:{padding:13,alignItems:'center'},arrivedText:{color:'#174DA7',fontSize:13,fontWeight:'800'},
});
