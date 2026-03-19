import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert, Image
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { getBrandColor } from '../theme/carBrands';
import api from '../services/api';
import KilometrajeModal from './KilometrajeModal';

export default function HomeScreen({ navigation }) {
  const [nombre, setNombre] = useState('');
  const [vehiculos, setVehiculos] = useState([]);
  const [resumen, setResumen] = useState(null);
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

          const hoy = new Date().toDateString();
          const ultimaVez = await AsyncStorage.getItem('ultimoModalKm');
          if (res.data.length > 0 && ultimaVez !== hoy) {
            setShowKilometrajeModal(true);
            await AsyncStorage.setItem('ultimoModalKm', hoy);
          }

          const resumenRes = await api.get(`/maintenance/resumen/${id}`);
          setResumen(resumenRes.data);
        } catch (error) {
          console.log('Error cargando datos', error);
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
                <View style={[styles.vehicleColorBar, { backgroundColor: getBrandColor(v.marca) }]}>
                  <Text style={styles.vehicleInitial}>
                    {v.marca ? v.marca.charAt(0).toUpperCase() : '?'}
                  </Text>
                </View>
                <View style={styles.vehicleInfo}>
                  <Text style={[styles.vehicleName, { color: theme.text }]}>{v.marca} {v.modelo}</Text>
                  <Text style={[styles.vehicleDetail, { color: theme.textSecondary }]}>{v.anio} • {v.placa}</Text>
                  <Text style={[styles.vehicleKm, { color: theme.accent }]}>{v.kilometraje} km</Text>
                </View>
                <TouchableOpacity
                  style={[styles.deleteButton, { borderColor: theme.danger || '#FF5252' }]}
                  onPress={() => handleDelete(v.id)}
                >
                  <Ionicons name="trash-outline" size={16} color={theme.danger || '#FF5252'} />
                  <Text style={[styles.deleteText, { color: theme.danger || '#FF5252' }]}>Eliminar</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}

        {/* Resumen */}
        {resumen && (
          <>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Resumen</Text>
            <View style={styles.statsGrid}>
              <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <MaterialIcons name="build" size={24} color={theme.primary} />
                <Text style={[styles.statNumber, { color: theme.text }]}>{resumen.totalMantenimientos}</Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Mantenimientos</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <MaterialIcons name="attach-money" size={24} color="#4CAF50" />
                <Text style={[styles.statNumber, { color: theme.text }]}>
                  ₡{Number(resumen.totalGastado).toLocaleString('es-CR')}
                </Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Total Gastado</Text>
              </View>
            </View>

            {resumen.ultimoMantenimiento && (
              <View style={[styles.ultimoCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Text style={[styles.ultimoTitle, { color: theme.textSecondary }]}>Último Mantenimiento</Text>
                <Text style={[styles.ultimoTipo, { color: theme.text }]}>{resumen.ultimoMantenimiento.tipo}</Text>
                <Text style={[styles.ultimoDetalle, { color: theme.textSecondary }]}>
                  {resumen.ultimoMantenimiento.vehiculo}
                  {resumen.ultimoMantenimiento.taller ? ` • ${resumen.ultimoMantenimiento.taller}` : ''}
                </Text>
              </View>
            )}
          </>
        )}

        {/* Accesos Rápidos */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Accesos Rápidos</Text>
        <View style={styles.quickAccessGrid}>
          <TouchableOpacity
            style={[styles.quickAccessItem, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => navigation.navigate('AddVehicle')}
          >
            <MaterialIcons name="add-circle-outline" size={28} color={theme.primary} />
            <Text style={[styles.quickAccessText, { color: theme.text }]}>Registrar Vehículo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickAccessItem, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => navigation.navigate('Historial')}
          >
            <MaterialIcons name="list-alt" size={28} color={theme.primary} />
            <Text style={[styles.quickAccessText, { color: theme.text }]}>Historial</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickAccessItem, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => navigation.navigate('AddMaintenance')}
          >
            <MaterialIcons name="build" size={28} color={theme.primary} />
            <Text style={[styles.quickAccessText, { color: theme.text }]}>Agregar Mantenimiento</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickAccessItem, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => navigation.navigate('Profile')}
          >
            <MaterialIcons name="person" size={28} color={theme.primary} />
            <Text style={[styles.quickAccessText, { color: theme.text }]}>Perfil</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 32 }} />
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
  vehicleCard: { borderRadius: 16, marginLeft: 24, marginRight: 8, marginBottom: 8, width: 200, borderWidth: 1, overflow: 'hidden' },
  vehicleColorBar: { height: 80, justifyContent: 'center', alignItems: 'center' },
  vehicleInitial: { fontSize: 40, fontWeight: 'bold', color: 'rgba(255,255,255,0.9)' },
  vehicleInfo: { padding: 12 },
  vehicleName: { fontSize: 15, fontWeight: 'bold' },
  vehicleDetail: { fontSize: 13, marginTop: 4 },
  vehicleKm: { fontSize: 13, marginTop: 4 },
  deleteButton: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, margin: 12, marginTop: 0 },
  deleteText: { fontSize: 13, marginLeft: 4 },
  statsGrid: { flexDirection: 'row', paddingHorizontal: 16, gap: 12, marginBottom: 8 },
  statCard: { flex: 1, borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1 },
  statNumber: { fontSize: 18, fontWeight: 'bold', marginTop: 8 },
  statLabel: { fontSize: 12, marginTop: 4, textAlign: 'center' },
  ultimoCard: { marginHorizontal: 24, borderRadius: 16, padding: 16, borderWidth: 1, marginBottom: 8 },
  ultimoTitle: { fontSize: 12, marginBottom: 4 },
  ultimoTipo: { fontSize: 16, fontWeight: 'bold' },
  ultimoDetalle: { fontSize: 13, marginTop: 4 },
  quickAccessGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, marginBottom: 32 },
  quickAccessItem: { width: '46%', borderRadius: 16, padding: 20, margin: '2%', alignItems: 'center', borderWidth: 1 },
  quickAccessText: { fontSize: 13, marginTop: 8, textAlign: 'center' },
});