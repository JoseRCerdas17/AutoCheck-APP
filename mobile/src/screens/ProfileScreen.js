import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, ScrollView, Alert
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

export default function ProfileScreen({ navigation }) {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [stats, setStats] = useState({ vehiculos: 0, mantenimientos: 0, totalGastado: 0, alertas: 0 });
  const { theme } = useTheme();

  useEffect(() => {
    const getData = async () => {
      const n = await AsyncStorage.getItem('nombre');
      const id = await AsyncStorage.getItem('userId');
      setNombre(n || '');
      if (id) {
        try {
          const resProfile = await api.get(`/users/profile/${id}`);
          setEmail(resProfile.data.email);

          const resVehiculos = await api.get(`/vehicles/${id}`);
          const resResumen = await api.get(`/maintenance/resumen/${id}`);
          // Calcular alertas
let totalAlertas = 0;
for (const v of resVehiculos.data) {
  const resMant = await api.get(`/maintenance/${v.id}`);
  const mantenimientos = resMant.data;
  const cambioAceite = mantenimientos.find(m => m.tipo?.toLowerCase().includes('aceite'));
  if (cambioAceite) {
    const kmDesde = v.kilometraje - (cambioAceite.kilometraje || 0);
    if (kmDesde >= 4000) totalAlertas++;
  } else if (v.kilometraje > 5000) {
    totalAlertas++;
  }
}

setStats({
  vehiculos: resVehiculos.data.length,
  mantenimientos: resResumen.data.totalMantenimientos,
  totalGastado: resResumen.data.totalGastado,
  alertas: totalAlertas,
});
        } catch (error) {
          console.log('Error cargando perfil', error);
        }
      }
    };
    getData();
  }, []);

  const handleLogout = async () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro que querés cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.clear();
            navigation.replace('Login');
          }
        }
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Mi Perfil</Text>
        </View>

        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
            <Text style={styles.avatarText}>
              {nombre ? nombre.charAt(0).toUpperCase() : 'U'}
            </Text>
          </View>
          <Text style={[styles.nombre, { color: theme.text }]}>{nombre}</Text>
          <Text style={[styles.email, { color: theme.textSecondary }]}>{email}</Text>
        </View>

        {/* Estadísticas */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Ionicons name="car" size={24} color={theme.primary} />
            <Text style={[styles.statNumber, { color: theme.text }]}>{stats.vehiculos}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Vehículos</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <MaterialIcons name="build" size={24} color={theme.primary} />
            <Text style={[styles.statNumber, { color: theme.text }]}>{stats.mantenimientos}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Mantenimientos</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <MaterialIcons name="attach-money" size={24} color="#4CAF50" />
            <Text style={[styles.statNumber, { color: theme.text }]}>
              ₡{Number(stats.totalGastado).toLocaleString('es-CR')}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Total Gastado</Text>
          </View>
        </View>

        {/* Cuenta */}
<View style={styles.section}>
  <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Cuenta</Text>

  <TouchableOpacity style={[styles.menuItem, { backgroundColor: theme.card, borderColor: theme.border }]}
    onPress={() => navigation.navigate('Settings')}>
    <View style={styles.menuLeft}>
      <View style={[styles.menuIcon, { backgroundColor: theme.border }]}>
        <Ionicons name="settings-outline" size={20} color={theme.primary} />
      </View>
      <Text style={[styles.menuText, { color: theme.text }]}>Ajustes</Text>
    </View>
    <MaterialIcons name="chevron-right" size={24} color={theme.textSecondary} />
  </TouchableOpacity>

  <TouchableOpacity style={[styles.menuItem, { backgroundColor: theme.card, borderColor: theme.border }]}
    onPress={() => navigation.navigate('Alertas')}>
    <View style={styles.menuLeft}>
      <View style={[styles.menuIcon, { backgroundColor: theme.border }]}>
        <MaterialIcons name="notifications" size={20} color={theme.primary} />
      </View>
      <Text style={[styles.menuText, { color: theme.text }]}>Alertas</Text>
      {stats.alertas > 0 && (
        <View style={[styles.badge, { backgroundColor: '#FF5252' }]}>
          <Text style={styles.badgeText}>{stats.alertas}</Text>
        </View>
      )}
    </View>
    <MaterialIcons name="chevron-right" size={24} color={theme.textSecondary} />
  </TouchableOpacity>

  <TouchableOpacity style={[styles.menuItem, { backgroundColor: theme.card, borderColor: theme.border }]}
    onPress={() => navigation.navigate('Documentos')}>
    <View style={styles.menuLeft}>
      <View style={[styles.menuIcon, { backgroundColor: theme.border }]}>
        <MaterialIcons name="folder" size={20} color={theme.primary} />
      </View>
      <Text style={[styles.menuText, { color: theme.text }]}>Documentos</Text>
    </View>
    <MaterialIcons name="chevron-right" size={24} color={theme.textSecondary} />
  </TouchableOpacity>

  <TouchableOpacity style={[styles.menuItem, { backgroundColor: theme.card, borderColor: theme.border }]}
    onPress={() => navigation.navigate('ChangePassword')}>
    <View style={styles.menuLeft}>
      <View style={[styles.menuIcon, { backgroundColor: theme.border }]}>
        <Ionicons name="lock-closed-outline" size={20} color={theme.primary} />
      </View>
      <Text style={[styles.menuText, { color: theme.text }]}>Cambiar contraseña</Text>
    </View>
    <MaterialIcons name="chevron-right" size={24} color={theme.textSecondary} />
  </TouchableOpacity>
</View>

        {/* Membresía */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Membresía</Text>
          <TouchableOpacity style={[styles.premiumCard, { backgroundColor: theme.card, borderColor: theme.primary }]}>
            <View style={styles.premiumLeft}>
              <Ionicons name="star" size={24} color="#FFD700" />
              <View style={styles.premiumText}>
                <Text style={[styles.premiumTitle, { color: theme.text }]}>Actualizar a Premium</Text>
                <Text style={[styles.premiumSubtitle, { color: theme.textSecondary }]}>Múltiples vehículos y más funciones</Text>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Soporte */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Soporte</Text>
          <TouchableOpacity style={[styles.menuItem, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.menuLeft}>
              <View style={[styles.menuIcon, { backgroundColor: theme.border }]}>
                <Ionicons name="help-circle-outline" size={20} color={theme.primary} />
              </View>
              <Text style={[styles.menuText, { color: theme.text }]}>Ayuda y soporte</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={theme.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItem, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.menuLeft}>
              <View style={[styles.menuIcon, { backgroundColor: theme.border }]}>
                <Ionicons name="document-text-outline" size={20} color={theme.primary} />
              </View>
              <Text style={[styles.menuText, { color: theme.text }]}>Términos y condiciones</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Cerrar sesión */}
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: theme.card, borderColor: '#FF5252' }]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color="#FF5252" />
          <Text style={[styles.logoutText, { color: '#FF5252' }]}>Cerrar sesión</Text>
        </TouchableOpacity>

        <Text style={[styles.version, { color: theme.textSecondary }]}>AutoCheck v1.0.0</Text>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 8 },
  headerTitle: { fontSize: 24, fontWeight: 'bold' },
  avatarContainer: { alignItems: 'center', paddingVertical: 24 },
  avatar: { width: 90, height: 90, borderRadius: 45, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText: { fontSize: 36, fontWeight: 'bold', color: '#FFFFFF' },
  nombre: { fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
  email: { fontSize: 14 },
  statsGrid: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 16 },
  statCard: { flex: 1, borderRadius: 16, padding: 12, alignItems: 'center', borderWidth: 1 },
  statNumber: { fontSize: 16, fontWeight: 'bold', marginTop: 6 },
  statLabel: { fontSize: 11, marginTop: 2, textAlign: 'center' },
  section: { paddingHorizontal: 24, marginBottom: 8 },
  sectionTitle: { fontSize: 13, marginBottom: 8, marginTop: 16, textTransform: 'uppercase', letterSpacing: 1 },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 12, padding: 16, marginBottom: 8, borderWidth: 1 },
  menuLeft: { flexDirection: 'row', alignItems: 'center' },
  menuIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  menuText: { fontSize: 15 },
  premiumCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 12, padding: 16, borderWidth: 1 },
  premiumLeft: { flexDirection: 'row', alignItems: 'center' },
  premiumText: { marginLeft: 12 },
  premiumTitle: { fontSize: 15, fontWeight: 'bold' },
  premiumSubtitle: { fontSize: 12, marginTop: 2 },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginHorizontal: 24, marginTop: 24, marginBottom: 16, borderRadius: 12, padding: 16, borderWidth: 1 },
  logoutText: { fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
  version: { textAlign: 'center', fontSize: 12, marginBottom: 32 },
  badge: { borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2, marginLeft: 8 },
badgeText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
});