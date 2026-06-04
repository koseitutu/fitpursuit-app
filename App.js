import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons'; // Built-in Expo Vector Icons

// Screens
import Dashboard from './src/screens/Dashboard';
import Workout from './src/screens/Workout';
import Analytics from './src/screens/Analytics';
import SettingsScreen from './src/screens/SettingsScreen';
import BloodPressureScreen from './src/screens/BloodPressure'; 

const themes = {
  dark: {
    mode: 'dark',
    background: '#14171c',
    card: '#1e232b',
    text: '#ffffff',
    textMuted: '#718096',
    border: '#2d3748',
    statusBar: 'light',
  },
  light: {
    mode: 'light',
    background: '#f7fafc',
    card: '#ffffff',
    text: '#1a202c',
    textMuted: '#4a5568',
    border: '#e2e8f0',
    statusBar: 'dark',
  }
};

export default function App() {
  const [currentScreen, setCurrentScreen] = React.useState('Dashboard');
  const [workoutParam, setWorkoutParam] = React.useState(null);
  const [themeMode, setThemeMode] = React.useState('dark');
  
  // New Global Preferences States (Addresses issues 2, 3, and 4)
  const [weightUnit, setWeightUnit] = useState('lbs'); // 'lbs' or 'kg'
  const [heightUnit, setHeightUnit] = useState('ft-in'); // 'ft-in' or 'cm'

  const currentTheme = themes[themeMode];

  // Load saved configurations when the app boots up
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('@theme_mode');
        const savedWeightUnit = await AsyncStorage.getItem('@weight_unit');
        const savedHeightUnit = await AsyncStorage.getItem('@height_unit');
        
        if (savedTheme) setThemeMode(savedTheme);
        if (savedWeightUnit) setWeightUnit(savedWeightUnit);
        if (savedHeightUnit) setHeightUnit(savedHeightUnit);
      } catch (e) {
        console.log("Error loading global preference configurations", e);
      }
    };
    loadPreferences();
  }, []);

  const navigate = (screenName, params = null) => {
    if (params) setWorkoutParam(params);
    setCurrentScreen(screenName);
  };

  const toggleTheme = async () => {
    const nextTheme = themeMode === 'dark' ? 'light' : 'dark';
    setThemeMode(nextTheme);
    await AsyncStorage.setItem('@theme_mode', nextTheme);
  };

  const updateWeightUnit = async (unit) => {
    setWeightUnit(unit);
    await AsyncStorage.setItem('@weight_unit', unit);
  };

  const updateHeightUnit = async (unit) => {
    setHeightUnit(unit);
    await AsyncStorage.setItem('@height_unit', unit);
  };

  // Grouping shared settings to reduce boilerplate prop drilling
  const globalAppSettings = {
    theme: currentTheme,
    weightUnit,
    updateWeightUnit,
    heightUnit,
    updateHeightUnit,
    toggleTheme
  };

  return (
    <View style={{ flex: 1, backgroundColor: currentTheme.background }}>
      <StatusBar style={currentTheme.statusBar} />
      
      {/* Viewport Render Layer */}
      <View style={{ flex: 1 }}>
        {currentScreen === 'Dashboard' && <Dashboard navigation={{ navigate }} appSettings={globalAppSettings} theme={currentTheme} />}
        {currentScreen === 'Workout' && <Workout route={{ params: workoutParam }} navigation={{ navigate }} appSettings={globalAppSettings} theme={currentTheme} />}
        {currentScreen === 'Analytics' && <Analytics appSettings={globalAppSettings} theme={currentTheme} />}
        {currentScreen === 'Settings' && <SettingsScreen appSettings={globalAppSettings} theme={currentTheme} toggleTheme={toggleTheme} />}
        {currentScreen === 'BloodPressure' && <BloodPressureScreen appSettings={globalAppSettings} theme={currentTheme} />}
      </View>

      {/* Reordered Clean Nav Bar: Analytics -> Workout -> DASHBOARD (Center Anchor) -> BP -> Settings */}
      <View style={[styles.navBar, { backgroundColor: currentTheme.card, borderTopColor: currentTheme.border }]}>
        
        {/* 1. Logs / Analytics Tab */}
        <TouchableOpacity onPress={() => navigate('Analytics')} style={styles.navItem}>
          <Ionicons 
            name="bar-chart-sharp" 
            size={22} 
            color={currentScreen === 'Analytics' ? '#dd6b20' : '#718096'} 
          />
        </TouchableOpacity>
        
        {/* 2. Exercise Trainer Tab */}
        <TouchableOpacity onPress={() => navigate('Workout', { day: 'Monday' })} style={styles.navItem}>
          <Ionicons 
            name="fitness" 
            size={24} 
            color={currentScreen === 'Workout' ? '#dd6b20' : '#718096'} 
          />
        </TouchableOpacity>

        {/* 3. Centralized Home Anchor Tab */}
        <TouchableOpacity onPress={() => navigate('Dashboard')} style={styles.centerHomeButton}>
          <View style={[styles.homeIconWrapper, { backgroundColor: currentScreen === 'Dashboard' ? '#dd6b20' : '#2d3748' }]}>
            <Ionicons 
              name="home" 
              size={24} 
              color="#ffffff" 
            />
          </View>
        </TouchableOpacity>

        {/* 4. Blood Pressure Tab */}
        <TouchableOpacity onPress={() => navigate('BloodPressure')} style={styles.navItem}>
          <Ionicons 
            name="heart" 
            size={24} 
            color={currentScreen === 'BloodPressure' ? '#dd6b20' : '#718096'} 
          />
        </TouchableOpacity>

        {/* 5. Settings Tab */}
        <TouchableOpacity onPress={() => navigate('Settings')} style={styles.navItem}>
          <Ionicons 
            name="settings" 
            size={22} 
            color={currentScreen === 'Settings' ? '#dd6b20' : '#718096'} 
          />
        </TouchableOpacity>
        
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navBar: { 
    flexDirection: 'row', 
    height: 70, 
    borderTopWidth: 1, 
    justifyContent: 'space-around', 
    alignItems: 'center', 
    paddingBottom: 15,
    position: 'relative'
  },
  navItem: { 
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1
  },
  centerHomeButton: {
    top: -12, // Lifts the button slightly above the tab bar frame
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  homeIconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8, // Floating shadow effect on Android hardware
  }
});