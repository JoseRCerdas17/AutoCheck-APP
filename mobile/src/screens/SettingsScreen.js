import React, { useEffect } from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, ScrollView, Switch
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';

export default function SettingsScreen({ navigation }) {
  const { theme, isDark, toggleTheme } = useTheme();
  const [notificaciones, setNotificaciones] = React.useState(true);
  const [notifKilometraje, setNotifKilometraje] = React.useState(true);
  const [notifFecha, setNotifFecha] = React.useState(true);

  // Cargar preferencias guardadas al abrir la pantalla
  useEffect(() => {
    const cargarPreferencias = async () => {
      const notif = await AsyncStorage.getItem('notificaciones_activas');
      const km = await AsyncStorage.getItem('notificaciones_kilometraje');
      const fecha = await AsyncStorage.getItem('notificaciones_fecha');
      if (notif !== null) setNotificaciones(notif === 'true');
      if (km !== null) setNotifKilometraje(km === 'true');
      if (fecha !== null) setNotifFecha(fecha === 'true');
    };
    cargarPreferencias();
  }, []);

  // Guardar preferencia de notificaciones push
  const handleNotificaciones = async (value) => {
    setNotificaciones(value);
    await AsyncStorage.setItem('notificaciones_activas', value.toString());
  };

  // Guardar preferencia de alertas por kilometraje
  const handleNotifKilometraje = async (value) => {
    setNotifKilometraje(value);
    await AsyncStorage.setItem('notificaciones_kilometraje', value.toString());
  };

  // Guardar preferencia de alertas por fecha
  const handleNotifFecha = async (value) => {
    setNotifFecha(value);
    await AsyncStorage.setItem('notificaciones_fecha', value.toString());
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Ajustes</Text>
        </View>

        {/* Notificaciones */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Notificaciones</Text>

          <View style={[styles.menuItem, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.menuLeft}>
              <View style={[styles.menuIcon, { backgroundColor: theme.border }]}>
                <Ionicons name="notifications-outline" size={20} color={theme.primary} />
              </View>
              <View>
                <Text style={[styles.menuText, { color: theme.text }]}>Notificaciones push</Text>
                <Text style={[styles.menuSubtext, { color: theme.textSecondary }]}>Recibir alertas de mantenimiento</Text>
              </View>
            </View>
            <Switch
              value={notificaciones}
              onValueChange={handleNotificaciones}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={[styles.menuItem, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.menuLeft}>
              <View style={[styles.menuIcon, { backgroundColor: theme.border }]}>
                <MaterialIcons name="speed" size={20} color={theme.primary} />
              </View>
              <View>
                <Text style={[styles.menuText, { color: theme.text }]}>Alertas por kilometraje</Text>
                <Text style={[styles.menuSubtext, { color: theme.textSecondary }]}>Avisar al acercarse al límite</Text>
              </View>
            </View>
            <Switch
              value={notifKilometraje}
              onValueChange={handleNotifKilometraje}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={[styles.menuItem, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.menuLeft}>
              <View style={[styles.menuIcon, { backgroundColor: theme.border }]}>
                <MaterialIcons name="calendar-today" size={20} color={theme.primary} />
              </View>
              <View>
                <Text style={[styles.menuText, { color: theme.text }]}>Alertas por fecha</Text>
                <Text style={[styles.menuSubtext, { color: theme.textSecondary }]}>Avisar días antes del vencimiento</Text>
              </View>
            </View>
            <Switch
              value={notifFecha}
              onValueChange={handleNotifFecha}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Apariencia */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Apariencia</Text>

          <View style={[styles.menuItem, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.menuLeft}>
              <View style={[styles.menuIcon, { backgroundColor: theme.border }]}>
                <Ionicons name="moon-outline" size={20} color={theme.primary} />
              </View>
              <View>
                <Text style={[styles.menuText, { color: theme.text }]}>Modo oscuro</Text>
                <Text style={[styles.menuSubtext, { color: theme.textSecondary }]}>
                  {isDark ? 'Activado' : 'Desactivado'}
                </Text>
              </View>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* General */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>General</Text>

          <TouchableOpacity style={[styles.menuItemNav, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.menuLeft}>
              <View style={[styles.menuIcon, { backgroundColor: theme.border }]}>
                <Ionicons name="language-outline" size={20} color={theme.primary} />
              </View>
              <View>
                <Text style={[styles.menuText, { color: theme.text }]}>Idioma</Text>
                <Text style={[styles.menuSubtext, { color: theme.textSecondary }]}>Español</Text>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={theme.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItemNav, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.menuLeft}>
              <View style={[styles.menuIcon, { backgroundColor: theme.border }]}>
                <MaterialIcons name="straighten" size={20} color={theme.primary} />
              </View>
              <View>
                <Text style={[styles.menuText, { color: theme.text }]}>Unidades</Text>
                <Text style={[styles.menuSubtext, { color: theme.textSecondary }]}>Kilómetros</Text>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={theme.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItemNav, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.menuLeft}>
              <View style={[styles.menuIcon, { backgroundColor: theme.border }]}>
                <Ionicons name="trash-outline" size={20} color={theme.danger} />
              </View>
              <Text style={[styles.menuText, { color: theme.danger }]}>Eliminar cuenta</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={theme.textSecondary} />
          </TouchableOpacity>

        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingTop: 60, paddingBottom: 16 },
  backButton: { marginRight: 16 },
  headerTitle: { fontSize: 24, fontWeight: 'bold' },
  section: { paddingHorizontal: 24, marginBottom: 8 },
  sectionTitle: { fontSize: 13, marginBottom: 8, marginTop: 16, textTransform: 'uppercase', letterSpacing: 1 },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderRadius: 12, padding: 16, marginBottom: 8, borderWidth: 1,
  },
  menuItemNav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderRadius: 12, padding: 16, marginBottom: 8, borderWidth: 1,
  },
  menuLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  menuIcon: {
    width: 36, height: 36, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center', marginRight: 12
  },
  menuText: { fontSize: 15 },
  menuSubtext: { fontSize: 12, marginTop: 2 },
});