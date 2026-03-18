import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen';
import MaintenanceScreen from '../screens/MaintenanceScreen';
import VehiclesScreen from '../screens/VehiclesScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ProfileScreen from '../screens/ProfileScreen';

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
          backgroundColor: theme.background,
          borderTopWidth: 0,
          elevation: 5,
        },
        tabBarIcon: ({ color, size }) => {
          let iconName = 'ellipse'; 

          if (route.name === 'Inicio') iconName = 'home';
          else if (route.name === 'Historial') iconName = 'time';
          else if (route.name === 'Docs') iconName = 'document-text';
          else if (route.name === 'Reportes') iconName = 'bar-chart';
          else if (route.name === 'Alertas') iconName = 'alert-circle';

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Inicio" component={HomeScreen} />
      <Tab.Screen name="Historial" component={MaintenanceScreen} />
      <Tab.Screen name="Docs" component={VehiclesScreen} />
      <Tab.Screen name="Reportes" component={SettingsScreen} />
      <Tab.Screen name="Alertas" component={ProfileScreen} />
    </Tab.Navigator>
  );
}