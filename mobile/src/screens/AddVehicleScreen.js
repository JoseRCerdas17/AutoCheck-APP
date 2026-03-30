import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, ScrollView,
  KeyboardAvoidingView, Platform
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { convertirAKm } from '../utils/unidades';
import api from '../services/api';

export default function AddVehicleScreen({ navigation }) {
  const { theme } = useTheme();
  const scrollRef = useRef(null);

  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [year, setYear] = useState('');
  const [placa, setPlaca] = useState('');
  const [kilometraje, setKilometraje] = useState('');
  const [combustible, setCombustible] = useState('Gasolina');
  const [unidad, setUnidad] = useState('km');
  const [loading, setLoading] = useState(false);

  const combustibles = ['Gasolina', 'Diesel', 'Híbrido', 'Eléctrico'];

  const handleFocus = () => {
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 300);
  };

  const handleGuardar = async () => {
    if (!marca || !modelo) {
      Alert.alert('Error', 'La marca y el modelo son obligatorios');
      return;
    }

    if (year && (isNaN(parseInt(year)) || year.length !== 4)) {
      Alert.alert('Error', 'El año debe ser válido (ej: 2020)');
      return;
    }

    if (kilometraje && isNaN(parseFloat(kilometraje))) {
      Alert.alert('Error', 'El kilometraje debe ser un número válido');
      return;
    }

    setLoading(true);
    try {
      const userId = await AsyncStorage.getItem('userId');
      const kmGuardar = kilometraje ? convertirAKm(parseFloat(kilometraje), unidad) : 0;

      await api.post(`/vehicles/${userId}`, {
        marca,
        modelo,
        anio: year ? parseInt(year) : null,
        placa: placa || null,
        kilometraje: kmGuardar,
        combustible,
        unidad,
      });

      Alert.alert('¡Éxito!', 'Vehículo agregado correctamente', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Error al agregar vehículo:', error);
      Alert.alert('Error', 'No se pudo agregar el vehículo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.inner}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
          <Text style={[styles.backText, { color: theme.text }]}>Agregar Vehículo</Text>
        </TouchableOpacity>

        {/* Marca */}
        <Text style={[styles.label, { color: theme.textSecondary }]}>Marca *</Text>
        <View style={[styles.inputContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <MaterialIcons name="directions-car" size={20} color={theme.textSecondary} style={styles.icon} />
          <TextInput
            style={[styles.input, { color: theme.text }]}
            placeholder="Ej. Toyota, Honda, etc."
            placeholderTextColor={theme.textSecondary}
            value={marca}
            onChangeText={setMarca}
            onFocus={handleFocus}
          />
        </View>

        {/* Modelo */}
        <Text style={[styles.label, { color: theme.textSecondary }]}>Modelo *</Text>
        <View style={[styles.inputContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <MaterialIcons name="model-training" size={20} color={theme.textSecondary} style={styles.icon} />
          <TextInput
            style={[styles.input, { color: theme.text }]}
            placeholder="Ej. Corolla, Civic, etc."
            placeholderTextColor={theme.textSecondary}
            value={modelo}
            onChangeText={setModelo}
            onFocus={handleFocus}
          />
        </View>

        {/* Año */}
        <Text style={[styles.label, { color: theme.textSecondary }]}>Año</Text>
        <View style={[styles.inputContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <MaterialIcons name="calendar-today" size={20} color={theme.textSecondary} style={styles.icon} />
          <TextInput
            style={[styles.input, { color: theme.text }]}
            placeholder="Ej. 2020"
            placeholderTextColor={theme.textSecondary}
            value={year}
            onChangeText={setYear}
            keyboardType="numeric"
            maxLength={4}
            onFocus={handleFocus}
          />
        </View>

        {/* Placa */}
        <Text style={[styles.label, { color: theme.textSecondary }]}>Placa</Text>
        <View style={[styles.inputContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <MaterialIcons name="badge" size={20} color={theme.textSecondary} style={styles.icon} />
          <TextInput
            style={[styles.input, { color: theme.text }]}
            placeholder="Ej. ABC-123"
            placeholderTextColor={theme.textSecondary}
            value={placa}
            onChangeText={setPlaca}
            onFocus={handleFocus}
          />
        </View>

        {/* Combustible */}
        <Text style={[styles.label, { color: theme.textSecondary }]}>Combustible</Text>
        <View style={styles.combustiblesContainer}>
          {combustibles.map((c) => (
            <TouchableOpacity
              key={c}
              style={[styles.combustibleButton, {
                backgroundColor: combustible === c ? theme.primary : theme.card,
                borderColor: theme.border,
              }]}
              onPress={() => setCombustible(c)}
            >
              <Text style={[styles.combustibleButtonText, { color: combustible === c ? '#fff' : theme.text }]}>
                {c}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Unidad de medida */}
        <Text style={[styles.label, { color: theme.textSecondary }]}>Unidad de medida</Text>
        <View style={styles.unidadesContainer}>
          <TouchableOpacity
            style={[styles.unidadButton, {
              backgroundColor: unidad === 'km' ? theme.primary : theme.card,
              borderColor: theme.border,
            }]}
            onPress={() => setUnidad('km')}
          >
            <Text style={[styles.unidadButtonText, { color: unidad === 'km' ? '#fff' : theme.text }]}>
              Kilómetros (km)
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.unidadButton, {
              backgroundColor: unidad === 'mi' ? theme.primary : theme.card,
              borderColor: theme.border,
            }]}
            onPress={() => setUnidad('mi')}
          >
            <Text style={[styles.unidadButtonText, { color: unidad === 'mi' ? '#fff' : theme.text }]}>
              Millas (mi)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Kilometraje inicial */}
        <Text style={[styles.label, { color: theme.textSecondary }]}>
          Recorrido actual ({unidad})
        </Text>
        <View style={[styles.inputContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <MaterialIcons name="speed" size={20} color={theme.textSecondary} style={styles.icon} />
          <TextInput
            style={[styles.input, { color: theme.text }]}
            placeholder={unidad === 'mi' ? 'Ej. 31000' : 'Ej. 50000'}
            placeholderTextColor={theme.textSecondary}
            value={kilometraje}
            onChangeText={setKilometraje}
            keyboardType="numeric"
            onFocus={handleFocus}
          />
          <Text style={[styles.unidadLabel, { color: theme.textSecondary }]}>{unidad}</Text>
        </View>
        {unidad === 'mi' && kilometraje ? (
          <Text style={[styles.conversionText, { color: theme.textSecondary }]}>
            ≈ {convertirAKm(parseFloat(kilometraje), 'mi').toLocaleString()} km
          </Text>
        ) : null}

        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.primary }]}
          onPress={handleGuardar}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Agregar Vehículo</Text>}
        </TouchableOpacity>

        <View style={{ height: 80 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { padding: 24, paddingTop: 60 },
  backButton: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  backText: { fontSize: 20, fontWeight: 'bold', marginLeft: 8 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 8, marginTop: 16 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, marginBottom: 4 },
  icon: { marginRight: 8 },
  input: { flex: 1, paddingVertical: 14, fontSize: 15 },
  unidadLabel: { fontSize: 13 },
  combustiblesContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  combustibleButton: { borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, borderWidth: 1 },
  combustibleButtonText: { fontSize: 13, fontWeight: '600' },
  unidadesContainer: { flexDirection: 'row', gap: 12, marginTop: 4 },
  unidadButton: { flex: 1, borderRadius: 10, paddingVertical: 12, alignItems: 'center', borderWidth: 1 },
  unidadButtonText: { fontSize: 14, fontWeight: '600' },
  conversionText: { fontSize: 12, marginBottom: 8, marginLeft: 4, fontStyle: 'italic' },
  button: { borderRadius: 10, padding: 16, alignItems: 'center', marginTop: 32, marginBottom: 32 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
