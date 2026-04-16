import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
  ScrollView, StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

export default function ChangePasswordScreen({ navigation }) {
  const { theme } = useTheme();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleCambiar = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Completá todos los campos');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas nuevas no coinciden');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Error', 'La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (currentPassword === newPassword) {
      Alert.alert('Error', 'La nueva contraseña debe ser diferente a la actual');
      return;
    }

    setLoading(true);
    try {
      const userId = await AsyncStorage.getItem('userId');
      await api.put(`/users/change-password/${userId}`, { currentPassword, newPassword });
      Alert.alert(
        '¡Contraseña actualizada!',
        'Tu contraseña fue cambiada exitosamente.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      const msg = error?.response?.data?.message || 'No se pudo cambiar la contraseña';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.dark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Cambiar contraseña</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Ícono */}
        <View style={[styles.iconBox, { backgroundColor: theme.primary + '15' }]}>
          <Ionicons name="lock-closed" size={36} color={theme.primary} />
        </View>

        <Text style={[styles.description, { color: theme.textSecondary }]}>
          Ingresá tu contraseña actual y luego la nueva contraseña que querés usar.
        </Text>

        {/* Contraseña actual */}
        <Text style={[styles.label, { color: theme.textSecondary }]}>Contraseña actual</Text>
        <View style={[styles.inputContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Ionicons name="lock-closed-outline" size={20} color={theme.textSecondary} style={styles.icon} />
          <TextInput
            style={[styles.input, { color: theme.text }]}
            placeholder="••••••••"
            placeholderTextColor={theme.textSecondary}
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry={!showCurrent}
          />
          <TouchableOpacity onPress={() => setShowCurrent(v => !v)}>
            <Ionicons name={showCurrent ? 'eye-off-outline' : 'eye-outline'} size={20} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Nueva contraseña */}
        <Text style={[styles.label, { color: theme.textSecondary }]}>Nueva contraseña</Text>
        <View style={[styles.inputContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Ionicons name="lock-closed-outline" size={20} color={theme.textSecondary} style={styles.icon} />
          <TextInput
            style={[styles.input, { color: theme.text }]}
            placeholder="••••••••"
            placeholderTextColor={theme.textSecondary}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry={!showNew}
          />
          <TouchableOpacity onPress={() => setShowNew(v => !v)}>
            <Ionicons name={showNew ? 'eye-off-outline' : 'eye-outline'} size={20} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Confirmar contraseña */}
        <Text style={[styles.label, { color: theme.textSecondary }]}>Confirmar nueva contraseña</Text>
        <View style={[styles.inputContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Ionicons name="lock-closed-outline" size={20} color={theme.textSecondary} style={styles.icon} />
          <TextInput
            style={[styles.input, { color: theme.text }]}
            placeholder="••••••••"
            placeholderTextColor={theme.textSecondary}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirm}
          />
          <TouchableOpacity onPress={() => setShowConfirm(v => !v)}>
            <Ionicons name={showConfirm ? 'eye-off-outline' : 'eye-outline'} size={20} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.primary }, loading && styles.buttonDisabled]}
          onPress={handleCambiar}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.buttonText}>Actualizar contraseña</Text>
          }
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 56, paddingBottom: 16,
    borderBottomWidth: 1,
  },
  backBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
  content: { padding: 24 },
  iconBox: {
    width: 72, height: 72, borderRadius: 36,
    justifyContent: 'center', alignItems: 'center',
    alignSelf: 'center', marginTop: 16, marginBottom: 20,
  },
  description: { fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 8, marginTop: 4 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, marginBottom: 20,
  },
  icon: { marginRight: 8 },
  input: { flex: 1, paddingVertical: 14, fontSize: 15 },
  button: { borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
