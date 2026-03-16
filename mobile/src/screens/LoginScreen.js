import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, Image
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor completá todos los campos');
      return;
    }
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      await AsyncStorage.setItem('token', response.data.access_token);
      await AsyncStorage.setItem('nombre', response.data.nombre);
      await AsyncStorage.setItem('userId', response.data.userId.toString());
      navigation.replace('Home');
    } catch (error) {
      Alert.alert('Error', 'Credenciales inválidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.inner}>

        <Image
          source={require('../../assets/LogoAutoCheck.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title}>Bienvenido a AutoCheck</Text>
        <Text style={styles.subtitle}>Ingresa para gestionar tus vehículos y mantenimientos.</Text>

        <Text style={styles.label}>Correo electrónico</Text>
        <View style={styles.inputContainer}>
          <MaterialIcons name="email" size={20} color="#A0A0B0" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="tu@ejemplo.com"
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
            placeholder="Contraseña"
            placeholderTextColor="#A0A0B0"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#A0A0B0" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.forgotPassword}>
          <Text style={styles.forgotText}>¿Olvidé mi contraseña?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Iniciar Sesión</Text>}
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

        <TouchableOpacity style={styles.socialButtonApple}>
          <Ionicons name="logo-apple" size={20} color="#fff" style={styles.icon} />
          <Text style={styles.socialText}>Continuar con Apple</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.registerText}>
            ¿No tienes cuenta? <Text style={styles.registerLink}>Regístrate</Text>
          </Text>
        </TouchableOpacity>

      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D1117' },
  inner: { flex: 1, padding: 24, justifyContent: 'center' },
  logo: { width: 160, height: 160, alignSelf: 'center', marginBottom: 8 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 13, color: '#A0A0B0', textAlign: 'center', marginBottom: 28 },
  label: { fontSize: 13, fontWeight: '600', color: '#A0A0B0', marginBottom: 6 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: '#2A2F3E', borderRadius: 10,
    paddingHorizontal: 12, marginBottom: 16, backgroundColor: '#1A1F2E'
  },
  icon: { marginRight: 8 },
  input: { flex: 1, paddingVertical: 14, fontSize: 15, color: '#FFFFFF' },
  forgotPassword: { alignItems: 'flex-end', marginBottom: 24 },
  forgotText: { color: '#29B6F6', fontSize: 13 },
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
  socialButtonApple: {
    flexDirection: 'row', justifyContent: 'center',
    borderWidth: 1, borderColor: '#2A2F3E', borderRadius: 10,
    padding: 14, alignItems: 'center', marginBottom: 24, backgroundColor: '#1A1F2E'
  },
  socialText: { fontSize: 15, color: '#fff' },
  registerText: { textAlign: 'center', color: '#A0A0B0', fontSize: 14 },
  registerLink: { color: '#29B6F6', fontWeight: 'bold' },
});