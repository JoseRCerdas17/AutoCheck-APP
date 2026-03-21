import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { ThemeProvider } from './src/context/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';
import { registrarNotificaciones, enviarNotificacionLocal } from './src/services/notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './src/services/api';

export default function App() {

  useEffect(() => {
    registrarNotificaciones();
    verificarAlertas();
  }, []);

  const verificarAlertas = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const token = await AsyncStorage.getItem('token');
      if (!userId || !token) return;
  
      await api.get(`/maintenance/verificar-alertas/${userId}`);
    } catch (error) {
      console.log('Error verificando alertas', error);
    }
  };

  return (
    <ThemeProvider>
      <AppNavigator />
    </ThemeProvider>
  );
}