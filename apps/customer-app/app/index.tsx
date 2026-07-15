import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';

const { height } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();
  const [checkingSession, setCheckingSession] = useState(true);

  // Animation values
  const logoScale = useRef(new Animated.Value(0.7)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(20)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const buttonTranslateY = useRef(new Animated.Value(30)).current;

  // Floating background bubble values
  const bubble1Y = useRef(new Animated.Value(0)).current;
  const bubble2Y = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Trigger background floating bubble animations
    startFloatingAnimations();

    // 2. Initial logo entry animation (runs during session check)
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
      Animated.timing(logoScale, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Once logo completes, verify user session
      checkUserSession();
    });
  }, []);

  const startFloatingAnimations = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bubble1Y, {
          toValue: -15,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(bubble1Y, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(bubble2Y, {
          toValue: 20,
          duration: 3500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(bubble2Y, {
          toValue: 0,
          duration: 3500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  };

  const checkUserSession = async () => {
    try {
      // Small simulated delay for premium branding feel
      await new Promise((resolve) => setTimeout(resolve, 800));
      const token = await AsyncStorage.getItem('@bglaundry_token');
      if (token) {
        router.replace('/(tabs)');
      } else {
        setCheckingSession(false);
        // Staggered reveal for details
        triggerRevealOnboarding();
      }
    } catch (error) {
      console.error('Session check error:', error);
      setCheckingSession(false);
      triggerRevealOnboarding();
    }
  };

  const triggerRevealOnboarding = () => {
    Animated.stagger(200, [
      // Reveal Text details
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(textTranslateY, {
          toValue: 0,
          duration: 800,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
      // Reveal CTA Button
      Animated.parallel([
        Animated.timing(buttonOpacity, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(buttonTranslateY, {
          toValue: 0,
          duration: 800,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  };

  if (checkingSession) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="light" />
        
        {/* Animated Loading Badge */}
        <Animated.View
          style={[
            styles.logoBadge,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          <Text style={styles.logoText}>BG</Text>
        </Animated.View>
        
        <ActivityIndicator size="small" color="#FFFFFF" style={{ marginTop: 32 }} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Decorative Animated Floating Background Spheres */}
      <Animated.View
        style={[
          styles.bgBubble1,
          { transform: [{ translateY: bubble1Y }] },
        ]}
      />
      <Animated.View
        style={[
          styles.bgBubble2,
          { transform: [{ translateY: bubble2Y }] },
        ]}
      />

      <View style={styles.innerContainer}>
        {/* Center Content Section */}
        <View style={styles.contentWrapper}>
          <Animated.View
            style={[
              styles.logoBadgeLarge,
              {
                opacity: logoOpacity,
                transform: [{ scale: logoScale }],
              },
            ]}
          >
            <Text style={styles.logoTextLarge}>BG</Text>
          </Animated.View>

          <Animated.View
            style={[
              styles.textContainer,
              {
                opacity: textOpacity,
                transform: [{ translateY: textTranslateY }],
              },
            ]}
          >
            <Text style={styles.title}>BG Laundry</Text>
            <Text style={styles.subtitle}>
              Premium laundry & dry cleaning service at your doorstep.
            </Text>
            <View style={styles.badgeRow}>
              <View style={styles.capsuleBadge}>
                <Text style={styles.badgeText}>24h Express</Text>
              </View>
              <View style={[styles.capsuleBadge, { backgroundColor: 'rgba(56, 189, 248, 0.15)' }]}>
                <Text style={[styles.badgeText, { color: '#38BDF8' }]}>Free Pickup</Text>
              </View>
            </View>
          </Animated.View>
        </View>

        {/* Bottom Onboarding CTA Button */}
        <Animated.View
          style={[
            styles.buttonContainer,
            {
              opacity: buttonOpacity,
              transform: [{ translateY: buttonTranslateY }],
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.primaryButton}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.primaryButtonText}>Get Started</Text>
          </TouchableOpacity>
          <Text style={styles.footerText}>
            Secure Login • Fast Dispatch
          </Text>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#002B7F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#0A192F', // Modern, richer dark navy background
    overflow: 'hidden',
  },
  bgBubble1: {
    position: 'absolute',
    top: '10%',
    left: '-20%',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(0, 102, 255, 0.08)',
  },
  bgBubble2: {
    position: 'absolute',
    bottom: '20%',
    right: '-15%',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(56, 189, 248, 0.05)',
  },
  innerContainer: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginTop: '10%',
  },
  logoBadge: {
    width: 68,
    height: 68,
    borderRadius: 18,
    backgroundColor: '#0066FF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0066FF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  logoBadgeLarge: {
    width: 100,
    height: 100,
    borderRadius: 26,
    backgroundColor: '#0066FF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0066FF',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
    marginBottom: 36,
  },
  logoText: {
    fontSize: 30,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  logoTextLarge: {
    fontSize: 44,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  textContainer: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 38,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 12,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
    fontWeight: '500',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  capsuleBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 102, 255, 0.15)',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3B82F6',
  },
  buttonContainer: {
    width: '100%',
    marginBottom: height * 0.08,
    alignItems: 'center',
  },
  primaryButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#0066FF',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0066FF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  footerText: {
    fontSize: 11,
    color: '#475569',
    marginTop: 18,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
