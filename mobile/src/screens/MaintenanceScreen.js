import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  TouchableOpacity, ActivityIndicator, Alert, TextInput
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { formatRecorrido } from '../utils/unidades';
import api from '../services/api';

export default function MaintenanceScreen({ navigation }) {
  const { theme } = useTheme();
  const [vehiculos, setVehiculos] = useState([]);
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState(null);
  const [mantenimientos, setMantenimientos] = useState([]);
  const [loading, setLoading] = useState(true);

  // NUEVOS ESTADOS
  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState('todos');

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
    return new Date(fecha).toLocaleDateString('es-CR');
  };

  const formatCosto = (costo) => {
    if (!costo) return '-';
    return `₡${Number(costo).toLocaleString('es-CR')}`;
  };

  const unidad = vehiculoSeleccionado?.unidad || 'km';

  // FILTRO Y BÚSQUEDA
  const mantenimientosFiltrados = mantenimientos.filter(m => {
    const coincideBusqueda = m.tipo?.toLowerCase().includes(busqueda.toLowerCase());
    const coincideFiltro = filtro === 'todos' ? true : m.tipo === filtro;
    return coincideBusqueda && coincideFiltro;
  });

  // TOTAL GASTADO
  const totalGastado = mantenimientosFiltrados.reduce((total, m) => {
    return total + (m.costo || 0);
  }, 0);

  const renderMantenimiento = ({ item }) => (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={styles.cardHeader}>
        <Text style={[styles.cardTipo, { color: theme.primary }]}>{item.tipo}</Text>
        <Text style={[styles.cardCosto, { color: theme.success || '#4CAF50' }]}>
          {formatCosto(item.costo)}
        </Text>
      </View>

      <Text style={{ color: theme.text }}>Fecha: {formatFecha(item.fecha)}</Text>

      <Text style={{ color: theme.text }}>
        Recorrido: {item.kilometraje ? formatRecorrido(item.kilometraje, unidad) : '-'}
      </Text>

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

      {/* 🔍 BUSCADOR */}
      <TextInput
        placeholder="Buscar mantenimiento..."
        value={busqueda}
        onChangeText={setBusqueda}
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          margin: 10,
          padding: 10,
          borderRadius: 8
        }}
      />

      {/*  FILTROS */}
      <View style={{ flexDirection: 'row', marginHorizontal: 10 }}>
        <TouchableOpacity onPress={() => setFiltro('todos')}>
          <Text style={{ marginRight: 10 }}>Todos</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setFiltro('aceite')}>
          <Text style={{ marginRight: 10 }}>Aceite</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setFiltro('llantas')}>
          <Text style={{ marginRight: 10 }}>Llantas</Text>
        </TouchableOpacity>
      </View>

      {/* TOTAL */}
      <Text style={{ margin: 10, fontWeight: 'bold' }}>
        Total: ₡{totalGastado}
      </Text>

      {mantenimientosFiltrados.length === 0 ? (
        <Text style={{ textAlign: 'center', marginTop: 20 }}>
          No hay resultados
        </Text>
      ) : (
        <FlatList
          data={mantenimientosFiltrados}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderMantenimiento}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { borderRadius: 12, padding: 16, margin: 10, borderWidth: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  cardTipo: { fontSize: 16, fontWeight: 'bold' },
  cardCosto: { fontSize: 15, fontWeight: 'bold' },
  deleteButton: { flexDirection: 'row', marginTop: 10 },
  deleteText: { marginLeft: 5 }
});