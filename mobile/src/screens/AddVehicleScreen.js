import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, ScrollView, Image
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { getBrandImage } from '../theme/carBrands';
import api from '../services/api';

export default function AddVehicleScreen({ navigation }) {
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [año, setAño] = useState('');
  const [placa, setPlaca] = useState('');
  const [combustible, setCombustible] = useState('');
  const [kilometraje, setKilometraje] = useState('');
  const [imagen, setImagen] = useState(null);
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();

  const brandImage = getBrandImage(marca);
  const displayImage = imagen || brandImage;

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
      const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setImagen(base64Image);
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
      const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setImagen(base64Image);
    }
  };

  const handleImageOptions = () => {
    Alert.alert(
      'Foto del vehículo',
      '¿Cómo querés agregar la foto?',
      [
        { text: 'Tomar foto', onPress: takePhoto },
        { text: 'Elegir de galería', onPress: pickImage },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

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
        imagen: imagen || null,
      });
      Alert.alert('¡Éxito!', 'Vehículo registrado correctamente', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'No se pudo registrar el vehículo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.inner}>

        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
          <Text style={[styles.backText, { color: theme.text }]}>Registro de Vehículo</Text>
        </TouchableOpacity>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>Detalles del Vehículo</Text>

        {/* Imagen del vehículo */}
        <TouchableOpacity style={[styles.imageContainer, { backgroundColor: theme.card, borderColor: theme.border }]} onPress={handleImageOptions}>
          {displayImage ? (
            <Image source={{ uri: displayImage }} style={styles.vehicleImage} resizeMode="cover" />
          ) : (
            <View style={styles.imagePlaceholder}>
              <MaterialIcons name="directions-car" size={48} color={theme.textSecondary} />
              <Text style={[styles.imagePlaceholderText, { color: theme.textSecondary }]}>
                Tocá para agregar una foto
              </Text>
            </View>
          )}
          <View style={[styles.imageEditButton, { backgroundColor: theme.primary }]}>
            <Ionicons name="camera" size={16} color="#fff" />
          </View>
        </TouchableOpacity>

        {brandImage && !imagen && (
          <Text style={[styles.brandDetected, { color: theme.accent }]}>
            ✓ Imagen de {marca} detectada automáticamente
          </Text>
        )}

        <Text style={[styles.label, { color: theme.textSecondary }]}>Marca del Vehículo</Text>
        <View style={[styles.inputContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <MaterialIcons name="directions-car" size={20} color={theme.textSecondary} style={styles.icon} />
          <TextInput
            style={[styles.input, { color: theme.text }]}
            placeholder="Ej. Toyota"
            placeholderTextColor={theme.textSecondary}
            value={marca}
            onChangeText={setMarca}
          />
        </View>

        <Text style={[styles.label, { color: theme.textSecondary }]}>Modelo del Vehículo</Text>
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

        <Text style={[styles.label, { color: theme.textSecondary }]}>Año de Fabricación</Text>
        <View style={[styles.inputContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <MaterialIcons name="calendar-today" size={20} color={theme.textSecondary} style={styles.icon} />
          <TextInput
            style={[styles.input, { color: theme.text }]}
            placeholder="Ej. 2020"
            placeholderTextColor={theme.textSecondary}
            value={año}
            onChangeText={setAño}
            keyboardType="numeric"
          />
        </View>

        <Text style={[styles.label, { color: theme.textSecondary }]}>Placa del Vehículo</Text>
        <View style={[styles.inputContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <MaterialIcons name="credit-card" size={20} color={theme.textSecondary} style={styles.icon} />
          <TextInput
            style={[styles.input, { color: theme.text }]}
            placeholder="Ej. ABC 123"
            placeholderTextColor={theme.textSecondary}
            value={placa}
            onChangeText={setPlaca}
            autoCapitalize="characters"
          />
        </View>

        <Text style={[styles.label, { color: theme.textSecondary }]}>Tipo de Combustible</Text>
        <View style={[styles.inputContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <MaterialIcons name="local-gas-station" size={20} color={theme.textSecondary} style={styles.icon} />
          <TextInput
            style={[styles.input, { color: theme.text }]}
            placeholder="Gasolina / Diesel / Eléctrico"
            placeholderTextColor={theme.textSecondary}
            value={combustible}
            onChangeText={setCombustible}
          />
        </View>

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
        </View>

        <View style={[styles.premiumCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <MaterialIcons name="lock" size={22} color={theme.primary} />
          <View style={styles.premiumText}>
            <Text style={[styles.premiumTitle, { color: theme.text }]}>Añadir múltiples vehículos</Text>
            <Text style={[styles.premiumSubtitle, { color: theme.textSecondary }]}>Requiere membresía Premium.</Text>
          </View>
        </View>

        <TouchableOpacity style={[styles.button, { backgroundColor: theme.primary }]} onPress={handleSave} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Guardar Vehículo</Text>}
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
  sectionTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 24 },
  imageContainer: { borderRadius: 16, borderWidth: 1, marginBottom: 8, overflow: 'hidden', height: 180, justifyContent: 'center', alignItems: 'center' },
  vehicleImage: { width: '100%', height: '100%' },
  imagePlaceholder: { alignItems: 'center' },
  imagePlaceholderText: { marginTop: 8, fontSize: 14 },
  imageEditButton: { position: 'absolute', bottom: 12, right: 12, width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  brandDetected: { fontSize: 13, marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, marginBottom: 16 },
  icon: { marginRight: 8 },
  input: { flex: 1, paddingVertical: 14, fontSize: 15 },
  premiumCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 16, marginBottom: 24, borderWidth: 1 },
  premiumText: { marginLeft: 12, flex: 1 },
  premiumTitle: { fontWeight: 'bold', fontSize: 15 },
  premiumSubtitle: { fontSize: 12, marginTop: 2 },
  button: { borderRadius: 10, padding: 16, alignItems: 'center', marginBottom: 32 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});