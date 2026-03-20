import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform, Image, Animated
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  // Animaciones
  const logoAnim = useRef(new Animated.Value(0)).current;
  const formAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(logoAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(formAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor completá todos los campos');
      return;
    }

    // Animación del botón
    Animated.sequence([
      Animated.timing(buttonAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(buttonAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();

    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      await AsyncStorage.setItem('token', response.data.access_token);
      await AsyncStorage.setItem('nombre', response.data.nombre);
      await AsyncStorage.setItem('userId', response.data.userId.toString());
      navigation.replace('Main');
    } catch (error) {
      Alert.alert('Error', 'Credenciales inválidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#0D1117', '#1A1F2E', '#0D1117']} style={styles.container}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.inner}>

          {/* Logo animado */}
          <Animated.View style={[styles.logoContainer, {
            opacity: logoAnim,
            transform: [{
              translateY: logoAnim.interpolate({ inputRange: [0, 1], outputRange: [-30, 0] })
            }]
          }]}>
            <Image
              source={require('../../assets/LogoAutoCheck.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>AutoCheck</Text>
            <Text style={styles.subtitle}>Tu asistente de mantenimiento vehicular</Text>
          </Animated.View>

          {/* Formulario animado */}
          <Animated.View style={[styles.form, {
            opacity: formAnim,
            transform: [{
              translateY: formAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] })
            }]
          }]}>

            {/* Email */}
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

            {/* Contraseña */}
            <Text style={styles.label}>Contraseña</Text>
            <View style={[styles.inputContainer, passwordFocused && styles.inputFocused]}>
              <Ionicons name="lock-closed-outline" size={20} color={passwordFocused ? '#5B2EE8' : '#A0A0B0'} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Contraseña"
                placeholderTextColor="#A0A0B0"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#A0A0B0" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotText}>¿Olvidé mi contraseña?</Text>
            </TouchableOpacity>

            {/* Botón de login */}
            <Animated.View style={{ transform: [{ scale: buttonAnim }] }}>
              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={loading}
              >
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.buttonText}>Iniciar Sesión</Text>
                }
              </TouchableOpacity>
            </Animated.View>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>o</Text>
              <View style={styles.divider} />
            </View>

            {/* Registro */}
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerText}>
                ¿No tenés cuenta? <Text style={styles.registerLink}>Registrate</Text>
              </Text>
            </TouchableOpacity>

          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  inner: { flex: 1, padding: 24, justifyContent: 'center' },
  logoContainer: { alignItems: 'center', marginBottom: 32 },
  logo: { width: 120, height: 120, marginBottom: 12 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF', letterSpacing: 1 },
  subtitle: { fontSize: 13, color: '#A0A0B0', marginTop: 4, textAlign: 'center' },
  form: {},
  label: { fontSize: 13, fontWeight: '600', color: '#A0A0B0', marginBottom: 6 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: '#2A2F3E', borderRadius: 12,
    paddingHorizontal: 12, marginBottom: 16, backgroundColor: '#1A1F2E'
  },
  inputFocused: { borderColor: '#5B2EE8' },
  icon: { marginRight: 8 },
  input: { flex: 1, paddingVertical: 14, fontSize: 15, color: '#FFFFFF' },
  forgotPassword: { alignItems: 'flex-end', marginBottom: 24 },
  forgotText: { color: '#29B6F6', fontSize: 13 },
  button: { backgroundColor: '#5B2EE8', borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 20 },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  divider: { flex: 1, height: 1, backgroundColor: '#2A2F3E' },
  dividerText: { marginHorizontal: 12, color: '#A0A0B0', fontSize: 13 },
  registerText: { textAlign: 'center', color: '#A0A0B0', fontSize: 14 },
  registerLink: { color: '#29B6F6', fontWeight: 'bold' },
});