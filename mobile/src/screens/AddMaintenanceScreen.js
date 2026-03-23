import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, ScrollView
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { convertirAKm, formatRecorrido } from '../utils/unidades';
import api from '../services/api';

export default function AddMaintenanceScreen({ navigation, route }) {
  const { theme } = useTheme();
  const [vehiculos, setVehiculos] = useState([]);
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState(null);
  const [vehiculoId, setVehiculoId] = useState(route?.params?.vehiculoId || null);
  const [tipo, setTipo] = useState('');
  const [fecha, setFecha] = useState('');
  const [recorrido, setRecorrido] = useState('');
  const [costo, setCosto] = useState('');
  const [taller, setTaller] = useState('');
  const [notas, setNotas] = useState('');
  const [loading, setLoading] = useState(false);

  const tiposMantenimiento = [
    'Cambio de aceite',
    'Revisión de frenos',
    'Cambio de llantas',
    'Alineación y balanceo',
    'Cambio de filtro de aire',
    'Revisión general',
    'Cambio de batería',
    'Otro',
  ];

  useEffect(() => {
    cargarVehiculos();
  }, []);

  const cargarVehiculos = async () => {
    try {
      const id = await AsyncStorage.getItem('userId');
      const res = await api.get(`/vehicles/${id}`);
      setVehiculos(res.data);
      if (res.data.length > 0) {
        const inicial = route?.params?.vehiculoId
          ? res.data.find(v => v.id === route.params.vehiculoId) || res.data[0]
          : res.data[0];
        setVehiculoId(inicial.id);
        setVehiculoSeleccionado(inicial);
      }
    } catch (error) {
      console.log('Error cargando vehículos', error);
    }
  };

  const handleSeleccionarVehiculo = (v) => {
    setVehiculoId(v.id);
    setVehiculoSeleccionado(v);
    setRecorrido('');
  };

  const unidad = vehiculoSeleccionado?.unidad || 'km';

  const handleGuardar = async () => {
    if (!tipo || !vehiculoId) {
      Alert.alert('Error', 'El tipo de mantenimiento y el vehículo son obligatorios');
      return;
    }

    // Convertir recorrido a km para guardar en el backend
    const kmGuardar = recorrido ? convertirAKm(recorrido, unidad) : undefined;

    setLoading(true);
    try {
      await api.post('/maintenance', {
        vehiculoId,
        tipo,
        fecha: fecha || undefined,
        kilometraje: kmGuardar,
        costo: costo ? parseFloat(costo) : undefined,
        taller: taller || undefined,
        notas: notas || undefined,
      });
      Alert.alert('¡Éxito!', 'Mantenimiento registrado correctamente', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'No se pudo registrar el mantenimiento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.inner}>

        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
          <Text style={[styles.backText, { color: theme.text }]}>Registrar Mantenimiento</Text>
        </TouchableOpacity>

        {/* Selector de vehículo */}
        <Text style={[styles.label, { color: theme.textSecondary }]}>Vehículo</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.vehiculosContainer}>
          {vehiculos.map((v) => (
            <TouchableOpacity
              key={v.id}
              style={[
                styles.vehiculoTab,
                {
                  backgroundColor: vehiculoId === v.id ? theme.primary : theme.card,
                  borderColor: theme.border
                }
              ]}
              onPress={() => handleSeleccionarVehiculo(v)}
            >
              <Text style={[styles.vehiculoTabText, { color: vehiculoId === v.id ? '#fff' : theme.text }]}>
                {v.marca} {v.modelo}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Info del vehículo seleccionado */}
        {vehiculoSeleccionado && (
          <View style={[styles.vehiculoInfo, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <MaterialIcons name="speed" size={16} color={theme.primary} />
            <Text style={[styles.vehiculoInfoText, { color: theme.textSecondary }]}>
              Recorrido actual: <Text style={{ color: theme.accent, fontWeight: 'bold' }}>
                {formatRecorrido(vehiculoSeleccionado.kilometraje, unidad)}
              </Text>
            </Text>
          </View>
        )}

        {/* Tipo de mantenimiento */}
        <Text style={[styles.label, { color: theme.textSecondary }]}>Tipo de Mantenimiento *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tiposContainer}>
          {tiposMantenimiento.map((t) => (
            <TouchableOpacity
              key={t}
              style={[
                styles.tipoTab,
                {
                  backgroundColor: tipo === t ? theme.primary : theme.card,
                  borderColor: theme.border
                }
              ]}
              onPress={() => setTipo(t)}
            >
              <Text style={[styles.tipoTabText, { color: tipo === t ? '#fff' : theme.text }]}>
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Fecha */}
        <Text style={[styles.label, { color: theme.textSecondary }]}>Fecha</Text>
        <View style={[styles.inputContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <MaterialIcons name="calendar-today" size={20} color={theme.textSecondary} style={styles.icon} />
          <TextInput
            style={[styles.input, { color: theme.text }]}
            placeholder="YYYY-MM-DD (ej. 2026-03-19)"
            placeholderTextColor={theme.textSecondary}
            value={fecha}
            onChangeText={setFecha}
          />
        </View>

        {/* Recorrido en la unidad del vehículo */}
        <Text style={[styles.label, { color: theme.textSecondary }]}>
          Recorrido al momento del servicio ({unidad})
        </Text>
        <View style={[styles.inputContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <MaterialIcons name="speed" size={20} color={theme.textSecondary} style={styles.icon} />
          <TextInput
            style={[styles.input, { color: theme.text }]}
            placeholder={unidad === 'mi' ? 'Ej. 31000' : 'Ej. 50000'}
            placeholderTextColor={theme.textSecondary}
            value={recorrido}
            onChangeText={setRecorrido}
            keyboardType="numeric"
          />
          <Text style={[styles.unidadLabel, { color: theme.textSecondary }]}>{unidad}</Text>
        </View>
        {unidad === 'mi' && recorrido ? (
          <Text style={[styles.conversionText, { color: theme.textSecondary }]}>
            ≈ {convertirAKm(recorrido, 'mi').toLocaleString()} km
          </Text>
        ) : null}

        {/* Costo */}
        <Text style={[styles.label, { color: theme.textSecondary }]}>Costo (₡)</Text>
        <View style={[styles.inputContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <MaterialIcons name="attach-money" size={20} color={theme.textSecondary} style={styles.icon} />
          <TextInput
            style={[styles.input, { color: theme.text }]}
            placeholder="Ej. 25000"
            placeholderTextColor={theme.textSecondary}
            value={costo}
            onChangeText={setCosto}
            keyboardType="numeric"
          />
        </View>

        {/* Taller */}
        <Text style={[styles.label, { color: theme.textSecondary }]}>Taller</Text>
        <View style={[styles.inputContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <MaterialIcons name="build" size={20} color={theme.textSecondary} style={styles.icon} />
          <TextInput
            style={[styles.input, { color: theme.text }]}
            placeholder="Nombre del taller"
            placeholderTextColor={theme.textSecondary}
            value={taller}
            onChangeText={setTaller}
          />
        </View>

        {/* Notas */}
        <Text style={[styles.label, { color: theme.textSecondary }]}>Notas</Text>
        <View style={[styles.inputContainerMulti, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <TextInput
            style={[styles.inputMulti, { color: theme.text }]}
            placeholder="Observaciones adicionales..."
            placeholderTextColor={theme.textSecondary}
            value={notas}
            onChangeText={setNotas}
            multiline
            numberOfLines={3}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.primary }]}
          onPress={handleGuardar}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Guardar Mantenimiento</Text>
          )}
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { padding: 24, paddingTop: 60 },
  backButton: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  backText: { fontSize: 20, fontWeight: 'bold', marginLeft: 8 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 8, marginTop: 16 },
  vehiculosContainer: { maxHeight: 50, marginBottom: 8 },
  vehiculoTab: { borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, marginRight: 8, borderWidth: 1 },
  vehiculoTabText: { fontSize: 13, fontWeight: '600' },
  vehiculoInfo: { flexDirection: 'row', alignItems: 'center', borderRadius: 10, padding: 10, borderWidth: 1, marginBottom: 4, gap: 8 },
  vehiculoInfoText: { fontSize: 13 },
  tiposContainer: { maxHeight: 50, marginBottom: 8 },
  tipoTab: { borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, marginRight: 8, borderWidth: 1 },
  tipoTabText: { fontSize: 13 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, marginBottom: 4 },
  icon: { marginRight: 8 },
  input: { flex: 1, paddingVertical: 14, fontSize: 15 },
  unidadLabel: { fontSize: 13 },
  conversionText: { fontSize: 12, marginBottom: 8, marginLeft: 4, fontStyle: 'italic' },
  inputContainerMulti: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 4 },
  inputMulti: { fontSize: 15, minHeight: 80, textAlignVertical: 'top' },
  button: { borderRadius: 10, padding: 16, alignItems: 'center', marginTop: 24, marginBottom: 32 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});