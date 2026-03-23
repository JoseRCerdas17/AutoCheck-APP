import { formatRecorrido } from '../utils/unidades';
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Image, Alert
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { getBrandColor } from '../theme/carBrands';
import api from '../services/api';

export default function VehiclesScreen({ navigation }) {
  const [vehicles, setVehicles] = useState([]);
  const { theme } = useTheme();

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchVehicles);
    return unsubscribe;
  }, [navigation]);

  const fetchVehicles = async () => {
    try {
      const id = await AsyncStorage.getItem('userId');
      const response = await api.get(`/vehicles/${id}`);
      setVehicles(response.data || []);
    } catch (error) {
      console.log('Error:', error);
      setVehicles([]);
    }
  };

  const handleEliminar = (id, nombre) => {
    Alert.alert(
      'Eliminar vehículo',
      `¿Estás seguro que querés eliminar ${nombre}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/vehicles/${id}`);
              setVehicles(vehicles.filter(v => v.id !== id));
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

      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Mis Vehículos</Text>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: theme.primary }]}
          onPress={() => navigation.navigate('AddVehicle')}
        >
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {vehicles.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="directions-car" size={64} color={theme.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No tenés vehículos registrados
            </Text>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.primary }]}
              onPress={() => navigation.navigate('AddVehicle')}
            >
              <Text style={styles.buttonText}>+ Agregar Vehículo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          vehicles.map((item) => (
            <View key={item.id} style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>

              {/* Imagen */}
              <View style={[styles.cardImageContainer, { backgroundColor: getBrandColor(item.marca) }]}>
                {item.imagen ? (
                  <Image source={{ uri: item.imagen }} style={styles.cardImage} resizeMode="cover" />
                ) : (
                  <Text style={styles.brandInitial}>
                    {item.marca ? item.marca.charAt(0).toUpperCase() : '?'}
                  </Text>
                )}
              </View>

              {/* Info */}
              <View style={styles.cardInfo}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>
                  {item.marca} {item.modelo}
                </Text>
                <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>
                  {item.anio} • {item.placa}
                </Text>
                <Text style={[styles.cardKm, { color: theme.accent }]}>
  {formatRecorrido(item.kilometraje, item.unidad)}
</Text>
                <Text style={[styles.cardCombustible, { color: theme.textSecondary }]}>
                  {item.combustible}
                </Text>
              </View>

              {/* Botones */}
              <View style={styles.cardButtons}>
                <TouchableOpacity
                  style={[styles.historialBtn, { borderColor: theme.primary }]}
                  onPress={() => navigation.navigate('VehicleDetail', { vehiculo: item })}
                >
                  <MaterialIcons name="list-alt" size={16} color={theme.primary} />
                  <Text style={[styles.historialBtnText, { color: theme.primary }]}>Ver detalle</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.deleteBtn, { borderColor: '#FF5252' }]}
                  onPress={() => handleEliminar(item.id, `${item.marca} ${item.modelo}`)}
                >
                  <Ionicons name="trash-outline" size={16} color="#FF5252" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 60, paddingBottom: 16 },
  title: { fontSize: 24, fontWeight: 'bold' },
  addBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 80, padding: 32 },
  emptyText: { fontSize: 15, marginTop: 12, marginBottom: 24, textAlign: 'center' },
  button: { borderRadius: 10, paddingHorizontal: 24, paddingVertical: 12 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  card: { marginHorizontal: 16, marginBottom: 16, borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  cardImageContainer: { height: 140, justifyContent: 'center', alignItems: 'center' },
  cardImage: { width: '100%', height: '100%' },
  brandInitial: { fontSize: 64, fontWeight: 'bold', color: 'rgba(255,255,255,0.9)' },
  cardInfo: { padding: 16 },
  cardTitle: { fontSize: 18, fontWeight: 'bold' },
  cardSubtitle: { fontSize: 14, marginTop: 4 },
  cardKm: { fontSize: 14, marginTop: 4, fontWeight: '600' },
  cardCombustible: { fontSize: 13, marginTop: 2 },
  cardButtons: { flexDirection: 'row', paddingHorizontal: 16, paddingBottom: 16, gap: 8 },
  historialBtn: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8, flex: 1, justifyContent: 'center' },
  historialBtnText: { fontSize: 13, fontWeight: '600', marginLeft: 4 },
  deleteBtn: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8, justifyContent: 'center', alignItems: 'center' },
});