import React, { useState } from 'react';
import {
  View, Text, Modal, TouchableOpacity,
  StyleSheet, TextInput, FlatList, Alert
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

export default function KilometrajeModal({ visible, vehiculos, onClose }) {
  const { theme } = useTheme();
  const [step, setStep] = useState(vehiculos.length > 1 ? 'seleccionar' : 'kilometraje');
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState(
    vehiculos.length === 1 ? vehiculos[0] : null
  );
  const [kilometraje, setKilometraje] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSeleccionar = (vehiculo) => {
    setVehiculoSeleccionado(vehiculo);
    setStep('kilometraje');
  };

  const handleGuardar = async () => {
    if (!kilometraje || isNaN(parseInt(kilometraje))) {
      Alert.alert('Error', 'Por favor ingresá un kilometraje válido');
      return;
    }
    const km = parseInt(kilometraje);
    if (km < vehiculoSeleccionado.kilometraje) {
      Alert.alert('Error', 'El nuevo kilometraje debe ser mayor al actual');
      return;
    }
    setLoading(true);
    try {
      await api.put(`/vehicles/${vehiculoSeleccionado.id}/kilometraje`, {
        kilometraje: km,
      });
      Alert.alert(
        '✅ Actualizado',
        `Kilometraje actualizado a ${km} km`,
        [{ text: 'OK', onPress: onClose }]
      );
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'No se pudo actualizar el kilometraje');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: theme.card, borderColor: theme.border }]}>

          {step === 'seleccionar' ? (
            <>
              <View style={styles.header}>
                <MaterialIcons name="directions-car" size={28} color={theme.primary} />
                <Text style={[styles.title, { color: theme.text }]}>¿Cuál vehículo usaste último?</Text>
              </View>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                Seleccioná el vehículo para actualizar su kilometraje
              </Text>
              <FlatList
                data={vehiculos}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.vehiculoItem, { backgroundColor: theme.background, borderColor: theme.border }]}
                    onPress={() => handleSeleccionar(item)}
                  >
                    <MaterialIcons name="directions-car" size={24} color={theme.primary} />
                    <View style={styles.vehiculoInfo}>
                      <Text style={[styles.vehiculoNombre, { color: theme.text }]}>
                        {item.marca} {item.modelo}
                      </Text>
                      <Text style={[styles.vehiculoDetalle, { color: theme.textSecondary }]}>
                        {item.anio} • {item.placa} • {item.kilometraje} km
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
                  </TouchableOpacity>
                )}
              />
              <TouchableOpacity style={styles.skipButton} onPress={onClose}>
                <Text style={[styles.skipText, { color: theme.textSecondary }]}>Omitir por ahora</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.header}>
                <MaterialIcons name="speed" size={28} color={theme.primary} />
                <Text style={[styles.title, { color: theme.text }]}>Actualizar Kilometraje</Text>
              </View>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                {vehiculoSeleccionado?.marca} {vehiculoSeleccionado?.modelo} — {vehiculoSeleccionado?.placa}
              </Text>
              <Text style={[styles.kmActual, { color: theme.textSecondary }]}>
                Kilometraje actual: <Text style={{ color: theme.accent }}>{vehiculoSeleccionado?.kilometraje} km</Text>
              </Text>

              <View style={[styles.inputContainer, { backgroundColor: theme.background, borderColor: theme.border }]}>
                <MaterialIcons name="speed" size={20} color={theme.textSecondary} style={{ marginRight: 8 }} />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="Nuevo kilometraje"
                  placeholderTextColor={theme.textSecondary}
                  value={kilometraje}
                  onChangeText={setKilometraje}
                  keyboardType="numeric"
                  autoFocus
                />
              </View>

              <View style={styles.botones}>
                <TouchableOpacity
                  style={[styles.botonSecundario, { borderColor: theme.border }]}
                  onPress={onClose}
                >
                  <Text style={[styles.botonSecundarioText, { color: theme.textSecondary }]}>Omitir</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.botonPrimario, { backgroundColor: theme.primary }]}
                  onPress={handleGuardar}
                  disabled={loading}
                >
                  <Text style={styles.botonPrimarioText}>
                    {loading ? 'Guardando...' : 'Guardar'}
                  </Text>
                </TouchableOpacity>
              </View>

              {vehiculos.length > 1 && (
                <TouchableOpacity onPress={() => setStep('seleccionar')}>
                  <Text style={[styles.skipText, { color: theme.accent, marginTop: 12 }]}>
                    ← Cambiar vehículo
                  </Text>
                </TouchableOpacity>
              )}
            </>
          )}

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 24 },
  container: { borderRadius: 20, padding: 24, borderWidth: 1 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  title: { fontSize: 18, fontWeight: 'bold', marginLeft: 10, flex: 1 },
  subtitle: { fontSize: 14, marginBottom: 16 },
  kmActual: { fontSize: 14, marginBottom: 16 },
  vehiculoItem: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1 },
  vehiculoInfo: { flex: 1, marginLeft: 12 },
  vehiculoNombre: { fontSize: 15, fontWeight: 'bold' },
  vehiculoDetalle: { fontSize: 13, marginTop: 2 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, marginBottom: 20 },
  input: { flex: 1, paddingVertical: 14, fontSize: 16 },
  botones: { flexDirection: 'row', gap: 12 },
  botonSecundario: { flex: 1, borderWidth: 1, borderRadius: 10, padding: 14, alignItems: 'center' },
  botonSecundarioText: { fontSize: 15 },
  botonPrimario: { flex: 1, borderRadius: 10, padding: 14, alignItems: 'center' },
  botonPrimarioText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  skipButton: { alignItems: 'center', marginTop: 12 },
  skipText: { fontSize: 14 },
});