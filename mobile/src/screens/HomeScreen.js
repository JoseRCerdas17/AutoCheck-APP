import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen({ navigation }) {
  const [nombre, setNombre] = useState('');

  useEffect(() => {
    const getNombre = async () => {
      const n = await AsyncStorage.getItem('nombre');
      setNombre(n);
    };
    getNombre();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('nombre');
    navigation.replace('Login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>¡Bienvenido!</Text>
      <Text style={styles.subtitle}>{nombre}</Text>

      <View style={styles.card}>
        <Text style={styles.cardText}>🚗 Mis vehículos</Text>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#f5f5f5' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1A56A0', marginTop: 60, marginBottom: 8 },
  subtitle: { fontSize: 18, color: '#666', marginBottom: 32 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#ddd' },
  cardText: { fontSize: 16, color: '#333' },
  logoutButton: { backgroundColor: '#ff4444', borderRadius: 8, padding: 16, alignItems: 'center', marginTop: 'auto' },
  logoutText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});