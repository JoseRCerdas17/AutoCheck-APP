import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert, Image
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { getBrandImage } from '../theme/carBrands';
import api from '../services/api';
import KilometrajeModal from './KilometrajeModal';

export default function HomeScreen({ navigation }) {
  const [nombre, setNombre] = useState('');
  const [vehiculos, setVehiculos] = useState([]);
  const [showKilometrajeModal, setShowKilometrajeModal] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    const getData = async () => {
      const n = await AsyncStorage.getItem('nombre');
      const id = await AsyncStorage.getItem('userId');
      setNombre(n);
      if (id) {
        try {
          const res = await api.get(`/vehicles/${id}`);
          setVehiculos(res.data);
  
          // Solo mostrar el modal una vez por día
          const hoy = new Date().toDateString();
          const ultimaVez = await AsyncStorage.getItem('ultimoModalKm');
          if (res.data.length > 0 && ultimaVez !== hoy) {
            setShowKilometrajeModal(true);
            await AsyncStorage.setItem('ultimoModalKm', hoy);
          }
        } catch (error) {
          console.log('Error cargando vehículos', error);
        }
      }
    };
  
    getData();
  
    const unsubscribe = navigation.addListener('focus', getData);
    return unsubscribe;
  }, [navigation]);

  const handleDelete = async (id) => {
    Alert.alert(
      'Eliminar vehículo',
      '¿Estás seguro que querés eliminar este vehículo?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/vehicles/${id}`);
              setVehiculos(vehiculos.filter(v => v.id !== id));
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar el vehículo');
            }
          }
        }
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>

      <KilometrajeModal
        visible={showKilometrajeModal}
        vehiculos={vehiculos}
        onClose={() => setShowKilometrajeModal(false)}
      />

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: theme.text }]}>Hola, {nombre} 👋</Text>
            <Text style={[styles.subGreeting, { color: theme.textSecondary }]}>Bienvenido a AutoCheck</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.profileBtn}>
            <Ionicons name="person-circle-outline" size={32} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Mis Vehículos */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Mis Vehículos</Text>
        {vehiculos.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <MaterialIcons name="directions-car" size={40} color={theme.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No tenés vehículos registrados</Text>
            <TouchableOpacity style={[styles.addButton, { backgroundColor: theme.primary }]} onPress={() => navigation.navigate('AddVehicle')}>
              <Text style={styles.addButtonText}>+ Agregar vehículo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {vehiculos.map((v) => (
              <View key={v.id} style={[styles.vehicleCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                {v.imagen ? (
                  <Image
                    source={{ uri: v.imagen }}
                    style={styles.brandLogo}
                    resizeMode="cover"
                  />
                ) : getBrandImage(v.marca) ? (
                  <Image
                    source={{ uri: getBrandImage(v.marca) }}
                    style={styles.brandLogo}
                    resizeMode="contain"
                  />
                ) : (
                  <MaterialIcons name="directions-car" size={40} color={theme.primary} />
                )}
                <Text style={[styles.vehicleName, { color: theme.text }]}>{v.marca} {v.modelo}</Text>
                <Text style={[styles.vehicleDetail, { color: theme.textSecondary }]}>{v.anio} • {v.placa}</Text>
                <Text style={[styles.vehicleKm, { color: theme.accent }]}>{v.kilometraje} km</Text>
                <TouchableOpacity
                  style={[styles.deleteButton, { borderColor: theme.danger }]}
                  onPress={() => handleDelete(v.id)}
                >
                  <Ionicons name="trash-outline" size={16} color={theme.danger} />
                  <Text style={[styles.deleteText, { color: theme.danger }]}>Eliminar</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}

        {/* Próximos Mantenimientos */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Próximos Mantenimientos</Text>
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.maintenanceItem}>
            <View>
              <Text style={[styles.maintenanceTitle, { color: theme.text }]}>Cambio de Aceite</Text>
              <Text style={[styles.maintenanceDate, { color: theme.textSecondary }]}>15 Julio 2024</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: theme.border }]}>
              <Text style={[styles.badgeText, { color: theme.text }]}>Media</Text>
            </View>
          </View>
          <View style={[styles.separator, { backgroundColor: theme.border }]} />
          <View style={styles.maintenanceItem}>
            <View>
              <Text style={[styles.maintenanceTitle, { color: theme.text }]}>Revisión de Frenos</Text>
              <Text style={[styles.maintenanceDate, { color: theme.textSecondary }]}>22 Julio 2024</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: theme.primary }]}>
              <Text style={[styles.badgeText, { color: '#fff' }]}>Alta</Text>
            </View>
          </View>
          <View style={[styles.separator, { backgroundColor: theme.border }]} />
          <View style={styles.maintenanceItem}>
            <View>
              <Text style={[styles.maintenanceTitle, { color: theme.text }]}>Rotación de Neumáticos</Text>
              <Text style={[styles.maintenanceDate, { color: theme.textSecondary }]}>01 Agosto 2024</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: theme.border }]}>
              <Text style={[styles.badgeText, { color: theme.text }]}>Baja</Text>
            </View>
          </View>
        </View>

        {/* Accesos Rápidos */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Accesos Rápidos</Text>
        <View style={styles.quickAccessGrid}>
          <TouchableOpacity style={[styles.quickAccessItem, { backgroundColor: theme.card, borderColor: theme.border }]} onPress={() => navigation.navigate('AddVehicle')}>
            <MaterialIcons name="add-circle-outline" size={28} color={theme.primary} />
            <Text style={[styles.quickAccessText, { color: theme.text }]}>Registrar Vehículo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.quickAccessItem, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <MaterialIcons name="list-alt" size={28} color={theme.primary} />
            <Text style={[styles.quickAccessText, { color: theme.text }]}>Historial</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.quickAccessItem, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <MaterialIcons name="description" size={28} color={theme.primary} />
            <Text style={[styles.quickAccessText, { color: theme.text }]}>Documentación</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.quickAccessItem, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <MaterialIcons name="bar-chart" size={28} color={theme.primary} />
            <Text style={[styles.quickAccessText, { color: theme.text }]}>Reportes</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, paddingTop: 60 },
  greeting: { fontSize: 22, fontWeight: 'bold' },
  subGreeting: { fontSize: 13, marginTop: 2 },
  profileBtn: { padding: 8 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', paddingHorizontal: 24, marginBottom: 12, marginTop: 8 },
  emptyCard: { margin: 24, borderRadius: 16, padding: 32, alignItems: 'center', borderWidth: 1 },
  emptyText: { marginTop: 12, marginBottom: 16, fontSize: 14 },
  addButton: { borderRadius: 10, paddingHorizontal: 24, paddingVertical: 12 },
  addButtonText: { color: '#fff', fontWeight: 'bold' },
  vehicleCard: { borderRadius: 16, padding: 20, marginLeft: 24, marginRight: 8, marginBottom: 8, width: 220, borderWidth: 1 },
  brandLogo: { width: 100, height: 60, marginBottom: 8 },
  vehicleName: { fontSize: 16, fontWeight: 'bold', marginTop: 4 },
  vehicleDetail: { fontSize: 13, marginTop: 4 },
  vehicleKm: { fontSize: 13, marginTop: 4 },
  deleteButton: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, marginTop: 12 },
  deleteText: { fontSize: 13, marginLeft: 4 },
  card: { marginHorizontal: 24, borderRadius: 16, padding: 16, borderWidth: 1, marginBottom: 8 },
  maintenanceItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  maintenanceTitle: { fontSize: 14, fontWeight: '600' },
  maintenanceDate: { fontSize: 12, marginTop: 2 },
  badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 12 },
  separator: { height: 1 },
  quickAccessGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, marginBottom: 32 },
  quickAccessItem: { width: '46%', borderRadius: 16, padding: 20, margin: '2%', alignItems: 'center', borderWidth: 1 },
  quickAccessText: { fontSize: 13, marginTop: 8, textAlign: 'center' },
});