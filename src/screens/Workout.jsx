import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, Alert, Modal } from 'react-native';
import { Play, CheckCircle, Info, ShieldAlert } from 'lucide-react-native';
import { WEEKLY_ROUTINE } from '../data/workouts';

export default function Workout({ route, navigation }) {
  const { day } = route.params || { day: 'Monday' };
  const routine = WEEKLY_ROUTINE[day];

  const [logs, setLogs] = useState({});
  const [activeInstructionId, setActiveInstructionId] = useState(null);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [coachModalVisible, setCoachModalVisible] = useState(false);
  const [coachMessage, setCoachMessage] = useState('');

  useEffect(() => {
    let interval = null;
    if (isTimerRunning && timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    } else if (timer === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timer]);

  const triggerRestTimer = () => {
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

  const saveWorkout = () => {
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

    if (progressiveOverloadAchieved.length > 0) {
      setCoachMessage(`Coach Tip: You absolutely crushed your final sets for: ${progressiveOverloadAchieved.join(', ')}! Next week, let's challenge ourselves—move the weight selector pin down by one plate.`);
      setCoachModalVisible(true);
    } else {
      Alert.alert("Workout Saved!", "Fantastic consistency. See you next session!", [{ text: "OK", onPress: () => navigation.navigate('Dashboard') }]);
    }
  };

  return (
    <View style={styles.masterContainer}>
      <ScrollView style={styles.container}>
        <Text style={styles.dayTitle}>{day}'s Blueprint</Text>
        <Text style={styles.routineTitle}>{routine.title} • {routine.type}</Text>

        <View style={styles.safetyBox}>
          <ShieldAlert color="#e53e3e" size={16} />
          <Text style={styles.safetyText}>Form Rule: Control weight metrics down. Do not slam plates.</Text>
        </View>

        {routine.exercises.map((ex) => (
          <View key={ex.id} style={styles.exerciseCard}>
            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.exName}>{ex.name}</Text>
                <Text style={styles.exMeta}>{ex.sets} Sets × {ex.reps} Reps | {ex.station}</Text>
              </View>
              <TouchableOpacity onPress={() => setActiveInstructionId(activeInstructionId === ex.id ? null : ex.id)}>
                <Info color="#dd6b20" size={22} />
              </TouchableOpacity>
            </View>

            {activeInstructionId === ex.id && (
              <View style={styles.instructionDrawer}>
                <Text style={styles.instructionText}>{ex.steps}</Text>
              </View>
            )}

            {Array.from({ length: ex.sets }).map((_, setIndex) => (
              <View key={setIndex} style={styles.logRow}>
                <Text style={styles.setNumber}>Set {setIndex + 1}</Text>
                <TextInput 
                  placeholder="lbs" 
                  placeholderTextColor="#4a5568" 
                  keyboardType="numeric"
                  style={styles.input}
                  onChangeText={(val) => handleInputChange(ex.id, setIndex, 'weight', val)}
                />
                <TextInput 
                  placeholder="reps" 
                  placeholderTextColor="#4a5568" 
                  keyboardType="numeric"
                  style={styles.input}
                  onChangeText={(val) => handleInputChange(ex.id, setIndex, 'reps', val)}
                />
                <TouchableOpacity style={styles.rowCheck} onPress={triggerRestTimer}>
                  <CheckCircle color="#718096" size={20} />
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
        <View style={styles.floatingTimer}>
          <Play color="#dd6b20" size={18} />
          <Text style={styles.timerText}>Resting Window Countdown: {timer}s</Text>
        </View>
      )}

      <Modal animationType="slide" transparent={true} visible={coachModalVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🔥 Coach Promotion Evaluation</Text>
            <Text style={styles.modalBody}>{coachMessage}</Text>
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
  masterContainer: { flex: 1, backgroundColor: '#14171c' },
  container: { flex: 1, padding: 20, marginTop: 40 },
  dayTitle: { color: '#ffffff', fontSize: 24, fontWeight: 'bold' },
  routineTitle: { color: '#718096', fontSize: 14, marginBottom: 12 },
  safetyBox: { flexDirection: 'row', backgroundColor: '#2c1a1a', padding: 10, borderRadius: 8, alignItems: 'center', marginBottom: 20 },
  safetyText: { color: '#e53e3e', fontSize: 11, marginLeft: 8, fontWeight: '500' },
  exerciseCard: { backgroundColor: '#1e232b', borderRadius: 12, padding: 16, marginBottom: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  exName: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  exMeta: { color: '#718096', fontSize: 12, marginTop: 2 },
  instructionDrawer: { backgroundColor: '#14171c', padding: 12, borderRadius: 8, marginBottom: 12 },
  instructionText: { color: '#cbd5e0', fontSize: 12, lineHeight: 16 },
  logRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  setNumber: { color: '#ffffff', width: '20%', fontSize: 13 },
  input: { backgroundColor: '#14171c', color: '#ffffff', padding: 8, borderRadius: 6, width: '25%', textAlign: 'center', fontSize: 13 },
  rowCheck: { width: '15%', alignItems: 'center' },
  saveBtn: { backgroundColor: '#dd6b20', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 15 },
  saveBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 16 },
  floatingTimer: { position: 'absolute', bottom: 30, left: 20, right: 20, backgroundColor: '#1e232b', padding: 16, borderRadius: 30, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderborderColor: '#dd6b20', borderWidth: 1 },
  timerText: { color: '#ffffff', fontWeight: 'bold', marginLeft: 10 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#1e232b', padding: 24, borderRadius: 16, width: '85%', borderborderColor: '#dd6b20', borderWidth: 1 },
  modalTitle: { color: '#ffffff', fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  modalBody: { color: '#cbd5e0', fontSize: 14, lineHeight: 20, marginBottom: 20 },
  modalCloseBtn: { backgroundColor: '#dd6b20', padding: 12, borderRadius: 8, alignItems: 'center' },
  modalCloseText: { color: '#ffffff', fontWeight: 'bold' }
});