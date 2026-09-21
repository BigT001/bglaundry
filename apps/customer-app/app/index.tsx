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
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { clearCustomerSession, getCustomerSession } from '../lib/session';
import { registerForLiveNotifications } from '../lib/push-notifications';

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
      const { token, user } = await getCustomerSession();
      if (token && user?.id) {
        setTimeout(() => {
          void registerForLiveNotifications();
        }, 1500);
        router.replace('/(tabs)' as any);
      } else {
        if (user && !token) {
          await clearCustomerSession();
        }
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
          <Image
            source={require('../assets/icon.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
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
            <Image
              source={require('../assets/icon.png')}
              style={styles.logoImageLarge}
              resizeMode="contain"
            />
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
            onPress={() => {
              router.push('/(auth)/login' as any);
            }}
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
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  bgBubble1: {
    position: 'absolute',
    top: '12%',
    left: '-10%',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(59, 130, 246, 0.04)',
  },
  bgBubble2: {
    position: 'absolute',
    bottom: '12%',
    right: '-10%',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(14, 165, 233, 0.04)',
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
    marginTop: '8%',
  },
  logoBadge: {
    width: 82,
    height: 82,
    borderRadius: 22,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'visible',
  },
  logoBadgeLarge: {
    width: 150,
    height: 150,
    borderRadius: 36,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 22,
    overflow: 'visible',
  },
  logoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
  },
  logoImageLarge: {
    width: '100%',
    height: '100%',
    borderRadius: 38,
  },
  textContainer: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 16,
  },
  subtitle: {
    fontSize: 18,
    color: '#1F2937',
    textAlign: 'center',
    lineHeight: 30,
    marginBottom: 24,
    fontWeight: '500',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  capsuleBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  buttonContainer: {
    width: '100%',
    marginBottom: height * 0.08,
    alignItems: 'center',
  },
  primaryButton: {
    width: '100%',
    height: 60,
    backgroundColor: '#2563EB',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 4,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  footerText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 18,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
