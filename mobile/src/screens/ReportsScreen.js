import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  ActivityIndicator, Dimensions, TouchableOpacity, Alert
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BarChart, PieChart } from 'react-native-chart-kit';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { useTheme } from '../context/ThemeContext';
import { formatRecorrido } from '../utils/unidades';
import api from '../services/api';

const screenWidth = Dimensions.get('window').width;

export default function ReportsScreen() {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [mantenimientos, setMantenimientos] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const viewShotRef = useRef(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const resVehiculos = await api.get(`/vehicles/${userId}`);
      setVehiculos(resVehiculos.data);

      let todos = [];
      for (const v of resVehiculos.data) {
        const resMant = await api.get(`/maintenance/${v.id}`);
        todos = [...todos, ...resMant.data.map(m => ({
          ...m,
          vehiculo: `${v.marca} ${v.modelo}`,
          unidad: v.unidad || 'km',
        }))];
      }
      setMantenimientos(todos);
    } catch (error) {
      console.log('Error cargando datos', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompartir = async () => {
    try {
      const uri = await viewShotRef.current.capture();
      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: 'Compartir reporte AutoCheck',
      });
    } catch (error) {
      Alert.alert('Error', 'No se pudo compartir el reporte');
    }
  };

  const getGastosPorMes = () => {
    const meses = [];
    const hoy = new Date();
    for (let i = 5; i >= 0; i--) {
      const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
      const label = fecha.toLocaleString('es-CR', { month: 'short' });
      const total = mantenimientos
        .filter(m => {
          if (!m.fecha) return false;
          const f = new Date(m.fecha);
          return f.getMonth() === fecha.getMonth() && f.getFullYear() === fecha.getFullYear();
        })
        .reduce((sum, m) => sum + Number(m.costo || 0), 0);
      meses.push({ label, total });
    }
    return meses;
  };

  const getGastosPorTipo = () => {
    const tipos = {};
    mantenimientos.forEach(m => {
      const tipo = m.tipo || 'Otro';
      tipos[tipo] = (tipos[tipo] || 0) + Number(m.costo || 0);
    });
    const colores = ['#5B2EE8', '#29B6F6', '#4CAF50', '#FF9800', '#E91E63', '#9C27B0', '#00BCD4'];
    return Object.entries(tipos).map(([name, value], i) => ({
      name: name.length > 15 ? name.substring(0, 15) + '...' : name,
      value,
      color: colores[i % colores.length],
      legendFontColor: theme.text,
      legendFontSize: 12,
    }));
  };

  const getGastosPorVehiculo = () => {
    const vehiculosGastos = {};
    mantenimientos.forEach(m => {
      const v = m.vehiculo || 'Desconocido';
      vehiculosGastos[v] = (vehiculosGastos[v] || 0) + Number(m.costo || 0);
    });
    return Object.entries(vehiculosGastos);
  };

  const gastosMes = getGastosPorMes();
  const gastosTipo = getGastosPorTipo();
  const gastosVehiculo = getGastosPorVehiculo();
  const totalGastado = mantenimientos.reduce((sum, m) => sum + Number(m.costo || 0), 0);

  const chartConfig = {
    backgroundColor: theme.card,
    backgroundGradientFrom: theme.card,
    backgroundGradientTo: theme.card,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(91, 46, 232, ${opacity})`,
    labelColor: () => theme.textSecondary,
    style: { borderRadius: 16 },
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
        <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 0.9 }}>
          <View style={{ backgroundColor: theme.background }}>

            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={[styles.title, { color: theme.text }]}>Reportes</Text>
                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Análisis de tus gastos</Text>
              </View>
              <TouchableOpacity
                style={[styles.shareBtn, { backgroundColor: theme.primary }]}
                onPress={handleCompartir}
              >
                <MaterialIcons name="share" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Total general */}
            <View style={[styles.totalCard, { backgroundColor: theme.primary }]}>
              <MaterialIcons name="attach-money" size={32} color="#fff" />
              <Text style={styles.totalLabel}>Total Gastado</Text>
              <Text style={styles.totalAmount}>
                ₡{totalGastado.toLocaleString('es-CR')}
              </Text>
              <Text style={styles.totalSub}>{mantenimientos.length} mantenimientos registrados</Text>
            </View>

            {/* Gastos por vehículo */}
            {gastosVehiculo.length > 0 && (
              <>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Gastos por Vehículo</Text>
                {gastosVehiculo.map(([nombre, total], i) => (
                  <View key={i} style={[styles.vehiculoRow, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <View style={[styles.vehiculoIcon, { backgroundColor: theme.primary + '20' }]}>
                      <MaterialIcons name="directions-car" size={20} color={theme.primary} />
                    </View>
                    <Text style={[styles.vehiculoNombre, { color: theme.text }]}>{nombre}</Text>
                    <Text style={[styles.vehiculoTotal, { color: theme.primary }]}>
                      ₡{Number(total).toLocaleString('es-CR')}
                    </Text>
                  </View>
                ))}
              </>
            )}

            {/* Gráfica de barras */}
            {mantenimientos.length > 0 && (
              <>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Gastos por Mes</Text>
                <View style={[styles.chartCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                  <BarChart
                    data={{
                      labels: gastosMes.map(m => m.label),
                      datasets: [{ data: gastosMes.map(m => m.total || 0) }],
                    }}
                    width={screenWidth - 64}
                    height={200}
                    chartConfig={chartConfig}
                    style={styles.chart}
                    showValuesOnTopOfBars
                    fromZero
                  />
                </View>
              </>
            )}

            {/* Gráfica de pie */}
            {gastosTipo.length > 0 && (
              <>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Gastos por Tipo</Text>
                <View style={[styles.chartCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                  <PieChart
                    data={gastosTipo}
                    width={screenWidth - 64}
                    height={200}
                    chartConfig={chartConfig}
                    accessor="value"
                    backgroundColor="transparent"
                    paddingLeft="15"
                  />
                </View>
              </>
            )}

            {mantenimientos.length === 0 && (
              <View style={styles.emptyContainer}>
                <MaterialIcons name="bar-chart" size={64} color={theme.textSecondary} />
                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                  No hay datos para mostrar.{'\n'}Registrá mantenimientos para ver reportes.
                </Text>
              </View>
            )}

            <View style={{ height: 32 }} />
          </View>
        </ViewShot>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 60, paddingBottom: 16 },
  title: { fontSize: 24, fontWeight: 'bold' },
  subtitle: { fontSize: 14, marginTop: 4 },
  shareBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  totalCard: { marginHorizontal: 24, borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 8 },
  totalLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 8 },
  totalAmount: { color: '#fff', fontSize: 32, fontWeight: 'bold', marginTop: 4 },
  totalSub: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', paddingHorizontal: 24, marginTop: 16, marginBottom: 12 },
  vehiculoRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 24, marginBottom: 8, borderRadius: 12, padding: 14, borderWidth: 1 },
  vehiculoIcon: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  vehiculoNombre: { flex: 1, fontSize: 15, fontWeight: '600' },
  vehiculoTotal: { fontSize: 15, fontWeight: 'bold' },
  chartCard: { marginHorizontal: 24, borderRadius: 16, padding: 16, borderWidth: 1 },
  chart: { borderRadius: 12 },
  emptyContainer: { alignItems: 'center', paddingTop: 60, padding: 32 },
  emptyText: { fontSize: 15, marginTop: 16, textAlign: 'center', lineHeight: 24 },
});