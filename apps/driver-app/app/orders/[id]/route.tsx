import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import MapView, { Marker, Polyline } from 'react-native-maps';
import axios from 'axios';
import * as Location from 'expo-location';
import type { RiderOrder } from '@bglaundry/rider-core';
import { destinationFor } from '@bglaundry/rider-core';
import { API_URL, MAPBOX_TOKEN } from '../../../lib/config';
import { clearRiderSession, riderAuthHeaders } from '../../../lib/session';

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
  const [loading, setLoading] = useState(true);

  const selected = orders.find((order) => order.id === id) || orders[0];

  useEffect(() => {
    let subscription: Location.LocationSubscription | undefined;
    void (async () => {
      try {
        setLoading(true);
        const headers = await riderAuthHeaders();
        if (!headers) return router.replace('/(auth)/login');

        const { data } = await axios.get<RiderOrder[]>(`${API_URL}/riders/me/orders`, { headers });
        setOrders(data);

        // Attempt geocoding located stops via Mapbox or fallback coordinates (Default Lagos: 6.5244, 3.3792)
        const located = await Promise.all(
          data.map(async (order) => {
            const dest = destinationFor(order);
            if (MAPBOX_TOKEN) {
              try {
                const response = await fetch(
                  `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
                    dest
                  )}.json?country=ng&autocomplete=false&limit=1&access_token=${MAPBOX_TOKEN}`
                );
                const json = await response.json();
                const match = json.features?.[0]?.center;
                if (Array.isArray(match)) {
                  return { order, point: { longitude: match[0], latitude: match[1] } };
                }
              } catch (e) {
                console.warn('Mapbox geocoding error:', e);
              }
            }
            // Fallback default coordinates if geocoder unavailable
            return { order, point: { latitude: 6.5244 + Math.random() * 0.05, longitude: 3.3792 + Math.random() * 0.05 } };
          })
        );
        setStops(located.filter((stop): stop is LocatedStop => Boolean(stop)));

        // Request device live GPS permissions
        const permission = await Location.requestForegroundPermissionsAsync();
        if (permission.status === 'granted') {
          const first = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
          const currentPos = { latitude: first.coords.latitude, longitude: first.coords.longitude };
          setPosition(currentPos);

          // Watch position and update backend live tracking
          subscription = await Location.watchPositionAsync(
            { accuracy: Location.Accuracy.High, distanceInterval: 10, timeInterval: 5000 },
            (location) => {
              const next = { latitude: location.coords.latitude, longitude: location.coords.longitude };
              setPosition(next);
              void axios
                .patch(
                  `${API_URL}/riders/me`,
                  { currentLat: next.latitude, currentLng: next.longitude, isOnline: true },
                  { headers }
                )
                .catch(() => {});
            }
          );
        } else {
          // Default initial position if permission denied
          setPosition({ latitude: 6.5244, longitude: 3.3792 });
        }
      } catch (error: any) {
        if (error.response?.status === 401 || error.response?.status === 403) {
          await clearRiderSession();
          router.replace('/(auth)/login');
          return;
        }
        console.warn('Route loading warning:', error?.message);
      } finally {
        setLoading(false);
      }
    })();

    return () => subscription?.remove();
  }, [router]);

  useEffect(() => {
    if (!position || !stops.length) return;
    const ordered = [...stops].sort((a, b) => (a.order.id === id ? -1 : b.order.id === id ? 1 : 0)).slice(0, 24);
    const points = [position, ...ordered.map((stop) => stop.point)];
    mapRef.current?.fitToCoordinates(points, {
      edgePadding: { top: 70, right: 50, bottom: 70, left: 50 },
      animated: true,
    });

    if (MAPBOX_TOKEN && points.length > 1) {
      const coordinates = points.map((point) => `${point.longitude},${point.latitude}`).join(';');
      void fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${coordinates}?geometries=geojson&overview=full&access_token=${MAPBOX_TOKEN}`
      )
        .then((response) => response.json())
        .then((data) =>
          setRoute(
            (data.routes?.[0]?.geometry?.coordinates || []).map(([longitude, latitude]: number[]) => ({
              latitude,
              longitude,
            }))
          )
        )
        .catch(() => setRoute([]));
    }
  }, [id, position?.latitude, position?.longitude, stops]);

  if (loading || !selected) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#002B7F" />
        <Text style={styles.loadingText}>Loading assigned route & live GPS...</Text>
      </View>
    );
  }

  const destination = destinationFor(selected);
  const routeNotStarted =
    selected.status === 'PICKUP_PENDING' || selected.status === 'DELIVERY_PENDING';

  const handleAdvanceRoute = async () => {
    if (!routeNotStarted) {
      return router.push({
        pathname: '/orders/[id]/confirm',
        params: { id: selected.id, status: selected.status },
      });
    }

    try {
      const headers = await riderAuthHeaders();
      if (!headers) return router.replace('/(auth)/login');
      const status =
        selected.status === 'PICKUP_PENDING' ? 'PICKUP_IN_PROGRESS' : 'DELIVERY_IN_PROGRESS';
      const { data } = await axios.patch(
        `${API_URL}/riders/orders/${selected.id}/status`,
        { status },
        { headers }
      );
      setOrders((current) => current.map((order) => (order.id === selected.id ? data : order)));
      Alert.alert(
        'Route Started',
        'Dispatch is now receiving your live movement updates to this customer location.'
      );
    } catch (error: any) {
      Alert.alert('Could not start route', error.response?.data?.error || 'Please try again.');
    }
  };

  const handleOpenExternalNavigation = () => {
    const encodedDest = encodeURIComponent(destination);
    const googleUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedDest}&travelmode=driving`;
    Linking.openURL(googleUrl).catch(() => {
      Alert.alert('Error', 'Could not open Google Maps navigation.');
    });
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: position?.latitude || 6.5244,
          longitude: position?.longitude || 3.3792,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {position && (
          <Marker
            coordinate={position}
            title="My Live Location (Rider)"
            description="Active duty coordinator"
            pinColor="#10B981"
          />
        )}
        {stops.map((stop, index) => (
          <Marker
            key={stop.order.id}
            coordinate={stop.point}
            title={`${index + 1}. ${stop.order.customer?.fullName || 'Customer'}`}
            description={destinationFor(stop.order)}
            pinColor={stop.order.id === selected.id ? '#002B7F' : '#64748B'}
            onPress={() => router.setParams({ id: stop.order.id })}
          />
        ))}
        {route.length > 1 && <Polyline coordinates={route} strokeColor="#002B7F" strokeWidth={5} />}
      </MapView>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.kicker}>
            {stops.length} ASSIGNED CUSTOMER STOP{stops.length === 1 ? '' : 'S'}
          </Text>
          <Text style={styles.statusTag}>
            {selected.status.replace(/_/g, ' ')}
          </Text>
        </View>

        <Text style={styles.title}>{selected.customer?.fullName || 'Customer Name'}</Text>
        <Text style={styles.address}>📍 {destination}</Text>

        <TouchableOpacity style={styles.navigateBtn} onPress={handleOpenExternalNavigation}>
          <Text style={styles.navigateBtnText}>🗺️ Open Turn-by-Turn Navigation (Google Maps)</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} onPress={handleAdvanceRoute}>
          <Text style={styles.actionBtnText}>
            {routeNotStarted ? '▶ Start This Route' : '✓ Confirm Handoff OTP'}
          </Text>
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
  map: {
    flex: 1,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#64748B',
    fontSize: 14,
  },
  card: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  kicker: {
    fontSize: 11,
    fontWeight: '800',
    color: '#002B7F',
    letterSpacing: 1,
  },
  statusTag: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#002B7F',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 4,
  },
  address: {
    fontSize: 14,
    lineHeight: 20,
    color: '#475569',
    marginBottom: 16,
  },
  navigateBtn: {
    backgroundColor: '#002B7F',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  navigateBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  actionBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
