import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Shield, Moon, Sun, Bell, SquareStack, Sliders } from 'lucide-react-native';

const STORAGE_KEY = '@fitpursuit_profile';
const HISTORY_KEY = '@fitpursuit_weight_history';

export default function SettingsScreen({ theme, toggleTheme, appSettings }) {
  // Fallback Normalizer: Dynamically protects the component regardless of how theme is supplied
  const isDark = typeof theme === 'string' ? theme !== 'light' : theme?.mode !== 'light';
  
  const activeTheme = typeof theme === 'object' && theme.background ? theme : {
    background: isDark ? '#14171c' : '#f7fafc',
    card: isDark ? '#1e232b' : '#ffffff',
    border: isDark ? 'rgba(255, 255, 255, 0.05)' : '#e2e8f0',
    text: isDark ? '#ffffff' : '#1a202c',
    textMuted: isDark ? '#718096' : '#4a5568',
    mode: isDark ? 'dark' : 'light'
  };

  const placeholderColor = isDark ? '#4a5568' : '#a0aec0';

  // Local Profile Form States
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [currentWeight, setCurrentWeight] = useState('');

  // Height Specific Inputs Layout Split
  const [heightFeet, setHeightFeet] = useState('');
  const [heightInches, setHeightInches] = useState('');
  const [heightCm, setHeightCm] = useState('');

  // Sync current layout configurations directly from App.js master states
  const currentHeightUnit = appSettings?.heightUnit || 'ft-in';
  const currentWeightUnit = appSettings?.weightUnit || 'lbs';

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      if (jsonValue != null) {
        const data = JSON.parse(jsonValue);
        setName(data.name || '');
        setAge(data.age ? data.age.toString() : '');
        // Gracefully fallback to old data fields so previous user metrics carry over cleanly
        setCurrentWeight(data.currentWeight ? data.currentWeight.toString() : (data.targetWeight ? data.targetWeight.toString() : ''));

        // Safely parse saved height configurations based on units
        if (data.heightUnit === 'ft-in' || (!data.heightUnit && data.height)) {
          const totalInches = data.height ? parseFloat(data.height) : 0;
          if (totalInches > 0) {
            setHeightFeet(Math.floor(totalInches / 12).toString());
            setHeightInches(Math.round(totalInches % 12).toString());
          }
        } else if (data.heightUnit === 'cm') {
          setHeightCm(data.height ? data.height.toString() : '');
        }
      }
    } catch (e) {
      console.log('Failed to load profile settings data.', e);
    }
  };

  const handleSaveProfile = async () => {
    try {
      let calculatedHeight = null;
      if (currentHeightUnit === 'ft-in') {
        const ft = parseInt(heightFeet, 10) || 0;
        const inch = parseInt(heightInches, 10) || 0;
        calculatedHeight = (ft * 12) + inch || null;
      } else {
        calculatedHeight = heightCm ? parseFloat(heightCm) : null;
      }

      const profileData = {
        name: name.trim(),
        age: age ? parseInt(age, 10) : null,
        height: calculatedHeight,
        currentWeight: currentWeight ? parseFloat(currentWeight) : null,
        // Retain key placeholder backup for complete multi-screen file safety
        targetWeight: currentWeight ? parseFloat(currentWeight) : null,
        weightUnit: currentWeightUnit,
        heightUnit: currentHeightUnit,
        updatedAt: new Date().toISOString(),
      };

      // 1. Save local snapshot configuration
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profileData));
      
      // 2. New tracking logic: Append value into historical logging timeline
      if (currentWeight && !isNaN(currentWeight)) {
        const existingHistoryRaw = await AsyncStorage.getItem(HISTORY_KEY);
        let historyArray = [];
        if (existingHistoryRaw) {
          historyArray = JSON.parse(existingHistoryRaw);
        }

        const newHistoryEntry = {
          id: Date.now().toString(),
          weight: parseFloat(currentWeight),
          date: new Date().toISOString().split('T')[0] // Formats cleanly as YYYY-MM-DD
        };

        const updatedHistoryArray = [newHistoryEntry, ...historyArray];
        await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistoryArray));
      }

      if (Platform.OS === 'web') {
        alert('Profile settings updated successfully!');
      } else {
        Alert.alert('Success', 'Profile settings updated successfully!');
      }
    } catch (e) {
      if (Platform.OS === 'web') {
        alert('Failed to save profile changes.');
      } else {
        Alert.alert('Error', 'Failed to save profile changes.');
      }
    }
  };

  const toggleWeightUnit = () => {
    const nextUnit = currentWeightUnit === 'lbs' ? 'kg' : 'lbs';
    if (appSettings?.updateWeightUnit) {
      appSettings.updateWeightUnit(nextUnit);
    }
  };

  const toggleHeightUnit = () => {
    const nextUnit = currentHeightUnit === 'ft-in' ? 'cm' : 'ft-in';
    if (appSettings?.updateHeightUnit) {
      appSettings.updateHeightUnit(nextUnit);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: activeTheme.background }]} contentContainerStyle={styles.contentContainer}>
      <Text style={[styles.title, { color: activeTheme.text }]}>Settings</Text>

      {/* Profile Section */}
      <View style={[styles.sectionCard, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}>
        <View style={styles.sectionHeader}>
          <User size={18} color="#dd6b20" />
          <Text style={[styles.sectionTitle, { color: activeTheme.text }]}>User Profile</Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: activeTheme.textMuted }]}>Display Name</Text>
          <TextInput
            style={[styles.input, { backgroundColor: activeTheme.background, borderColor: activeTheme.border, color: activeTheme.text }]}
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            placeholderTextColor={placeholderColor}
          />
        </View>

        <View style={styles.inlineRow}>
          <View style={[styles.formGroup, { flex: 1 }]}>
            <Text style={[styles.label, { color: activeTheme.textMuted }]}>Age</Text>
            <TextInput
              style={[styles.input, { backgroundColor: activeTheme.background, borderColor: activeTheme.border, color: activeTheme.text }]}
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
              placeholder="Years"
              placeholderTextColor={placeholderColor}
            />
          </View>

          {/* Dynamic Height Inputs Layout Split Block */}
          <View style={[styles.formGroup, { flex: 2 }]}>
            <Text style={[styles.label, { color: activeTheme.textMuted }]}>
              Height ({currentHeightUnit === 'ft-in' ? 'ft / in' : 'cm'})
            </Text>
            
            {currentHeightUnit === 'ft-in' ? (
              <View style={styles.splitRowContainer}>
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <TextInput
                    style={[styles.input, { flex: 1, backgroundColor: activeTheme.background, borderColor: activeTheme.border, color: activeTheme.text }]}
                    value={heightFeet}
                    onChangeText={setHeightFeet}
                    keyboardType="numeric"
                    placeholder="Feet"
                    placeholderTextColor={placeholderColor}
                  />
                  <Text style={{ color: activeTheme.text, fontWeight: '700', fontSize: 13 }}>ft</Text>
                </View>
                
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <TextInput
                    style={[styles.input, { flex: 1, backgroundColor: activeTheme.background, borderColor: activeTheme.border, color: activeTheme.text }]}
                    value={heightInches}
                    onChangeText={setHeightInches}
                    keyboardType="numeric"
                    placeholder="Inches"
                    placeholderTextColor={placeholderColor}
                  />
                  <Text style={{ color: activeTheme.text, fontWeight: '700', fontSize: 13 }}>in</Text>
                </View>
              </View>
            ) : (
              <TextInput
                style={[styles.input, { backgroundColor: activeTheme.background, borderColor: activeTheme.border, color: activeTheme.text }]}
                value={heightCm}
                onChangeText={setHeightCm}
                keyboardType="numeric"
                placeholder="Height in cm"
                placeholderTextColor={placeholderColor}
              />
            )}
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: activeTheme.textMuted }]}>Current Weight ({currentWeightUnit})</Text>
          <TextInput
            style={[styles.input, { backgroundColor: activeTheme.background, borderColor: activeTheme.border, color: activeTheme.text }]}
            value={currentWeight}
            onChangeText={setCurrentWeight}
            keyboardType="numeric"
            placeholder={`Current weight in ${currentWeightUnit}`}
            placeholderTextColor={placeholderColor}
          />
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
          <Text style={styles.saveButtonText}>Save Profile Data</Text>
        </TouchableOpacity>
      </View>

      {/* Preferences Section */}
      <View style={[styles.sectionCard, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}>
        <View style={styles.sectionHeader}>
          <SquareStack size={18} color="#dd6b20" />
          <Text style={[styles.sectionTitle, { color: activeTheme.text }]}>Application Preferences</Text>
        </View>

        {/* Theme Toggle Row */}
        <View style={[styles.settingRow, { borderBottomColor: activeTheme.border }]}>
          <View style={styles.settingMeta}>
            {activeTheme.mode === 'dark' ? <Moon size={16} color={activeTheme.text} /> : <Sun size={16} color={activeTheme.text} />}
            <Text style={[styles.settingLabel, { color: activeTheme.text }]}>Dark Mode Interface</Text>
          </View>
          <Switch
            value={activeTheme.mode === 'dark'}
            onValueChange={() => toggleTheme()}
            trackColor={{ false: '#718096', true: '#dd6b20' }}
            thumbColor={Platform.OS === 'android' ? '#ffffff' : undefined}
          />
        </View>

        {/* Weight Units Toggle Row */}
        <View style={[styles.settingRow, { borderBottomColor: activeTheme.border }]}>
          <View style={styles.settingMeta}>
            <Bell size={16} color={activeTheme.text} />
            <Text style={[styles.settingLabel, { color: activeTheme.text }]}>Measurement Weight Units</Text>
          </View>
          <TouchableOpacity style={styles.unitBadgeButton} onPress={toggleWeightUnit}>
            <Text style={styles.unitBadgeText}>{currentWeightUnit.toUpperCase()}</Text>
          </TouchableOpacity>
        </View>

        {/* Height Units Toggle Row */}
        <View style={[styles.settingRow, { borderBottomColor: activeTheme.border }]}>
          <View style={styles.settingMeta}>
            <Sliders size={16} color={activeTheme.text} />
            <Text style={[styles.settingLabel, { color: activeTheme.text }]}>Measurement Height Units</Text>
          </View>
          <TouchableOpacity style={styles.unitBadgeButton} onPress={toggleHeightUnit}>
            <Text style={styles.unitBadgeText}>{currentHeightUnit === 'ft-in' ? 'FT/IN' : 'CM'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Security Info Card */}
      <View style={[styles.sectionCard, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}>
        <View style={styles.sectionHeader}>
          <Shield size={18} color="#dd6b20" />
          <Text style={[styles.sectionTitle, { color: activeTheme.text }]}>Data Privacy</Text>
        </View>
        <Text style={[styles.privacyDescription, { color: activeTheme.textMuted }]}>
          FitPursuit uses secure on-device local caching engine systems (AsyncStorage) exclusively. Your personal vitals metrics and workout history blueprints are completely private and never uploaded to external servers.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { padding: 20, paddingTop: 60, paddingBottom: 60 },
  title: { fontSize: 26, fontWeight: '800', marginBottom: 24 },
  sectionCard: { borderRadius: 16, padding: 18, borderWidth: 1, marginBottom: 20 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  sectionTitle: { fontSize: 15, fontWeight: '700' },
  formGroup: { marginBottom: 14, width: '100%' },
  label: { fontSize: 11, fontWeight: '700', marginBottom: 6 },
  input: { height: 42, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, fontSize: 14, fontWeight: '600' },
  inlineRow: { flexDirection: 'row', gap: 12 },
  splitRowContainer: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  saveButton: { backgroundColor: '#dd6b20', height: 42, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  saveButtonText: { color: '#ffffff', fontWeight: '700', fontSize: 14 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1 },
  settingMeta: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  settingLabel: { fontSize: 13, fontWeight: '600' },
  unitBadgeButton: { backgroundColor: '#dd6b20', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  unitBadgeText: { color: '#ffffff', fontSize: 11, fontWeight: '800' },
  privacyDescription: { fontSize: 12, lineHeight: 18 }
});