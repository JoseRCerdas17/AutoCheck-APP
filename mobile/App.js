import { useEffect, useRef } from 'react';
import { AppState, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { ThemeProvider } from './src/context/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';
import { registrarNotificaciones, enviarNotificacionLocal } from './src/services/notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './src/services/api';

// Configurar el handler para cuando la app está en primer plano
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function App() {
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    // Registrar notificaciones al iniciar
    registrarNotificaciones();
    
    // Verificar alertas periódicamente
    verificarAlertas();
    
    // Configurar intervalo para verificar alertas cada hora
    const interval = setInterval(verificarAlertas, 3600000);
    
    // Escuchar notificaciones recibidas mientras la app está abierta
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notificación recibida:', notification);
    });

    // Escuchar cuando el usuario toca una notificación
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const { data } = response.notification.request.content;
      // Aquí puedes navegar a la pantalla correspondiente
      console.log('Usuario tocó notificación:', data);
    });

    return () => {
      clearInterval(interval);
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  const verificarAlertas = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const token = await AsyncStorage.getItem('token');
      if (!userId || !token) return;

      // Obtener vehículos del usuario
      const resVehiculos = await api.get(`/vehicles/${userId}`);
      
      for (const vehiculo of resVehiculos.data) {
        // Verificar mantenimientos próximos
        const resMant = await api.get(`/maintenance/${vehiculo.id}`);
        const mantenimientos = resMant.data;
        
        const hoy = new Date();
        for (const mant of mantenimientos) {
          if (mant.proximoMantenimiento) {
            const fechaProximo = new Date(mant.proximoMantenimiento);
            const diffDays = Math.ceil((fechaProximo - hoy) / (1000 * 60 * 60 * 24));
            
            // Notificar si faltan 7, 3 o 1 días
            if (diffDays === 7 || diffDays === 3 || diffDays === 1) {
              await enviarNotificacionLocal(
                'Mantenimiento próximo',
                `${vehiculo.marca} ${vehiculo.modelo}: ${mant.tipo} en ${diffDays} día${diffDays !== 1 ? 's' : ''}`
              );
            }
          }
        }
      }
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