import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

export default function AlertsScreen({ navigation }) {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [alertas, setAlertas] = useState([]);

  useEffect(() => {
    cargarAlertas();
  }, []);

  const cargarAlertas = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const resVehiculos = await api.get(`/vehicles/${userId}`);

      let todasAlertas = [];

      for (const v of resVehiculos.data) {
        const resMant = await api.get(`/maintenance/${v.id}`);
        const mantenimientos = resMant.data;
        const nombreVehiculo = `${v.marca} ${v.modelo} ${v.anio}`;

        // Alerta por km — si el vehículo tiene más de 5000 km desde el último cambio de aceite
        const cambioAceite = mantenimientos.find(m =>
          m.tipo?.toLowerCase().includes('aceite')
        );
        if (cambioAceite) {
          const kmDesde = v.kilometraje - (cambioAceite.kilometraje || 0);
          if (kmDesde >= 4000) {
            todasAlertas.push({
              id: `aceite-${v.id}`,
              vehiculo: nombreVehiculo,
              tipo: 'Cambio de Aceite',
              mensaje: `Han pasado ${kmDesde} km desde el último cambio`,
              nivel: kmDesde >= 5000 ? 'alto' : 'medio',
              icono: 'oil-barrel',
            });
          }
        } else if (v.kilometraje > 5000) {
          todasAlertas.push({
            id: `aceite-nuevo-${v.id}`,
            vehiculo: nombreVehiculo,
            tipo: 'Cambio de Aceite',
            mensaje: 'No hay registro de cambio de aceite',
            nivel: 'alto',
            icono: 'warning',
          });
        }

        // Alerta por tiempo — si el último mantenimiento fue hace más de 6 meses
        if (mantenimientos.length > 0) {
          const ultimo = mantenimientos[0];
          if (ultimo.fecha) {
            const diasDesde = Math.floor(
              (new Date() - new Date(ultimo.fecha)) / (1000 * 60 * 60 * 24)
            );
            if (diasDesde >= 150) {
              todasAlertas.push({
                id: `tiempo-${v.id}`,
                vehiculo: nombreVehiculo,
                tipo: 'Revisión General',
                mensaje: `Hace ${diasDesde} días sin mantenimiento registrado`,
                nivel: diasDesde >= 180 ? 'alto' : 'medio',
                icono: 'calendar-today',
              });
            }
          }
        } else {
          todasAlertas.push({
            id: `sin-mant-${v.id}`,
            vehiculo: nombreVehiculo,
            tipo: 'Sin Mantenimientos',
            mensaje: 'Este vehículo no tiene mantenimientos registrados',
            nivel: 'bajo',
            icono: 'info',
          });
        }

        // Alerta por frenos — cada 40000 km
        const frenos = mantenimientos.find(m =>
          m.tipo?.toLowerCase().includes('freno')
        );
        if (!frenos && v.kilometraje > 40000) {
          todasAlertas.push({
            id: `frenos-${v.id}`,
            vehiculo: nombreVehiculo,
            tipo: 'Revisión de Frenos',
            mensaje: `El vehículo tiene ${v.kilometraje} km sin revisión de frenos`,
            nivel: 'medio',
            icono: 'warning',
          });
        }
      }

      // Ordenar por nivel: alto primero
      todasAlertas.sort((a, b) => {
        const orden = { alto: 0, medio: 1, bajo: 2 };
        return orden[a.nivel] - orden[b.nivel];
      });

      setAlertas(todasAlertas);
    } catch (error) {
      console.log('Error cargando alertas', error);
    } finally {
      setLoading(false);
    }
  };

  const getNivelColor = (nivel) => {
    if (nivel === 'alto') return '#FF5252';
    if (nivel === 'medio') return '#FF9800';
    return '#29B6F6';
  };

  const getNivelLabel = (nivel) => {
    if (nivel === 'alto') return 'Urgente';
    if (nivel === 'medio') return 'Atención';
    return 'Info';
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

        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>Alertas</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {alertas.length} alerta{alertas.length !== 1 ? 's' : ''} activa{alertas.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {alertas.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="check-circle" size={64} color="#4CAF50" />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>¡Todo en orden!</Text>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              Tus vehículos no tienen alertas pendientes
            </Text>
          </View>
        ) : (
          alertas.map((alerta) => (
            <View
              key={alerta.id}
              style={[styles.alertCard, { backgroundColor: theme.card, borderColor: theme.border, borderLeftColor: getNivelColor(alerta.nivel) }]}
            >
              <View style={styles.alertHeader}>
                <View style={[styles.nivelBadge, { backgroundColor: getNivelColor(alerta.nivel) + '20' }]}>
                  <Text style={[styles.nivelText, { color: getNivelColor(alerta.nivel) }]}>
                    {getNivelLabel(alerta.nivel)}
                  </Text>
                </View>
                <MaterialIcons name={alerta.icono} size={20} color={getNivelColor(alerta.nivel)} />
              </View>

              <Text style={[styles.alertTipo, { color: theme.text }]}>{alerta.tipo}</Text>
              <Text style={[styles.alertVehiculo, { color: theme.primary }]}>{alerta.vehiculo}</Text>
              <Text style={[styles.alertMensaje, { color: theme.textSecondary }]}>{alerta.mensaje}</Text>

              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: theme.primary }]}
                onPress={() => navigation.navigate('AddMaintenance')}
              >
                <Text style={styles.actionButtonText}>Registrar Mantenimiento</Text>
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
  header: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 16 },
  title: { fontSize: 24, fontWeight: 'bold' },
  subtitle: { fontSize: 14, marginTop: 4 },
  emptyContainer: { alignItems: 'center', paddingTop: 80, padding: 32 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 16 },
  emptyText: { fontSize: 15, marginTop: 8, textAlign: 'center', color: '#666' },
  alertCard: { marginHorizontal: 24, marginBottom: 16, borderRadius: 16, padding: 16, borderWidth: 1, borderLeftWidth: 4 },
  alertHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  nivelBadge: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
  nivelText: { fontSize: 12, fontWeight: 'bold' },
  alertTipo: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  alertVehiculo: { fontSize: 13, fontWeight: '600', marginBottom: 4 },
  alertMensaje: { fontSize: 13, marginBottom: 12 },
  actionButton: { borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10, alignSelf: 'flex-start' },
  actionButtonText: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
});