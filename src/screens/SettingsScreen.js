import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Shield, Moon, Sun, Bell, SquareStack } from 'lucide-react-native';

const STORAGE_KEY = '@fitpursuit_profile';

export default function SettingsScreen({ theme, toggleTheme, appSettings, updateAppSettings }) {
  // Local Profile Form States
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [targetWeight, setTargetWeight] = useState('');

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
        setHeight(data.height ? data.height.toString() : '');
        setTargetWeight(data.targetWeight ? data.targetWeight.toString() : '');
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to load profile settings data.');
    }
  };

  const handleSaveProfile = async () => {
    try {
      const profileData = {
        name,
        age: parseInt(age) || 0,
        height: parseFloat(height) || 0,
        targetWeight: parseFloat(targetWeight) || 0,
      };

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profileData));
      Alert.alert('Success', 'Profile settings updated successfully!');
    } catch (e) {
      Alert.alert('Error', 'Failed to save profile changes.');
    }
  };

  const toggleWeightUnit = () => {
    const nextUnit = appSettings.weightUnit === 'lbs' ? 'kg' : 'lbs';
    updateAppSettings({ weightUnit: nextUnit });
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.contentContainer}>
      <Text style={[styles.title, { color: theme.text }]}>Settings</Text>

      {/* Profile Section */}
      <View style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={styles.sectionHeader}>
          <User size={18} color="#dd6b20" />
          <Text style={[styles.sectionTitle, { color: theme.text }]}>User Profile</Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.textMuted }]}>Display Name</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            placeholderTextColor="#4a5568"
          />
        </View>

        <View style={styles.inlineRow}>
          <View style={[styles.formGroup, { flex: 1 }]}>
            <Text style={[styles.label, { color: theme.textMuted }]}>Age</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
              placeholder="Years"
              placeholderTextColor="#4a5568"
            />
          </View>

          <View style={[styles.formGroup, { flex: 1 }]}>
            <Text style={[styles.label, { color: theme.textMuted }]}>Height (cm)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
              value={height}
              onChangeText={setHeight}
              keyboardType="numeric"
              placeholder="cm"
              placeholderTextColor="#4a5568"
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.textMuted }]}>Target Goal Weight ({appSettings.weightUnit})</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
            value={targetWeight}
            onChangeText={setTargetWeight}
            keyboardType="numeric"
            placeholder={`Target in ${appSettings.weightUnit}`}
            placeholderTextColor="#4a5568"
          />
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
          <Text style={styles.saveButtonText}>Save Profile Data</Text>
        </TouchableOpacity>
      </View>

      {/* Preferences Section */}
      <View style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={styles.sectionHeader}>
          <SquareStack size={18} color="#dd6b20" />
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Application Preferences</Text>
        </View>

        {/* Theme Toggle Row */}
        <View style={styles.settingRow}>
          <View style={styles.settingMeta}>
            {appSettings.isDarkMode ? <Moon size={16} color={theme.text} /> : <Sun size={16} color={theme.text} />}
            <Text style={[styles.settingLabel, { color: theme.text }]}>Dark Mode Interface</Text>
          </View>
          <Switch
            value={appSettings.isDarkMode}
            onValueChange={toggleTheme}
            trackColor={{ false: '#718096', true: '#dd6b20' }}
            thumbColor={Platform.OS === 'android' ? '#ffffff' : undefined}
          />
        </View>

        {/* Units Toggle Row */}
        <View style={styles.settingRow}>
          <View style={styles.settingMeta}>
            <Bell size={16} color={theme.text} />
            <Text style={[styles.settingLabel, { color: theme.text }]}>Measurement Weight Units</Text>
          </View>
          <TouchableOpacity style={styles.unitBadgeButton} onPress={toggleWeightUnit}>
            <Text style={styles.unitBadgeText}>{appSettings.weightUnit.toUpperCase()}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Security Info Card */}
      <View style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={styles.sectionHeader}>
          <Shield size={18} color="#dd6b20" />
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Data Privacy</Text>
        </View>
        <Text style={[styles.privacyDescription, { color: theme.textMuted }]}>
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
  label: { fontSize: 11, fontWeight: '700', marginBottom: 6, uppercase: true },
  input: { height: 42, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, fontSize: 14, fontWeight: '600' },
  inlineRow: { flexDirection: 'row', gap: 12 },
  saveButton: { backgroundColor: '#dd6b20', height: 42, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  saveButtonText: { color: '#ffffff', fontWeight: '700', fontSize: 14 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(113, 128, 150, 0.1)' },
  settingMeta: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  settingLabel: { fontSize: 13, fontWeight: '600' },
  unitBadgeButton: { backgroundColor: '#dd6b20', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  unitBadgeText: { color: '#ffffff', fontSize: 11, fontWeight: '800' },
  privacyDescription: { fontSize: 12, lineHeight: 18 }
});