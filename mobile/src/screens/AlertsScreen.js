import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, RefreshControl
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { generarAlertas } from '../utils/unidades';
import api from '../services/api';
import { enviarNotificacionLocal } from '../services/notifications';

export default function AlertsScreen({ navigation }) {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [alertas, setAlertas] = useState([]);
  const [alertasNoLeidas, setAlertasNoLeidas] = useState(0);

  // Cargar alertas cuando la pantalla recibe foco
  useFocusEffect(
    useCallback(() => {
      cargarAlertas();
      actualizarBadge();
    }, [])
  );

  const actualizarBadge = async () => {
    try {
      const alertasVistas = await AsyncStorage.getItem('alertas_vistas');
      const count = alertas.length - parseInt(alertasVistas || '0');
      setAlertasNoLeidas(Math.max(0, count));
      
      // Actualizar el badge en la pestaña (esto se maneja en el navigation)
      navigation.setOptions({
        tabBarBadge: alertasNoLeidas > 0 ? alertasNoLeidas : undefined,
      });
    } catch (error) {
      console.log('Error actualizando badge', error);
    }
  };

  const cargarAlertas = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        setLoading(false);
        return;
      }
      
      const resVehiculos = await api.get(`/vehicles/${userId}`);
      let todasAlertas = [];

      for (const v of resVehiculos.data) {
        const resMant = await api.get(`/maintenance/${v.id}`);
        const alertasVehiculo = generarAlertas(v, resMant.data);
        todasAlertas = [...todasAlertas, ...alertasVehiculo];
      }

      todasAlertas.sort((a, b) => {
        const orden = { alto: 0, medio: 1, bajo: 2 };
        return orden[a.nivel] - orden[b.nivel];
      });

      setAlertas(todasAlertas);
      
      // Verificar si hay nuevas alertas para notificar
      const alertasVistas = await AsyncStorage.getItem('alertas_vistas');
      const vistasCount = parseInt(alertasVistas || '0');
      
      if (todasAlertas.length > vistasCount) {
        const nuevas = todasAlertas.length - vistasCount;
        await enviarNotificacionLocal(
          `${nuevas} alerta${nuevas !== 1 ? 's' : ''} nueva${nuevas !== 1 ? 's' : ''}`,
          'Hay alertas pendientes en tus vehículos'
        );
      }
      
      await actualizarBadge();
    } catch (error) {
      console.log('Error cargando alertas', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await cargarAlertas();
    setRefreshing(false);
  }, []);

  const marcarComoLeidas = async () => {
    try {
      await AsyncStorage.setItem('alertas_vistas', String(alertas.length));
      setAlertasNoLeidas(0);
      navigation.setOptions({
        tabBarBadge: undefined,
      });
      
      await enviarNotificacionLocal(
        'Alertas marcadas como leídas',
        'Todas las alertas han sido marcadas como leídas'
      );
    } catch (error) {
      console.log('Error marcando alertas como leídas', error);
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
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.primary]} />
        }
      >
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Text style={[styles.title, { color: theme.text }]}>Alertas</Text>
            {alertasNoLeidas > 0 && (
              <TouchableOpacity style={styles.marcarLeidasBtn} onPress={marcarComoLeidas}>
                <Text style={styles.marcarLeidasText}>Marcar como leídas</Text>
              </TouchableOpacity>
            )}
          </View>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {alertas.length} alerta{alertas.length !== 1 ? 's' : ''} activa{alertas.length !== 1 ? 's' : ''}
            {alertasNoLeidas > 0 && ` (${alertasNoLeidas} nueva${alertasNoLeidas !== 1 ? 's' : ''})`}
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
          alertas.map((alerta, index) => (
            <View
              key={alerta.id}
              style={[styles.alertCard, {
                backgroundColor: theme.card,
                borderColor: theme.border,
                borderLeftColor: getNivelColor(alerta.nivel)
              }]}
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

              {alerta.recorridoDesde && alerta.limite && (
                <View style={[styles.progressContainer, { backgroundColor: theme.border }]}>
                  <View style={[styles.progressBar, {
                    backgroundColor: getNivelColor(alerta.nivel),
                    width: `${Math.min((alerta.recorridoDesde / alerta.limite) * 100, 100)}%`
                  }]} />
                </View>
              )}

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
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  title: { fontSize: 24, fontWeight: 'bold' },
  subtitle: { fontSize: 14, marginTop: 4 },
  marcarLeidasBtn: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#2196F3', borderRadius: 20 },
  marcarLeidasText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  emptyContainer: { alignItems: 'center', paddingTop: 80, padding: 32 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 16 },
  emptyText: { fontSize: 15, marginTop: 8, textAlign: 'center' },
  alertCard: { marginHorizontal: 24, marginBottom: 16, borderRadius: 16, padding: 16, borderWidth: 1, borderLeftWidth: 4 },
  alertHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  nivelBadge: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
  nivelText: { fontSize: 12, fontWeight: 'bold' },
  alertTipo: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  alertVehiculo: { fontSize: 13, fontWeight: '600', marginBottom: 4 },
  alertMensaje: { fontSize: 13, marginBottom: 12 },
  progressContainer: { height: 6, borderRadius: 3, marginBottom: 12, overflow: 'hidden' },
  progressBar: { height: '100%', borderRadius: 3 },
  actionButton: { borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10, alignSelf: 'flex-start' },
  actionButtonText: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
});