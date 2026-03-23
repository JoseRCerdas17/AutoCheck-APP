import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  TouchableOpacity, ActivityIndicator, Alert
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { formatRecorrido, convertirDeKm } from '../utils/unidades';
import api from '../services/api';

export default function MaintenanceScreen({ navigation }) {
  const { theme } = useTheme();
  const [vehiculos, setVehiculos] = useState([]);
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState(null);
  const [mantenimientos, setMantenimientos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarVehiculos();
  }, []);

  const cargarVehiculos = async () => {
    try {
      const id = await AsyncStorage.getItem('userId');
      const res = await api.get(`/vehicles/${id}`);
      setVehiculos(res.data);
      if (res.data.length > 0) {
        seleccionarVehiculo(res.data[0]);
      }
    } catch (error) {
      console.log('Error cargando vehículos', error);
    } finally {
      setLoading(false);
    }
  };

  const seleccionarVehiculo = async (vehiculo) => {
    setVehiculoSeleccionado(vehiculo);
    setLoading(true);
    try {
      const res = await api.get(`/maintenance/${vehiculo.id}`);
      setMantenimientos(res.data);
    } catch (error) {
      console.log('Error cargando mantenimientos', error);
      setMantenimientos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = (id) => {
    Alert.alert('Eliminar mantenimiento', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/maintenance/${id}`);
            setMantenimientos(mantenimientos.filter(m => m.id !== id));
          } catch (error) {
            Alert.alert('Error', 'No se pudo eliminar');
          }
        }
      }
    ]);
  };

  const formatFecha = (fecha) => {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleDateString('es-CR', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  };

  const formatCosto = (costo) => {
    if (!costo) return '-';
    return `₡${Number(costo).toLocaleString('es-CR')}`;
  };

  const unidad = vehiculoSeleccionado?.unidad || 'km';

  const renderMantenimiento = ({ item }) => (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={styles.cardHeader}>
        <Text style={[styles.cardTipo, { color: theme.primary }]}>{item.tipo}</Text>
        <Text style={[styles.cardCosto, { color: theme.success || '#4CAF50' }]}>
          {formatCosto(item.costo)}
        </Text>
      </View>

      <View style={styles.cardRow}>
        <MaterialIcons name="calendar-today" size={14} color={theme.textSecondary} />
        <Text style={[styles.cardLabel, { color: theme.textSecondary }]}>Fecha:</Text>
        <Text style={[styles.cardValue, { color: theme.text }]}>{formatFecha(item.fecha)}</Text>
      </View>

      <View style={styles.cardRow}>
        <MaterialIcons name="speed" size={14} color={theme.textSecondary} />
        <Text style={[styles.cardLabel, { color: theme.textSecondary }]}>Recorrido:</Text>
        <Text style={[styles.cardValue, { color: theme.text }]}>
          {item.kilometraje ? formatRecorrido(item.kilometraje, unidad) : '-'}
        </Text>
      </View>

      {item.taller && (
        <View style={styles.cardRow}>
          <MaterialIcons name="build" size={14} color={theme.textSecondary} />
          <Text style={[styles.cardLabel, { color: theme.textSecondary }]}>Taller:</Text>
          <Text style={[styles.cardValue, { color: theme.text }]}>{item.taller}</Text>
        </View>
      )}

      {item.notas && (
        <View style={styles.cardRow}>
          <MaterialIcons name="notes" size={14} color={theme.textSecondary} />
          <Text style={[styles.cardLabel, { color: theme.textSecondary }]}>Notas:</Text>
          <Text style={[styles.cardValue, { color: theme.text }]}>{item.notas}</Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.deleteButton, { borderColor: theme.danger }]}
        onPress={() => handleEliminar(item.id)}
      >
        <Ionicons name="trash-outline" size={14} color={theme.danger} />
        <Text style={[styles.deleteText, { color: theme.danger }]}>Eliminar</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>

      <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Historial de Mantenimientos</Text>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: theme.primary }]}
          onPress={() => navigation.navigate('AddMaintenance')}
        >
          <Ionicons name="add" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {vehiculos.length > 1 && (
        <View style={styles.vehiculosScroll}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={vehiculos}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.vehiculoTab,
                  {
                    backgroundColor: vehiculoSeleccionado?.id === item.id ? theme.primary : theme.card,
                    borderColor: theme.border
                  }
                ]}
                onPress={() => seleccionarVehiculo(item)}
              >
                <Text style={[
                  styles.vehiculoTabText,
                  { color: vehiculoSeleccionado?.id === item.id ? '#fff' : theme.text }
                ]}>
                  {item.marca} {item.modelo}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {vehiculoSeleccionado && (
        <View style={[styles.vehiculoInfo, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <MaterialIcons name="directions-car" size={18} color={theme.primary} />
          <Text style={[styles.vehiculoNombre, { color: theme.text }]}>
            {vehiculoSeleccionado.marca} {vehiculoSeleccionado.modelo} {vehiculoSeleccionado.anio}
          </Text>
          <Text style={[styles.vehiculoPlaca, { color: theme.textSecondary }]}>
            {vehiculoSeleccionado.placa} • {formatRecorrido(vehiculoSeleccionado.kilometraje, unidad)}
          </Text>
        </View>
      )}

      {vehiculos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="directions-car" size={48} color={theme.textSecondary} />
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            No tenés vehículos registrados
          </Text>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: theme.primary }]}
            onPress={() => navigation.navigate('AddVehicle')}
          >
            <Text style={styles.addButtonText}>+ Agregar vehículo</Text>
          </TouchableOpacity>
        </View>
      ) : mantenimientos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="build" size={48} color={theme.textSecondary} />
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            No hay mantenimientos registrados
          </Text>
        </View>
      ) : (
        <FlatList
          data={mantenimientos}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderMantenimiento}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 60, paddingBottom: 16, borderBottomWidth: 1 },
  headerTitle: { fontSize: 22, fontWeight: 'bold' },
  addBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  vehiculosScroll: { maxHeight: 60 },
  vehiculoTab: { borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, marginRight: 8, borderWidth: 1 },
  vehiculoTabText: { fontSize: 13, fontWeight: '600' },
  vehiculoInfo: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginVertical: 8, borderRadius: 12, padding: 12, borderWidth: 1 },
  vehiculoNombre: { fontSize: 15, fontWeight: 'bold', marginLeft: 8, flex: 1 },
  vehiculoPlaca: { fontSize: 13 },
  list: { padding: 16 },
  card: { borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(128,128,128,0.2)' },
  cardTipo: { fontSize: 16, fontWeight: 'bold', flex: 1 },
  cardCosto: { fontSize: 15, fontWeight: 'bold' },
  cardRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  cardLabel: { fontSize: 13, marginLeft: 4, width: 90 },
  cardValue: { fontSize: 13, flex: 1 },
  deleteButton: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, marginTop: 12, alignSelf: 'flex-start' },
  deleteText: { fontSize: 13, marginLeft: 4 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyText: { fontSize: 15, marginTop: 12, marginBottom: 16, textAlign: 'center' },
  addButton: { borderRadius: 10, paddingHorizontal: 24, paddingVertical: 12 },
  addButtonText: { color: '#fff', fontWeight: 'bold' },
});