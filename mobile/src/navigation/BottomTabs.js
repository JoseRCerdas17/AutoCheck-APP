import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import MaintenanceScreen from '../screens/MaintenanceScreen';
import VehiclesScreen from '../screens/VehiclesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ReportsScreen from '../screens/ReportsScreen';
import AlertsScreen from '../screens/AlertsScreen';
import { useTheme } from '../context/ThemeContext';

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  const { theme } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopWidth: 1,
          borderTopColor: theme.border,
          elevation: 5,
        },
        tabBarIcon: ({ color, size }) => {
          if (route.name === 'Inicio') return <Ionicons name="home" size={size} color={color} />;
          if (route.name === 'Vehículos') return <Ionicons name="car" size={size} color={color} />;
          if (route.name === 'Historial') return <Ionicons name="time" size={size} color={color} />;
          if (route.name === 'Reportes') return <MaterialIcons name="bar-chart" size={size} color={color} />;
          if (route.name === 'Alertas') return <MaterialIcons name="notifications" size={size} color={color} />;
          if (route.name === 'Perfil') return <Ionicons name="person" size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Inicio" component={HomeScreen} />
      <Tab.Screen name="Vehículos" component={VehiclesScreen} />
      <Tab.Screen name="Historial" component={MaintenanceScreen} />
      <Tab.Screen name="Reportes" component={ReportsScreen} />
      <Tab.Screen name="Alertas" component={AlertsScreen} />
      <Tab.Screen name="Perfil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}