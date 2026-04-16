import React from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, StatusBar
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { formatRecorrido } from '../utils/unidades';
import api from '../services/api';

export default function MaintenanceDetailScreen({ route, navigation }) {
  const { theme } = useTheme();
  const { mantenimiento, unidad = 'km' } = route.params;

  const formatFecha = (fecha) => {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleDateString('es-CR', {
      day: '2-digit', month: 'long', year: 'numeric'
    });
  };

  const formatCosto = (costo) => {
    if (!costo && costo !== 0) return '-';
    return `₡${Number(costo).toLocaleString('es-CR')}`;
  };

  const handleEliminar = () => {
    Alert.alert(
      'Eliminar mantenimiento',
      `¿Estás seguro que querés eliminar "${mantenimiento.tipo}"? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/maintenance/${mantenimiento.id}`);
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar el mantenimiento');
            }
          }
        }
      ]
    );
  };

  const InfoRow = ({ icono, label, valor }) => (
    <View style={[styles.infoRow, { borderBottomColor: theme.border }]}>
      <View style={[styles.iconBox, { backgroundColor: theme.primary + '15' }]}>
        <MaterialIcons name={icono} size={20} color={theme.primary} />
      </View>
      <View style={styles.infoContent}>
        <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>{label}</Text>
        <Text style={[styles.infoValue, { color: theme.text }]}>{valor || '-'}</Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.dark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]} numberOfLines={1}>
          Detalle de Mantenimiento
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Tipo banner */}
        <View style={[styles.tipoBanner, { backgroundColor: theme.primary }]}>
          <MaterialIcons name="build" size={32} color="#fff" />
          <Text style={styles.tipoText}>{mantenimiento.tipo}</Text>
          <Text style={styles.costoText}>{formatCosto(mantenimiento.costo)}</Text>
        </View>

        {/* Info card */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Información</Text>

          <InfoRow
            icono="calendar-today"
            label="Fecha"
            valor={formatFecha(mantenimiento.fecha)}
          />
          <InfoRow
            icono="speed"
            label="Recorrido al servicio"
            valor={mantenimiento.kilometraje ? formatRecorrido(mantenimiento.kilometraje, unidad) : '-'}
          />
          <InfoRow
            icono="build"
            label="Taller / Mecánico"
            valor={mantenimiento.taller}
          />
          <InfoRow
            icono="attach-money"
            label="Costo"
            valor={formatCosto(mantenimiento.costo)}
          />
        </View>

        {/* Notas card */}
        {mantenimiento.notas ? (
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Notas</Text>
            <View style={[styles.notasBox, { backgroundColor: theme.background }]}>
              <Text style={[styles.notasText, { color: theme.text }]}>
                {mantenimiento.notas}
              </Text>
            </View>
          </View>
        ) : null}

        {/* Eliminar */}
        <TouchableOpacity
          style={[styles.deleteBtn, { borderColor: '#FF5252' }]}
          onPress={handleEliminar}
        >
          <Ionicons name="trash-outline" size={18} color="#FF5252" />
          <Text style={styles.deleteBtnText}>Eliminar mantenimiento</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tipoBanner: {
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 24,
    gap: 8,
  },
  tipoText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 4,
  },
  costoText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 16,
    fontWeight: '600',
  },
  card: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
    opacity: 0.6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 12, marginBottom: 2 },
  infoValue: { fontSize: 15, fontWeight: '600' },
  notasBox: {
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
  },
  notasText: { fontSize: 14, lineHeight: 22 },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 20,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  deleteBtnText: {
    color: '#FF5252',
    fontSize: 15,
    fontWeight: '600',
  },
});
