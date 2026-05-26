import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { CheckCircle2 } from 'lucide-react-native';

export default function Analytics() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>History & Performance</Text>
      <Text style={styles.sub}>Track structural session records over time.</Text>

      <View style={styles.placeholderContainer}>
        <CheckCircle2 color="#718096" size={48} />
        <Text style={styles.placeholderText}>Logged data sets will pop-up trend timelines here automatically as history records compile.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#14171c', padding: 20, paddingTop: 60 },
  title: { color: '#ffffff', fontSize: 24, fontWeight: 'bold' },
  sub: { color: '#718096', fontSize: 13, marginBottom: 30 },
  placeholderContainer: { backgroundColor: '#1e232b', padding: 30, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  placeholderText: { color: '#718096', fontSize: 13, textAlign: 'center', marginTop: 12, lineHeight: 18 }
});