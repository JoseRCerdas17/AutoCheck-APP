import React, { useEffect, useRef } from 'react';
import {
  View, Image, StyleSheet, Animated, Text, Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export default function SplashScreen({ navigation }) {
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const loaderOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Secuencia de animaciones
    Animated.sequence([
      // Logo aparece y crece
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      // Texto aparece
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      // Subtítulo aparece
      Animated.timing(subtitleOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      // Loader aparece
      Animated.timing(loaderOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Navegar después de la animación
    const checkToken = async () => {
      await new Promise(resolve => setTimeout(resolve, 2800));
      
      const onboardingCompletado = await AsyncStorage.getItem('onboarding_completado');
      if (!onboardingCompletado) {
        navigation.replace('Onboarding');
        return;
      }
    
      const token = await AsyncStorage.getItem('token');
      if (token) {
        navigation.replace('Main');
      } else {
        navigation.replace('Login');
      }
    };
    checkToken();
  }, []);

  return (
    <LinearGradient
      colors={['#0D1117', '#1A1F2E', '#0D1117']}
      style={styles.container}
    >
      {/* Círculo decorativo de fondo */}
      <View style={styles.circle1} />
      <View style={styles.circle2} />

      {/* Logo animado */}
      <Animated.View style={[
        styles.logoContainer,
        { opacity: logoOpacity, transform: [{ scale: logoScale }] }
      ]}>
        <Image
          source={require('../../assets/LogoAutoCheck.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Nombre de la app */}
      <Animated.Text style={[styles.appName, { opacity: textOpacity }]}>
        AutoCheck
      </Animated.Text>

      {/* Subtítulo */}
      <Animated.Text style={[styles.subtitle, { opacity: subtitleOpacity }]}>
        Tu asistente de mantenimiento vehicular
      </Animated.Text>

      {/* Puntos de carga */}
      <Animated.View style={[styles.dotsContainer, { opacity: loaderOpacity }]}>
        <DotsLoader />
      </Animated.View>

    </LinearGradient>
  );
}

function DotsLoader() {
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animateDot = (dot, delay) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0.3, duration: 400, useNativeDriver: true }),
        ])
      ).start();
    };
    animateDot(dot1, 0);
    animateDot(dot2, 200);
    animateDot(dot3, 400);
  }, []);

  return (
    <View style={styles.dots}>
      <Animated.View style={[styles.dot, { opacity: dot1 }]} />
      <Animated.View style={[styles.dot, { opacity: dot2 }]} />
      <Animated.View style={[styles.dot, { opacity: dot3 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  circle1: {
    position: 'absolute', width: 300, height: 300, borderRadius: 150,
    backgroundColor: '#5B2EE8', opacity: 0.05, top: -50, right: -80,
  },
  circle2: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    backgroundColor: '#29B6F6', opacity: 0.05, bottom: 50, left: -60,
  },
  logoContainer: { marginBottom: 16 },
  logo: { width: 220, height: 220 },
  appName: {
    fontSize: 36, fontWeight: 'bold', color: '#FFFFFF',
    letterSpacing: 2, marginBottom: 8,
  },
  subtitle: {
    fontSize: 14, color: '#A0A0B0',
    marginBottom: 60, textAlign: 'center', paddingHorizontal: 40,
  },
  dotsContainer: { position: 'absolute', bottom: 80 },
  dots: { flexDirection: 'row', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#5B2EE8' },
});