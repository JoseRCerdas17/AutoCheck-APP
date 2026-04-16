import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../services/api';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);

  const handleEnviar = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Ingresá tu correo electrónico');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email: email.trim().toLowerCase() });
      const code = res.data.code;

      Alert.alert(
        'Código generado',
        `Tu código de recuperación es:\n\n${code}\n\nTenés 15 minutos para usarlo.`,
        [
          {
            text: 'Continuar',
            onPress: () => navigation.navigate('ResetPassword', { email: email.trim().toLowerCase(), code }),
          },
        ]
      );
    } catch (error) {
      const msg = error?.response?.data?.message || 'No existe una cuenta con ese correo';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#0D1117', '#1A1F2E', '#0D1117']} style={styles.container}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.inner}>

          {/* Botón volver */}
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>

          {/* Ícono */}
          <View style={styles.iconContainer}>
            <Ionicons name="lock-open-outline" size={52} color="#5B2EE8" />
          </View>

          <Text style={styles.title}>¿Olvidaste tu contraseña?</Text>
          <Text style={styles.subtitle}>
            Ingresá tu correo y te generamos un código para restablecer tu contraseña.
          </Text>

          <Text style={styles.label}>Correo electrónico</Text>
          <View style={[styles.inputContainer, emailFocused && styles.inputFocused]}>
            <MaterialIcons name="email" size={20} color={emailFocused ? '#5B2EE8' : '#A0A0B0'} style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="tu@ejemplo.com"
              placeholderTextColor="#A0A0B0"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleEnviar}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.buttonText}>Generar código</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.linkText}>Volver al inicio de sesión</Text>
          </TouchableOpacity>

        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  inner: { flex: 1, padding: 24, justifyContent: 'center' },
  backBtn: { position: 'absolute', top: 56, left: 24, zIndex: 10 },
  iconContainer: { alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center', marginBottom: 12 },
  subtitle: { fontSize: 14, color: '#A0A0B0', textAlign: 'center', marginBottom: 32, lineHeight: 22 },
  label: { fontSize: 13, fontWeight: '600', color: '#A0A0B0', marginBottom: 6 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: '#2A2F3E', borderRadius: 12,
    paddingHorizontal: 12, marginBottom: 24, backgroundColor: '#1A1F2E',
  },
  inputFocused: { borderColor: '#5B2EE8' },
  icon: { marginRight: 8 },
  input: { flex: 1, paddingVertical: 14, fontSize: 15, color: '#FFFFFF' },
  button: { backgroundColor: '#5B2EE8', borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 16 },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  linkText: { color: '#29B6F6', fontSize: 14, textAlign: 'center' },
});
