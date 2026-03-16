import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, ScrollView
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

export default function AddVehicleScreen({ navigation }) {
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [año, setAño] = useState('');
  const [placa, setPlaca] = useState('');
  const [combustible, setCombustible] = useState('');
  const [kilometraje, setKilometraje] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!marca || !modelo || !año || !placa || !combustible || !kilometraje) {
      Alert.alert('Error', 'Por favor completá todos los campos');
      return;
    }
    setLoading(true);
    try {
      const userId = await AsyncStorage.getItem('userId');
      await api.post(`/vehicles/${userId}`, {
        marca,
        modelo,
        anio: parseInt(año),
        placa,
        combustible,
        kilometraje: parseInt(kilometraje),
      });
      Alert.alert('¡Éxito!', 'Vehículo registrado correctamente', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'No se pudo registrar el vehículo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.inner}>

        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          <Text style={styles.backText}>Registro de Vehículo</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Detalles del Vehículo</Text>

        <Text style={styles.label}>Marca del Vehículo</Text>
        <View style={styles.inputContainer}>
          <MaterialIcons name="directions-car" size={20} color="#A0A0B0" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Ej. Toyota"
            placeholderTextColor="#A0A0B0"
            value={marca}
            onChangeText={setMarca}
          />
        </View>

        <Text style={styles.label}>Modelo del Vehículo</Text>
        <View style={styles.inputContainer}>
          <MaterialIcons name="directions-car" size={20} color="#A0A0B0" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Ej. Corolla"
            placeholderTextColor="#A0A0B0"
            value={modelo}
            onChangeText={setModelo}
          />
        </View>

        <Text style={styles.label}>Año de Fabricación</Text>
        <View style={styles.inputContainer}>
          <MaterialIcons name="calendar-today" size={20} color="#A0A0B0" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Ej. 2020"
            placeholderTextColor="#A0A0B0"
            value={año}
            onChangeText={setAño}
            keyboardType="numeric"
          />
        </View>

        <Text style={styles.label}>Placa del Vehículo</Text>
        <View style={styles.inputContainer}>
          <MaterialIcons name="credit-card" size={20} color="#A0A0B0" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Ej. ABC 123"
            placeholderTextColor="#A0A0B0"
            value={placa}
            onChangeText={setPlaca}
            autoCapitalize="characters"
          />
        </View>

        <Text style={styles.label}>Tipo de Combustible</Text>
        <View style={styles.inputContainer}>
          <MaterialIcons name="local-gas-station" size={20} color="#A0A0B0" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Gasolina / Diesel / Eléctrico"
            placeholderTextColor="#A0A0B0"
            value={combustible}
            onChangeText={setCombustible}
          />
        </View>

        <Text style={styles.label}>Kilometraje Actual</Text>
        <View style={styles.inputContainer}>
          <MaterialIcons name="speed" size={20} color="#A0A0B0" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Ej. 75000"
            placeholderTextColor="#A0A0B0"
            value={kilometraje}
            onChangeText={setKilometraje}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.premiumCard}>
          <MaterialIcons name="lock" size={22} color="#5B2EE8" />
          <View style={styles.premiumText}>
            <Text style={styles.premiumTitle}>Añadir múltiples vehículos</Text>
            <Text style={styles.premiumSubtitle}>Requiere membresía Premium para desbloquear esta función.</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSave} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Guardar Vehículo</Text>}
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D1117' },
  inner: { padding: 24, paddingTop: 60 },
  backButton: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  backText: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF', marginLeft: 8 },
  sectionTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 24 },
  label: { fontSize: 13, fontWeight: '600', color: '#A0A0B0', marginBottom: 6 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: '#2A2F3E', borderRadius: 10,
    paddingHorizontal: 12, marginBottom: 16, backgroundColor: '#1A1F2E'
  },
  icon: { marginRight: 8 },
  input: { flex: 1, paddingVertical: 14, fontSize: 15, color: '#FFFFFF' },
  premiumCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1A1F2E', borderRadius: 12,
    padding: 16, marginBottom: 24, borderWidth: 1, borderColor: '#2A2F3E'
  },
  premiumText: { marginLeft: 12, flex: 1 },
  premiumTitle: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 15 },
  premiumSubtitle: { color: '#A0A0B0', fontSize: 12, marginTop: 2 },
  button: { backgroundColor: '#5B2EE8', borderRadius: 10, padding: 16, alignItems: 'center', marginBottom: 32 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});