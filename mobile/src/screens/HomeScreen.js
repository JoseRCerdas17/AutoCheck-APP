import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert, Image
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { getBrandColor } from '../theme/carBrands';
import { generarAlertas, calcularProximosMantenimientos, formatRecorrido } from '../utils/unidades';
import api from '../services/api';
import KilometrajeModal from './KilometrajeModal';

export default function HomeScreen({ navigation }) {
  const [nombre, setNombre] = useState('');
  const [vehiculos, setVehiculos] = useState([]);
  const [resumen, setResumen] = useState(null);
  const [alertas, setAlertas] = useState([]);
  const [proximosMantenimientos, setProximosMantenimientos] = useState([]);
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

          // Calcular alertas y próximos mantenimientos
          let todasAlertas = [];
          let todosMantenimientos = {};

          for (const v of res.data) {
            const resMant = await api.get(`/maintenance/${v.id}`);
            todosMantenimientos[v.id] = resMant.data;
            const alertasVehiculo = generarAlertas(v, resMant.data);
            todasAlertas = [...todasAlertas, ...alertasVehiculo];
          }

          todasAlertas.sort((a, b) => {
            const orden = { alto: 0, medio: 1, bajo: 2 };
            return orden[a.nivel] - orden[b.nivel];
          });
          setAlertas(todasAlertas.slice(0, 3));

          // Próximos mantenimientos del primer vehículo
          if (res.data.length > 0) {
            const primerVehiculo = res.data[0];
            const proximos = calcularProximosMantenimientos(
              primerVehiculo,
              todosMantenimientos[primerVehiculo.id] || []
            );
            setProximosMantenimientos(proximos.slice(0, 3));
          }

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

  const getNivelColor = (nivel) => {
    if (nivel === 'alto') return '#FF5252';
    if (nivel === 'medio') return '#FF9800';
    return '#29B6F6';
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
        <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
          <View style={styles.headerTop}>
            <View>
              <Text style={[styles.greeting, { color: theme.text }]}>Hola, {nombre} 👋</Text>
              <Text style={[styles.subGreeting, { color: theme.textSecondary }]}>Bienvenido a AutoCheck</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={[styles.avatarBtn, { backgroundColor: theme.primary }]}>
              <Text style={styles.avatarText}>
                {nombre ? nombre.charAt(0).toUpperCase() : 'U'}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.headerStats}>
            <View style={styles.headerStat}>
              <Text style={[styles.headerStatNumber, { color: theme.primary }]}>{vehiculos.length}</Text>
              <Text style={[styles.headerStatLabel, { color: theme.textSecondary }]}>Vehículos</Text>
            </View>
            <View style={[styles.headerDivider, { backgroundColor: theme.border }]} />
            <View style={styles.headerStat}>
              <Text style={[styles.headerStatNumber, { color: theme.primary }]}>
                {resumen?.totalMantenimientos || 0}
              </Text>
              <Text style={[styles.headerStatLabel, { color: theme.textSecondary }]}>Servicios</Text>
            </View>
            <View style={[styles.headerDivider, { backgroundColor: theme.border }]} />
            <View style={styles.headerStat}>
              <Text style={[styles.headerStatNumber, { color: '#FF5252' }]}>
                {alertas.length}
              </Text>
              <Text style={[styles.headerStatLabel, { color: theme.textSecondary }]}>Alertas</Text>
            </View>
          </View>
        </View>

        {/* Alertas */}
        {alertas.length > 0 && (
          <>
            <View style={styles.sectionRow}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Alertas</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Alertas')}>
                <Text style={[styles.verTodas, { color: theme.primary }]}>Ver todas →</Text>
              </TouchableOpacity>
            </View>
            {alertas.map((alerta) => (
              <View
                key={alerta.id}
                style={[styles.alertaCard, {
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                  borderLeftColor: getNivelColor(alerta.nivel)
                }]}
              >
                <View style={[styles.alertaDot, { backgroundColor: getNivelColor(alerta.nivel) }]} />
                <View style={styles.alertaInfo}>
                  <Text style={[styles.alertaTipo, { color: theme.text }]}>{alerta.tipo}</Text>
                  <Text style={[styles.alertaMensaje, { color: theme.textSecondary }]}>
                    {alerta.vehiculo} • {alerta.mensaje}
                  </Text>
                </View>
                <View style={[styles.alertaNivel, { backgroundColor: getNivelColor(alerta.nivel) + '20' }]}>
                  <Text style={[styles.alertaNivelText, { color: getNivelColor(alerta.nivel) }]}>
                    {alerta.nivel === 'alto' ? 'Urgente' : 'Atención'}
                  </Text>
                </View>
              </View>
            ))}
          </>
        )}

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
                  {v.imagen ? (
                    <Image source={{ uri: v.imagen }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                  ) : (
                    <Text style={styles.vehicleInitial}>
                      {v.marca ? v.marca.charAt(0).toUpperCase() : '?'}
                    </Text>
                  )}
                </View>
                <View style={styles.vehicleInfo}>
                  <Text style={[styles.vehicleName, { color: theme.text }]}>{v.marca} {v.modelo}</Text>
                  <Text style={[styles.vehicleDetail, { color: theme.textSecondary }]}>{v.anio} • {v.placa}</Text>
                  <Text style={[styles.vehicleKm, { color: theme.accent }]}>{formatRecorrido(v.kilometraje, v.unidad)}</Text>
                </View>
                <TouchableOpacity
                  style={[styles.deleteButton, { borderColor: '#FF5252' }]}
                  onPress={() => handleDelete(v.id)}
                >
                  <Ionicons name="trash-outline" size={16} color="#FF5252" />
                  <Text style={[styles.deleteText, { color: '#FF5252' }]}>Eliminar</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}

        {/* Próximos Mantenimientos */}
        {proximosMantenimientos.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Próximos Mantenimientos</Text>
            {proximosMantenimientos.map((m, i) => (
              <View key={i} style={[styles.proximoCard, {
                backgroundColor: theme.card,
                borderColor: m.vencido ? '#FF5252' : m.urgente ? '#FF9800' : theme.border,
                borderLeftColor: m.vencido ? '#FF5252' : m.urgente ? '#FF9800' : '#4CAF50',
              }]}>
                <View style={styles.proximoHeader}>
                  <Text style={[styles.proximoTipo, { color: theme.text }]}>{m.tipo}</Text>
                  {m.vencido ? (
                    <View style={[styles.proximoBadge, { backgroundColor: '#FF525220' }]}>
                      <Text style={[styles.proximoBadgeText, { color: '#FF5252' }]}>Vencido</Text>
                    </View>
                  ) : m.urgente ? (
                    <View style={[styles.proximoBadge, { backgroundColor: '#FF980020' }]}>
                      <Text style={[styles.proximoBadgeText, { color: '#FF9800' }]}>Pronto</Text>
                    </View>
                  ) : (
                    <View style={[styles.proximoBadge, { backgroundColor: '#4CAF5020' }]}>
                      <Text style={[styles.proximoBadgeText, { color: '#4CAF50' }]}>OK</Text>
                    </View>
                  )}
                </View>
                <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
                  <View style={[styles.progressFill, {
                    width: `${m.porcentaje}%`,
                    backgroundColor: m.vencido ? '#FF5252' : m.urgente ? '#FF9800' : '#4CAF50',
                  }]} />
                </View>
                <Text style={[styles.proximoFaltante, { color: theme.textSecondary }]}>
                  {m.vencido
                    ? 'Mantenimiento vencido'
                    : `Faltan ${m.recorridoFaltante.toLocaleString()} ${m.unidad}`
                  }
                </Text>
              </View>
            ))}
          </>
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
            style={[styles.quickAccessCard, { backgroundColor: '#5B2EE8' }]}
            onPress={() => navigation.navigate('AddMaintenance')}
          >
            <MaterialIcons name="build" size={28} color="#fff" />
            <Text style={styles.quickAccessCardText}>Agregar{'\n'}Mantenimiento</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickAccessCard, { backgroundColor: '#FF5252' }]}
            onPress={() => navigation.navigate('Alertas')}
          >
            <MaterialIcons name="notifications" size={28} color="#fff" />
            <Text style={styles.quickAccessCardText}>Ver{'\n'}Alertas</Text>
            {alertas.length > 0 && (
              <View style={styles.quickAccessBadge}>
                <Text style={styles.quickAccessBadgeText}>{alertas.length}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickAccessCard, { backgroundColor: '#29B6F6' }]}
            onPress={() => navigation.navigate('Reportes')}
          >
            <MaterialIcons name="bar-chart" size={28} color="#fff" />
            <Text style={styles.quickAccessCardText}>Ver{'\n'}Reportes</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickAccessCard, { backgroundColor: '#4CAF50' }]}
            onPress={() => navigation.navigate('Documentos')}
          >
            <MaterialIcons name="folder" size={28} color="#fff" />
            <Text style={styles.quickAccessCardText}>Mis{'\n'}Documentos</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 20, borderBottomWidth: 1 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greeting: { fontSize: 22, fontWeight: 'bold' },
  subGreeting: { fontSize: 13, marginTop: 2 },
  avatarBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  headerStats: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  headerStat: { alignItems: 'center', flex: 1 },
  headerStatNumber: { fontSize: 22, fontWeight: 'bold' },
  headerStatLabel: { fontSize: 12, marginTop: 2 },
  headerDivider: { width: 1, height: 30 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, marginBottom: 12, marginTop: 8 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', paddingHorizontal: 24, marginBottom: 12, marginTop: 8 },
  verTodas: { fontSize: 13, fontWeight: '600' },
  alertaCard: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 24, marginBottom: 8, borderRadius: 12, padding: 14, borderWidth: 1, borderLeftWidth: 4 },
  alertaDot: { width: 8, height: 8, borderRadius: 4, marginRight: 12 },
  alertaInfo: { flex: 1 },
  alertaTipo: { fontSize: 14, fontWeight: 'bold' },
  alertaMensaje: { fontSize: 12, marginTop: 2 },
  alertaNivel: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, marginLeft: 8 },
  alertaNivelText: { fontSize: 11, fontWeight: 'bold' },
  emptyCard: { margin: 24, borderRadius: 16, padding: 32, alignItems: 'center', borderWidth: 1 },
  emptyText: { marginTop: 12, marginBottom: 16, fontSize: 14 },
  addButton: { borderRadius: 10, paddingHorizontal: 24, paddingVertical: 12 },
  addButtonText: { color: '#fff', fontWeight: 'bold' },
  vehicleCard: { borderRadius: 16, marginLeft: 24, marginRight: 8, marginBottom: 8, width: 200, borderWidth: 1, overflow: 'hidden' },
  vehicleColorBar: { height: 80, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  vehicleInitial: { fontSize: 40, fontWeight: 'bold', color: 'rgba(255,255,255,0.9)' },
  vehicleInfo: { padding: 12 },
  vehicleName: { fontSize: 15, fontWeight: 'bold' },
  vehicleDetail: { fontSize: 13, marginTop: 4 },
  vehicleKm: { fontSize: 13, marginTop: 4 },
  deleteButton: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, margin: 12, marginTop: 0 },
  deleteText: { fontSize: 13, marginLeft: 4 },
  proximoCard: { marginHorizontal: 24, marginBottom: 10, borderRadius: 12, padding: 14, borderWidth: 1, borderLeftWidth: 4 },
  proximoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  proximoTipo: { fontSize: 14, fontWeight: 'bold', flex: 1 },
  proximoBadge: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 3 },
  proximoBadgeText: { fontSize: 11, fontWeight: 'bold' },
  progressBar: { height: 6, borderRadius: 3, marginBottom: 6, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  proximoFaltante: { fontSize: 12 },
  statsGrid: { flexDirection: 'row', paddingHorizontal: 16, gap: 12, marginBottom: 8 },
  statCard: { flex: 1, borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1 },
  statNumber: { fontSize: 18, fontWeight: 'bold', marginTop: 8 },
  statLabel: { fontSize: 12, marginTop: 4, textAlign: 'center' },
  ultimoCard: { marginHorizontal: 24, borderRadius: 16, padding: 16, borderWidth: 1, marginBottom: 8 },
  ultimoTitle: { fontSize: 12, marginBottom: 4 },
  ultimoTipo: { fontSize: 16, fontWeight: 'bold' },
  ultimoDetalle: { fontSize: 13, marginTop: 4 },
  quickAccessGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 12, marginBottom: 32 },
  quickAccessCard: { width: '46%', borderRadius: 20, padding: 20, justifyContent: 'space-between', minHeight: 110 },
  quickAccessCardText: { color: '#fff', fontSize: 14, fontWeight: 'bold', marginTop: 12 },
  quickAccessBadge: { position: 'absolute', top: 12, right: 12, backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2 },
  quickAccessBadgeText: { color: '#FF5252', fontSize: 11, fontWeight: 'bold' },
});