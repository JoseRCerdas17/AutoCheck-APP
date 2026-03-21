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
      if (!userId) return;

      const resVehiculos = await api.get(`/vehicles/${userId}`);
      let alertasUrgentes = 0;

      for (const v of resVehiculos.data) {
        const resMant = await api.get(`/maintenance/${v.id}`);
        const mantenimientos = resMant.data;

        const cambioAceite = mantenimientos.find(m => m.tipo?.toLowerCase().includes('aceite'));
        if (cambioAceite) {
          const kmDesde = v.kilometraje - (cambioAceite.kilometraje || 0);
          if (kmDesde >= 5000) {
            alertasUrgentes++;
            await enviarNotificacionLocal(
              '⚠️ Cambio de aceite urgente',
              `${v.marca} ${v.modelo} necesita cambio de aceite (${kmDesde} km desde el último)`,
              { vehiculoId: v.id }
            );
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