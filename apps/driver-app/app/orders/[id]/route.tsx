import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import MapView, { Marker, Polyline } from 'react-native-maps';

export default function RouteScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  // Center around Ejibo
  const region = {
    latitude: 6.5452,
    longitude: 3.3086,
    latitudeDelta: 0.015,
    longitudeDelta: 0.015,
  };

  const driverCoords = { latitude: 6.5412, longitude: 3.3032 };
  const clientCoords = { latitude: 6.5472, longitude: 3.3132 };

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <MapView style={styles.map} initialRegion={region}>
          <Marker coordinate={driverCoords} title="My Location" pinColor="blue" />
          <Marker coordinate={clientCoords} title="Customer Address" pinColor="red" />
          <Polyline
            coordinates={[driverCoords, clientCoords]}
            strokeColor="#002B7F"
            strokeWidth={4}
          />
        </MapView>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Order #{id}</Text>
        <Text style={styles.infoLabel}>Navigation Destination:</Text>
        <Text style={styles.address}>16B Maria Okor Street, Ejibo, Lagos</Text>

        <TouchableOpacity
          style={styles.btn}
          onPress={() => router.push(`/orders/${id}/confirm`)}
        >
          <Text style={styles.btnText}>Arrived at Destination</Text>
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
  mapContainer: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  card: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E6F0FA',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#002B7F',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  address: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '500',
    marginTop: 4,
    marginBottom: 20,
  },
  btn: {
    backgroundColor: '#002B7F',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
