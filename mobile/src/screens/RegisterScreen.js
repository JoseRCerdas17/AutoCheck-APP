import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import api from '../services/api';

export default function RegisterScreen({ navigation }) {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [acepto, setAcepto] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!nombre || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Por favor completá todos los campos');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }
    if (!acepto) {
      Alert.alert('Error', 'Debés aceptar los términos y condiciones');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/register', { nombre, email, password });
      Alert.alert('¡Éxito!', 'Usuario creado correctamente', [
        { text: 'Iniciar sesión', onPress: () => navigation.navigate('Login') }
      ]);
    } catch (error) {
      Alert.alert('Error', 'No se pudo crear el usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.inner}>

        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          <Text style={styles.backText}>Registro</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Nombre Completo</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={20} color="#A0A0B0" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Juan Pérez"
            placeholderTextColor="#A0A0B0"
            value={nombre}
            onChangeText={setNombre}
          />
        </View>

        <Text style={styles.label}>Correo Electrónico</Text>
        <View style={styles.inputContainer}>
          <MaterialIcons name="email" size={20} color="#A0A0B0" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="nombre@ejemplo.com"
            placeholderTextColor="#A0A0B0"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <Text style={styles.label}>Contraseña</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#A0A0B0" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Mínimo 6 caracteres"
            placeholderTextColor="#A0A0B0"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#A0A0B0" />
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Confirmar Contraseña</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#A0A0B0" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Repite tu contraseña"
            placeholderTextColor="#A0A0B0"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirm}
          />
          <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
            <Ionicons name={showConfirm ? 'eye-off-outline' : 'eye-outline'} size={20} color="#A0A0B0" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.checkboxContainer} onPress={() => setAcepto(!acepto)}>
          <Ionicons name={acepto ? 'checkbox' : 'square-outline'} size={22} color="#5B2EE8" />
          <Text style={styles.checkboxText}>
            Acepto los <Text style={styles.link}>Términos y Condiciones</Text> y la <Text style={styles.link}>Política de Privacidad</Text>
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Registrarse</Text>}
        </TouchableOpacity>

        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>o</Text>
          <View style={styles.divider} />
        </View>

        <TouchableOpacity style={styles.socialButton}>
          <MaterialIcons name="google" size={20} color="#fff" style={styles.icon} />
          <Text style={styles.socialText}>Continuar con Google</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.socialButton}>
          <Ionicons name="logo-apple" size={20} color="#fff" style={styles.icon} />
          <Text style={styles.socialText}>Continuar con Apple</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D1117' },
  inner: { padding: 24, paddingTop: 60 },
  backButton: { flexDirection: 'row', alignItems: 'center', marginBottom: 32 },
  backText: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF', marginLeft: 8 },
  label: { fontSize: 13, fontWeight: '600', color: '#A0A0B0', marginBottom: 6 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: '#2A2F3E', borderRadius: 10,
    paddingHorizontal: 12, marginBottom: 16, backgroundColor: '#1A1F2E'
  },
  icon: { marginRight: 8 },
  input: { flex: 1, paddingVertical: 14, fontSize: 15, color: '#FFFFFF' },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  checkboxText: { flex: 1, marginLeft: 8, fontSize: 13, color: '#A0A0B0' },
  link: { color: '#29B6F6' },
  button: { backgroundColor: '#5B2EE8', borderRadius: 10, padding: 16, alignItems: 'center', marginBottom: 20 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  divider: { flex: 1, height: 1, backgroundColor: '#2A2F3E' },
  dividerText: { marginHorizontal: 12, color: '#A0A0B0', fontSize: 13 },
  socialButton: {
    flexDirection: 'row', justifyContent: 'center',
    borderWidth: 1, borderColor: '#2A2F3E', borderRadius: 10,
    padding: 14, alignItems: 'center', marginBottom: 12, backgroundColor: '#1A1F2E'
  },
  socialText: { fontSize: 15, color: '#fff' },
});