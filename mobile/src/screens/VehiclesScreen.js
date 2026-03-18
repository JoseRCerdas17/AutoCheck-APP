import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api";
import { useTheme } from "../context/ThemeContext";

const VehiclesScreen = ({ navigation }) => {
  const [vehicles, setVehicles] = useState([]);
  const { theme } = useTheme();

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      // ✅ 1. Obtener userId
      const id = await AsyncStorage.getItem("userId");

      // ✅ 2. Endpoint corregido
      const response = await api.get(`/vehicles/${id}`);

      console.log("DATA:", response.data);
      setVehicles(response.data || []);
    } catch (error) {
      console.log("Error:", error);
      setVehicles([]);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>

      <ScrollView>

        <Text style={[styles.title, { color: theme.text }]}>
          Mis Vehículos
        </Text>

        {/* 🔍 SI NO HAY VEHÍCULOS */}
        {vehicles.length === 0 && (
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            No tienes vehículos registrados 🚗
          </Text>
        )}

        {/* 🔍 LISTA */}
        {vehicles.map((item, index) => (
          <View key={index} style={[styles.card, { backgroundColor: theme.card }]}>
            
            {/* ✅ 3. CAMPOS CORREGIDOS */}
            <Text style={[styles.cardTitle, { color: theme.text }]}>
              {item.marca} {item.modelo}
            </Text>

            <Text style={{ color: theme.textSecondary }}>
              Año: {item.anio}
            </Text>

            <Text style={{ color: theme.textSecondary }}>
              Kilometraje: {item.kilometraje} km
            </Text>

          </View>
        ))}

        {/* ➕ BOTÓN */}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.primary }]}
          onPress={() => navigation.navigate("AddVehicle")}
        >
          <Text style={styles.buttonText}>+ Agregar Vehículo</Text>
        </TouchableOpacity>

      </ScrollView>

    </View>
  );
};

export default VehiclesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20
  },
  emptyText: {
    textAlign: "center",
    marginTop: 50
  },
  card: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 10
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold"
  },
  button: {
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold"
  }
});