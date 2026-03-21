import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, ScrollView, Image, Animated
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { getBrandColor } from '../theme/carBrands';
import api from '../services/api';

const MARCAS = ['Toyota', 'Honda', 'Nissan', 'Hyundai', 'Kia', 'Mazda', 'Ford', 'Chevrolet', 'Volkswagen', 'Suzuki', 'Mitsubishi', 'Subaru', 'BMW', 'Mercedes', 'Otra'];
const COMBUSTIBLES = ['Gasolina', 'Diesel', 'Híbrido', 'Eléctrico', 'GLP'];

export default function AddVehicleScreen({ navigation }) {
  const [marca, setMarca] = useState('');
  const [marcaCustom, setMarcaCustom] = useState('');
  const [modelo, setModelo] = useState('');
  const [año, setAño] = useState('');
  const [placa, setPlaca] = useState('');
  const [combustible, setCombustible] = useState('');
  const [kilometraje, setKilometraje] = useState('');
  const [imagen, setImagen] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const { theme } = useTheme();

  const formAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(formAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, [step]);

  const marcaFinal = marca === 'Otra' ? marcaCustom : marca;

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.5,
      base64: true,
    });
    if (!result.canceled) {
      setImagen(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tu cámara.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.5,
      base64: true,
    });
    if (!result.canceled) {
      setImagen(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  const handleImageOptions = () => {
    Alert.alert('Foto del vehículo', '¿Cómo querés agregar la foto?', [
      { text: 'Tomar foto', onPress: takePhoto },
      { text: 'Elegir de galería', onPress: pickImage },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  const handleSave = async () => {
    if (!marcaFinal || !modelo || !año || !placa || !combustible || !kilometraje) {
      Alert.alert('Error', 'Por favor completá todos los campos');
      return;
    }
    setLoading(true);
    try {
      const userId = await AsyncStorage.getItem('userId');
      await api.post(`/vehicles/${userId}`, {
        marca: marcaFinal,
        modelo,
        anio: parseInt(año),
        placa,
        combustible,
        kilometraje: parseInt(kilometraje),
        imagen: imagen || null,
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
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.inner} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
          <Text style={[styles.backText, { color: theme.text }]}>Registrar Vehículo</Text>
        </TouchableOpacity>

        {/* Imagen */}
        <TouchableOpacity
          style={[styles.imageContainer, {
            backgroundColor: marcaFinal ? getBrandColor(marcaFinal) + '30' : theme.card,
            borderColor: marcaFinal ? getBrandColor(marcaFinal) : theme.border
          }]}
          onPress={handleImageOptions}
        >
          {imagen ? (
            <Image source={{ uri: imagen }} style={styles.vehicleImage} resizeMode="cover" />
          ) : (
            <View style={styles.imagePlaceholder}>
              {marcaFinal ? (
                <View style={[styles.brandCircle, { backgroundColor: getBrandColor(marcaFinal) }]}>
                  <Text style={styles.brandInitial}>
                    {marcaFinal.charAt(0).toUpperCase()}
                  </Text>
                </View>
              ) : (
                <MaterialIcons name="directions-car" size={48} color={theme.textSecondary} />
              )}
              <Text style={[styles.imagePlaceholderText, { color: theme.textSecondary }]}>
                {marcaFinal ? `${marcaFinal} — Toca para agregar foto` : 'Toca para agregar una foto'}
              </Text>
            </View>
          )}
          <View style={[styles.imageEditButton, { backgroundColor: theme.primary }]}>
            <Ionicons name="camera" size={16} color="#fff" />
          </View>
        </TouchableOpacity>

        {/* Selector de marca */}
        <Text style={[styles.label, { color: theme.textSecondary }]}>Marca del Vehículo</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.marcasContainer}>
          {MARCAS.map((m) => (
            <TouchableOpacity
              key={m}
              style={[
                styles.marcaTab,
                {
                  backgroundColor: marca === m ? getBrandColor(m) : theme.card,
                  borderColor: marca === m ? getBrandColor(m) : theme.border
                }
              ]}
              onPress={() => setMarca(m)}
            >
              <Text style={[styles.marcaTabText, { color: marca === m ? '#fff' : theme.text }]}>{m}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {marca === 'Otra' && (
          <View style={[styles.inputContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <MaterialIcons name="directions-car" size={20} color={theme.textSecondary} style={styles.icon} />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="Escribí la marca"
              placeholderTextColor={theme.textSecondary}
              value={marcaCustom}
              onChangeText={setMarcaCustom}
            />
          </View>
        )}

        {/* Modelo */}
        <Text style={[styles.label, { color: theme.textSecondary }]}>Modelo</Text>
        <View style={[styles.inputContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <MaterialIcons name="directions-car" size={20} color={theme.textSecondary} style={styles.icon} />
          <TextInput
            style={[styles.input, { color: theme.text }]}
            placeholder="Ej. Corolla"
            placeholderTextColor={theme.textSecondary}
            value={modelo}
            onChangeText={setModelo}
          />
        </View>

        {/* Año y Placa en fila */}
        <View style={styles.row}>
          <View style={styles.rowItem}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Año</Text>
            <View style={[styles.inputContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <MaterialIcons name="calendar-today" size={20} color={theme.textSecondary} style={styles.icon} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="2020"
                placeholderTextColor={theme.textSecondary}
                value={año}
                onChangeText={setAño}
                keyboardType="numeric"
                maxLength={4}
              />
            </View>
          </View>
          <View style={styles.rowItem}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Placa</Text>
            <View style={[styles.inputContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <MaterialIcons name="credit-card" size={20} color={theme.textSecondary} style={styles.icon} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="ABC 123"
                placeholderTextColor={theme.textSecondary}
                value={placa}
                onChangeText={setPlaca}
                autoCapitalize="characters"
              />
            </View>
          </View>
        </View>

        {/* Combustible */}
        <Text style={[styles.label, { color: theme.textSecondary }]}>Combustible</Text>
        <View style={styles.combustibleGrid}>
          {COMBUSTIBLES.map((c) => (
            <TouchableOpacity
              key={c}
              style={[
                styles.combustibleBtn,
                {
                  backgroundColor: combustible === c ? theme.primary : theme.card,
                  borderColor: combustible === c ? theme.primary : theme.border
                }
              ]}
              onPress={() => setCombustible(c)}
            >
              <Text style={[styles.combustibleText, { color: combustible === c ? '#fff' : theme.text }]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Kilometraje */}
        <Text style={[styles.label, { color: theme.textSecondary }]}>Kilometraje Actual</Text>
        <View style={[styles.inputContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <MaterialIcons name="speed" size={20} color={theme.textSecondary} style={styles.icon} />
          <TextInput
            style={[styles.input, { color: theme.text }]}
            placeholder="Ej. 75000"
            placeholderTextColor={theme.textSecondary}
            value={kilometraje}
            onChangeText={setKilometraje}
            keyboardType="numeric"
          />
          <Text style={[styles.kmLabel, { color: theme.textSecondary }]}>km</Text>
        </View>

        {/* Botón */}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.primary }]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.buttonText}>Guardar Vehículo</Text>
          }
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { padding: 24, paddingTop: 60 },
  backButton: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  backText: { fontSize: 20, fontWeight: 'bold', marginLeft: 8 },
  imageContainer: { borderRadius: 16, borderWidth: 1, marginBottom: 24, overflow: 'hidden', height: 180, justifyContent: 'center', alignItems: 'center' },
  vehicleImage: { width: '100%', height: '100%' },
  imagePlaceholder: { alignItems: 'center' },
  brandCircle: { width: 70, height: 70, borderRadius: 35, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  brandInitial: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
  imagePlaceholderText: { fontSize: 13, marginTop: 8, textAlign: 'center', paddingHorizontal: 16 },
  imageEditButton: { position: 'absolute', bottom: 12, right: 12, width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
  marcasContainer: { maxHeight: 50, marginBottom: 16 },
  marcaTab: { borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, marginRight: 8, borderWidth: 1 },
  marcaTabText: { fontSize: 13, fontWeight: '600' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, marginBottom: 16 },
  icon: { marginRight: 8 },
  input: { flex: 1, paddingVertical: 14, fontSize: 15 },
  kmLabel: { fontSize: 13 },
  row: { flexDirection: 'row', gap: 12 },
  rowItem: { flex: 1 },
  combustibleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  combustibleBtn: { borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, borderWidth: 1 },
  combustibleText: { fontSize: 13, fontWeight: '600' },
  button: { borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});