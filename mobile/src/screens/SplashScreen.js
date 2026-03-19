import React, { useEffect } from 'react';
import { View, Image, StyleSheet, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    const checkToken = async () => {
      await new Promise(resolve => setTimeout(resolve, 2500));
      const token = await AsyncStorage.getItem('token');
      if (token) {
        navigation.replace('Main');
      } else {
        navigation.replace('Login');
      }
    };
    checkToken();
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/LogoAutoCheck.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <ActivityIndicator size="small" color="#5B2EE8" style={styles.loader} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D1117', justifyContent: 'center', alignItems: 'center' },
  logo: { width: 280, height: 280 },
  loader: { marginTop: 40 },
});