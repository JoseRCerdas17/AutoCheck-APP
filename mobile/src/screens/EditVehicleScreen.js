import React, { useState, useRef } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    StyleSheet, Alert, ActivityIndicator, ScrollView,
    KeyboardAvoidingView, Platform
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { convertirAKm, formatRecorrido } from '../utils/unidades';
import api from '../services/api';

export default function EditVehicleScreen({ navigation, route }) {
    const { theme } = useTheme();
    const scrollRef = useRef(null);
    const { vehiculo } = route.params;

    // Inicializar estados con los datos del vehículo
    const [marca, setMarca] = useState(vehiculo.marca);
    const [modelo, setModelo] = useState(vehiculo.modelo);
    const [year, setYear] = useState(vehiculo.year?.toString() || '');
    const [placa, setPlaca] = useState(vehiculo.placa || '');
    const [kilometraje, setKilometraje] = useState(vehiculo.kilometraje?.toString() || '');
    const [unidad, setUnidad] = useState(vehiculo.unidad || 'km');
    const [loading, setLoading] = useState(false);

    const handleFocus = () => {
        setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
        }, 300);
    };

    const handleActualizar = async () => {
        if (!marca || !modelo) {
        Alert.alert('Error', 'La marca y el modelo son obligatorios');
        return;
        }

        if (kilometraje && isNaN(parseFloat(kilometraje))) {
        Alert.alert('Error', 'El kilometraje debe ser un número válido');
        return;
        }

        if (year && (isNaN(parseInt(year)) || year.length !== 4)) {
        Alert.alert('Error', 'El año debe ser válido (ej: 2020)');
        return;
        }

        setLoading(true);
        try {
        const datosActualizados = {
            marca,
            modelo,
            year: year ? parseInt(year) : null,
            placa: placa || null,
            kilometraje: kilometraje ? parseFloat(kilometraje) : null,
            unidad,
        };

        await api.put(`/vehicles/${vehiculo.id}`, datosActualizados);

        Alert.alert('¡Éxito!', 'Vehículo actualizado correctamente', [
            { text: 'OK', onPress: () => navigation.goBack() }
        ]);
        } catch (error) {
        console.error('Error al actualizar:', error);
        Alert.alert('Error', 'No se pudo actualizar el vehículo');
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
            <Text style={[styles.backText, { color: theme.text }]}>Editar Vehículo</Text>
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

            {/* Kilometraje */}
            <Text style={[styles.label, { color: theme.textSecondary }]}>
            Kilometraje actual ({unidad})
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

            {/* Unidad de medida */}
            <Text style={[styles.label, { color: theme.textSecondary }]}>Unidad de medida</Text>
            <View style={styles.unidadesContainer}>
            <TouchableOpacity
                style={[styles.unidadButton, {
                backgroundColor: unidad === 'km' ? theme.primary : theme.card,
                borderColor: theme.border
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
                borderColor: theme.border
                }]}
                onPress={() => setUnidad('mi')}
            >
                <Text style={[styles.unidadButtonText, { color: unidad === 'mi' ? '#fff' : theme.text }]}>
                Millas (mi)
                </Text>
            </TouchableOpacity>
            </View>

            {unidad === 'mi' && kilometraje ? (
            <Text style={[styles.conversionText, { color: theme.textSecondary }]}>
                ≈ {convertirAKm(kilometraje, 'mi').toLocaleString()} km
            </Text>
            ) : null}

            <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.primary }]}
            onPress={handleActualizar}
            disabled={loading}
            >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Actualizar Vehículo</Text>}
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
    unidadesContainer: { flexDirection: 'row', gap: 12, marginTop: 4 },
    unidadButton: { flex: 1, borderRadius: 10, paddingVertical: 12, alignItems: 'center', borderWidth: 1 },
    unidadButtonText: { fontSize: 14, fontWeight: '600' },
    conversionText: { fontSize: 12, marginBottom: 8, marginLeft: 4, fontStyle: 'italic' },
    button: { borderRadius: 10, padding: 16, alignItems: 'center', marginTop: 32, marginBottom: 32 },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});