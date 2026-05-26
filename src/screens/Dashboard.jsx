import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { Dumbbell, Calendar, Flame } from 'lucide-react-native';
import { WEEKLY_ROUTINE } from '../data/workouts';

export default function Dashboard({ navigation }) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  
  const currentDayIndex = new Date().getDay(); 
  const defaultDay = (currentDayIndex >= 1 && currentDayIndex <= 5) ? days[currentDayIndex - 1] : 'Monday';

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.appTitle}>FitPursuit</Text>
        <Text style={styles.subtitle}>AI Personal Training Coach</Text>
      </View>

      {/* Streak Widget */}
      <View style={styles.streakCard}>
        <Flame color="#dd6b20" size={32} />
        <View style={styles.streakTextContainer}>
          <Text style={styles.streakTitle}>Active Workouts Active</Text>
          <Text style={styles.streakSub}>You are tracking beautifully this week.</Text>
        </View>
      </View>

      {/* Week Timeline */}
      <Text style={styles.sectionHeader}>Weekly Matrix</Text>
      <View style={styles.calendarStrip}>
        {days.map((day) => {
          const isToday = day === defaultDay;
          return (
            <View key={day} style={[styles.dayCard, isToday && styles.todayCard]}>
              <Text style={[styles.dayText, isToday && styles.todayText]}>{day.substring(0,3)}</Text>
              <Calendar color={isToday ? "#dd6b20" : "#718096"} size={18} style={{marginTop: 6}} />
            </View>
          );
        })}
      </View>

      {/* Main Dynamic Launcher Action */}
      <TouchableOpacity 
        style={styles.actionButton}
        onPress={() => navigation.navigate('Workout', { day: defaultDay })}
      >
        <Dumbbell color="#ffffff" size={24} />
        <Text style={styles.actionButtonText}>Launch {defaultDay}'s Routine</Text>
      </TouchableOpacity>

      <Text style={styles.sectionHeader}>Overview Plan</Text>
      {days.map((day) => (
        <View key={day} style={styles.summaryCard}>
          <Text style={styles.summaryDay}>{day}</Text>
          <Text style={styles.summaryRoutine}>{WEEKLY_ROUTINE[day].title} • <Text style={{color: '#dd6b20'}}>{WEEKLY_ROUTINE[day].type}</Text></Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#14171c', padding: 20 },
  header: { marginTop: 40, marginBottom: 25 },
  appTitle: { fontSize: 28, fontWeight: 'bold', color: '#ffffff' },
  subtitle: { fontSize: 14, color: '#718096', marginTop: 4 },
  streakCard: { flexDirection: 'row', backgroundColor: '#1e232b', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 25 },
  streakTextContainer: { marginLeft: 12 },
  streakTitle: { color: '#ffffff', fontWeight: 'bold', fontSize: 16 },
  streakSub: { color: '#718096', fontSize: 12 },
  sectionHeader: { color: '#ffffff', fontSize: 18, fontWeight: 'bold', marginBottom: 12, marginTop: 10 },
  calendarStrip: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  dayCard: { backgroundColor: '#1e232b', padding: 12, borderRadius: 10, alignItems: 'center', width: '18%' },
  todayCard: { borderborderColor: '#dd6b20', borderWidth: 1, backgroundColor: '#251c16' },
  dayText: { color: '#718096', fontWeight: '600' },
  todayText: { color: '#dd6b20', fontWeight: 'bold' },
  actionButton: { backgroundColor: '#dd6b20', flexDirection: 'row', padding: 18, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 30 },
  actionButtonText: { color: '#ffffff', fontWeight: 'bold', fontSize: 16, marginLeft: 10 },
  summaryCard: { backgroundColor: '#1e232b', padding: 14, borderRadius: 10, marginBottom: 10 },
  summaryDay: { color: '#ffffff', fontWeight: 'bold', fontSize: 14 },
  summaryRoutine: { color: '#718096', fontSize: 12, marginTop: 2 }
});