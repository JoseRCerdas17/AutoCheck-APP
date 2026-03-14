import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

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
      navigation.replace('Home');
    } catch (error) {
      Alert.alert('Error', 'Credenciales inválidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Autocheck</Text>
      <Text style={styles.subtitle}>Iniciá sesión</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Iniciar sesión</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.link}>¿No tenés cuenta? Registrate</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#f5f5f5' },
  title: { fontSize: 36, fontWeight: 'bold', color: '#1A56A0', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 18, color: '#666', textAlign: 'center', marginBottom: 32 },
  input: { backgroundColor: '#fff', borderRadius: 8, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: '#ddd', fontSize: 16 },
  button: { backgroundColor: '#1A56A0', borderRadius: 8, padding: 16, alignItems: 'center', marginBottom: 16 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  link: { color: '#1A56A0', textAlign: 'center', fontSize: 14 },
});