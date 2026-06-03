import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Dashboard from './src/screens/Dashboard';
import Workout from './src/screens/Workout';
import Analytics from './src/screens/Analytics';
import SettingsScreen from './src/screens/SettingsScreen';
import BloodPressureScreen from './src/screens/BloodPressure'; 

// 1. Define our global Light and Dark mode style objects
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
  
  // 2. Set the default application theme to dark mode
  const [themeMode, setThemeMode] = React.useState('dark');
  const currentTheme = themes[themeMode];

  const navigate = (screenName, params = null) => {
    if (params) setWorkoutParam(params);
    setCurrentScreen(screenName);
  };

  // 3. Simple function to flip between the modes
  const toggleTheme = () => {
    setThemeMode((prevMode) => (prevMode === 'dark' ? 'light' : 'dark'));
  };

  return (
    // 4. Update the main background wrapper to use dynamic theme styles
    <View style={{ flex: 1, backgroundColor: currentTheme.background }}>
      <StatusBar style={currentTheme.statusBar} />
      
      {/* Active Screen Viewport (Passing currentTheme and toggleTheme down) */}
      <View style={{ flex: 1 }}>
        {currentScreen === 'Dashboard' && <Dashboard navigation={{ navigate }} theme={currentTheme} />}
        {currentScreen === 'Workout' && <Workout route={{ params: workoutParam }} navigation={{ navigate }} theme={currentTheme} />}
        {currentScreen === 'Analytics' && <Analytics theme={currentTheme} />}
        
        {/* We explicitly pass theme and toggleTheme to SettingsScreen so it can display the switch */}
        {currentScreen === 'Settings' && <SettingsScreen theme={currentTheme} toggleTheme={toggleTheme} />}
        
        {currentScreen === 'BloodPressure' && <BloodPressureScreen theme={currentTheme} />}
      </View>

      {/* Navigation Tab Bar wrapper updated with dynamic theme background and borders */}
      <View style={[styles.navBar, { backgroundColor: currentTheme.card, borderTopColor: currentTheme.border }]}>
        <TouchableOpacity onPress={() => navigate('Dashboard')} style={styles.navItem}>
          <Text style={[styles.navText, currentScreen === 'Dashboard' && styles.activeNav]}>Dashboard</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => navigate('Workout', { day: 'Monday' })} style={styles.navItem}>
          <Text style={[styles.navText, currentScreen === 'Workout' && styles.activeNav]}>Trainer</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => navigate('Analytics')} style={styles.navItem}>
          <Text style={[styles.navText, currentScreen === 'Analytics' && styles.activeNav]}>Logs</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigate('BloodPressure')} style={styles.navItem}>
          <Text style={[styles.navText, currentScreen === 'BloodPressure' && styles.activeNav]}>BP</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigate('Settings')} style={styles.navItem}>
          <Text style={[styles.navText, currentScreen === 'Settings' && styles.activeNav]}>Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navBar: { 
    flexDirection: 'row', 
    height: 65, 
    borderTopWidth: 1, 
    justifyContent: 'space-around', 
    alignItems: 'center', 
    paddingBottom: 10 
  },
  navItem: { 
    padding: 10 
  },
  navText: { 
    color: '#718096', 
    fontWeight: '600', 
    fontSize: 12 
  },
  activeNav: { 
    color: '#dd6b20', 
    fontWeight: 'bold' 
  }
});