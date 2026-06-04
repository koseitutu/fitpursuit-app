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
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Scale, Trash2, Calendar, X, Dumbbell, ChevronRight } from 'lucide-react-native';

const PROFILE_KEY = '@fitpursuit_profile';
const HISTORY_KEY = '@fitpursuit_weight_history';
const WORKOUT_HISTORY_KEY = '@fitpursuit_workout_history';

export default function Analytics({ theme, appSettings }) {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('weight'); // 'weight' or 'workouts'
  
  // Storage Vectors
  const [profile, setProfile] = useState(null);
  const [history, setHistory] = useState([]);
  const [workoutHistory, setWorkoutHistory] = useState([]);
  
  // Weight Log Form states
  const [inputWeight, setInputWeight] = useState('');
  const [inputDate, setInputDate] = useState(new Date().toISOString().split('T')[0]); 
  
  // Modals Configurations
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editWeight, setEditWeight] = useState('');
  const [editDate, setEditDate] = useState('');
  const [statusMessage, setStatusMessage] = useState(null);

  // Sync Global Display Preference Units
  const currentWeightUnit = appSettings?.weightUnit || 'lbs';

  useEffect(() => {
    loadAllHistoricalLogs();
  }, []);

  const loadAllHistoricalLogs = async () => {
    setLoading(true);
    try {
      const storedProfile = await AsyncStorage.getItem(PROFILE_KEY);
      const storedWeightHistory = await AsyncStorage.getItem(HISTORY_KEY);
      const storedWorkoutHistory = await AsyncStorage.getItem(WORKOUT_HISTORY_KEY);

      if (storedProfile) setProfile(JSON.parse(storedProfile));
      
      if (storedWeightHistory) {
        const parsedWeight = JSON.parse(storedWeightHistory);
        setHistory(parsedWeight.sort((a, b) => new Date(b.date) - new Date(a.date)));
      }
      
      if (storedWorkoutHistory) {
        setWorkoutHistory(JSON.parse(storedWorkoutHistory));
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

  const showStatusAlert = (msg) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3500);
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
        
        {/* Toggle Segments Controller Bar */}
        <View style={[styles.segmentContainer, { backgroundColor: theme.card }]}>
          <TouchableOpacity 
            style={[styles.segmentBtn, activeTab === 'weight' && styles.segmentBtnActive]} 
            onPress={() => setActiveTab('weight')}
          >
            <Scale size={16} color={activeTab === 'weight' ? '#ffffff' : theme.textMuted} />
            <Text style={[styles.segmentText, { color: activeTab === 'weight' ? '#ffffff' : theme.textMuted }]}>Weight Logs</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.segmentBtn, activeTab === 'workouts' && styles.segmentBtnActive]} 
            onPress={() => setActiveTab('workouts')}
          >
            <Dumbbell size={16} color={activeTab === 'workouts' ? '#ffffff' : theme.textMuted} />
            <Text style={[styles.segmentText, { color: activeTab === 'workouts' ? '#ffffff' : theme.textMuted }]}>Workout Logs</Text>
          </TouchableOpacity>
        </View>
      </View>

      {statusMessage && (
        <View style={styles.statusBarNotification}>
          <Text style={styles.statusBarNotificationText}>{statusMessage}</Text>
        </View>
      )}

      {activeTab === 'weight' ? (
        /* WEIGHT LOG TRACKING TAB LAYOUT ENGINE */
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          ListHeaderComponent={
            <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={[styles.cardHeading, { color: theme.text }]}>Quick-Log Scale Value</Text>
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
      ) : (
        /* WORKOUT ROUTINE HISTORY TAB LAYOUT ENGINE */
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
                <TouchableOpacity onPress={() => handleDeleteWorkoutSession(item.id)}>
                  <Trash2 size={18} color="#e53e3e" />
                </TouchableOpacity>
              </View>

              {/* Map nested Exercise sets items directly */}
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

      {/* Weight Editor Dialog Engine */}
      <Modal animationType="fade" transparent={true} visible={editModalVisible}>
        <View style={styles.dialogOverlay}>
          <View style={[styles.dialogContent, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.dialogHeader}>
              <Text style={[styles.dialogHeading, { color: theme.text }]}>Adjust Record Context</Text>
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  masterWrapper: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 20, paddingTop: 50, gap: 12 },
  mainTitle: { fontSize: 26, fontWeight: '800' },
  segmentContainer: { flexDirection: 'row', borderRadius: 12, padding: 4 },
  segmentBtn: { flex: 1, flexDirection: 'row', height: 38, borderRadius: 8, justifyContent: 'center', alignItems: 'center', gap: 6 },
  segmentBtnActive: { backgroundColor: '#dd6b20' },
  segmentText: { fontSize: 12, fontWeight: '700' },
  listContainer: { padding: 20, paddingBottom: 100 },
  card: { borderRadius: 16, padding: 16, borderHorizontalWidth: 1, borderVerticalWidth: 1, borderWidth: 1, marginBottom: 20 },
  cardHeading: { fontSize: 14, fontWeight: '700', marginBottom: 12 },
  inlineForm: { flexDirection: 'row', gap: 10, height: 42 },
  inputField: { flex: 1, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, fontSize: 13, fontWeight: '600' },
  appendRecordBtn: { backgroundColor: '#dd6b20', paddingHorizontal: 16, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
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
  dialogHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dialogHeading: { fontSize: 16, fontWeight: '700' },
  dialogActionBtn: { backgroundColor: '#dd6b20', height: 44, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginTop: 6 },
  dialogActionBtnText: { color: '#ffffff', fontWeight: '700', fontSize: 14 }
});