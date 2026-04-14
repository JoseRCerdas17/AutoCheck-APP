import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, Alert
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { getBrandColor } from '../theme/carBrands';
import { formatRecorrido } from '../utils/unidades';
import api from '../services/api';

export default function VehicleDetailScreen({ navigation, route }) {
  const { vehiculo } = route.params;
  const { theme } = useTheme();
  const [mantenimientos, setMantenimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const unidad = vehiculo.unidad || 'km';

  useEffect(() => {
    cargarMantenimientos();
  }, []);

  const cargarMantenimientos = async () => {
    try {
      const res = await api.get(`/maintenance/${vehiculo.id}`);
      setMantenimientos(res.data);
    } catch (error) {
      console.log('Error cargando mantenimientos', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEliminarMantenimiento = (id) => {
    Alert.alert('Eliminar', '¿Estás seguro?', [
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

  const totalGastado = mantenimientos.reduce((sum, m) => sum + Number(m.costo || 0), 0);

  const formatFecha = (fecha) => {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleDateString('es-CR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>

        <View style={[styles.hero, { backgroundColor: getBrandColor(vehiculo.marca) }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('EditVehicle', { vehiculo })}
            style={styles.editBtn}
          >
            <Ionicons name="create-outline" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.heroInitial}>
            {vehiculo.marca ? vehiculo.marca.charAt(0).toUpperCase() : '?'}
          </Text>
          <Text style={styles.heroNombre}>{vehiculo.marca} {vehiculo.modelo}</Text>
          <Text style={styles.heroSub}>{vehiculo.anio} • {vehiculo.placa}</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <MaterialIcons name="speed" size={22} color={theme.primary} />
            <Text style={[styles.statNumber, { color: theme.text }]}>
              {formatRecorrido(vehiculo.kilometraje, unidad)}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Recorrido actual</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <MaterialIcons name="build" size={22} color={theme.primary} />
            <Text style={[styles.statNumber, { color: theme.text }]}>{mantenimientos.length}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Servicios</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <MaterialIcons name="attach-money" size={22} color="#4CAF50" />
            <Text style={[styles.statNumber, { color: theme.text }]}>
              ₡{(totalGastado / 1000).toFixed(0)}K
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Total gastado</Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>Información</Text>
        <View style={[styles.infoCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Marca</Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>{vehiculo.marca}</Text>
          </View>
          <View style={[styles.infoDivider, { backgroundColor: theme.border }]} />
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Modelo</Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>{vehiculo.modelo}</Text>
          </View>
          <View style={[styles.infoDivider, { backgroundColor: theme.border }]} />
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Año</Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>{vehiculo.anio}</Text>
          </View>
          <View style={[styles.infoDivider, { backgroundColor: theme.border }]} />
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Placa</Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>{vehiculo.placa}</Text>
          </View>
          <View style={[styles.infoDivider, { backgroundColor: theme.border }]} />
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Combustible</Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>{vehiculo.combustible}</Text>
          </View>
          <View style={[styles.infoDivider, { backgroundColor: theme.border }]} />
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Unidad</Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>{unidad === 'mi' ? 'Millas' : 'Kilómetros'}</Text>
          </View>
        </View>

        <View style={styles.sectionRow}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Historial</Text>
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: theme.primary }]}
            onPress={() => navigation.navigate('AddMaintenance', { vehiculoId: vehiculo.id })}
          >
            <Ionicons name="add" size={18} color="#fff" />
            <Text style={styles.addBtnText}>Agregar</Text>
          </TouchableOpacity>
        </View>

        {mantenimientos.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <MaterialIcons name="build" size={40} color={theme.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No hay mantenimientos registrados
            </Text>
          </View>
        ) : (
          mantenimientos.map((m) => (
            <View key={m.id} style={[styles.mantCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={styles.mantHeader}>
                <Text style={[styles.mantTipo, { color: theme.primary }]}>{m.tipo}</Text>
                <Text style={[styles.mantCosto, { color: '#4CAF50' }]}>
                  ₡{Number(m.costo || 0).toLocaleString('es-CR')}
                </Text>
              </View>
              <View style={styles.mantRow}>
                <MaterialIcons name="calendar-today" size={13} color={theme.textSecondary} />
                <Text style={[styles.mantDetalle, { color: theme.textSecondary }]}> {formatFecha(m.fecha)}</Text>
                <MaterialIcons name="speed" size={13} color={theme.textSecondary} style={{ marginLeft: 12 }} />
                <Text style={[styles.mantDetalle, { color: theme.textSecondary }]}>
                  {' '}{m.kilometraje ? formatRecorrido(m.kilometraje, unidad) : '-'}
                </Text>
              </View>
              {m.taller && (
                <View style={styles.mantRow}>
                  <MaterialIcons name="build" size={13} color={theme.textSecondary} />
                  <Text style={[styles.mantDetalle, { color: theme.textSecondary }]}> {m.taller}</Text>
                </View>
              )}
              {m.notas && (
                <Text style={[styles.mantNotas, { color: theme.textSecondary }]}>{m.notas}</Text>
              )}
              <TouchableOpacity
                style={[styles.deleteBtn, { borderColor: '#FF5252' }]}
                onPress={() => handleEliminarMantenimiento(m.id)}
              >
                <Ionicons name="trash-outline" size={14} color="#FF5252" />
                <Text style={[styles.deleteBtnText, { color: '#FF5252' }]}>Eliminar</Text>
              </TouchableOpacity>
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
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  hero: { paddingTop: 60, paddingBottom: 24, alignItems: 'center' },
  backBtn: { position: 'absolute', top: 60, left: 24, padding: 8 },
  editBtn: { position: 'absolute', top: 60, right: 24, padding: 8 },
  heroInitial: { fontSize: 64, fontWeight: 'bold', color: 'rgba(255,255,255,0.9)', marginBottom: 8 },
  heroNombre: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  heroSub: { fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  statsRow: { flexDirection: 'row', padding: 16, gap: 8 },
  statCard: { flex: 1, borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1 },
  statNumber: { fontSize: 14, fontWeight: 'bold', marginTop: 6, textAlign: 'center' },
  statLabel: { fontSize: 11, marginTop: 2, textAlign: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', paddingHorizontal: 24, marginTop: 8, marginBottom: 12 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, marginTop: 8, marginBottom: 12 },
  addBtn: { flexDirection: 'row', alignItems: 'center', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  addBtnText: { color: '#fff', fontSize: 13, fontWeight: '600', marginLeft: 4 },
  infoCard: { marginHorizontal: 16, borderRadius: 16, padding: 16, borderWidth: 1, marginBottom: 8 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
  infoLabel: { fontSize: 14 },
  infoValue: { fontSize: 14, fontWeight: '600' },
  infoDivider: { height: 1 },
  emptyCard: { marginHorizontal: 16, borderRadius: 16, padding: 32, alignItems: 'center', borderWidth: 1 },
  emptyText: { fontSize: 14, marginTop: 12 },
  mantCard: { marginHorizontal: 16, marginBottom: 12, borderRadius: 12, padding: 16, borderWidth: 1 },
  mantHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  mantTipo: { fontSize: 15, fontWeight: 'bold', flex: 1 },
  mantCosto: { fontSize: 15, fontWeight: 'bold' },
  mantRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  mantDetalle: { fontSize: 13 },
  mantNotas: { fontSize: 13, marginTop: 4, fontStyle: 'italic' },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, marginTop: 10, alignSelf: 'flex-start' },
  deleteBtnText: { fontSize: 12, marginLeft: 4 },
});