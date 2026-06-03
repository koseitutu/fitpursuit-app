import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Scale, Ruler, Calendar, Check, Sliders } from 'lucide-react-native';

const STORAGE_KEY = '@fitpursuit_profile';

export default function SettingsScreen() {
  // Loading & State
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // 'success' | 'error' | null

  // Profile Form States
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');

  // Unit Preferences States (Item 3!)
  const [weightUnit, setWeightUnit] = useState('lbs'); // 'lbs' | 'kg'
  const [heightUnit, setHeightUnit] = useState('in');  // 'in' | 'cm'

  // Load existing profile from AsyncStorage when screen mounts
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
        setWeight(data.weight ? data.weight.toString() : '');
        setWeightUnit(data.weightUnit || 'lbs');
        setHeightUnit(data.heightUnit || 'in');
      }
    } catch (e) {
      console.error('Failed to load profile data.', e);
    } finally {
      setLoading(false);
    }
  };

  const saveProfileData = async () => {
    setSaveStatus(null);
    try {
      // Basic input validation
      if (!name.trim()) {
        setSaveStatus('error');
        return;
      }

      const profileData = {
        name: name.trim(),
        age: age ? parseInt(age, 10) : null,
        height: height ? parseFloat(height) : null,
        weight: weight ? parseFloat(weight) : null,
        weightUnit,
        heightUnit,
        updatedAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profileData));
      setSaveStatus('success');
      setIsEditing(false);

      // Clear save message after 3 seconds
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (e) {
      console.error('Failed to save profile data.', e);
      setSaveStatus('error');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#dd6b20" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Manage your profile and app preferences</Text>

        {/* Status Messaging */}
        {saveStatus === 'success' && (
          <View style={[styles.statusBox, styles.successBox]}>
            <Text style={styles.successText}>✓ Profile updated successfully!</Text>
          </View>
        )}
        {saveStatus === 'error' && (
          <View style={[styles.statusBox, styles.errorBox]}>
            <Text style={styles.errorText}>⚠️ Please fill out at least your name.</Text>
          </View>
        )}

        {/* Card: Profile Information */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Personal Profile</Text>
            {!isEditing ? (
              <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.editButton}>
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={saveProfileData} style={styles.saveButton}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Form Fields */}
          <View style={styles.form}>
            {/* Name Input */}
            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <User size={16} color="#dd6b20" style={styles.inputIcon} />
                <Text style={styles.label}>Full Name</Text>
              </View>
              <TextInput
                style={[styles.input, !isEditing && styles.disabledInput]}
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor="#4a5568"
                editable={isEditing}
              />
            </View>

            {/* Age Input */}
            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <Calendar size={16} color="#dd6b20" style={styles.inputIcon} />
                <Text style={styles.label}>Age</Text>
              </View>
              <TextInput
                style={[styles.input, !isEditing && styles.disabledInput]}
                value={age}
                onChangeText={setAge}
                keyboardType="number-pad"
                placeholder="Years"
                placeholderTextColor="#4a5568"
                editable={isEditing}
              />
            </View>

            {/* Height Input */}
            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <Ruler size={16} color="#dd6b20" style={styles.inputIcon} />
                <Text style={styles.label}>Height ({heightUnit})</Text>
              </View>
              <TextInput
                style={[styles.input, !isEditing && styles.disabledInput]}
                value={height}
                onChangeText={setHeight}
                keyboardType="decimal-pad"
                placeholder={`Height in ${heightUnit}`}
                placeholderTextColor="#4a5568"
                editable={isEditing}
              />
            </View>

            {/* Weight Input */}
            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <Scale size={16} color="#dd6b20" style={styles.inputIcon} />
                <Text style={styles.label}>Initial Weight ({weightUnit})</Text>
              </View>
              <TextInput
                style={[styles.input, !isEditing && styles.disabledInput]}
                value={weight}
                onChangeText={setWeight}
                keyboardType="decimal-pad"
                placeholder={`Weight in ${weightUnit}`}
                placeholderTextColor="#4a5568"
                editable={isEditing}
              />
            </View>
          </View>
        </View>

        {/* Card: Units Preferences (Item 3 Setup) */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Units of Measurement</Text>
            <Sliders size={18} color="#dd6b20" />
          </View>

          <View style={styles.preferences}>
            {/* Weight Preference Toggle */}
            <View style={styles.preferenceRow}>
              <Text style={styles.preferenceLabel}>Weight Units</Text>
              <View style={styles.toggleContainer}>
                <TouchableOpacity
                  style={[styles.toggleBtn, weightUnit === 'lbs' && styles.toggleBtnActive]}
                  onPress={async () => {
                    setWeightUnit('lbs');
                    // Automatically save unit change to storage
                    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
                    const current = jsonValue ? JSON.parse(jsonValue) : {};
                    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, weightUnit: 'lbs' }));
                  }}
                >
                  <Text style={[styles.toggleBtnText, weightUnit === 'lbs' && styles.toggleBtnTextActive]}>LBS</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.toggleBtn, weightUnit === 'kg' && styles.toggleBtnActive]}
                  onPress={async () => {
                    setWeightUnit('kg');
                    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
                    const current = jsonValue ? JSON.parse(jsonValue) : {};
                    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, weightUnit: 'kg' }));
                  }}
                >
                  <Text style={[styles.toggleBtnText, weightUnit === 'kg' && styles.toggleBtnTextActive]}>KG</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Height Preference Toggle */}
            <View style={styles.preferenceRow}>
              <Text style={styles.preferenceLabel}>Height Units</Text>
              <View style={styles.toggleContainer}>
                <TouchableOpacity
                  style={[styles.toggleBtn, heightUnit === 'in' && styles.toggleBtnActive]}
                  onPress={async () => {
                    setHeightUnit('in');
                    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
                    const current = jsonValue ? JSON.parse(jsonValue) : {};
                    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, heightUnit: 'in' }));
                  }}
                >
                  <Text style={[styles.toggleBtnText, heightUnit === 'in' && styles.toggleBtnTextActive]}>IN</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.toggleBtn, heightUnit === 'cm' && styles.toggleBtnActive]}
                  onPress={async () => {
                    setHeightUnit('cm');
                    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
                    const current = jsonValue ? JSON.parse(jsonValue) : {};
                    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, heightUnit: 'cm' }));
                  }}
                >
                  <Text style={[styles.toggleBtnText, heightUnit === 'cm' && styles.toggleBtnTextActive]}>CM</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#14171c',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#14171c',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 14,
    color: '#718096',
    marginTop: 4,
    marginBottom: 24,
  },
  statusBox: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  successBox: {
    backgroundColor: 'rgba(56, 161, 105, 0.1)',
    borderWidth: 1,
    borderColor: '#38a169',
  },
  successText: {
    color: '#48bb78',
    fontSize: 13,
    fontWeight: '600',
  },
  errorBox: {
    backgroundColor: 'rgba(229, 62, 62, 0.1)',
    borderWidth: 1,
    borderColor: '#e53e3e',
  },
  errorText: {
    color: '#f56565',
    fontSize: 13,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#1e232b',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.03)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    flex: 1,
  },
  editButton: {
    backgroundColor: 'rgba(221, 107, 32, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  editButtonText: {
    color: '#dd6b20',
    fontSize: 12,
    fontWeight: '700',
  },
  saveButton: {
    backgroundColor: '#dd6b20',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputIcon: {
    marginRight: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#a0aec0',
  },
  input: {
    backgroundColor: '#14171c',
    borderWidth: 1,
    borderColor: '#2d3748',
    borderRadius: 12,
    padding: 12,
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  disabledInput: {
    color: '#718096',
    borderColor: 'transparent',
    backgroundColor: 'rgba(20, 23, 28, 0.5)',
  },
  preferences: {
    gap: 16,
  },
  preferenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  preferenceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e2e8f0',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#14171c',
    borderRadius: 10,
    padding: 3,
  },
  toggleBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  toggleBtnActive: {
    backgroundColor: '#dd6b20',
  },
  toggleBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#718096',
  },
  toggleBtnTextActive: {
    color: '#ffffff',
  },
});