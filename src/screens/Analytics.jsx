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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Scale, TrendingUp, TrendingDown, Trash2, Edit2, Plus, Calendar, X } from 'lucide-react-native';

const PROFILE_KEY = '@fitpursuit_profile';
const HISTORY_KEY = '@fitpursuit_weight_history';

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [history, setHistory] = useState([]);
  
  // Form states for adding new log
  const [inputWeight, setInputWeight] = useState('');
  const [inputDate, setInputDate] = useState(new Date().toISOString().split('T')[0]); // Default YYYY-MM-DD
  
  // Edit Modal States
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editWeight, setEditWeight] = useState('');
  const [editDate, setEditDate] = useState('');

  // Status Alerts
  const [statusMessage, setStatusMessage] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load Profile (for starting weight & unit preference)
      const profileJson = await AsyncStorage.getItem(PROFILE_KEY);
      const parsedProfile = profileJson ? JSON.parse(profileJson) : null;
      setProfile(parsedProfile);

      // Load Weight History Logs
      const historyJson = await AsyncStorage.getItem(HISTORY_KEY);
      const parsedHistory = historyJson ? JSON.parse(historyJson) : [];
      
      // Sort history chronologically (newest first)
      const sortedHistory = parsedHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
      setHistory(sortedHistory);
    } catch (e) {
      console.error('Failed to load logs history.', e);
    } finally {
      setLoading(false);
    }
  };

  const showStatus = (msg) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  // ➕ CREATE: Add New Weight Entry
  const handleAddLog = async () => {
    if (!inputWeight.trim() || isNaN(inputWeight)) {
      showStatus({ text: 'Please enter a valid weight number.', type: 'error' });
      return;
    }

    try {
      const newEntry = {
        id: Date.now().toString(),
        weight: parseFloat(inputWeight),
        date: inputDate || new Date().toISOString().split('T')[0],
      };

      const updatedHistory = [newEntry, ...history].sort((a, b) => new Date(b.date) - new Date(a.date));
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
      
      setHistory(updatedHistory);
      setInputWeight('');
      setInputDate(new Date().toISOString().split('T')[0]);
      showStatus({ text: 'Weight logged successfully!', type: 'success' });
    } catch (e) {
      console.error(e);
      showStatus({ text: 'Error saving entry.', type: 'error' });
    }
  };

  // 📝 UPDATE: Edit Existing Entry (Item 7)
  const openEditModal = (item) => {
    setEditingItem(item);
    setEditWeight(item.weight.toString());
    setEditDate(item.date);
    setEditModalVisible(true);
  };

  const handleUpdateLog = async () => {
    if (!editWeight.trim() || isNaN(editWeight)) {
      showStatus({ text: 'Please enter a valid weight number.', type: 'error' });
      return;
    }

    try {
      const updatedHistory = history.map((item) => {
        if (item.id === editingItem.id) {
          return { ...item, weight: parseFloat(editWeight), date: editDate };
        }
        return item;
      }).sort((a, b) => new Date(b.date) - new Date(a.date));

      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
      setHistory(updatedHistory);
      setEditModalVisible(false);
      setEditingItem(null);
      showStatus({ text: 'Log updated successfully!', type: 'success' });
    } catch (e) {
      console.error(e);
    }
  };

  // ❌ DELETE: Remove Entry (Item 7)
  const handleDeleteLog = async (id) => {
    try {
      const updatedHistory = history.filter((item) => item.id !== id);
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
      setHistory(updatedHistory);
      showStatus({ text: 'Log deleted.', type: 'success' });
    } catch (e) {
      console.error(e);
    }
  };

  // Mathematical Analytics Conversions & Computations
  const unit = profile?.weightUnit || 'lbs';
  const startingWeight = profile?.weight ? parseFloat(profile.weight) : null;
  const currentWeight = history.length > 0 ? history[0].weight : startingWeight;
  const totalChange = startingWeight && currentWeight ? currentWeight - startingWeight : 0;

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
      {/* Header Info */}
      <View style={styles.header}>
        <Text style={styles.title}>Weight Logs</Text>
        <Text style={styles.subtitle}>Track your body transformation stats</Text>
      </View>

      {/* Progress Dashboard Panel */}
      <View style={styles.dashboardContainer}>
        <View style={styles.cardRow}>
          {/* Starting Weight */}
          <View style={styles.miniCard}>
            <Text style={styles.miniCardLabel}>Starting</Text>
            <Text style={styles.miniCardValue}>
              {startingWeight ? `${startingWeight} ${unit}` : 'Not set'}
            </Text>
          </View>

          {/* Current Weight */}
          <View style={styles.miniCard}>
            <Text style={styles.miniCardLabel}>Current</Text>
            <Text style={styles.miniCardValue}>
              {currentWeight ? `${currentWeight} ${unit}` : 'Not set'}
            </Text>
          </View>

          {/* Progress Net change */}
          <View style={[styles.miniCard, totalChange !== 0 && (totalChange < 0 ? styles.successCardBorder : styles.neutralCardBorder)]}>
            <Text style={styles.miniCardLabel}>Progress</Text>
            <View style={styles.trendRow}>
              {totalChange !== 0 && (
                totalChange < 0 ? <TrendingDown size={14} color="#48bb78" /> : <TrendingUp size={14} color="#e53e3e" />
              )}
              <Text style={[styles.miniCardValue, totalChange < 0 ? styles.greenText : totalChange > 0 ? styles.redText : null]}>
                {startingWeight && currentWeight
                  ? `${totalChange > 0 ? '+' : ''}${totalChange.toFixed(1)} ${unit}`
                  : '0.0'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Trigger Form Box: Log Today's Weight */}
      <View style={styles.formCard}>
        <Text style={styles.formTitle}>Record New Weight Entry</Text>
        
        <View style={styles.inputRow}>
          <View style={styles.inputContainer}>
            <Scale size={14} color="#718096" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder={`Weight (${unit})`}
              placeholderTextColor="#4a5568"
              keyboardType="decimal-pad"
              value={inputWeight}
              onChangeText={setInputWeight}
            />
          </View>

          <View style={styles.inputContainer}>
            <Calendar size={14} color="#718096" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#4a5568"
              value={inputDate}
              onChangeText={setInputDate}
            />
          </View>

          <TouchableOpacity style={styles.addButton} onPress={handleAddLog}>
            <Plus size={18} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {statusMessage && (
          <Text style={[styles.statusMessage, statusMessage.type === 'error' ? styles.redText : styles.greenText]}>
            {statusMessage.text}
          </Text>
        )}
      </View>

      {/* Logs Timeline List */}
      <Text style={styles.sectionHeader}>Log History</Text>
      
      {history.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Scale size={32} color="#4a5568" />
          <Text style={styles.emptyText}>No logs recorded yet.</Text>
          <Text style={styles.emptySubText}>Enter your weight above to compile records.</Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.logRow}>
              <View style={styles.logInfo}>
                <Calendar size={14} color="#dd6b20" style={styles.logIcon} />
                <Text style={styles.logDate}>{item.date}</Text>
              </View>
              <Text style={styles.logWeight}>{item.weight} {unit}</Text>
              
              <View style={styles.actionButtons}>
                <TouchableOpacity onPress={() => openEditModal(item)} style={styles.actionBtn}>
                  <Edit2 size={14} color="#a0aec0" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteLog(item.id)} style={styles.actionBtn}>
                  <Trash2 size={14} color="#fc8181" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      {/* Edit Overlay Modal */}
      <Modal visible={editModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Log Entry</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <X size={20} color="#a0aec0" />
              </View>
            </View>

            <View style={styles.modalForm}>
              <Text style={styles.modalLabel}>Weight ({unit})</Text>
              <TextInput
                style={styles.modalInput}
                keyboardType="decimal-pad"
                value={editWeight}
                onChangeText={setEditWeight}
              />

              <Text style={styles.modalLabel}>Date</Text>
              <TextInput
                style={styles.modalInput}
                value={editDate}
                onChangeText={setEditDate}
              />

              <TouchableOpacity style={styles.modalSaveButton} onPress={handleUpdateLog}>
                <Text style={styles.modalSaveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#14171c',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#14171c',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 14,
    color: '#718096',
    marginTop: 4,
  },
  dashboardContainer: {
    paddingHorizontal: 24,
    marginTop: 16,
    marginBottom: 16,
  },
  cardRow: {
    flexDirection: 'row',
    gap: 12,
  },
  miniCard: {
    flex: 1,
    backgroundColor: '#1e232b',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.03)',
  },
  miniCardLabel: {
    fontSize: 11,
    color: '#718096',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  miniCardValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
    marginTop: 6,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  successCardBorder: {
    borderColor: 'rgba(72, 187, 120, 0.2)',
  },
  neutralCardBorder: {
    borderColor: 'rgba(255, 255, 255, 0.03)',
  },
  greenText: {
    color: '#48bb78',
  },
  redText: {
    color: '#f56565',
  },
  formCard: {
    backgroundColor: '#1e232b',
    marginHorizontal: 24,
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.03)',
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  inputContainer: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#14171c',
    borderWidth: 1,
    borderColor: '#2d3748',
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  inputIcon: {
    marginRight: 6,
  },
  input: {
    flex: 1,
    height: 40,
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: '#dd6b20',
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusMessage: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
    paddingHorizontal: 24,
    marginBottom: 10,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  logRow: {
    flexDirection: 'row',
    backgroundColor: '#1e232b',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.02)',
  },
  logInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 2,
  },
  logIcon: {
    marginRight: 8,
  },
  logDate: {
    color: '#e2e8f0',
    fontSize: 13,
    fontWeight: '600',
  },
  logWeight: {
    flex: 1.5,
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'right',
    paddingRight: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    padding: 6,
    backgroundColor: '#14171c',
    borderRadius: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 60,
  },
  emptyText: {
    color: '#a0aec0',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 12,
  },
  emptySubText: {
    color: '#718096',
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#1e232b',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#2d3748',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
  },
  modalForm: {
    gap: 12,
  },
  modalLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#a0aec0',
  },
  modalInput: {
    backgroundColor: '#14171c',
    borderWidth: 1,
    borderColor: '#2d3748',
    borderRadius: 12,
    padding: 12,
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalSaveButton: {
    backgroundColor: '#dd6b20',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  modalSaveButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});