import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  Dimensions
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Scale, Trash2, Calendar, X, Dumbbell, Heart } from 'lucide-react-native';
import { LineChart } from 'react-native-chart-kit';

const PROFILE_KEY = '@fitpursuit_profile';
const HISTORY_KEY = '@fitpursuit_weight_history';
const WORKOUT_HISTORY_KEY = '@fitpursuit_workout_history';
const VITALS_HISTORY_KEY = '@fitpursuit_vitals_history';
const BP_SCREEN_HISTORY_KEY = '@fitpursuit_bp_history';

export default function Analytics({ theme, appSettings, navigation }) {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('weight'); // 'weight', 'workouts', or 'vitals'
  
  // Storage Vectors
  const [profile, setProfile] = useState(null);
  const [history, setHistory] = useState([]);
  const [workoutHistory, setWorkoutHistory] = useState([]);
  const [vitalsHistory, setVitalsHistory] = useState([]);

  // Weight Log Form states
  const [inputWeight, setInputWeight] = useState('');
  const [inputDate, setInputDate] = useState(new Date().toISOString().split('T')[0]);

  // Weight Edit Modal States
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editWeight, setEditWeight] = useState('');
  const [editDate, setEditDate] = useState('');

  // Workout Edit Modal States
  const [workoutModalVisible, setWorkoutModalVisible] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);

  // Sync Global Display Preference Units
  const currentWeightUnit = appSettings?.weightUnit || 'lbs';
  
  // Listen for navigation focus changes using the built-in navigation prop
  useEffect(() => {
    loadAllHistoricalLogs();

    if (navigation && navigation.addListener) {
      const unsubscribe = navigation.addListener('focus', () => {
        loadAllHistoricalLogs();
      });
      return unsubscribe;
    }
  }, [navigation]);

  const loadAllHistoricalLogs = async () => {
    setLoading(true);
    try {
      const storedProfile = await AsyncStorage.getItem(PROFILE_KEY);
      const storedWeightHistory = await AsyncStorage.getItem(HISTORY_KEY);
      const storedWorkoutHistory = await AsyncStorage.getItem(WORKOUT_HISTORY_KEY);
      
      // Look up cross-screen blood pressure key entries alongside internal fallback
      const storedVitalsHistory = await AsyncStorage.getItem(VITALS_HISTORY_KEY) || 
                                  await AsyncStorage.getItem(BP_SCREEN_HISTORY_KEY) || 
                                  await AsyncStorage.getItem('@fitpursuit_bp');

      if (storedProfile) setProfile(JSON.parse(storedProfile));
      if (storedWeightHistory) {
        const parsedWeight = JSON.parse(storedWeightHistory);
        setHistory(parsedWeight.sort((a, b) => new Date(b.date) - new Date(a.date)));
      }
      
      if (storedWorkoutHistory) {
        setWorkoutHistory(JSON.parse(storedWorkoutHistory));
      }

      if (storedVitalsHistory) {
        const parsedVitals = JSON.parse(storedVitalsHistory);
        setVitalsHistory(parsedVitals.sort((a, b) => new Date(b.date) - new Date(a.date)));
      }
    } catch (e) {
      console.error('Failed to parse logs repository values.', e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddWeightLog = async () => {
    if (!inputWeight || isNaN(inputWeight)) {
      showStatusAlert('Please provide a numerical weight entry.');
      return;
    }

    try {
      const newLog = {
        id: Date.now().toString(),
        weight: parseFloat(inputWeight),
        date: inputDate || new Date().toISOString().split('T')[0]
      };

      const updatedHistory = [newLog, ...history].sort((a, b) => new Date(b.date) - new Date(a.date));
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
      setHistory(updatedHistory);
      setInputWeight('');
      showStatusAlert('Weight log entry recorded!');
    } catch (e) {
      showStatusAlert('Failed to log weight entry.');
    }
  };

  const handleDeleteWeightLog = (id) => {
    Alert.alert('Delete Log Entry', 'Are you sure you want to remove this historical weight calculation point?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const updated = history.filter(item => item.id !== id);
          await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
          setHistory(updated);
        }
      }
    ]);
  };

  const handleDeleteWorkoutSession = (id) => {
    Alert.alert('Delete Workout Log', 'Are you sure you want to clear this entire session blueprint entry?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove Record',
        style: 'destructive',
        onPress: async () => {
          const updated = workoutHistory.filter(item => item.id !== id);
          await AsyncStorage.setItem(WORKOUT_HISTORY_KEY, JSON.stringify(updated));
          setWorkoutHistory(updated);
        }
      }
    ]);
  };

  const handleDeleteVitalsLog = (id) => {
    Alert.alert('Delete Vitals Entry', 'Are you sure you want to clear this blood pressure and heart rate record?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const updated = vitalsHistory.filter(item => item.id !== id);
          await AsyncStorage.setItem(VITALS_HISTORY_KEY, JSON.stringify(updated));
          await AsyncStorage.setItem(BP_SCREEN_HISTORY_KEY, JSON.stringify(updated));
          await AsyncStorage.setItem('@fitpursuit_bp', JSON.stringify(updated));
          setVitalsHistory(updated);
        }
      }
    ]);
  };

  // Weight Editors
  const openEditModal = (item) => {
    setEditingItem(item);
    setEditWeight(item.weight.toString());
    setEditDate(item.date);
    setEditModalVisible(true);
  };

  const handleUpdateWeightLog = async () => {
    if (!editWeight || isNaN(editWeight)) return;
    try {
      const updated = history.map(item => {
        if (item.id === editingItem.id) {
          return { ...item, weight: parseFloat(editWeight), date: editDate };
        }
        return item;
      }).sort((a, b) => new Date(b.date) - new Date(a.date));
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
      setHistory(updated);
      setEditModalVisible(false);
      showStatusAlert('Log details adjusted successfully!');
    } catch (e) {
      console.error(e);
    }
  };

  // Workout Nested Editor Handlers
  const openWorkoutEditModal = (session) => {
    setEditingWorkout(JSON.parse(JSON.stringify(session)));
    setWorkoutModalVisible(true);
  };

  const handleWorkoutInputChange = (exIndex, setIndex, field, value) => {
    setEditingWorkout(prev => {
      const copy = { ...prev };
      copy.exercisesCompleted[exIndex].sets[setIndex][field] = value;
      return copy;
    });
  };

  const handleUpdateWorkoutLog = async () => {
    try {
      const updated = workoutHistory.map(item => {
        if (item.id === editingWorkout.id) {
          return editingWorkout;
        }
        return item;
      });
      await AsyncStorage.setItem(WORKOUT_HISTORY_KEY, JSON.stringify(updated));
      setWorkoutHistory(updated);
      setWorkoutModalVisible(false);
      showStatusAlert('Workout metrics adjusted successfully!');
    } catch (e) {
      console.error(e);
      showStatusAlert('Failed to update workout log.');
    }
  };

  const showStatusAlert = (msg) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const renderWeightChart = () => {
    if (history.length < 2) return null;

    const chronologicalData = [...history].reverse().slice(-5);
    const chartLabels = chronologicalData.map(item => item.date.substring(5));
    const chartDataPoints = chronologicalData.map(item => item.weight);

    return (
      <View style={{ marginVertical: 10, alignItems: 'center' }}>
        <LineChart
          data={{
            labels: chartLabels,
            datasets: [{ data: chartDataPoints }]
          }}
          width={Dimensions.get('window').width - 40}
          height={200}
          chartConfig={{
            backgroundColor: theme.card,
            backgroundGradientFrom: theme.card,
            backgroundGradientTo: theme.card,
            decimalPlaces: 1,
            color: (opacity = 1) => `rgba(221, 107, 32, ${opacity})`,
            labelColor: (opacity = 1) => theme.textMuted || '#718096',
            style: { borderRadius: 16 },
            propsForDots: { r: '4', strokeWidth: '2', stroke: '#dd6b20' }
          }}
          bezier
          style={{ borderRadius: 16, borderWidth: 1, borderColor: theme.border }}
        />
      </View>
    );
  };

  const renderVitalsChart = () => {
    if (vitalsHistory.length < 2) return null;

    const chronologicalVitals = [...vitalsHistory].reverse().slice(-5);
    const vitalLabels = chronologicalVitals.map(item => item.date.substring(5));
    const systolicPoints = chronologicalVitals.map(item => item.systolic);
    const diastolicPoints = chronologicalVitals.map(item => item.diastolic);

    return (
      <View style={{ marginVertical: 10, alignItems: 'center' }}>
        <LineChart
          data={{
            labels: vitalLabels,
            datasets: [
              {
                data: systolicPoints,
                color: (opacity = 1) => `rgba(229, 62, 62, ${opacity})`,
                strokeWidth: 2
              },
              {
                data: diastolicPoints,
                color: (opacity = 1) => `rgba(74, 85, 104, ${opacity})`,
                strokeWidth: 2
              }
            ],
            legend: ['Systolic', 'Diastolic']
          }}
          width={Dimensions.get('window').width - 40}
          height={200}
          chartConfig={{
            backgroundColor: theme.card,
            backgroundGradientFrom: theme.card,
            backgroundGradientTo: theme.card,
            decimalPlaces: 0,
            color: (opacity = 1) => theme.text || `rgba(255, 255, 255, ${opacity})`,
            labelColor: (opacity = 1) => theme.textMuted || '#718096',
            style: { borderRadius: 16 },
            propsForDots: { r: '4', strokeWidth: '1' }
          }}
          bezier
          style={{ borderRadius: 16, borderWidth: 1, borderColor: theme.border }}
        />
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color="#dd6b20" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={[styles.masterWrapper, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.mainTitle, { color: theme.text }]}>Analytics & Logs</Text>
        
        <View style={[styles.segmentContainer, { backgroundColor: theme.card }]}>
          <TouchableOpacity 
            style={[styles.segmentBtn, activeTab === 'weight' && styles.segmentBtnActive]} 
            onPress={() => setActiveTab('weight')}
          >
            <Scale size={14} color={activeTab === 'weight' ? '#ffffff' : theme.textMuted} />
            <Text style={[styles.segmentText, { color: activeTab === 'weight' ? '#ffffff' : theme.textMuted }]}>Weight</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.segmentBtn, activeTab === 'workouts' && styles.segmentBtnActive]} 
            onPress={() => setActiveTab('workouts')}
          >
            <Dumbbell size={14} color={activeTab === 'workouts' ? '#ffffff' : theme.textMuted} />
            <Text style={[styles.segmentText, { color: activeTab === 'workouts' ? '#ffffff' : theme.textMuted }]}>Workouts</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.segmentBtn, activeTab === 'vitals' && styles.segmentBtnActive]} 
            onPress={() => setActiveTab('vitals')}
          >
            <Heart size={14} color={activeTab === 'vitals' ? '#ffffff' : theme.textMuted} />
            <Text style={[styles.segmentText, { color: activeTab === 'vitals' ? '#ffffff' : theme.textMuted }]}>Vitals</Text>
          </TouchableOpacity>
        </View>
      </View>

      {statusMessage && (
        <View style={styles.statusBarNotification}>
          <Text style={styles.statusBarNotificationText}>{statusMessage}</Text>
        </View>
      )}

      {activeTab === 'weight' && (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          ListHeaderComponent={
            <View style={{ gap: 4 }}>
              <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border, marginBottom: 10 }]}>
                <Text style={[styles.cardHeading, { color: theme.text }]}>
                  Current Profile Weight: {profile?.currentWeight || 'Not set'} {currentWeightUnit}
                </Text>
                
                <View style={styles.inlineForm}>
                  <TextInput
                    placeholder={`Weight (${currentWeightUnit})`}
                    placeholderTextColor="#4a5568"
                    keyboardType="numeric"
                    value={inputWeight}
                    onChangeText={setInputWeight}
                    style={[styles.inputField, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
                  />
                  <TextInput
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#4a5568"
                    value={inputDate}
                    onChangeText={setInputDate}
                    style={[styles.inputField, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
                  />
                  <TouchableOpacity style={styles.appendRecordBtn} onPress={handleAddWeightLog}>
                    <Text style={styles.appendRecordText}>Add</Text>
                  </TouchableOpacity>
                </View>
              </View>
              {renderWeightChart()}
            </View>
          }
          renderItem={({ item }) => (
            <View style={[styles.logRow, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Calendar size={16} color="#dd6b20" />
              <Text style={[styles.logDateLabel, { color: theme.text }]}>{item.date}</Text>
              <Text style={[styles.logWeightMetric, { color: theme.text }]}>{item.weight} {currentWeightUnit}</Text>
              <View style={styles.rowControls}>
                <TouchableOpacity style={styles.iconButtonAction} onPress={() => openEditModal(item)}>
                  <Text style={{ color: '#dd6b20', fontSize: 12, fontWeight: '700' }}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButtonAction} onPress={() => handleDeleteWeightLog(item.id)}>
                  <Trash2 size={16} color="#e53e3e" />
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.blankSlateBox}>
              <Scale size={32} color={theme.textMuted} />
              <Text style={[styles.blankSlateText, { color: theme.text }]}>No metric tracking data exists.</Text>
            </View>
          }
        />
      )}

      {activeTab === 'workouts' && (
        <FlatList
          data={workoutHistory}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <View style={[styles.workoutSessionCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={styles.workoutSessionHeader}>
                <View>
                  <Text style={[styles.workoutSessionTitle, { color: theme.text }]}>{item.routineTitle}</Text>
                  <Text style={[styles.workoutSessionMeta, { color: theme.textMuted }]}>{item.day} • {item.date}</Text>
                </View>
                <View style={styles.rowControls}>
                  <TouchableOpacity style={styles.iconButtonAction} onPress={() => openWorkoutEditModal(item)}>
                    <Text style={{ color: '#dd6b20', fontSize: 12, fontWeight: '700' }}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDeleteWorkoutSession(item.id)}>
                    <Trash2 size={18} color="#e53e3e" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.workoutNestedList}>
                {item.exercisesCompleted.map((ex, index) => (
                  <View key={index} style={styles.nestedExerciseItemRow}>
                    <Text style={[styles.nestedExerciseName, { color: theme.text }]}>• {ex.name}</Text>
                    <View style={styles.nestedSetsBadgeRow}>
                      {ex.sets.map((set, sIdx) => (
                        <Text key={sIdx} style={styles.setsBadgeItem}>
                          S{sIdx + 1}: {set.weight || '0'}{currentWeightUnit} × {set.reps || '0'}
                        </Text>
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.blankSlateBox}>
              <Dumbbell size={32} color={theme.textMuted} />
              <Text style={[styles.blankSlateText, { color: theme.text }]}>No completed blueprints recorded yet.</Text>
              <Text style={{ color: theme.textMuted, fontSize: 11, textAlign: 'center', marginTop: 4 }}>Complete exercises inside the Trainer tab to populate history.</Text>
            </View>
          }
        />
      )}

      {activeTab === 'vitals' && (
        <FlatList
          data={vitalsHistory}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          ListHeaderComponent={
            <View style={{ gap: 4 }}>
              {renderVitalsChart()}
            </View>
          }
          renderItem={({ item }) => (
            <View style={[styles.logRow, { backgroundColor: theme.card, borderColor: theme.border, height: 60 }]}>
              <Heart size={16} color="#e53e3e" />
              <View style={{ marginLeft: 10, flex: 1 }}>
                <Text style={[styles.logDateLabel, { color: theme.text, marginLeft: 0 }]}>{item.date}</Text>
                <Text style={{ color: theme.textMuted, fontSize: 11 }}>Cardio Profile</Text>
              </View>
              <View style={{ flex: 1.5, alignItems: 'flex-end', paddingRight: 16 }}>
                <Text style={{ color: theme.text, fontSize: 14, fontWeight: '700' }}>{item.systolic}/{item.diastolic} mmHg</Text>
                <Text style={{ color: '#e53e3e', fontSize: 11, fontWeight: '600' }}>{item.bpm} BPM Pulse</Text>
              </View>
              <TouchableOpacity style={styles.iconButtonAction} onPress={() => handleDeleteVitalsLog(item.id)}>
                <Trash2 size={16} color="#e53e3e" />
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.blankSlateBox}>
              <Heart size={32} color={theme.textMuted} />
              <Text style={[styles.blankSlateText, { color: theme.text }]}>No cardiovascular vital entries recorded.</Text>
            </View>
          }
        />
      )}

      {/* Modal 1: Weight Editor Dialog Engine */}
      <Modal animationType="fade" transparent={true} visible={editModalVisible}>
        <View style={styles.dialogOverlay}>
          <View style={[styles.dialogContent, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.dialogHeader}>
              <Text style={[styles.dialogHeading, { color: theme.text }]}>Adjust Weight Record</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <X size={20} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={{ gap: 14, marginTop: 14 }}>
              <TextInput
                placeholder="Scale Weight value"
                placeholderTextColor="#4a5568"
                keyboardType="numeric"
                value={editWeight}
                onChangeText={setEditWeight}
                style={[styles.inputField, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text, width: '100%' }]}
              />
              <TextInput
                placeholder="Date string reference"
                placeholderTextColor="#4a5568"
                value={editDate}
                onChangeText={setEditDate}
                style={[styles.inputField, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text, width: '100%' }]}
              />
              <TouchableOpacity style={styles.dialogActionBtn} onPress={handleUpdateWeightLog}>
                <Text style={styles.dialogActionBtnText}>Save Amendments</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal 2: Nested Workout Session Multi-Field Form Editor */}
      <Modal animationType="slide" transparent={true} visible={workoutModalVisible}>
        <View style={styles.dialogOverlay}>
          <View style={[styles.dialogContent, { backgroundColor: theme.card, borderColor: theme.border, maxHeight: '80%' }]}>
            <View style={styles.dialogHeader}>
              <View>
                <Text style={[styles.dialogHeading, { color: theme.text }]}>Edit Workout Session</Text>
                <Text style={{ color: theme.textMuted, fontSize: 12 }}>{editingWorkout?.routineTitle} ({editingWorkout?.date})</Text>
              </View>
              <TouchableOpacity onPress={() => setWorkoutModalVisible(false)}>
                <X size={20} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ gap: 16, paddingVertical: 14 }}>
              <View style={{ gap: 4 }}>
                <Text style={{ color: theme.textMuted, fontSize: 11, fontWeight: '700' }}>SESSION DATE</Text>
                <TextInput
                  value={editingWorkout?.date}
                  onChangeText={(val) => setEditingWorkout(p => ({ ...p, date: val }))}
                  style={[styles.inputField, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text, height: 40 }]}
                />
              </View>

              {editingWorkout?.exercisesCompleted.map((ex, exIdx) => (
                <View key={exIdx} style={{ gap: 8, borderTopWidth: 1, borderTopColor: 'rgba(113, 128, 150, 0.2)', paddingTop: 12 }}>
                  <Text style={{ color: theme.text, fontSize: 13, fontWeight: '700' }}>{ex.name}</Text>
                  {ex.sets.map((set, sIdx) => (
                    <View key={sIdx} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <Text style={{ color: theme.textMuted, fontSize: 12, width: 40 }}>Set {sIdx + 1}</Text>
                      <TextInput
                        placeholder={currentWeightUnit}
                        placeholderTextColor="#4a5568"
                        keyboardType="numeric"
                        value={set.weight ? set.weight.toString() : ''}
                        onChangeText={(val) => handleWorkoutInputChange(exIdx, sIdx, 'weight', val)}
                        style={[styles.inputField, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text, height: 36 }]}
                      />
                      <TextInput
                        placeholder="reps"
                        placeholderTextColor="#4a5568"
                        keyboardType="numeric"
                        value={set.reps ? set.reps.toString() : ''}
                        onChangeText={(val) => handleWorkoutInputChange(exIdx, sIdx, 'reps', val)}
                        style={[styles.inputField, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text, height: 36 }]}
                      />
                    </View>
                  ))}
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity style={styles.dialogActionBtn} onPress={handleUpdateWorkoutLog}>
              <Text style={styles.dialogActionBtnText}>Apply Log Adjustments</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  masterWrapper: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 20, paddingTop: 50, gap: 12 },
  mainTitle: { fontSize: 26, fontWeight: '800' },
  segmentContainer: { flexDirection: 'row', borderRadius: 12, padding: 4 },
  segmentBtn: { flex: 1, flexDirection: 'row', height: 38, borderRadius: 8, justifyContent: 'center', alignItems: 'center', gap: 4 },
  segmentBtnActive: { backgroundColor: '#dd6b20' },
  segmentText: { fontSize: 11, fontWeight: '700' },
  listContainer: { padding: 20, paddingBottom: 100 },
  card: { borderRadius: 16, padding: 16, borderWidth: 1, marginBottom: 20 },
  cardHeading: { fontSize: 14, fontWeight: '700', marginBottom: 12 },
  inlineForm: { flexDirection: 'row', gap: 10, height: 42 },
  inputField: { flex: 1, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, fontSize: 13, fontWeight: '600' },
  appendRecordBtn: { backgroundColor: '#dd6b20', paddingHorizontal: 16, borderRadius: 10, justifyContent: 'center', alignItems: 'center', height: 42 },
  appendRecordText: { color: '#ffffff', fontWeight: '700', fontSize: 13 },
  logRow: { flexDirection: 'row', height: 50, borderRadius: 12, paddingHorizontal: 14, alignItems: 'center', marginBottom: 12, borderWidth: 1 },
  logDateLabel: { marginLeft: 10, fontSize: 13, fontWeight: '600' },
  logWeightMetric: { flex: 1, textAlign: 'right', paddingRight: 16, fontSize: 14, fontWeight: '700' },
  rowControls: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  iconButtonAction: { padding: 4 },
  blankSlateBox: { alignItems: 'center', paddingVertical: 60 },
  blankSlateText: { fontSize: 14, fontWeight: '700', marginTop: 10 },
  statusBarNotification: { backgroundColor: '#dd6b20', padding: 10, alignItems: 'center' },
  statusBarNotificationText: { color: '#ffffff', fontSize: 12, fontWeight: '600' },
  workoutSessionCard: { borderRadius: 16, padding: 16, borderWidth: 1, marginBottom: 16 },
  workoutSessionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(113, 128, 150, 0.2)', paddingBottom: 8 },
  workoutSessionTitle: { fontSize: 15, fontWeight: '700' },
  workoutSessionMeta: { fontSize: 11, marginTop: 2 },
  workoutNestedList: { gap: 10 },
  nestedExerciseItemRow: { gap: 4 },
  nestedExerciseName: { fontSize: 13, fontWeight: '600' },
  nestedSetsBadgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, paddingLeft: 10 },
  setsBadgeItem: { fontSize: 10, color: '#dd6b20', backgroundColor: 'rgba(221, 107, 32, 0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, fontWeight: '600' },
  dialogOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 24 },
  dialogContent: { borderRadius: 20, padding: 20, borderWidth: 1 },
  dialogHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  dialogHeading: { fontSize: 16, fontWeight: '700' },
  dialogActionBtn: { backgroundColor: '#dd6b20', height: 44, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginTop: 12 },
  dialogActionBtnText: { color: '#ffffff', fontWeight: '700', fontSize: 14 }
});