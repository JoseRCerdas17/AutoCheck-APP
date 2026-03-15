import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

export default function HomeScreen({ navigation }) {
  const [nombre, setNombre] = useState('');
  const [vehiculos, setVehiculos] = useState([]);

  useEffect(() => {
    const getData = async () => {
      const n = await AsyncStorage.getItem('nombre');
      const id = await AsyncStorage.getItem('userId');
      setNombre(n);
      if (id) {
        try {
          const res = await api.get(`/vehicles/${id}`);
          setVehiculos(res.data);
        } catch (error) {
          console.log('Error cargando vehículos', error);
        }
      }
    };
    getData();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('nombre');
    await AsyncStorage.removeItem('userId');
    navigation.replace('Login');
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hola, {nombre} 👋</Text>
            <Text style={styles.subGreeting}>Bienvenido a AutoCheck</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={24} color="#A0A0B0" />
          </TouchableOpacity>
        </View>

        {/* Mis Vehículos */}
        <Text style={styles.sectionTitle}>Mis Vehículos</Text>
        {vehiculos.length === 0 ? (
          <View style={styles.emptyCard}>
            <MaterialIcons name="directions-car" size={40} color="#A0A0B0" />
            <Text style={styles.emptyText}>No tenés vehículos registrados</Text>
            <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('AddVehicle')}>
              <Text style={styles.addButtonText}>+ Agregar vehículo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {vehiculos.map((v) => (
              <View key={v.id} style={styles.vehicleCard}>
                <MaterialIcons name="directions-car" size={40} color="#5B2EE8" />
                <Text style={styles.vehicleName}>{v.marca} {v.modelo}</Text>
                <Text style={styles.vehicleDetail}>{v.año} • {v.placa}</Text>
                <Text style={styles.vehicleKm}>{v.kilometraje} km</Text>
              </View>
            ))}
          </ScrollView>
        )}

        {/* Próximos Mantenimientos */}
        <Text style={styles.sectionTitle}>Próximos Mantenimientos</Text>
        <View style={styles.card}>
          <View style={styles.maintenanceItem}>
            <View>
              <Text style={styles.maintenanceTitle}>Cambio de Aceite</Text>
              <Text style={styles.maintenanceDate}>15 Julio 2024</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: '#2A2F3E' }]}>
              <Text style={styles.badgeText}>Media</Text>
            </View>
          </View>
          <View style={styles.separator} />
          <View style={styles.maintenanceItem}>
            <View>
              <Text style={styles.maintenanceTitle}>Revisión de Frenos</Text>
              <Text style={styles.maintenanceDate}>22 Julio 2024</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: '#5B2EE8' }]}>
              <Text style={styles.badgeText}>Alta</Text>
            </View>
          </View>
          <View style={styles.separator} />
          <View style={styles.maintenanceItem}>
            <View>
              <Text style={styles.maintenanceTitle}>Rotación de Neumáticos</Text>
              <Text style={styles.maintenanceDate}>01 Agosto 2024</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: '#2A2F3E' }]}>
              <Text style={styles.badgeText}>Baja</Text>
            </View>
          </View>
        </View>

        {/* Accesos Rápidos */}
        <Text style={styles.sectionTitle}>Accesos Rápidos</Text>
        <View style={styles.quickAccessGrid}>
          <TouchableOpacity style={styles.quickAccessItem} onPress={() => navigation.navigate('AddVehicle')}>
            <MaterialIcons name="add-circle-outline" size={28} color="#5B2EE8" />
            <Text style={styles.quickAccessText}>Registrar Vehículo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAccessItem}>
            <MaterialIcons name="list-alt" size={28} color="#5B2EE8" />
            <Text style={styles.quickAccessText}>Historial</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAccessItem}>
            <MaterialIcons name="description" size={28} color="#5B2EE8" />
            <Text style={styles.quickAccessText}>Documentación</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAccessItem}>
            <MaterialIcons name="bar-chart" size={28} color="#5B2EE8" />
            <Text style={styles.quickAccessText}>Reportes</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D1117' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, paddingTop: 60 },
  greeting: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF' },
  subGreeting: { fontSize: 13, color: '#A0A0B0', marginTop: 2 },
  logoutBtn: { padding: 8 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF', paddingHorizontal: 24, marginBottom: 12, marginTop: 8 },
  emptyCard: { margin: 24, backgroundColor: '#1A1F2E', borderRadius: 16, padding: 32, alignItems: 'center', borderWidth: 1, borderColor: '#2A2F3E' },
  emptyText: { color: '#A0A0B0', marginTop: 12, marginBottom: 16, fontSize: 14 },
  addButton: { backgroundColor: '#5B2EE8', borderRadius: 10, paddingHorizontal: 24, paddingVertical: 12 },
  addButtonText: { color: '#fff', fontWeight: 'bold' },
  vehicleCard: { backgroundColor: '#1A1F2E', borderRadius: 16, padding: 20, marginLeft: 24, marginRight: 8, marginBottom: 8, width: 200, borderWidth: 1, borderColor: '#2A2F3E' },
  vehicleName: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', marginTop: 8 },
  vehicleDetail: { color: '#A0A0B0', fontSize: 13, marginTop: 4 },
  vehicleKm: { color: '#29B6F6', fontSize: 13, marginTop: 4 },
  card: { marginHorizontal: 24, backgroundColor: '#1A1F2E', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#2A2F3E', marginBottom: 8 },
  maintenanceItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  maintenanceTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  maintenanceDate: { color: '#A0A0B0', fontSize: 12, marginTop: 2 },
  badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  badgeText: { color: '#fff', fontSize: 12 },
  separator: { height: 1, backgroundColor: '#2A2F3E' },
  quickAccessGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, marginBottom: 32 },
  quickAccessItem: { width: '46%', backgroundColor: '#1A1F2E', borderRadius: 16, padding: 20, margin: '2%', alignItems: 'center', borderWidth: 1, borderColor: '#2A2F3E' },
  quickAccessText: { color: '#FFFFFF', fontSize: 13, marginTop: 8, textAlign: 'center' },
});