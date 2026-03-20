import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform, ScrollView, Animated
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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
  const [focusedField, setFocusedField] = useState(null);

  // Validaciones en tiempo real
  const emailValido = email.includes('@') && email.includes('.');
  const passwordValida = password.length >= 6;
  const passwordsCoinciden = password === confirmPassword && confirmPassword.length > 0;

  // Animaciones
  const formAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(formAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  const handleRegister = async () => {
    if (!nombre || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Por favor completá todos los campos');
      return;
    }
    if (!emailValido) {
      Alert.alert('Error', 'El correo electrónico no es válido');
      return;
    }
    if (!passwordValida) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (!passwordsCoinciden) {
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
      Alert.alert('Error', 'No se pudo crear el usuario. El correo ya puede estar registrado.');
    } finally {
      setLoading(false);
    }
  };

  const getInputStyle = (field, isValid) => {
    if (focusedField === field) return styles.inputFocused;
    if (field === 'email' && email.length > 0) return isValid ? styles.inputValid : styles.inputError;
    if (field === 'password' && password.length > 0) return isValid ? styles.inputValid : styles.inputError;
    if (field === 'confirmPassword' && confirmPassword.length > 0) return isValid ? styles.inputValid : styles.inputError;
    return {};
  };

  const getIconColor = (field, isValid) => {
    if (focusedField === field) return '#5B2EE8';
    if (field === 'email' && email.length > 0) return isValid ? '#4CAF50' : '#FF5252';
    if (field === 'password' && password.length > 0) return isValid ? '#4CAF50' : '#FF5252';
    if (field === 'confirmPassword' && confirmPassword.length > 0) return isValid ? '#4CAF50' : '#FF5252';
    return '#A0A0B0';
  };

  return (
    <LinearGradient colors={['#0D1117', '#1A1F2E', '#0D1117']} style={styles.container}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.inner} showsVerticalScrollIndicator={false}>

          <Animated.View style={{
            opacity: formAnim,
            transform: [{ translateY: formAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }]
          }}>

            {/* Header */}
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            <Text style={styles.title}>Crear cuenta</Text>
            <Text style={styles.subtitle}>Completá tus datos para registrarte</Text>

            {/* Nombre */}
            <Text style={styles.label}>Nombre Completo</Text>
            <View style={[styles.inputContainer, focusedField === 'nombre' && styles.inputFocused]}>
              <Ionicons name="person-outline" size={20} color={focusedField === 'nombre' ? '#5B2EE8' : '#A0A0B0'} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Juan Pérez"
                placeholderTextColor="#A0A0B0"
                value={nombre}
                onChangeText={setNombre}
                onFocus={() => setFocusedField('nombre')}
                onBlur={() => setFocusedField(null)}
              />
            </View>

            {/* Email */}
            <Text style={styles.label}>Correo Electrónico</Text>
            <View style={[styles.inputContainer, getInputStyle('email', emailValido)]}>
              <MaterialIcons name="email" size={20} color={getIconColor('email', emailValido)} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="nombre@ejemplo.com"
                placeholderTextColor="#A0A0B0"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
              />
              {email.length > 0 && (
                <Ionicons
                  name={emailValido ? 'checkmark-circle' : 'close-circle'}
                  size={20}
                  color={emailValido ? '#4CAF50' : '#FF5252'}
                />
              )}
            </View>

            {/* Contraseña */}
            <Text style={styles.label}>Contraseña</Text>
            <View style={[styles.inputContainer, getInputStyle('password', passwordValida)]}>
              <Ionicons name="lock-closed-outline" size={20} color={getIconColor('password', passwordValida)} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Mínimo 6 caracteres"
                placeholderTextColor="#A0A0B0"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#A0A0B0" />
              </TouchableOpacity>
            </View>
            {password.length > 0 && !passwordValida && (
              <Text style={styles.errorText}>La contraseña debe tener al menos 6 caracteres</Text>
            )}

            {/* Confirmar contraseña */}
            <Text style={styles.label}>Confirmar Contraseña</Text>
            <View style={[styles.inputContainer, getInputStyle('confirmPassword', passwordsCoinciden)]}>
              <Ionicons name="lock-closed-outline" size={20} color={getIconColor('confirmPassword', passwordsCoinciden)} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Repetí tu contraseña"
                placeholderTextColor="#A0A0B0"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirm}
                onFocus={() => setFocusedField('confirmPassword')}
                onBlur={() => setFocusedField(null)}
              />
              <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
                <Ionicons name={showConfirm ? 'eye-off-outline' : 'eye-outline'} size={20} color="#A0A0B0" />
              </TouchableOpacity>
            </View>
            {confirmPassword.length > 0 && !passwordsCoinciden && (
              <Text style={styles.errorText}>Las contraseñas no coinciden</Text>
            )}

            {/* Términos */}
            <TouchableOpacity style={styles.checkboxContainer} onPress={() => setAcepto(!acepto)}>
              <Ionicons name={acepto ? 'checkbox' : 'square-outline'} size={22} color="#5B2EE8" />
              <Text style={styles.checkboxText}>
                Acepto los <Text style={styles.link}>Términos y Condiciones</Text> y la <Text style={styles.link}>Política de Privacidad</Text>
              </Text>
            </TouchableOpacity>

            {/* Botón */}
            <TouchableOpacity
              style={[styles.button, (!acepto || loading) && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={loading || !acepto}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.buttonText}>Crear Cuenta</Text>
              }
            </TouchableOpacity>

            {/* Login */}
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginText}>
                ¿Ya tenés cuenta? <Text style={styles.loginLink}>Iniciá sesión</Text>
              </Text>
            </TouchableOpacity>

          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  inner: { padding: 24, paddingTop: 60, paddingBottom: 40 },
  backButton: { marginBottom: 24 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 8 },
  subtitle: { fontSize: 13, color: '#A0A0B0', marginBottom: 28 },
  label: { fontSize: 13, fontWeight: '600', color: '#A0A0B0', marginBottom: 6 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: '#2A2F3E', borderRadius: 12,
    paddingHorizontal: 12, marginBottom: 4, backgroundColor: '#1A1F2E'
  },
  inputFocused: { borderColor: '#5B2EE8' },
  inputValid: { borderColor: '#4CAF50' },
  inputError: { borderColor: '#FF5252' },
  icon: { marginRight: 8 },
  input: { flex: 1, paddingVertical: 14, fontSize: 15, color: '#FFFFFF' },
  errorText: { color: '#FF5252', fontSize: 12, marginBottom: 12, marginLeft: 4 },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, marginTop: 8 },
  checkboxText: { flex: 1, marginLeft: 8, fontSize: 13, color: '#A0A0B0' },
  link: { color: '#29B6F6' },
  button: { backgroundColor: '#5B2EE8', borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 20 },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  loginText: { textAlign: 'center', color: '#A0A0B0', fontSize: 14 },
  loginLink: { color: '#29B6F6', fontWeight: 'bold' },
});