import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { Dumbbell, Calendar, Flame } from 'lucide-react-native';
import { WEEKLY_ROUTINE } from '../data/workouts';

export default function Dashboard({ navigation, theme }) {
  const isDark = theme !== 'light';
  
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const currentDayIndex = new Date().getDay(); 
  const defaultDay = (currentDayIndex >= 1 && currentDayIndex <= 5) ? days[currentDayIndex - 1] : 'Monday';

  // Dynamic Theme Palette
  const themeStyles = {
    container: {
      backgroundColor: isDark ? '#14171c' : '#f7fafc',
    },
    card: {
      backgroundColor: isDark ? '#1e232b' : '#ffffff',
      borderColor: isDark ? 'rgba(255, 255, 255, 0.03)' : '#e2e8f0',
      borderWidth: isDark ? 0 : 1,
    },
    todayCard: {
      borderColor: '#dd6b20',
      borderWidth: 1,
      backgroundColor: isDark ? '#251c16' : '#fffaf0',
    },
    titleText: {
      color: isDark ? '#ffffff' : '#1a202c',
    },
    subText: {
      color: isDark ? '#718096' : '#4a5568',
    },
    mutedText: {
      color: isDark ? '#718096' : '#718096', // Stays balanced across both
    }
  };

  return (
    <ScrollView style={[styles.container, themeStyles.container]}>
      <View style={styles.header}>
        <Text style={[styles.appTitle, themeStyles.titleText]}>FitPursuit</Text>
        <Text style={[styles.subtitle, themeStyles.subText]}>AI Personal Training Coach</Text>
      </View>

      {/* Streak Widget */}
      <View style={[styles.streakCard, themeStyles.card]}>
        <Flame color="#dd6b20" size={32} />
        <View style={styles.streakTextContainer}>
          <Text style={[styles.streakTitle, themeStyles.titleText]}>Active Workouts Active</Text>
          <Text style={[styles.streakSub, themeStyles.mutedText]}>You are tracking beautifully this week.</Text>
        </View>
      </View>

      {/* Week Timeline */}
      <Text style={[styles.sectionHeader, themeStyles.titleText]}>Weekly Matrix</Text>
      <View style={styles.calendarStrip}>
        {days.map((day) => {
          const isToday = day === defaultDay;
          return (
            <View 
              key={day} 
              style={[
                styles.dayCard, 
                themeStyles.card, 
                isToday && themeStyles.todayCard
              ]}
            >
              <Text style={[styles.dayText, isToday ? styles.todayText : themeStyles.subText]}>
                {day.substring(0,3)}
              </Text>
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

      <Text style={[styles.sectionHeader, themeStyles.titleText]}>Overview Plan</Text>
      {days.map((day) => (
        <View key={day} style={[styles.summaryCard, themeStyles.card]}>
          <Text style={[styles.summaryDay, themeStyles.titleText]}>{day}</Text>
          <Text style={[styles.summaryRoutine, themeStyles.mutedText]}>
            {WEEKLY_ROUTINE[day].title} • <Text style={{color: '#dd6b20'}}>{WEEKLY_ROUTINE[day].type}</Text>
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { marginTop: 40, marginBottom: 25 },
  appTitle: { fontSize: 28, fontWeight: 'bold' },
  subtitle: { fontSize: 14, marginTop: 4 },
  streakCard: { flexDirection: 'row', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 25 },
  streakTextContainer: { marginLeft: 12 },
  streakTitle: { fontWeight: 'bold', fontSize: 16 },
  streakSub: { fontSize: 12 },
  sectionHeader: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, marginTop: 10 },
  calendarStrip: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  dayCard: { padding: 12, borderRadius: 10, alignItems: 'center', width: '18%' },
  dayText: { fontWeight: '600' },
  todayText: { color: '#dd6b20', fontWeight: 'bold' },
  actionButton: { backgroundColor: '#dd6b20', flexDirection: 'row', padding: 18, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 30 },
  actionButtonText: { color: '#ffffff', fontWeight: 'bold', fontSize: 16, marginLeft: 10 },
  summaryCard: { padding: 14, borderRadius: 10, marginBottom: 10 },
  summaryDay: { fontWeight: 'bold', fontSize: 14 },
  summaryRoutine: { fontSize: 12, marginTop: 2 }
});