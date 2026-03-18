import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView
} from "react-native";
import api from "../services/api";

const VehiclesScreen = ({ navigation }) => {
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await api.get("/vehicles");
      console.log("DATA:", response.data);
      setVehicles(response.data || []);
    } catch (error) {
      console.log("Error:", error);
      setVehicles([]);
    }
  };

  return (
    <View style={styles.container}>

      <ScrollView>

        <Text style={styles.title}>Mis Vehículos</Text>

        {/* 🔍 SI NO HAY VEHÍCULOS */}
        {vehicles.length === 0 && (
          <Text style={styles.emptyText}>
            No tienes vehículos registrados 🚗
          </Text>
        )}

        {/* 🔍 LISTA MANUAL (SIN FlatList para evitar errores) */}
        {vehicles.map((item, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.cardTitle}>
              {item.brand} {item.model}
            </Text>
            <Text>Año: {item.year}</Text>
            <Text>Kilometraje: {item.mileage} km</Text>
          </View>
        ))}

        {/* ➕ BOTÓN */}
        <TouchableOpacity
          style={styles.button}
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
    backgroundColor: "#111",
    padding: 16
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20
  },
  emptyText: {
    textAlign: "center",
    marginTop: 50,
    color: "#ccc"
  },
  card: {
    backgroundColor: "#1e1e2f",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff"
  },
  button: {
    backgroundColor: "#007bff",
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