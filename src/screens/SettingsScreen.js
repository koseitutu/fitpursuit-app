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
import { User, Shield, Moon, Sun, Bell, SquareStack, Sliders, Download, Upload } from 'lucide-react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const STORAGE_KEY = '@fitpursuit_profile';
const HISTORY_KEY = '@fitpursuit_weight_history';
const WORKOUT_HISTORY_KEY = '@fitpursuit_workout_history';
const VITALS_HISTORY_KEY = '@fitpursuit_vitals_history';
const BP_SCREEN_HISTORY_KEY = '@fitpursuit_bp_history';

// Web Guard: Safely falls back to an empty string if running in a web browser architecture context
const safeDocumentDirectory = FileSystem.documentDirectory || '';

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
        
        // Priority Enforcement: Strictly binds present statistics, skipping obsolete targets
        setCurrentWeight(data.currentWeight ? data.currentWeight.toString() : '');

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
        targetWeight: currentWeight ? parseFloat(currentWeight) : null,
        weightUnit: currentWeightUnit,
        heightUnit: currentHeightUnit,
        updatedAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profileData));
      
      if (currentWeight && !isNaN(currentWeight)) {
        const existingHistoryRaw = await AsyncStorage.getItem(HISTORY_KEY);
        let historyArray = [];
        if (existingHistoryRaw) {
          historyArray = JSON.parse(existingHistoryRaw);
        }

        const newHistoryEntry = {
          id: Date.now().toString(),
          weight: parseFloat(currentWeight),
          date: new Date().toISOString().split('T')[0]
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

  // --- UNIFIED IMPORT/EXPORT LOGIC (COMBINED CSV METHOD) ---
  
  const handleExportCSV = async () => {
    if (Platform.OS === 'web') {
      alert('Local file sharing is unavailable in standard web browser sandboxes. Use an emulator or Expo Go.');
      return;
    }

    try {
      const [profileRaw, weightRaw, workoutRaw, vitalsRaw, bpRaw] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEY),
        AsyncStorage.getItem(HISTORY_KEY),
        AsyncStorage.getItem(WORKOUT_HISTORY_KEY),
        AsyncStorage.getItem(VITALS_HISTORY_KEY),
        AsyncStorage.getItem(BP_SCREEN_HISTORY_KEY)
      ]);

      let csvContent = 'DATA_TYPE,PAYLOAD_JSON\n';

      if (profileRaw) csvContent += `PROFILE,${JSON.stringify(profileRaw)}\n`;
      if (weightRaw) csvContent += `WEIGHT,${JSON.stringify(weightRaw)}\n`;
      if (workoutRaw) csvContent += `WORKOUT,${JSON.stringify(workoutRaw)}\n`;
      if (vitalsRaw) csvContent += `VITAL,${JSON.stringify(vitalsRaw)}\n`;
      if (bpRaw) csvContent += `BP,${JSON.stringify(bpRaw)}\n`;

      // Uses the safeguarded path variable to prevent null reference errors on web bundle renders
      const fileUri = `${safeDocumentDirectory}fitpursuit_backup.csv`;
      await FileSystem.writeAsStringAsync(fileUri, csvContent, { encoding: FileSystem.EncodingType.UTF8 });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, { mimeType: 'text/csv', dialogTitle: 'Export FitPursuit Metrics Backup' });
      } else {
        Alert.alert('Unsupported Engine', 'Sharing is not available on this device ecosystem.');
      }
    } catch (error) {
      console.error('Export operation failure:', error);
      Alert.alert('Export Failed', 'An unexpected conflict caused the backup routine to pause.');
    }
  };

  const handleImportCSV = async () => {
    if (Platform.OS === 'web') {
      alert('File importing needs to be executed inside a local native deployment bundle context.');
      return;
    }

    Alert.alert(
      'Import Backup',
      'Are you sure you want to load this file? This will merge or overwrite your current active logs.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Proceed',
          onPress: async () => {
            try {
              const fileUri = `${safeDocumentDirectory}fitpursuit_backup.csv`;
              
              const fileExists = await FileSystem.getInfoAsync(fileUri);
              if (!fileExists.exists) {
                Alert.alert('No File Detected', 'Please ensure fitpursuit_backup.csv exists in your app document directory folder.');
                return;
              }

              const csvString = await FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.UTF8 });
              const rows = csvString.split('\n');

              let importedProfile = null;
              let importedWeight = null;
              let importedWorkout = null;
              let importedVitals = null;
              let importedBp = null;

              for (let i = 1; i < rows.length; i++) {
                const currentRow = rows[i].trim();
                if (!currentRow) continue;

                const commaIndex = currentRow.indexOf(',');
                if (commaIndex === -1) continue;

                const dataType = currentRow.substring(0, commaIndex);
                let payloadJson = currentRow.substring(commaIndex + 1);

                if (payloadJson.startsWith('"') && payloadJson.endsWith('"')) {
                  payloadJson = payloadJson.slice(1, -1);
                }
                payloadJson = payloadJson.replace(/""/g, '"');

                try {
                  const verifiedData = JSON.parse(payloadJson);
                  if (dataType === 'PROFILE') importedProfile = verifiedData;
                  if (dataType === 'WEIGHT') importedWeight = verifiedData;
                  if (dataType === 'WORKOUT') importedWorkout = verifiedData;
                  if (dataType === 'VITAL') importedVitals = verifiedData;
                  if (dataType === 'BP') importedBp = verifiedData;
                } catch (e) {
                  console.log(`Failed parsing item block line: ${i}`, e);
                }
              }

              const saveOperations = [];
              if (importedProfile) saveOperations.push(AsyncStorage.setItem(STORAGE_KEY, typeof importedProfile === 'string' ? importedProfile : JSON.stringify(importedProfile)));
              if (importedWeight) saveOperations.push(AsyncStorage.setItem(HISTORY_KEY, typeof importedWeight === 'string' ? importedWeight : JSON.stringify(importedWeight)));
              if (importedWorkout) saveOperations.push(AsyncStorage.setItem(WORKOUT_HISTORY_KEY, typeof importedWorkout === 'string' ? importedWorkout : JSON.stringify(importedWorkout)));
              if (importedVitals) saveOperations.push(AsyncStorage.setItem(VITALS_HISTORY_KEY, typeof importedVitals === 'string' ? importedVitals : JSON.stringify(importedVitals)));
              if (importedBp) saveOperations.push(AsyncStorage.setItem(BP_SCREEN_HISTORY_KEY, typeof importedBp === 'string' ? importedBp : JSON.stringify(importedBp)));

              if (saveOperations.length > 0) {
                await Promise.all(saveOperations);
                Alert.alert('Success', 'Metrics loaded perfectly.', [
                  { text: 'OK', onPress: () => loadProfileData() }
                ]);
              } else {
                Alert.alert('Import Halted', 'No structural data alignment found within the file.');
              }
            } catch (err) {
              console.error('Import processing sequence failure:', err);
              Alert.alert('Import Failed', 'Unable to parse structural components from file parameters.');
            }
          }
        }
      ]
    );
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

      {/* CSV Backup Card Section */}
      <View style={[styles.sectionCard, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}>
        <View style={styles.sectionHeader}>
          <Download size={18} color="#dd6b20" />
          <Text style={[styles.sectionTitle, { color: activeTheme.text }]}>Data Backup Control Hub</Text>
        </View>
        
        <Text style={[styles.backupDescriptionText, { color: activeTheme.textMuted }]}>
          Generate a cross-platform data snapshot (`.csv` format) to back up your metrics history offline, or load a historical save point.
        </Text>

        <View style={styles.backupActionsButtonGroupRow}>
          <TouchableOpacity 
            style={[styles.backupUtilityButton, { backgroundColor: '#dd6b20' }]} 
            onPress={handleExportCSV}
          >
            <Download size={16} color="#ffffff" />
            <Text style={styles.backupUtilityButtonText}>Export CSV</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.backupUtilityButton, { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#dd6b20' }]} 
            onPress={handleImportCSV}
          >
            <Upload size={16} color="#dd6b20" />
            <Text style={[styles.backupUtilityButtonText, { color: '#dd6b20' }]}>Import CSV</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Preferences Section */}
      <View style={[styles.sectionCard, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}>
        <View style={styles.sectionHeader}>
          <SquareStack size={18} color="#dd6b20" />
          <Text style={[styles.sectionTitle, { color: activeTheme.text }]}>Application Preferences</Text>
        </View>

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

        <View style={[styles.settingRow, { borderBottomColor: activeTheme.border }]}>
          <View style={styles.settingMeta}>
            <Bell size={16} color={activeTheme.text} />
            <Text style={[styles.settingLabel, { color: activeTheme.text }]}>Measurement Weight Units</Text>
          </View>
          <TouchableOpacity style={styles.unitBadgeButton} onPress={toggleWeightUnit}>
            <Text style={styles.unitBadgeText}>{currentWeightUnit.toUpperCase()}</Text>
          </TouchableOpacity>
        </View>

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

      {/* Data Privacy Section */}
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
  backupDescriptionText: { fontSize: 12, lineHeight: 18, marginBottom: 14 },
  backupActionsButtonGroupRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginTop: 4 },
  backupUtilityButton: { flex: 1, height: 40, borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  backupUtilityButtonText: { color: '#ffffff', fontSize: 13, fontWeight: '700' },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1 },
  settingMeta: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  settingLabel: { fontSize: 13, fontWeight: '600' },
  unitBadgeButton: { backgroundColor: '#dd6b20', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  unitBadgeText: { color: '#ffffff', fontSize: 11, fontWeight: '800' },
  privacyDescription: { fontSize: 12, lineHeight: 18 }
});