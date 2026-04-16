import ReportsScreen from '../screens/ReportsScreen';
import VehicleDetailScreen from '../screens/VehicleDetailScreen';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import AddVehicleScreen from '../screens/AddVehicleScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AddMaintenanceScreen from '../screens/AddMaintenanceScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import AlertsScreen from '../screens/AlertsScreen';
import DocumentsScreen from '../screens/DocumentsScreen';
import BottomTabs from './BottomTabs';
import EditVehicleScreen from '../screens/EditVehicleScreen';
import MaintenanceDetailScreen from '../screens/MaintenanceDetailScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Reports" component={ReportsScreen} />
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Main" component={BottomTabs} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="AddVehicle" component={AddVehicleScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="AddMaintenance" component={AddMaintenanceScreen} />
        <Stack.Screen
 name="EditVehicle"
 component={EditVehicleScreen}
/>
        <Stack.Screen name="Alertas" component={AlertsScreen} />
        <Stack.Screen name="VehicleDetail" component={VehicleDetailScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
<Stack.Screen name="Documentos" component={DocumentsScreen} />
        <Stack.Screen name="MaintenanceDetail" component={MaintenanceDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}