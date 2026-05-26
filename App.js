import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Dashboard from './src/screens/Dashboard';
import Workout from './src/screens/Workout';
import Analytics from './src/screens/Analytics';

export default function App() {
  const [currentScreen, setCurrentScreen] = React.useState('Dashboard');
  const [workoutParam, setWorkoutParam] = React.useState(null);

  const navigate = (screenName, params = null) => {
    if (params) setWorkoutParam(params);
    setCurrentScreen(screenName);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#14171c' }}>
      <StatusBar style="light" />
      
      <View style={{ flex: 1 }}>
        {currentScreen === 'Dashboard' && <Dashboard navigation={{ navigate }} />}
        {currentScreen === 'Workout' && <Workout route={{ params: workoutParam }} navigation={{ navigate }} />}
        {currentScreen === 'Analytics' && <Analytics />}
      </View>

      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigate('Dashboard')} style={styles.navItem}>
          <Text style={[styles.navText, currentScreen === 'Dashboard' && styles.activeNav]}>Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigate('Workout', { day: 'Monday' })} style={styles.navItem}>
          <Text style={[styles.navText, currentScreen === 'Workout' && styles.activeNav]}>Trainer</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigate('Analytics')} style={styles.navItem}>
          <Text style={[styles.navText, currentScreen === 'Analytics' && styles.activeNav]}>Logs</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navBar: { flexDirection: 'row', height: 65, backgroundColor: '#1e232b', borderTopWidth: 1, borderTopColor: '#2d3748', justifyContent: 'space-around', alignItems: 'center', paddingBottom: 10 },
  navItem: { padding: 10 },
  navText: { color: '#718096', fontWeight: '600', fontSize: 12 },
  activeNav: { color: '#dd6b20', fontWeight: 'bold' }
});