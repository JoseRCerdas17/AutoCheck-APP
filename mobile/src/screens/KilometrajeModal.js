import React, { useState } from 'react';
import {
  View, Text, Modal, TouchableOpacity,
  StyleSheet, TextInput, FlatList, Alert
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { formatRecorrido, convertirAKm } from '../utils/unidades';
import api from '../services/api';

export default function KilometrajeModal({ visible, vehiculos, onClose }) {
  const { theme } = useTheme();
  const [step, setStep] = useState(vehiculos.length > 1 ? 'seleccionar' : 'kilometraje');
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState(
    vehiculos.length === 1 ? vehiculos[0] : null
  );
  const [recorrido, setRecorrido] = useState('');
  const [loading, setLoading] = useState(false);

  const unidad = vehiculoSeleccionado?.unidad || 'km';

  const handleSeleccionar = (vehiculo) => {
    setVehiculoSeleccionado(vehiculo);
    setStep('kilometraje');
    setRecorrido('');
  };

  const handleGuardar = async () => {
    if (!recorrido || isNaN(parseInt(recorrido))) {
      Alert.alert('Error', `Por favor ingresá un recorrido válido en ${unidad}`);
      return;
    }

    // Convertir a km para comparar y guardar
    const kmNuevo = convertirAKm(recorrido, unidad);
    const kmActual = vehiculoSeleccionado.kilometraje;

    if (kmNuevo < kmActual) {
      const recorridoActualMostrado = formatRecorrido(kmActual, unidad);
      Alert.alert('Error', `El nuevo recorrido debe ser mayor al actual (${recorridoActualMostrado})`);
      return;
    }

    setLoading(true);
    try {
      await api.put(`/vehicles/${vehiculoSeleccionado.id}`, {
        kilometraje: kmNuevo,
      });
      Alert.alert(
        '✅ Actualizado',
        `Recorrido actualizado a ${recorrido} ${unidad}`,
        [{ text: 'OK', onPress: onClose }]
      );
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'No se pudo actualizar el recorrido');
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
                Seleccioná el vehículo para actualizar su recorrido
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
                        {item.anio} • {item.placa} • {formatRecorrido(item.kilometraje, item.unidad || 'km')}
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
                <Text style={[styles.title, { color: theme.text }]}>Actualizar Recorrido</Text>
              </View>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                {vehiculoSeleccionado?.marca} {vehiculoSeleccionado?.modelo} — {vehiculoSeleccionado?.placa}
              </Text>
              <Text style={[styles.kmActual, { color: theme.textSecondary }]}>
                Recorrido actual:{' '}
                <Text style={{ color: theme.accent }}>
                  {formatRecorrido(vehiculoSeleccionado?.kilometraje, unidad)}
                </Text>
              </Text>

              <View style={[styles.inputContainer, { backgroundColor: theme.background, borderColor: theme.border }]}>
                <MaterialIcons name="speed" size={20} color={theme.textSecondary} style={{ marginRight: 8 }} />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder={`Nuevo recorrido en ${unidad}`}
                  placeholderTextColor={theme.textSecondary}
                  value={recorrido}
                  onChangeText={setRecorrido}
                  keyboardType="numeric"
                  autoFocus
                />
                <Text style={[styles.unidadLabel, { color: theme.textSecondary }]}>{unidad}</Text>
              </View>

              {unidad === 'mi' && recorrido ? (
                <Text style={[styles.conversionText, { color: theme.textSecondary }]}>
                  ≈ {convertirAKm(recorrido, 'mi').toLocaleString()} km
                </Text>
              ) : null}

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
                <TouchableOpacity onPress={() => { setStep('seleccionar'); setRecorrido(''); }}>
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
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, marginBottom: 8 },
  input: { flex: 1, paddingVertical: 14, fontSize: 16 },
  unidadLabel: { fontSize: 13 },
  conversionText: { fontSize: 12, marginBottom: 12, fontStyle: 'italic' },
  botones: { flexDirection: 'row', gap: 12, marginTop: 8 },
  botonSecundario: { flex: 1, borderWidth: 1, borderRadius: 10, padding: 14, alignItems: 'center' },
  botonSecundarioText: { fontSize: 15 },
  botonPrimario: { flex: 1, borderRadius: 10, padding: 14, alignItems: 'center' },
  botonPrimarioText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  skipButton: { alignItems: 'center', marginTop: 12 },
  skipText: { fontSize: 14 },
});