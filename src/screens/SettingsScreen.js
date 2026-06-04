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
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Scale, Ruler, Calendar, Check, Sliders, Download, Upload, Moon, Sun } from 'lucide-react-native';

const STORAGE_KEY = '@fitpursuit_profile';
const BP_STORAGE_KEY = '@fitpursuit_bp_logs';
const isWeb = typeof document !== 'undefined';

export default function SettingsScreen({ theme, toggleTheme, appSettings }) {
  // Loading & UI State [cite: 4, 5]
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [csvStatus, setCsvStatus] = useState(null);

  // Profile Form States [cite: 6, 7]
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');

  // Feet & Inches Specific Inputs Layout Split
  const [heightFeet, setHeightFeet] = useState('');
  const [heightInches, setHeightInches] = useState('');
  const [heightCm, setHeightCm] = useState('');

  // Consume or Fall Back to App.js Master References [cite: 7]
  const currentWeightUnit = appSettings?.weightUnit || 'lbs';
  const currentHeightUnit = appSettings?.heightUnit || 'ft-in';

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY); [cite: 9]
      if (jsonValue != null) { [cite: 10]
        const data = JSON.parse(jsonValue); [cite: 10]
        setName(data.name || ''); [cite: 10]
        setAge(data.age ? data.age.toString() : ''); [cite: 11]
        setWeight(data.weight ? data.weight.toString() : ''); [cite: 11]

        // Parse legacy configurations securely if present [cite: 11, 12]
        const savedHeightUnit = data.heightUnit === 'in' ? 'ft-in' : (data.heightUnit || 'ft-in');
        
        if (savedHeightUnit === 'ft-in') {
          const totalInches = data.height ? parseFloat(data.height) : 0;
          if (totalInches > 0) {
            setHeightFeet(Math.floor(totalInches / 12).toString());
            setHeightInches(Math.round(totalInches % 12).toString());
          }
        } else {
          setHeightCm(data.height ? data.height.toString() : '');
        }

        // Initialize App.js state containers with persisted storage context
        if (data.weightUnit && appSettings?.updateWeightUnit) {
          appSettings.updateWeightUnit(data.weightUnit);
        }
        if (data.heightUnit && appSettings?.updateHeightUnit) {
          appSettings.updateHeightUnit(savedHeightUnit);
        }
      }
    } catch (e) {
      console.error('Failed to load profile data.', e); [cite: 12]
    } finally {
      setLoading(false); [cite: 13]
    }
  };

  const saveProfileData = async () => {
    setSaveStatus(null); [cite: 14]
    try {
      if (!name.trim()) { [cite: 15]
        setSaveStatus('error'); [cite: 15]
        return; [cite: 15]
      }

      // Calculate the standardized metric height value to save [cite: 17]
      let calculatedHeight = null;
      if (currentHeightUnit === 'ft-in') {
        const ft = parseInt(heightFeet, 10) || 0;
        const inch = parseInt(heightInches, 10) || 0;
        calculatedHeight = (ft * 12) + inch || null; // Converted back to total inches
      } else {
        calculatedHeight = heightCm ? parseFloat(heightCm) : null;
      }

      const profileData = {
        name: name.trim(), [cite: 16]
        age: age ? parseInt(age, 10) : null, [cite: 16, 17]
        height: calculatedHeight,
        weight: weight ? parseFloat(weight) : null, [cite: 18, 19]
        weightUnit: currentWeightUnit,
        heightUnit: currentHeightUnit,
        updatedAt: new Date().toISOString(), [cite: 19]
      };

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profileData)); [cite: 20]
      setSaveStatus('success'); [cite: 20]
      setIsEditing(false); [cite: 20]

      setTimeout(() => setSaveStatus(null), 3000); [cite: 20]
    } catch (e) {
      console.error('Failed to save profile data.', e); [cite: 20]
      setSaveStatus('error'); [cite: 21]
    }
  };

  // Keep internal backup handlers intact [cite: 21]
  const handleExportCSV = async () => {
    setCsvStatus(null); [cite: 21]
    try {
      const storedData = await AsyncStorage.getItem(BP_STORAGE_KEY); [cite: 22]
      const records = storedData ? JSON.parse(storedData) : []; [cite: 22]
      if (records.length === 0) { [cite: 23]
        if (isWeb) { [cite: 23]
          setCsvStatus('No blood pressure records found to export.'); [cite: 23]
        } else {
          Alert.alert('No Data', 'No blood pressure records found to export.'); [cite: 24]
        }
        return; [cite: 25]
      }

      let csvContent = 'id,systolic,diastolic,pulse,notes,date\n'; [cite: 25]
      records.forEach((item) => { [cite: 26]
        const row = [
          item.id || '', [cite: 26]
          item.systolic || '', [cite: 26]
          item.diastolic || '', [cite: 26]
          item.pulse || '', [cite: 26]
          `"${(item.notes || '').replace(/"/g, '""')}"`, [cite: 26]
          item.date || '' [cite: 26]
        ].join(','); [cite: 26]
        csvContent += row + '\n'; [cite: 27]
      });

      if (isWeb) { [cite: 27]
        const blob = new document.defaultView.Blob([csvContent], { type: 'text/csv;charset=utf-8;' }); [cite: 27]
        const url = document.defaultView.URL.createObjectURL(blob); [cite: 27]
        const link = document.defaultView.document.createElement('a'); [cite: 27]
        link.setAttribute('href', url); [cite: 27]
        link.setAttribute('download', 'fitpursuit_bp_data.csv'); [cite: 27]
        link.style.visibility = 'hidden'; [cite: 27]
        document.defaultView.document.body.appendChild(link); [cite: 27]
        link.click(); [cite: 28]
        document.defaultView.document.body.removeChild(link); [cite: 28]
        setCsvStatus('✓ Data exported successfully!'); [cite: 28]
        setTimeout(() => setCsvStatus(null), 4000); [cite: 28]
      } else {
        Alert.alert('Export Complete', 'Your backup string generated in console logs.'); [cite: 28]
        console.log('FitPursuit CSV Output String Data:\n', csvContent); [cite: 29]
      }
    } catch (error) {
      console.error('CSV Export Error: ', error); [cite: 29]
      setCsvStatus('Export failed.'); [cite: 30]
    }
  };

  const handleWebCSVImport = (event) => { [cite: 30]
    const file = event.target.files[0]; [cite: 30]
    if (!file) return; [cite: 31]

    const reader = new document.defaultView.FileReader(); [cite: 31]
    reader.onload = async (e) => { [cite: 31]
      try {
        const text = e.target.result; [cite: 31]
        const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0); [cite: 32]
        if (lines.length <= 1) { [cite: 33]
          setCsvStatus('⚠️ Clean valid data columns not found in file.'); [cite: 33]
          return; [cite: 34]
        }

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase()); [cite: 34]
        const sysIdx = headers.indexOf('systolic'); [cite: 34]
        const diaIdx = headers.indexOf('diastolic'); [cite: 35]
        const pulseIdx = headers.indexOf('pulse'); [cite: 35]
        const notesIdx = headers.indexOf('notes'); [cite: 35]
        const dateIdx = headers.indexOf('date'); [cite: 35]

        if (sysIdx === -1 || diaIdx === -1) { [cite: 36]
          setCsvStatus('⚠️ Invalid structure. Must include Systolic and Diastolic headers.'); [cite: 36]
          return; [cite: 37]
        }

        const importedRecords = []; [cite: 37]
        for (let i = 1; i < lines.length; i++) { [cite: 38]
          const columns = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/); [cite: 38]
          if (columns.length >= 2) { [cite: 38]
            let cleanNotes = columns[notesIdx] || ''; [cite: 38]
            if (cleanNotes.startsWith('"') && cleanNotes.endsWith('"')) { [cite: 38]
              cleanNotes = cleanNotes.substring(1, cleanNotes.length - 1).replace(/""/g, '"'); [cite: 38]
            }

            importedRecords.push({
              id: columns[headers.indexOf('id')] || Date.now().toString() + '_' + i, [cite: 39]
              systolic: parseInt(columns[sysIdx], 10), [cite: 39]
              diastolic: parseInt(columns[diaIdx], 10), [cite: 39]
              pulse: pulseIdx !== -1 ? parseInt(columns[pulseIdx], 10) || null : null, [cite: 39]
              notes: cleanNotes, [cite: 40]
              date: dateIdx !== -1 ? columns[dateIdx] : new Date().toISOString(), [cite: 40]
            });
          }
        }

        const existingData = await AsyncStorage.getItem(BP_STORAGE_KEY); [cite: 41]
        const currentLogs = existingData ? JSON.parse(existingData) : []; [cite: 42]
        const mergedLogs = [...currentLogs]; [cite: 42]
        
        importedRecords.forEach(newRec => { [cite: 43]
          if (!mergedLogs.some(existingRec => existingRec.id === newRec.id)) { [cite: 43]
            mergedLogs.push(newRec); [cite: 43]
          }
        });

        await AsyncStorage.setItem(BP_STORAGE_KEY, JSON.stringify(mergedLogs)); [cite: 44]
        setCsvStatus('✓ Data imported and merged safely!'); [cite: 44]
        setTimeout(() => setCsvStatus(null), 4000); [cite: 44]
      } catch (err) {
        console.error(err); [cite: 45]
        setCsvStatus('⚠️ Error parsing file content data.'); [cite: 45]
      }
    };
    reader.readAsText(file); [cite: 46]
  };

  if (loading) { [cite: 46]
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color="#dd6b20" />
      </View>
    ); [cite: 46]
  }

  return (
    <KeyboardAvoidingView
      [cite_start]behavior={Platform.OS === 'ios' ? 'padding' : 'height'} [cite: 47]
      [cite_start]style={[styles.container, { backgroundColor: theme.background }]} [cite: 47]
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.title, { color: theme.text }]}>Settings</Text> [cite: 47]
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>Manage your profile and app preferences</Text> [cite: 47]

        {saveStatus === 'success' && ( [cite: 47]
          <View style={[styles.statusBox, styles.successBox]}>
            <Text style={styles.successText}>✓ Profile updated successfully!</Text> [cite: 48]
          </View>
        )}
        {saveStatus === 'error' && ( [cite: 48]
          <View style={[styles.statusBox, styles.errorBox]}>
            <Text style={styles.errorText}>⚠️ Please fill out at least your name.</Text> [cite: 48]
          </View>
        )}
        {csvStatus && ( [cite: 49]
          <View style={[styles.statusBox, csvStatus.includes('✓') ? styles.successBox : styles.errorBox]}> [cite: 49, 50]
            <Text style={csvStatus.includes('✓') ? styles.successText : styles.errorText}>{csvStatus}</Text> [cite: 50, 51]
          </View>
        )}

        {/* Card: Profile Information */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}> [cite: 51]
          <View style={styles.cardHeader}> [cite: 51]
            <Text style={[styles.cardTitle, { color: theme.text }]}>Personal Profile</Text> [cite: 51]
            {!isEditing ? ( [cite: 51, 52]
              <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.editButton}>
                <Text style={styles.editButtonText}>Edit</Text> [cite: 52]
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={saveProfileData} style={styles.saveButton}>
                <Text style={styles.saveButtonText}>Save</Text> [cite: 52, 53]
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.form}> [cite: 53]
            {/* Field: Full Name */}
            <View style={styles.inputGroup}> [cite: 53]
              <View style={styles.labelContainer}> [cite: 53]
                <User size={16} color="#dd6b20" style={styles.inputIcon} /> [cite: 54]
                <Text style={[styles.label, { color: theme.textMuted }]}>Full Name</Text> [cite: 54]
              </View>
              <TextInput
                [cite_start]style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }, !isEditing && styles.disabledInput]} [cite: 54]
                [cite_start]value={name} [cite: 54]
                [cite_start]onChangeText={setName} [cite: 55]
                [cite_start]placeholder="Enter your name" [cite: 55]
                [cite_start]placeholderTextColor="#4a5568" [cite: 55]
                [cite_start]editable={isEditing} [cite: 55]
              />
            </View>

            {/* Field: Age */}
            <View style={styles.inputGroup}> [cite: 56]
              <View style={styles.labelContainer}> [cite: 56]
                <Calendar size={16} color="#dd6b20" style={styles.inputIcon} /> [cite: 56]
                <Text style={[styles.label, { color: theme.textMuted }]}>Age</Text> [cite: 56]
              </View>
              <TextInput
                [cite_start]style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }, !isEditing && styles.disabledInput]} [cite: 57]
                [cite_start]value={age} [cite: 57]
                [cite_start]onChangeText={setAge} [cite: 57]
                [cite_start]keyboardType="number-pad" [cite: 57]
                [cite_start]placeholder="Years" [cite: 57]
                [cite_start]placeholderTextColor="#4a5568" [cite: 57]
                [cite_start]editable={isEditing} [cite: 58]
              />
            </View>

            {/* Field: Height (Conditional Split rendering layout for feet & inches) */}
            <View style={styles.inputGroup}> [cite: 58]
              <View style={styles.labelContainer}> [cite: 58]
                <Ruler size={16} color="#dd6b20" style={styles.inputIcon} /> [cite: 58]
                <Text style={[styles.label, { color: theme.textMuted }]}>
                  Height ({currentHeightUnit === 'ft-in' ? 'ft / in' : 'cm'})
                </Text>
              </View>
              
              {currentHeightUnit === 'ft-in' ? (
                <View style={styles.splitRowContainer}>
                  <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <TextInput
                      style={[styles.input, { flex: 1, backgroundColor: theme.background, borderColor: theme.border, color: theme.text }, !isEditing && styles.disabledInput]}
                      value={heightFeet}
                      onChangeText={setHeightFeet}
                      keyboardType="number-pad"
                      placeholder="Feet"
                      placeholderTextColor="#4a5568"
                      editable={isEditing}
                    />
                    <Text style={{ color: theme.text, fontWeight: '700' }}>ft</Text>
                  </View>
                  
                  <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <TextInput
                      style={[styles.input, { flex: 1, backgroundColor: theme.background, borderColor: theme.border, color: theme.text }, !isEditing && styles.disabledInput]}
                      value={heightInches}
                      onChangeText={setHeightInches}
                      keyboardType="number-pad"
                      placeholder="Inches"
                      placeholderTextColor="#4a5568"
                      editable={isEditing}
                    />
                    <Text style={{ color: theme.text, fontWeight: '700' }}>in</Text>
                  </View>
                </View>
              ) : (
                <TextInput
                  [cite_start]style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }, !isEditing && styles.disabledInput]} [cite: 59]
                  value={heightCm}
                  onChangeText={setHeightCm}
                  [cite_start]keyboardType="decimal-pad" [cite: 60]
                  placeholder="Height in cm"
                  [cite_start]placeholderTextColor="#4a5568" [cite: 60]
                  [cite_start]editable={isEditing} [cite: 60]
                />
              )}
            </View>

            {/* Field: Initial Weight */}
            <View style={styles.inputGroup}> [cite: 60]
              <View style={styles.labelContainer}> [cite: 61]
                <Scale size={16} color="#dd6b20" style={styles.inputIcon} /> [cite: 61]
                <Text style={[styles.label, { color: theme.textMuted }]}>Initial Weight ({currentWeightUnit})</Text> [cite: 61]
              </View>
              <TextInput
                [cite_start]style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }, !isEditing && styles.disabledInput]} [cite: 62]
                [cite_start]value={weight} [cite: 62]
                [cite_start]onChangeText={setWeight} [cite: 62]
                [cite_start]keyboardType="decimal-pad" [cite: 62]
                [cite_start]placeholder={`Weight in ${currentWeightUnit}`} [cite: 63]
                [cite_start]placeholderTextColor="#4a5568" [cite: 63]
                [cite_start]editable={isEditing} [cite: 63]
              />
            </View>
          </View>
        </View>

        {/* Card: Display Theme Settings */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}> [cite: 63]
          <View style={styles.cardHeader}> [cite: 63]
            <Text style={[styles.cardTitle, { color: theme.text }]}>App Display Theme</Text> [cite: 64]
            {theme.mode === 'dark' ? <Moon size={18} color="#dd6b20" /> : <Sun size={18} color="#dd6b20" />} [cite: 64, 65]
          </View>
          
          <View style={styles.preferenceRow}> [cite: 65]
            <Text style={[styles.preferenceLabel, { color: theme.text }]}>Interface Theme</Text> [cite: 65]
            <View style={[styles.toggleContainer, { backgroundColor: theme.background }]}> [cite: 65]
              <TouchableOpacity
                [cite_start]style={[styles.toggleBtn, theme.mode === 'light' && styles.toggleBtnActive]} [cite: 66]
                [cite_start]onPress={toggleTheme} [cite: 66]
              >
                <Text style={[styles.toggleBtnText, theme.mode === 'light' && styles.toggleBtnTextActive]}>LIGHT</Text> [cite: 66]
              </TouchableOpacity>
              <TouchableOpacity
                [cite_start]style={[styles.toggleBtn, theme.mode === 'dark' && styles.toggleBtnActive]} [cite: 67]
                [cite_start]onPress={toggleTheme} [cite: 67]
              >
                <Text style={[styles.toggleBtnText, theme.mode === 'dark' && styles.toggleBtnTextActive]}>DARK</Text> [cite: 67]
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Card: Data Management */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}> [cite: 68]
          <View style={styles.cardHeader}> [cite: 68]
            <Text style={[styles.cardTitle, { color: theme.text }]}>Data Backup & Export</Text> [cite: 68]
            <Download size={18} color="#dd6b20" /> [cite: 68]
          </View>
          <Text style={[styles.infoDescription, { color: theme.textMuted }]}> [cite: 68, 69]
            Export your blood pressure log metrics out to an open format .CSV spreadsheet file for spreadsheets, or bring backups back in. [cite: 69]
          </Text>
          
          <View style={styles.dataActionContainer}> [cite: 69]
            <TouchableOpacity style={styles.exportActionBtn} onPress={handleExportCSV}> [cite: 69]
              <Download size={16} color="#ffffff" style={{ marginRight: 6 }} /> [cite: 69, 70]
              <Text style={styles.exportActionText}>Export CSV</Text> [cite: 70]
            </TouchableOpacity>

            {isWeb ? ( [cite: 70, 71]
              <label style={[styles.importActionLabel, { backgroundColor: theme.mode === 'dark' ? [cite_start]'rgba(221, 107, 32, 0.08)' : 'rgba(221, 107, 32, 0.04)' }]}> [cite: 71]
                <Upload size={16} color="#dd6b20" style={{ marginRight: 6 }} /> [cite: 71]
                <Text style={styles.importActionText}>Import CSV</Text> [cite: 71]
                <input type="file" accept=".csv" onChange={handleWebCSVImport} style={{ display: 'none' }} /> [cite: 71, 72]
              </label>
            ) : (
              <TouchableOpacity 
                [cite_start]style={[styles.importActionBtnMobile, { backgroundColor: theme.mode === 'dark' ? 'rgba(221, 107, 32, 0.08)' : 'rgba(221, 107, 32, 0.04)' }]} [cite: 73]
                [cite_start]onPress={() => Alert.alert('Import Engine', 'Use standard browser environments to parse local physical files smoothly.')} [cite: 73]
              >
                <Upload size={16} color="#dd6b20" style={{ marginRight: 6 }} /> [cite: 74]
                <Text style={styles.importActionText}>Import CSV</Text> [cite: 74]
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Card: Units Preferences */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}> [cite: 74, 75]
          <View style={styles.cardHeader}> [cite: 75]
            <Text style={[styles.cardTitle, { color: theme.text }]}>Units of Measurement</Text> [cite: 75]
            <Sliders size={18} color="#dd6b20" /> [cite: 75]
          </View>

          <View style={styles.preferences}> [cite: 75]
            {/* Toggle: Weight Units synced globally */}
            <View style={styles.preferenceRow}> [cite: 75]
              <Text style={[styles.preferenceLabel, { color: theme.text }]}>Weight Units</Text> 
              <View style={[styles.toggleContainer, { backgroundColor: theme.background }]}> 
                <TouchableOpacity
                  [cite_start]style={[styles.toggleBtn, currentWeightUnit === 'lbs' && styles.toggleBtnActive]} [cite: 76]
                  onPress={async () => {
                    if (appSettings?.updateWeightUnit) appSettings.updateWeightUnit('lbs');
                    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY); [cite: 77]
                    const current = jsonValue ? JSON.parse(jsonValue) : {}; [cite: 77, 78]
                    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, weightUnit: 'lbs' })); [cite: 78]
                  }}
                >
                  <Text style={[styles.toggleBtnText, currentWeightUnit === 'lbs' && styles.toggleBtnTextActive]}>LBS</Text> [cite: 79]
                </TouchableOpacity>
                <TouchableOpacity
                  [cite_start]style={[styles.toggleBtn, currentWeightUnit === 'kg' && styles.toggleBtnActive]} [cite: 79]
                  onPress={async () => {
                    if (appSettings?.updateWeightUnit) appSettings.updateWeightUnit('kg');
                    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY); [cite: 80, 81]
                    const current = jsonValue ? JSON.parse(jsonValue) : {}; [cite: 81]
                    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, weightUnit: 'kg' })); [cite: 81]
                  }}
                >
                  <Text style={[styles.toggleBtnText, currentWeightUnit === 'kg' && styles.toggleBtnTextActive]}>KG</Text> [cite: 82]
                </TouchableOpacity>
              </View>
            </View>

            {/* Toggle: Height Units synced globally */}
            <View style={styles.preferenceRow}> [cite: 82]
              <Text style={[styles.preferenceLabel, { color: theme.text }]}>Height Units</Text> 
              <View style={[styles.toggleContainer, { backgroundColor: theme.background }]}> 
                <TouchableOpacity
                  [cite_start]style={[styles.toggleBtn, currentHeightUnit === 'ft-in' && styles.toggleBtnActive]} [cite: 83]
                  onPress={async () => {
                    if (appSettings?.updateHeightUnit) appSettings.updateHeightUnit('ft-in');
                    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY); [cite: 84]
                    const current = jsonValue ? JSON.parse(jsonValue) : {}; [cite: 85]
                    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, heightUnit: 'ft-in' })); [cite: 85]
                  }}
                >
                  <Text style={[styles.toggleBtnText, currentHeightUnit === 'ft-in' && styles.toggleBtnTextActive]}>FT/IN</Text> [cite: 86]
                </TouchableOpacity>
                <TouchableOpacity
                  [cite_start]style={[styles.toggleBtn, currentHeightUnit === 'cm' && styles.toggleBtnActive]} [cite: 86]
                  onPress={async () => {
                    if (appSettings?.updateHeightUnit) appSettings.updateHeightUnit('cm');
                    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY); [cite: 87, 88]
                    const current = jsonValue ? JSON.parse(jsonValue) : {}; [cite: 88]
                    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, heightUnit: 'cm' })); [cite: 88]
                  }}
                >
                  <Text style={[styles.toggleBtnText, currentHeightUnit === 'cm' && styles.toggleBtnTextActive]}>CM</Text> [cite: 89]
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
  container: { flex: 1 }, [cite: 91]
  scrollContent: { padding: 24, paddingBottom: 40 }, [cite: 91]
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' }, [cite: 91]
  title: { fontSize: 28, fontWeight: '800', marginTop: 16 }, [cite: 91]
  subtitle: { fontSize: 14, marginTop: 4, marginBottom: 24 }, [cite: 91]
  statusBox: { borderRadius: 12, padding: 14, marginBottom: 20 }, [cite: 91, 92]
  successBox: { backgroundColor: 'rgba(56, 161, 105, 0.1)', borderWidth: 1, borderColor: '#38a169' }, [cite: 92]
  successText: { color: '#48bb78', fontSize: 13, fontWeight: '600' }, [cite: 92]
  errorBox: { backgroundColor: 'rgba(229, 62, 62, 0.1)', borderWidth: 1, borderColor: '#e53e3e' }, [cite: 92]
  errorText: { color: '#f56565', fontSize: 13, fontWeight: '600' }, [cite: 92]
  card: { borderRadius: 20, padding: 20, marginBottom: 24, borderWidth: 1 }, [cite: 93]
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }, [cite: 93]
  cardTitle: { fontSize: 16, fontWeight: '700', flex: 1 }, [cite: 93]
  infoDescription: { fontSize: 12, lineHeight: 18, marginBottom: 16 }, [cite: 93]
  dataActionContainer: { flexDirection: 'row', gap: 12 }, [cite: 93]
  exportActionBtn: { flex: 1, flexDirection: 'row', backgroundColor: '#dd6b20', height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center' }, [cite: 94]
  exportActionText: { color: '#ffffff', fontSize: 13, fontWeight: '700' }, [cite: 94]
  importActionLabel: { flex: 1, flexDirection: 'row', borderWidth: 1, borderColor: 'rgba(221, 107, 32, 0.3)', height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center' }, [cite: 94, 95]
  importActionBtnMobile: { flex: 1, flexDirection: 'row', borderWidth: 1, borderColor: 'rgba(221, 107, 32, 0.3)', height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center' }, [cite: 95]
  importActionText: { color: '#dd6b20', fontSize: 13, fontWeight: '700' }, [cite: 95]
  editButton: { backgroundColor: 'rgba(221, 107, 32, 0.1)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 }, [cite: 95, 96]
  editButtonText: { color: '#dd6b20', fontSize: 12, fontWeight: '700' }, [cite: 96]
  saveButton: { backgroundColor: '#dd6b20', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 }, [cite: 96]
  saveButtonText: { color: '#ffffff', fontSize: 12, fontWeight: '700' }, [cite: 96]
  form: { gap: 16 }, [cite: 96]
  inputGroup: { gap: 6 }, [cite: 96]
  labelContainer: { flexDirection: 'row', alignItems: 'center' }, [cite: 97]
  inputIcon: { marginRight: 6 }, [cite: 97]
  label: { fontSize: 12, fontWeight: '600' }, [cite: 97]
  input: { borderWidth: 1, borderRadius: 12, padding: 12, fontSize: 14, fontWeight: '600' }, [cite: 97]
  disabledInput: { color: '#718096', borderColor: 'transparent', backgroundColor: 'rgba(20, 23, 28, 0.3)' }, [cite: 97]
  splitRowContainer: { flexDirection: 'row', gap: 16, alignItems: 'center' },
  preferences: { gap: 16 }, [cite: 97]
  preferenceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, [cite: 98]
  preferenceLabel: { fontSize: 14, fontWeight: '600' }, [cite: 98]
  toggleContainer: { flexDirection: 'row', borderRadius: 10, padding: 3 }, [cite: 98]
  toggleBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8 }, [cite: 98]
  toggleBtnActive: { backgroundColor: '#dd6b20' }, [cite: 98]
  toggleBtnText: { fontSize: 11, fontWeight: '700', color: '#718096' }, [cite: 98, 99]
  toggleBtnTextActive: { color: '#ffffff' }, [cite: 99]
});