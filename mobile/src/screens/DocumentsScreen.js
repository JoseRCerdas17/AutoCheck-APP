import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, ActivityIndicator, Image, RefreshControl
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import { enviarNotificacionLocal } from '../services/notifications';

const TIPOS_DOCUMENTO = [
  { id: 'riteve', label: 'RITEVE', icono: 'verified', color: '#4CAF50' },
  { id: 'seguro', label: 'Seguro', icono: 'security', color: '#2196F3' },
  { id: 'marchamo', label: 'Marchamo', icono: 'receipt', color: '#FF9800' },
  { id: 'licencia', label: 'Licencia', icono: 'badge', color: '#9C27B0' },
  { id: 'factura', label: 'Factura', icono: 'description', color: '#E91E63' },
  { id: 'otro', label: 'Otro', icono: 'folder', color: '#607D8B' },
];

export default function DocumentsScreen() {
  const { theme } = useTheme();
  const [vehiculos, setVehiculos] = useState([]);
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState(null);
  const [documentos, setDocumentos] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    cargarVehiculos();
  }, []);

  const cargarVehiculos = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        setLoading(false);
        return;
      }
      const res = await api.get(`/vehicles/${userId}`);
      setVehiculos(res.data);
      if (res.data.length > 0) {
        setVehiculoSeleccionado(res.data[0]);
        await cargarDocumentos(res.data[0].id);
      }
    } catch (error) {
      console.log('Error cargando vehículos', error);
      Alert.alert('Error', 'No se pudieron cargar los vehículos');
    } finally {
      setLoading(false);
    }
  };

  const cargarDocumentos = async (vehiculoId) => {
    try {
      const res = await api.get(`/documents/${vehiculoId}`);
      const docsMap = {};
      for (const doc of res.data) {
        docsMap[doc.type] = {
          id: doc.id,
          imagen: doc.fileUrl,
          fecha: doc.expirationDate || new Date().toLocaleDateString('es-CR'),
          label: TIPOS_DOCUMENTO.find(t => t.id === doc.type)?.label || doc.type,
        };
      }
      setDocumentos(docsMap);
    } catch (error) {
      console.log('Error cargando documentos', error);
      if (error.response?.status !== 404) {
        Alert.alert('Error', 'No se pudieron cargar los documentos');
      }
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (vehiculoSeleccionado) {
      await cargarDocumentos(vehiculoSeleccionado.id);
    }
    setRefreshing(false);
  }, [vehiculoSeleccionado]);

  const seleccionarVehiculo = async (vehiculo) => {
    setVehiculoSeleccionado(vehiculo);
    await cargarDocumentos(vehiculo.id);
  };

  const pickImage = async (tipo, useCamera) => {
    if (uploading) {
      Alert.alert('Espera', 'Ya hay una operación en curso');
      return;
    }

    try {
      let result;
      if (useCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permiso denegado', 'Necesitamos acceso a tu cámara');
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          base64: true,
          quality: 0.7,
        });
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permiso denegado', 'Necesitamos acceso a tu galería para subir documentos');
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          base64: true,
          quality: 0.7,
        });
      }

      if (!result.canceled && result.assets[0]) {
        setUploading(true);
        const imagen = `data:image/jpeg;base64,${result.assets[0].base64}`;
        const fecha = new Date().toLocaleDateString('es-CR');

        // Si ya existe un documento de este tipo, actualizarlo
        let res;
        if (documentos[tipo.id]?.id) {
          res = await api.put(`/documents/${documentos[tipo.id].id}`, {
            type: tipo.id,
            vehicleId: vehiculoSeleccionado.id,
            fileUrl: imagen,
            expirationDate: fecha,
          });
        } else {
          res = await api.post('/documents', {
            type: tipo.id,
            vehicleId: vehiculoSeleccionado.id,
            fileUrl: imagen,
            expirationDate: fecha,
          });
        }

        setDocumentos(prev => ({
          ...prev,
          [tipo.id]: {
            id: res.data.id,
            imagen,
            fecha,
            label: tipo.label,
          }
        }));

        // Notificación local de éxito
        await enviarNotificacionLocal(
          'Documento guardado',
          `${tipo.label} de ${vehiculoSeleccionado.placa} guardado correctamente`
        );

        Alert.alert('Guardado', `${tipo.label} guardado correctamente`);
      }
    } catch (error) {
      console.log('Error subiendo imagen', error);
      Alert.alert('Error', error.response?.data?.message || 'No se pudo subir el documento');
    } finally {
      setUploading(false);
    }
  };

  const handleSubirDocumento = async (tipo) => {
    Alert.alert(
      `Subir ${tipo.label}`,
      '¿De dónde querés subir el documento?',
      [
        {
          text: 'Galería',
          onPress: async () => await pickImage(tipo, false),
        },
        {
          text: 'Cámara',
          onPress: async () => await pickImage(tipo, true),
        },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  const handleEliminar = (tipo) => {
    Alert.alert(
      'Eliminar documento',
      `¿Estás seguro que querés eliminar ${tipo.label}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              setUploading(true);
              await api.delete(`/documents/${documentos[tipo.id].id}`);
              setDocumentos(prev => {
                const nuevos = { ...prev };
                delete nuevos[tipo.id];
                return nuevos;
              });
              
              await enviarNotificacionLocal(
                'Documento eliminado',
                `${tipo.label} de ${vehiculoSeleccionado.placa} fue eliminado`
              );
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar el documento');
            } finally {
              setUploading(false);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (vehiculos.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: theme.background }]}>
        <MaterialIcons name="directions-car" size={64} color={theme.textSecondary} />
        <Text style={[styles.emptyTitle, { color: theme.text }]}>Sin vehículos</Text>
        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
          Agregá un vehículo para comenzar a guardar documentos
        </Text>
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
          <Text style={[styles.title, { color: theme.text }]}>Documentación</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Guardá los documentos de tus vehículos
          </Text>
        </View>

        {/* Selector de vehículo */}
        {vehiculos.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.vehiculosContainer}>
            {vehiculos.map((v) => (
              <TouchableOpacity
                key={v.id}
                style={[
                  styles.vehiculoTab,
                  {
                    backgroundColor: vehiculoSeleccionado?.id === v.id ? theme.primary : theme.card,
                    borderColor: theme.border
                  }
                ]}
                onPress={() => seleccionarVehiculo(v)}
              >
                <Text style={[
                  styles.vehiculoTabText,
                  { color: vehiculoSeleccionado?.id === v.id ? '#fff' : theme.text }
                ]}>
                  {v.marca} {v.modelo}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Vehículo seleccionado */}
        {vehiculoSeleccionado && (
          <View style={[styles.vehiculoInfo, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <MaterialIcons name="directions-car" size={18} color={theme.primary} />
            <Text style={[styles.vehiculoNombre, { color: theme.text }]}>
              {vehiculoSeleccionado.marca} {vehiculoSeleccionado.modelo} {vehiculoSeleccionado.anio}
            </Text>
            <Text style={[styles.vehiculoPlaca, { color: theme.textSecondary }]}>
              {vehiculoSeleccionado.placa}
            </Text>
          </View>
        )}

        {/* Grid de documentos */}
        <View style={styles.grid}>
          {TIPOS_DOCUMENTO.map((tipo) => {
            const doc = documentos[tipo.id];
            return (
              <View
                key={tipo.id}
                style={[styles.docCard, { backgroundColor: theme.card, borderColor: doc ? tipo.color : theme.border }]}
              >
                {doc ? (
                  <>
                    <Image source={{ uri: doc.imagen }} style={styles.docImage} resizeMode="cover" />
                    <View style={styles.docOverlay}>
                      <View style={[styles.docBadge, { backgroundColor: tipo.color }]}>
                        <Text style={styles.docBadgeText}>{tipo.label}</Text>
                      </View>
                      <Text style={[styles.docFecha, { color: '#fff' }]}>{doc.fecha}</Text>
                      <View style={styles.docButtons}>
                        <TouchableOpacity
                          style={[styles.docBtn, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
                          onPress={() => handleSubirDocumento(tipo)}
                          disabled={uploading}
                        >
                          <Ionicons name="refresh" size={16} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.docBtn, { backgroundColor: 'rgba(255,82,82,0.6)' }]}
                          onPress={() => handleEliminar(tipo)}
                          disabled={uploading}
                        >
                          <Ionicons name="trash-outline" size={16} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </>
                ) : (
                  <TouchableOpacity
                    style={styles.docEmpty}
                    onPress={() => handleSubirDocumento(tipo)}
                    disabled={uploading}
                  >
                    <View style={[styles.docIconContainer, { backgroundColor: tipo.color + '20' }]}>
                      <MaterialIcons name={tipo.icono} size={28} color={tipo.color} />
                    </View>
                    <Text style={[styles.docLabel, { color: theme.text }]}>{tipo.label}</Text>
                    <Text style={[styles.docAgregar, { color: theme.textSecondary }]}>Toca para agregar</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>

        {uploading && (
          <View style={styles.uploadingOverlay}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={[styles.uploadingText, { color: theme.text }]}>Subiendo documento...</Text>
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 16 },
  emptyText: { fontSize: 15, marginTop: 8, textAlign: 'center' },
  header: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 16 },
  title: { fontSize: 24, fontWeight: 'bold' },
  subtitle: { fontSize: 14, marginTop: 4 },
  vehiculosContainer: { maxHeight: 50, paddingHorizontal: 16, marginBottom: 8 },
  vehiculoTab: { borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, marginRight: 8, borderWidth: 1 },
  vehiculoTabText: { fontSize: 13, fontWeight: '600' },
  vehiculoInfo: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 16, borderRadius: 12, padding: 12, borderWidth: 1 },
  vehiculoNombre: { fontSize: 15, fontWeight: 'bold', marginLeft: 8, flex: 1 },
  vehiculoPlaca: { fontSize: 13 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 12 },
  docCard: { width: '46%', borderRadius: 16, borderWidth: 1, overflow: 'hidden', height: 160 },
  docImage: { width: '100%', height: '100%' },
  docOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 8, backgroundColor: 'rgba(0,0,0,0.5)' },
  docBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2, alignSelf: 'flex-start', marginBottom: 4 },
  docBadgeText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  docFecha: { fontSize: 11, marginBottom: 4 },
  docButtons: { flexDirection: 'row', gap: 8 },
  docBtn: { borderRadius: 8, padding: 6 },
  docEmpty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  docIconContainer: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  docLabel: { fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
  docAgregar: { fontSize: 11, textAlign: 'center' },
  uploadingOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.7)' },
  uploadingText: { marginTop: 12, fontSize: 14, color: '#fff' },
});