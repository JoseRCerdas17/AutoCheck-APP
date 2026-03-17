import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
} from 'react-native';

// Datos de prueba - historial de mantenimientos
const maintenanceData = [
  {
    id: '1',
    tipo: 'Cambio de aceite',
    fecha: '15/01/2026',
    kilometraje: '45,000 km',
    costo: '₡25,000',
    taller: 'Taller AutoService',
    notas: 'Se usó aceite sintético 5W-30',
  },
  {
    id: '2',
    tipo: 'Revisión de frenos',
    fecha: '10/12/2025',
    kilometraje: '43,500 km',
    costo: '₡15,000',
    taller: 'Taller AutoService',
    notas: 'Pastillas delanteras en buen estado',
  },
  {
    id: '3',
    tipo: 'Cambio de llantas',
    fecha: '05/10/2025',
    kilometraje: '40,000 km',
    costo: '₡120,000',
    taller: 'Llantas CR',
    notas: 'Se cambiaron las 4 llantas',
  },
  {
    id: '4',
    tipo: 'Alineación y balanceo',
    fecha: '05/10/2025',
    kilometraje: '40,000 km',
    costo: '₡12,000',
    taller: 'Llantas CR',
    notas: 'Sin observaciones',
  },
  {
    id: '5',
    tipo: 'Cambio de filtro de aire',
    fecha: '20/08/2025',
    kilometraje: '37,000 km',
    costo: '₡8,000',
    taller: 'Taller AutoService',
    notas: 'Filtro muy sucio',
  },
];

// Componente para cada tarjeta de mantenimiento
const MaintenanceCard = ({ item }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <Text style={styles.cardTipo}>{item.tipo}</Text>
      <Text style={styles.cardCosto}>{item.costo}</Text>
    </View>
    <View style={styles.cardRow}>
      <Text style={styles.cardLabel}>📅 Fecha:</Text>
      <Text style={styles.cardValue}>{item.fecha}</Text>
    </View>
    <View style={styles.cardRow}>
      <Text style={styles.cardLabel}>🚗 Kilometraje:</Text>
      <Text style={styles.cardValue}>{item.kilometraje}</Text>
    </View>
    <View style={styles.cardRow}>
      <Text style={styles.cardLabel}>🔧 Taller:</Text>
      <Text style={styles.cardValue}>{item.taller}</Text>
    </View>
    <View style={styles.cardRow}>
      <Text style={styles.cardLabel}>📝 Notas:</Text>
      <Text style={styles.cardValue}>{item.notas}</Text>
    </View>
  </View>
);

// Pantalla principal de historial de mantenimientos
const MaintenanceScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      {/* Encabezado */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Historial de Mantenimientos</Text>
        <Text style={styles.headerSubtitle}>Toyota Corolla 2020</Text>
      </View>

      {/* Lista de mantenimientos */}
      <FlatList
        data={maintenanceData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <MaintenanceCard item={item} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#1a73e8',
    padding: 20,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#cce0ff',
    fontSize: 14,
    marginTop: 4,
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 10,
  },
  cardTipo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a73e8',
    flex: 1,
  },
  cardCosto: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  cardRow: {
    flexDirection: 'row',
    marginTop: 6,
  },
  cardLabel: {
    fontSize: 13,
    color: '#666',
    width: 130,
  },
  cardValue: {
    fontSize: 13,
    color: '#333',
    flex: 1,
  },
});

export default MaintenanceScreen;