import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registrarNotificaciones() {
  if (!Device.isDevice) {
    console.log('Las notificaciones solo funcionan en dispositivo físico');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Permiso de notificaciones denegado');
    return null;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('autocheck', {
      name: 'AutoCheck',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#5B2EE8',
    });
  }

  // Obtener y guardar el push token
  try {
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: '678a9f60-85d7-4370-9629-d13a9910f8f1',
    });
    const pushToken = tokenData.data;
    console.log('Push token:', pushToken);

    const userId = await AsyncStorage.getItem('userId');
    if (userId && pushToken) {
      await api.post(`/users/push-token/${userId}`, { pushToken });
      await AsyncStorage.setItem('pushToken', pushToken);
    }
  } catch (error) {
    console.log('Error guardando push token', error);
  }

  return true;
}

export async function enviarNotificacionLocal(titulo, cuerpo, datos = {}) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: titulo,
      body: cuerpo,
      data: datos,
      sound: true,
    },
    trigger: null,
  });
}

export async function programarRecordatorio(titulo, cuerpo, fecha) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: titulo,
      body: cuerpo,
      sound: true,
    },
    trigger: { date: fecha },
  });
}

export async function cancelarTodasNotificaciones() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}