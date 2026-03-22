import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Dimensions, Animated, FlatList, Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    titulo: 'Bienvenido a AutoCheck',
    subtitulo: 'Tu asistente personal de mantenimiento vehicular',
    icono: 'directions-car',
    color: '#5B2EE8',
    descripcion: 'Llevá el control completo de todos tus vehículos en un solo lugar.',
  },
  {
    id: '2',
    titulo: 'Registrá tus Vehículos',
    subtitulo: 'Agregá todos tus autos fácilmente',
    icono: 'add-circle',
    color: '#29B6F6',
    descripcion: 'Guardá la información de cada vehículo con foto, placa, kilometraje y más.',
  },
  {
    id: '3',
    titulo: 'Historial de Mantenimientos',
    subtitulo: 'Nunca más olvidés un servicio',
    icono: 'build',
    color: '#4CAF50',
    descripcion: 'Registrá cada mantenimiento con fecha, costo y taller. Todo en un historial ordenado.',
  },
  {
    id: '4',
    titulo: 'Alertas Inteligentes',
    subtitulo: 'Te avisamos cuando necesitás atención',
    icono: 'notifications',
    color: '#FF9800',
    descripcion: 'Recibí notificaciones cuando tu vehículo necesite mantenimiento según el kilometraje.',
  },
  {
    id: '5',
    titulo: 'Reportes y Estadísticas',
    subtitulo: 'Conocé cuánto gastás en tu auto',
    icono: 'bar-chart',
    color: '#E91E63',
    descripcion: 'Visualizá gráficas de gastos por mes, tipo de mantenimiento y vehículo.',
  },
];

export default function OnboardingScreen({ navigation }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      handleFinish();
    }
  };

  const handleSkip = async () => {
    await handleFinish();
  };

  const handleFinish = async () => {
    await AsyncStorage.setItem('onboarding_completado', 'true');
    navigation.replace('Login');
  };

  const renderSlide = ({ item }) => (
    <View style={styles.slide}>
      <LinearGradient
        colors={[item.color + '20', 'transparent']}
        style={styles.slideGradient}
      />
      <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
        <MaterialIcons name={item.icono} size={64} color="#fff" />
      </View>
      <Text style={styles.slideTitulo}>{item.titulo}</Text>
      <Text style={styles.slideSubtitulo}>{item.subtitulo}</Text>
      <Text style={styles.slideDescripcion}>{item.descripcion}</Text>
    </View>
  );

  return (
    <LinearGradient colors={['#0D1117', '#1A1F2E']} style={styles.container}>

      {/* Skip */}
      {currentIndex < SLIDES.length - 1 && (
        <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
          <Text style={styles.skipText}>Omitir</Text>
        </TouchableOpacity>
      )}

      {/* Logo */}
      <Image
        source={require('../../assets/LogoAutoCheck.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Slides */}
      <Animated.FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
      />

      {/* Dots */}
      <View style={styles.dotsContainer}>
        {SLIDES.map((_, i) => {
          const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [8, 24, 8],
            extrapolate: 'clamp',
          });
          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.4, 1, 0.4],
            extrapolate: 'clamp',
          });
          return (
            <Animated.View
              key={i}
              style={[styles.dot, { width: dotWidth, opacity, backgroundColor: SLIDES[currentIndex].color }]}
            />
          );
        })}
      </View>

      {/* Botón */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: SLIDES[currentIndex].color }]}
        onPress={handleNext}
      >
        {currentIndex === SLIDES.length - 1 ? (
          <View style={styles.buttonInner}>
            <Text style={styles.buttonText}>Comenzar</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </View>
        ) : (
          <View style={styles.buttonInner}>
            <Text style={styles.buttonText}>Siguiente</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </View>
        )}
      </TouchableOpacity>

    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center' },
  skipBtn: { position: 'absolute', top: 60, right: 24, zIndex: 10 },
  skipText: { color: '#A0A0B0', fontSize: 15 },
  logo: { width: 80, height: 80, marginTop: 60 },
  slide: { width, alignItems: 'center', paddingHorizontal: 32, paddingTop: 24 },
  slideGradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 200 },
  iconContainer: { width: 120, height: 120, borderRadius: 60, justifyContent: 'center', alignItems: 'center', marginBottom: 32 },
  slideTitulo: { fontSize: 26, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 8 },
  slideSubtitulo: { fontSize: 16, color: '#A0A0B0', textAlign: 'center', marginBottom: 16 },
  slideDescripcion: { fontSize: 14, color: '#A0A0B0', textAlign: 'center', lineHeight: 22 },
  dotsContainer: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 24 },
  dot: { height: 8, borderRadius: 4 },
  button: { borderRadius: 16, paddingHorizontal: 48, paddingVertical: 16, marginBottom: 48 },
  buttonInner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});