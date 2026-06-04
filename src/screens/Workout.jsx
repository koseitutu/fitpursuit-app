import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, Alert, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Play, CheckCircle, Info, ShieldAlert } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import { WEEKLY_ROUTINE } from '../data/workouts';

export default function Workout({ route, navigation, theme, appSettings }) {
  const { day } = route.params || { day: 'Monday' };
  const routine = WEEKLY_ROUTINE[day];

  const [logs, setLogs] = useState({});
  const [activeInstructionId, setActiveInstructionId] = useState(null);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [coachModalVisible, setCoachModalVisible] = useState(false);
  const [coachMessage, setCoachMessage] = useState('');

  // Audio object persistence reference
  const soundObjectRef = useRef(null);

  // Read weight unit preference dynamically
  const currentWeightUnit = appSettings?.weightUnit || 'lbs';

  // Fallback Normalizer: Ensures 'theme' works perfectly whether it's a string ('light'/'dark') or an object
  const isDark = typeof theme === 'string' ? theme !== 'light' : theme?.mode !== 'light';
  
  const activeTheme = typeof theme === 'object' && theme.background ? theme : {
    background: isDark ? '#14171c' : '#f7fafc',
    card: isDark ? '#1e232b' : '#ffffff',
    border: isDark ? 'rgba(255, 255, 255, 0.05)' : '#e2e8f0',
    text: isDark ? '#ffffff' : '#1a202c',
    textMuted: isDark ? '#718096' : '#4a5568',
  };

  // Micro-theme refinements for special elements
  const interactiveStyles = {
    safetyBox: {
      backgroundColor: isDark ? '#2c1a1a' : '#fff5f5',
      borderColor: isDark ? 'transparent' : '#feb2b2',
      borderWidth: isDark ? 0 : 1,
    },
    placeholderColor: isDark ? '#4a5568' : '#a0aec0',
  };

  useEffect(() => {
    let interval = null;
    if (isTimerRunning && timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    } else if (timer === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      triggerRestEndAlerts();
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timer]);

  useEffect(() => {
    return () => {
      if (soundObjectRef.current) {
        soundObjectRef.current.unloadAsync();
      }
    };
  }, []);

  const triggerRestEndAlerts = async () => {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      console.log('Haptics not supported or available on this platform device context.');
    }

    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldRouteThroughEarpieceAndroid: false,
      });

      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/sounds/timer-chime.mp3'),
        { shouldPlay: true }
      );
      soundObjectRef.current = sound;
    } catch (error) {
      console.log('Audio file play execution halted or audio asset skipped.', error);
    }
  };

  const triggerRestTimer = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}

    setTimer(60);
    setIsTimerRunning(true);
  };

  const handleInputChange = (exerciseId, setIndex, field, value) => {
    setLogs(prev => ({
      ...prev,
      [exerciseId]: {
        ...prev[exerciseId],
        [setIndex]: { ...prev[exerciseId]?.[setIndex], [field]: value }
      }
    }));
  };

  const saveWorkout = async () => {
    let progressiveOverloadAchieved = [];

    routine.exercises.forEach(ex => {
      const exerciseLog = logs[ex.id];
      if (exerciseLog) {
        const lastSetIndex = ex.sets - 1;
        const lastSetReps = parseInt(exerciseLog[lastSetIndex]?.reps || 0);

        if (lastSetReps >= 12) {
          progressiveOverloadAchieved.push(ex.name);
        }
      }
    });

    try {
      const WORKOUT_HISTORY_KEY = '@fitpursuit_workout_history';
      const existingHistoryJson = await AsyncStorage.getItem(WORKOUT_HISTORY_KEY);
      const currentHistory = existingHistoryJson ? JSON.parse(existingHistoryJson) : [];
      
      const newSessionRecord = {
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        day: day,
        routineTitle: routine.title,
        exercisesCompleted: routine.exercises.map(ex => ({
          name: ex.name,
          sets: logs[ex.id] ? Object.values(logs[ex.id]) : []
        }))
      };

      await AsyncStorage.setItem(WORKOUT_HISTORY_KEY, JSON.stringify([newSessionRecord, ...currentHistory]));
    } catch (e) {
      console.error("Failed to append workout session to log database history", e);
    }

    if (progressiveOverloadAchieved.length > 0) {
      setCoachMessage(`Coach Tip: You absolutely crushed your final sets for: ${progressiveOverloadAchieved.join(', ')}! Next week, let's challenge ourselves—move the weight selector pin down by one plate.`);
      setCoachModalVisible(true);
    } else {
      Alert.alert("Workout Saved!", "Fantastic consistency. See you next session!", [{ text: "OK", onPress: () => navigation.navigate('Dashboard') }]);
    }
  };

  return (
    <View style={[styles.masterContainer, { backgroundColor: activeTheme.background }]}>
      <ScrollView style={styles.container}>
        <Text style={[styles.dayTitle, { color: activeTheme.text }]}>{day}'s Blueprint</Text>
        <Text style={[styles.routineTitle, { color: activeTheme.textMuted }]}>{routine.title} • {routine.type}</Text>

        <View style={[styles.safetyBox, interactiveStyles.safetyBox]}>
          <ShieldAlert color="#e53e3e" size={16} />
          <Text style={styles.safetyText}>Form Rule: Control weight metrics down. Do not slam plates.</Text>
        </View>

        {routine.exercises.map((ex) => (
          <View key={ex.id} style={[styles.exerciseCard, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}>
            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.exName, { color: activeTheme.text }]}>{ex.name}</Text>
                <Text style={[styles.exMeta, { color: activeTheme.textMuted }]}>{ex.sets} Sets × {ex.reps} Reps | {ex.station}</Text>
              </View>
              <TouchableOpacity onPress={() => setActiveInstructionId(activeInstructionId === ex.id ? null : ex.id)}>
                <Info color="#dd6b20" size={22} />
              </TouchableOpacity>
            </View>

            {activeInstructionId === ex.id && (
              <View style={[styles.instructionDrawer, { backgroundColor: activeTheme.background }]}>
                <Text style={[styles.instructionText, { color: activeTheme.text }]}>{ex.steps}</Text>
              </View>
            )}

            {Array.from({ length: ex.sets }).map((_, setIndex) => (
              <View key={setIndex} style={styles.logRow}>
                <Text style={[styles.setNumber, { color: activeTheme.text }]}>Set {setIndex + 1}</Text>
                <TextInput 
                  placeholder={currentWeightUnit} 
                  placeholderTextColor={interactiveStyles.placeholderColor} 
                  keyboardType="numeric"
                  style={[styles.input, { backgroundColor: activeTheme.background, borderColor: activeTheme.border, color: activeTheme.text }]}
                  onChangeText={(val) => handleInputChange(ex.id, setIndex, 'weight', val)}
                />
                <TextInput 
                  placeholder="reps" 
                  placeholderTextColor={interactiveStyles.placeholderColor} 
                  keyboardType="numeric"
                  style={[styles.input, { backgroundColor: activeTheme.background, borderColor: activeTheme.border, color: activeTheme.text }]}
                  onChangeText={(val) => handleInputChange(ex.id, setIndex, 'reps', val)}
                />
                <TouchableOpacity style={styles.rowCheck} onPress={triggerRestTimer}>
                  <CheckCircle color="#dd6b20" size={20} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ))}

        <TouchableOpacity style={styles.saveBtn} onPress={saveWorkout}>
          <Text style={styles.saveBtnText}>Complete & Save Workout</Text>
        </TouchableOpacity>
        <View style={{ height: 100 }} />
      </ScrollView>

      {timer > 0 && (
        <View style={[styles.floatingTimer, { backgroundColor: activeTheme.card, borderColor: '#dd6b20' }]}>
          <Play color="#dd6b20" size={18} />
          <Text style={[styles.timerText, { color: activeTheme.text }]}>Resting Window Countdown: {timer}s</Text>
        </View>
      )}

      <Modal animationType="slide" transparent={true} visible={coachModalVisible}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: activeTheme.card, borderColor: '#dd6b20' }]}>
            <Text style={[styles.modalTitle, { color: activeTheme.text }]}>🔥 Coach Promotion Evaluation</Text>
            <Text style={[styles.modalBody, { color: activeTheme.textMuted }]}>{coachMessage}</Text>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => { setCoachModalVisible(false); navigation.navigate('Dashboard'); }}>
              <Text style={styles.modalCloseText}>Understood, Coach!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  masterContainer: { flex: 1 },
  container: { flex: 1, padding: 20, marginTop: 40 },
  dayTitle: { fontSize: 24, fontWeight: 'bold' },
  routineTitle: { fontSize: 14, marginBottom: 12 },
  safetyBox: { flexDirection: 'row', padding: 10, borderRadius: 8, alignItems: 'center', marginBottom: 20 },
  safetyText: { color: '#e53e3e', fontSize: 11, marginLeft: 8, fontWeight: '500' },
  exerciseCard: { borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  exName: { fontSize: 16, fontWeight: 'bold' },
  exMeta: { fontSize: 12, marginTop: 2 },
  instructionDrawer: { padding: 12, borderRadius: 8, marginBottom: 12 },
  instructionText: { fontSize: 12, lineHeight: 16 },
  logRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  setNumber: { width: '20%', fontSize: 13 },
  input: { padding: 8, borderRadius: 6, width: '25%', textAlign: 'center', fontSize: 13, borderWidth: 1 },
  rowCheck: { width: '15%', alignItems: 'center' },
  saveBtn: { backgroundColor: '#dd6b20', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 15 },
  saveBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 16 },
  floatingTimer: { position: 'absolute', bottom: 30, left: 20, right: 20, padding: 16, borderRadius: 30, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  timerText: { fontWeight: 'bold', marginLeft: 10 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { padding: 24, borderRadius: 16, width: '85%', borderWidth: 1 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  modalBody: { fontSize: 14, lineHeight: 20, marginBottom: 20 },
  modalCloseBtn: { backgroundColor: '#dd6b20', padding: 12, borderRadius: 8, alignItems: 'center' },
  modalCloseText: { color: '#ffffff', fontWeight: 'bold' }
});