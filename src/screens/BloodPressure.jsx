import React, { useState, useEffect } from 'react';

// Dual-Platform Capability Layer (Web Preview & Mobile Device)
const isWeb = typeof document !== 'undefined';

let View, Text, TextInput, TouchableOpacity, ScrollView, Modal, ActivityIndicator, StyleSheet, KeyboardAvoidingView, Platform, FlatList;
let AsyncStorage;
let Heart, Activity, Calendar, Plus, Trash2, Edit2, X, ChevronLeft, ChevronRight, Info;
let ActivityIcon = Activity;
if (isWeb) {
  // Web compatibility mock layer for browser rendering
  StyleSheet = {
    create: (stylesObj) => stylesObj,
    flatten: (styleObj) => {
      if (!styleObj) return {};
      if (Array.isArray(styleObj)) {
        return styleObj.reduce((acc, curr) => ({ ...acc, ...StyleSheet.flatten(curr) }), {});
      }
      const m = { ...styleObj };
      if (m.paddingHorizontal) {
        m.paddingLeft = m.paddingHorizontal;
        m.paddingRight = m.paddingHorizontal;
        delete m.paddingHorizontal;
      }
      if (m.paddingVertical) {
        m.paddingTop = m.paddingVertical;
        m.paddingBottom = m.paddingVertical;
        delete m.paddingVertical;
      }
      if (m.marginHorizontal) {
        m.marginLeft = m.marginHorizontal;
        m.marginRight = m.marginHorizontal;
        delete m.marginHorizontal;
      }
      if (m.marginVertical) {
        m.marginTop = m.marginVertical;
        m.marginBottom = m.marginVertical;
        delete m.marginVertical;
      }
      if (m.borderRadius && typeof m.borderRadius === 'number') m.borderRadius = `${m.borderRadius}px`;
      if (m.fontSize && typeof m.fontSize === 'number') m.fontSize = `${m.fontSize}px`;
      if (m.gap && typeof m.gap === 'number') m.gap = `${m.gap}px`;
      return m;
    }
  };

  View = ({ children, style, ...props }) => (
    <div style={{ display: 'flex', flexDirection: 'column', boxSizing: 'border-box', ...StyleSheet.flatten(style) }} {...props}>
      {children}
    </div>
  );

  Text = ({ children, style, ...props }) => (
    <span style={{ boxSizing: 'border-box', ...StyleSheet.flatten(style) }} {...props}>
      {children}
    </span>
  );

  TextInput = ({ style, placeholderTextColor, onChangeText, value, ...props }) => (
    <input
      value={value}
      onChange={(e) => onChangeText && onChangeText(e.target.value)}
      style={{
        boxSizing: 'border-box',
        outline: 'none',
        border: 'none',
        ...StyleSheet.flatten(style)
      }}
      {...props}
    />
  );

  TouchableOpacity = ({ children, style, onPress, ...props }) => (
    <button
      onClick={onPress}
      style={{
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        cursor: 'pointer',
        border: 'none',
        background: 'none',
        padding: 0,
        outline: 'none',
        ...StyleSheet.flatten(style)
      }}
      {...props}
    >
      {children}
    </button>
  );

  ScrollView = ({ children, style, contentContainerStyle, ...props }) => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        overflowY: 'auto',
        maxHeight: '100%',
        ...StyleSheet.flatten(style),
        ...StyleSheet.flatten(contentContainerStyle)
      }}
      {...props}
    >
      {children}
    </div>
  );

  Modal = ({ children, visible, transparent, onRequestClose }) => {
    if (!visible) return null;
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: transparent ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.75)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 99999,
          padding: '20px',
          boxSizing: 'border-box'
        }}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} onClick={onRequestClose} />
        <div style={{ position: 'relative', width: '100%', maxWidth: '450px', zIndex: 1 }}>
          {children}
        </div>
      </div>
    );
  };

  ActivityIndicator = ({ size, color }) => (
    <div style={{ color, fontSize: '14px', fontWeight: 'bold', padding: '20px', textAlign: 'center' }}>
      Loading Diagnostic Feed...
    </div>
  );

  KeyboardAvoidingView = ({ children, style, ...props }) => (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, ...StyleSheet.flatten(style) }} {...props}>
      {children}
    </div>
  );

  Platform = { OS: 'web' };

  FlatList = ({ data, renderItem, keyExtractor, contentContainerStyle }) => (
    <div style={{ display: 'flex', flexDirection: 'column', ...StyleSheet.flatten(contentContainerStyle) }}>
      {data.map((item, index) => (
        <div key={keyExtractor ? keyExtractor(item, index) : index}>
          {renderItem({ item, index })}
        </div>
      ))}
    </div>
  );

  // localStorage fallback mock for web
  AsyncStorage = {
    getItem: async (key) => {
      return localStorage.getItem(key);
    },
    setItem: async (key, value) => {
      localStorage.setItem(key, value);
    }
  };

  // Inline styling / Unicode emoji replacements for Lucide icons in Browser
  Heart = ({ size, color }) => <span style={{ fontSize: size, color, display: 'inline-block' }}>❤️</span>;
  ActivityIcon = ({ size, color }) => <span style={{ fontSize: size, color, display: 'inline-block' }}>📈</span>;
  Calendar = ({ size, color }) => <span style={{ fontSize: size, color, display: 'inline-block' }}>📅</span>;
  Plus = ({ size, color }) => <span style={{ fontSize: size, color, fontWeight: 'bold', display: 'inline-block' }}>+</span>;
  Trash2 = ({ size, color }) => <span style={{ fontSize: size, color, display: 'inline-block' }}>🗑️</span>;
  Edit2 = ({ size, color }) => <span style={{ fontSize: size, color, display: 'inline-block' }}>✏️</span>;
  X = ({ size, color }) => <span style={{ fontSize: size, color, fontWeight: 'bold', display: 'inline-block' }}>✕</span>;
  ChevronLeft = ({ size, color }) => <span style={{ fontSize: size, color, fontWeight: 'bold', display: 'inline-block' }}>◀</span>;
  ChevronRight = ({ size, color }) => <span style={{ fontSize: size, color, fontWeight: 'bold', display: 'inline-block' }}>▶</span>;
  Info = ({ size, color }) => <span style={{ fontSize: size, color, display: 'inline-block' }}>ℹ️</span>;

} else {
  // Mobile Native compilation environment (resolves dynamically to prevent Web esbuild checks)
  const rnModuleName = 'react-native';
  const rnasyncModuleName = '@react-native-async-storage/async-storage';
  const lucideModuleName = 'lucide-react-native';

  const RN = require(rnModuleName);
  StyleSheet = RN.StyleSheet;
  Text = RN.Text;
  View = RN.View;
  TextInput = RN.TextInput;
  TouchableOpacity = RN.TouchableOpacity;
  ScrollView = RN.ScrollView;
  Modal = RN.Modal;
  ActivityIndicator = RN.ActivityIndicator;
  KeyboardAvoidingView = RN.KeyboardAvoidingView;
  Platform = RN.Platform;
  FlatList = RN.FlatList;

  AsyncStorage = require(rnasyncModuleName).default;

  const Lucide = require(lucideModuleName);
  Heart = Lucide.Heart;
  ActivityIcon = Lucide.Activity;
  Calendar = Lucide.Calendar;
  Plus = Lucide.Plus;
  Trash2 = Lucide.Trash2;
  Edit2 = Lucide.Edit2;
  X = Lucide.X;
  ChevronLeft = Lucide.ChevronLeft;
  ChevronRight = Lucide.ChevronRight;
  Info = Lucide.Info;
}

const BP_HISTORY_KEY = '@fitpursuit_bp_history';

const getDaysInMonth = (year, month) => {
  return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (year, month) => {
  return new Date(year, month, 1).getDay();
};

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function BloodPressureScreen({ theme }) {
  const isDark = theme !== 'light';

  // Dynamic Theme Definitions
  const currentThemeStyles = {
    container: {
      backgroundColor: isDark ? '#14171c' : '#f7fafc',
    },
    cardBackground: {
      backgroundColor: isDark ? '#1e232b' : '#ffffff',
      borderColor: isDark ? 'rgba(255, 255, 255, 0.03)' : '#e2e8f0',
    },
    innerInputBackground: {
      backgroundColor: isDark ? '#14171c' : '#edf2f7',
      borderColor: isDark ? '#2d3748' : '#cbd5e0',
      color: isDark ? '#ffffff' : '#2d3748',
    },
    mainText: {
      color: isDark ? '#ffffff' : '#1a202c',
    },
    subText: {
      color: isDark ? '#718096' : '#4a5568',
    },
    mutedLabel: {
      color: isDark ? '#a0aec0' : '#718096',
    },
    placeholderColor: isDark ? '#4a5568' : '#a0aec0',
  };

  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);

  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [pulse, setPulse] = useState('');
  const [period, setPeriod] = useState('Morning');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const [calendarVisible, setCalendarVisible] = useState(false);
  const [currentCalendarYear, setCurrentCalendarYear] = useState(new Date().getFullYear());
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState(new Date().getMonth());
  const [calendarTargetField, setCalendarTargetField] = useState('newLog');

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editSystolic, setEditSystolic] = useState('');
  const [editDiastolic, setEditDiastolic] = useState('');
  const [editPulse, setEditPulse] = useState('');
  const [editPeriod, setEditPeriod] = useState('Morning');
  const [editDate, setEditDate] = useState('');

  const [statusMessage, setStatusMessage] = useState(null);

  useEffect(() => {
    loadBPData();
  }, []);

  const loadBPData = async () => {
    try {
      setLoading(true);
      const historyJson = await AsyncStorage.getItem(BP_HISTORY_KEY);
      const parsedHistory = historyJson ? JSON.parse(historyJson) : [];
      const sortedHistory = parsedHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
      setHistory(sortedHistory);
    } catch (e) {
      console.error('Failed to load blood pressure data.', e);
    } finally {
      setLoading(false);
    }
  };

  const showStatus = (msg) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const getBPCategory = (sys, dia) => {
    const s = parseInt(sys, 10);
    const d = parseInt(dia, 10);
    if (isNaN(s) || isNaN(d)) return { label: 'Unknown', color: '#a0aec0' };

    if (s > 180 || d > 120) return { label: 'Crisis', color: '#e53e3e' };
    if (s >= 140 || d >= 90) return { label: 'Stage 2', color: '#fc8181' };
    if ((s >= 130 && s <= 139) || (d >= 80 && d <= 89)) return { label: 'Stage 1', color: '#f6ad55' };
    if (s >= 120 && s <= 129 && d < 80) return { label: 'Elevated', color: '#f6e05e' };
    if (s < 120 && d < 80) return { label: 'Normal', color: '#48bb78' };
    
    return { label: 'High', color: '#fc8181' };
  };

  const calculateAverages = () => {
    if (history.length === 0) return { sys: 0, dia: 0, pulse: 0, morningCount: 0, eveningCount: 0 };
    
    let sysSum = 0, diaSum = 0, pulseSum = 0;
    let morningCount = 0, eveningCount = 0;

    history.forEach((item) => {
      sysSum += item.systolic;
      diaSum += item.diastolic;
      pulseSum += item.pulse;
      if (item.period === 'Morning') morningCount++;
      else eveningCount++;
    });

    return {
      sys: Math.round(sysSum / history.length),
      dia: Math.round(diaSum / history.length),
      pulse: Math.round(pulseSum / history.length),
      morningCount,
      eveningCount,
    };
  };

  const handleAddLog = async () => {
    const sysNum = parseInt(systolic, 10);
    const diaNum = parseInt(diastolic, 10);
    const pulseNum = parseInt(pulse, 10);

    if (isNaN(sysNum) || isNaN(diaNum) || isNaN(pulseNum)) {
      showStatus({ text: 'Please fill in all readings with valid numbers.', type: 'error' });
      return;
    }

    try {
      const newEntry = {
        id: Date.now().toString(),
        systolic: sysNum,
        diastolic: diaNum,
        pulse: pulseNum,
        period,
        date: selectedDate,
      };

      const updatedHistory = [newEntry, ...history].sort((a, b) => new Date(b.date) - new Date(a.date));
      await AsyncStorage.setItem(BP_HISTORY_KEY, JSON.stringify(updatedHistory));
      
      setHistory(updatedHistory);
      setSystolic('');
      setDiastolic('');
      setPulse('');
      showStatus({ text: 'Cardiovascular values logged!', type: 'success' });
    } catch (e) {
      console.error(e);
      showStatus({ text: 'Error saving entry.', type: 'error' });
    }
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setEditSystolic(item.systolic.toString());
    setEditDiastolic(item.diastolic.toString());
    setEditPulse(item.pulse.toString());
    setEditPeriod(item.period);
    setEditDate(item.date);
    setEditModalVisible(true);
  };

  const handleUpdateLog = async () => {
    const sysNum = parseInt(editSystolic, 10);
    const diaNum = parseInt(editDiastolic, 10);
    const pulseNum = parseInt(editPulse, 10);

    if (isNaN(sysNum) || isNaN(diaNum) || isNaN(pulseNum)) {
      showStatus({ text: 'Please enter valid numbers.', type: 'error' });
      return;
    }

    try {
      const updatedHistory = history.map((item) => {
        if (item.id === editingItem.id) {
          return {
            ...item,
            systolic: sysNum,
            diastolic: diaNum,
            pulse: pulseNum,
            period: editPeriod,
            date: editDate
          };
        }
        return item;
      }).sort((a, b) => new Date(b.date) - new Date(a.date));

      await AsyncStorage.setItem(BP_HISTORY_KEY, JSON.stringify(updatedHistory));
      setHistory(updatedHistory);
      setEditModalVisible(false);
      setEditingItem(null);
      showStatus({ text: 'Reading updated successfully!', type: 'success' });
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteLog = async (id) => {
    try {
      const updatedHistory = history.filter((item) => item.id !== id);
      await AsyncStorage.setItem(BP_HISTORY_KEY, JSON.stringify(updatedHistory));
      setHistory(updatedHistory);
      showStatus({ text: 'Reading deleted.', type: 'success' });
    } catch (e) {
      console.error(e);
    }
  };

  const openCalendar = (field) => {
    setCalendarTargetField(field);
    const targetDateStr = field === 'newLog' ? selectedDate : editDate;
    const targetDate = new Date(targetDateStr);
    
    if (!isNaN(targetDate.getTime())) {
      setCurrentCalendarYear(targetDate.getFullYear());
      setCurrentCalendarMonth(targetDate.getMonth());
    }
    setCalendarVisible(true);
  };

  const handleSelectCalendarDay = (day) => {
    const monthStr = (currentCalendarMonth + 1).toString().padStart(2, '0');
    const dayStr = day.toString().padStart(2, '0');
    const formattedDate = `${currentCalendarYear}-${monthStr}-${dayStr}`;

    if (calendarTargetField === 'newLog') {
      setSelectedDate(formattedDate);
    } else {
      setEditDate(formattedDate);
    }
    setCalendarVisible(false);
  };

  const handleCalendarMonthChange = (direction) => {
    if (direction === 'prev') {
      if (currentCalendarMonth === 0) {
        setCurrentCalendarMonth(11);
        setCurrentCalendarYear(currentCalendarYear - 1);
      } else {
        setCurrentCalendarMonth(currentCalendarMonth - 1);
      }
    } else {
      if (currentCalendarMonth === 11) {
        setCurrentCalendarMonth(0);
        setCurrentCalendarYear(currentCalendarYear + 1);
      } else {
        setCurrentCalendarMonth(currentCalendarMonth + 1);
      }
    }
  };

  const renderCalendarGrid = () => {
    const totalDays = getDaysInMonth(currentCalendarYear, currentCalendarMonth);
    const firstDayIndex = getFirstDayOfMonth(currentCalendarYear, currentCalendarMonth);
    const daySlots = [];

    for (let i = 0; i < firstDayIndex; i++) {
      daySlots.push(<View key={`empty-${i}`} style={styles.calendarDayEmpty} />);
    }

    for (let day = 1; day <= totalDays; day++) {
      const monthStr = (currentCalendarMonth + 1).toString().padStart(2, '0');
      const dayStr = day.toString().padStart(2, '0');
      const formattedDate = `${currentCalendarYear}-${monthStr}-${dayStr}`;
      
      const isSelected = calendarTargetField === 'newLog' 
        ? selectedDate === formattedDate 
        : editDate === formattedDate;

      daySlots.push(
        <TouchableOpacity
          key={`day-${day}`}
          onPress={() => handleSelectCalendarDay(day)}
          style={[styles.calendarDay, isSelected && styles.calendarDaySelected]}
        >
          <Text style={[styles.calendarDayText, isSelected && styles.calendarDayTextSelected, !isSelected && currentThemeStyles.mainText]}>
            {day}
          </Text>
        </TouchableOpacity>
      );
    }

    return <View style={styles.calendarGrid}>{daySlots}</View>;
  };

  const averages = calculateAverages();

  if (loading) {
    return (
      <View style={[styles.loadingContainer, currentThemeStyles.container]}>
        <ActivityIndicator size="large" color="#dd6b20" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, currentThemeStyles.container]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        
        {/* Header Info */}
        <View style={styles.header}>
          <Text style={[styles.title, currentThemeStyles.mainText]}>Blood Pressure</Text>
          <Text style={[styles.subtitle, currentThemeStyles.subText]}>Daily cardiovascular tracking & insights</Text>
        </View>

        {/* BP Statistics Dashboard */}
        <View style={styles.dashboardContainer}>
          <View style={styles.cardRow}>
            {/* Average BP */}
            <View style={[styles.statsCard, currentThemeStyles.cardBackground]}>
              <View style={styles.statsCardHeader}>
                <Text style={[styles.miniCardLabel, currentThemeStyles.mutedLabel]}>Average BP</Text>
                <Heart size={14} color="#e53e3e" />
              </View>
              <Text style={[styles.statsCardValue, currentThemeStyles.mainText]}>
                {averages.sys > 0 ? `${averages.sys}/${averages.dia}` : '0/0'}
                <Text style={[styles.statsUnit, currentThemeStyles.mutedLabel]}> mmHg</Text>
              </Text>
              <View style={styles.categoryBadgeContainer}>
                {averages.sys > 0 && (
                  <View style={[styles.categoryBadge, { backgroundColor: getBPCategory(averages.sys, averages.dia).color + '22' }]}>
                    <Text style={[styles.categoryBadgeText, { color: getBPCategory(averages.sys, averages.dia).color }]}>
                      {getBPCategory(averages.sys, averages.dia).label}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Average Pulse */}
            <View style={[styles.statsCard, currentThemeStyles.cardBackground]}>
              <View style={styles.statsCardHeader}>
                <Text style={[styles.miniCardLabel, currentThemeStyles.mutedLabel]}>Avg Pulse</Text>
                <ActivityIcon size={14} color="#3182ce" />
              </View>
              <Text style={[styles.statsCardValue, currentThemeStyles.mainText]}>
                {averages.pulse > 0 ? averages.pulse : '0'}
                <Text style={[styles.statsUnit, currentThemeStyles.mutedLabel]}> BPM</Text>
              </Text>
              <Text style={[styles.periodBreakdownText, currentThemeStyles.mutedLabel]}>
                AM: {averages.morningCount} | PM: {averages.eveningCount}
              </Text>
            </View>
          </View>
        </View>

        {/* Input Form Box */}
        <View style={[styles.formCard, currentThemeStyles.cardBackground]}>
          <Text style={[styles.formTitle, currentThemeStyles.mainText]}>Record New Daily Reading</Text>
          
          <View style={styles.inputGrid}>
            {/* Systolic */}
            <View style={styles.formField}>
              <Text style={[styles.fieldLabel, currentThemeStyles.mutedLabel]}>Systolic (SYS)</Text>
              <TextInput
                style={[styles.formInput, currentThemeStyles.innerInputBackground]}
                placeholder="e.g. 120"
                placeholderTextColor={currentThemeStyles.placeholderColor}
                value={systolic}
                onChangeText={setSystolic}
              />
            </View>

            {/* Diastolic */}
            <View style={styles.formField}>
              <Text style={[styles.fieldLabel, currentThemeStyles.mutedLabel]}>Diastolic (DIA)</Text>
              <TextInput
                style={[styles.formInput, currentThemeStyles.innerInputBackground]}
                placeholder="e.g. 80"
                placeholderTextColor={currentThemeStyles.placeholderColor}
                value={diastolic}
                onChangeText={setDiastolic}
              />
            </View>

            {/* Pulse */}
            <View style={styles.formField}>
              <Text style={[styles.fieldLabel, currentThemeStyles.mutedLabel]}>Pulse (BPM)</Text>
              <TextInput
                style={[styles.formInput, currentThemeStyles.innerInputBackground]}
                placeholder="e.g. 72"
                placeholderTextColor={currentThemeStyles.placeholderColor}
                value={pulse}
                onChangeText={setPulse}
              />
            </View>
          </View>

          {/* Period Toggle & Calendar Button */}
          <View style={styles.metadataFormRow}>
            {/* Period selector */}
            <View style={[styles.toggleGroup, currentThemeStyles.innerInputBackground]}>
              <TouchableOpacity
                style={[styles.periodBtn, period === 'Morning' && styles.periodBtnActive]}
                onPress={() => setPeriod('Morning')}
              >
                <Text style={[styles.periodBtnText, period === 'Morning' && styles.periodBtnTextActive, period !== 'Morning' && currentThemeStyles.mutedLabel]}>Morning (AM)</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.periodBtn, period === 'Evening' && styles.periodBtnActive]}
                onPress={() => setPeriod('Evening')}
              >
                <Text style={[styles.periodBtnText, period === 'Evening' && styles.periodBtnTextActive, period !== 'Evening' && currentThemeStyles.mutedLabel]}>Evening (PM)</Text>
              </TouchableOpacity>
            </View>

            {/* Visual Calendar Picker Trigger */}
            <TouchableOpacity style={[styles.calendarSelector, currentThemeStyles.innerInputBackground]} onPress={() => openCalendar('newLog')}>
              <Calendar size={15} color="#dd6b20" style={styles.calendarIcon} />
              <Text style={[styles.calendarSelectorText, currentThemeStyles.mainText]}>{selectedDate}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.submitButton} onPress={handleAddLog}>
            <Plus size={16} color="#ffffff" style={{ marginRight: '6px' }} />
            <Text style={styles.submitButtonText}>Log Reading</Text>
          </TouchableOpacity>

          {statusMessage && (
            <Text style={[styles.statusMessage, statusMessage.type === 'error' ? styles.redText : styles.greenText]}>
              {statusMessage.text}
            </Text>
          )}
        </View>

        {/* History Timelines */}
        <Text style={[styles.sectionHeader, currentThemeStyles.mainText]}>Reading History</Text>
        
        {history.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Heart size={36} color={isDark ? "#4a5568" : "#cbd5e0"} />
            <Text style={[styles.emptyText, currentThemeStyles.mutedLabel]}>No blood pressure records.</Text>
            <Text style={[styles.emptySubText, currentThemeStyles.subText]}>Log your morning/evening numbers to map diagnostics.</Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {history.map((item) => {
              const category = getBPCategory(item.systolic, item.diastolic);
              return (
                <View key={item.id} style={[styles.logRow, currentThemeStyles.cardBackground]}>
                  {/* Left block info */}
                  <View style={styles.logMeta}>
                    <Text style={[styles.logDate, currentThemeStyles.mainText] ?? {color: '#000000'}}>{item.date}</Text>
                    <View style={[styles.periodBadge, currentThemeStyles.innerInputBackground]}>
                      <Text style={[styles.periodBadgeText, currentThemeStyles.mutedLabel]}>{item.period}</Text>
                    </View>
                  </View>

                  {/* Diagnostic stats */}
                  <View style={styles.logMetrics}>
                    <Text style={[styles.logValues, currentThemeStyles.mainText]}>
                      {item.systolic}/{item.diastolic}
                      <Text style={[styles.logValUnit, currentThemeStyles.mutedLabel]}> mmHg</Text>
                    </Text>
                    <Text style={[styles.logPulse, currentThemeStyles.mutedLabel]}>💓 {item.pulse} BPM</Text>
                  </View>

                  {/* Status Indicator Bar */}
                  <View style={styles.statusWrap}>
                    <View style={[styles.statusIndicatorLabel, { backgroundColor: category.color + '18', borderColor: category.color }]}>
                      <Text style={[styles.statusIndicatorLabelText, { color: category.color }]}>
                        {category.label}
                      </Text>
                    </View>
                  </View>

                  {/* Action buttons */}
                  <View style={styles.actionButtons}>
                    <TouchableOpacity onPress={() => openEditModal(item)} style={[styles.actionBtn, currentThemeStyles.innerInputBackground]}>
                      <Edit2 size={13} color={isDark ? "#a0aec0" : "#4a5568"} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeleteLog(item.id)} style={[styles.actionBtn, currentThemeStyles.innerInputBackground]}>
                      <Trash2 size={13} color="#fc8181" />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* 📅 CUSTOM INTERACTIVE CALENDAR DIALOG */}
      <Modal visible={calendarVisible} transparent={true} animationType="fade" onRequestClose={() => setCalendarVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.calendarModalContent, currentThemeStyles.cardBackground]}>
            
            {/* Month & Year Selection Navigation */}
            <View style={styles.calendarHeader}>
              <TouchableOpacity onPress={() => handleCalendarMonthChange('prev')} style={[styles.arrowButton, currentThemeStyles.innerInputBackground]}>
                <ChevronLeft size={20} color={isDark ? "#ffffff" : "#1a202c"} />
              </TouchableOpacity>
              
              <Text style={[styles.calendarMonthTitle, currentThemeStyles.mainText]}>
                {MONTH_NAMES[currentCalendarMonth]} {currentCalendarYear}
              </Text>
              
              <TouchableOpacity onPress={() => handleCalendarMonthChange('next')} style={[styles.arrowButton, currentThemeStyles.innerInputBackground]}>
                <ChevronRight size={20} color={isDark ? "#ffffff" : "#1a202c"} />
              </TouchableOpacity>
            </View>

            {/* Weekdays indicator grid */}
            <View style={styles.weekdaysHeader}>
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                <Text key={`weekday-${idx}`} style={[styles.weekdayText, currentThemeStyles.subText]}>{day}</Text>
              ))}
            </View>

            {/* Days calculation grid */}
            {renderCalendarGrid()}

            <TouchableOpacity 
              style={[styles.calendarCloseButton, currentThemeStyles.innerInputBackground]} 
              onPress={() => setCalendarVisible(false)}
            >
              <Text style={[styles.calendarCloseButtonText, currentThemeStyles.mutedLabel]}>Close Calendar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 📝 EDIT MODAL OVERLAY */}
      <Modal visible={editModalVisible} transparent={true} animationType="slide" onRequestClose={() => setEditModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.editModalContentBody, currentThemeStyles.cardBackground]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, currentThemeStyles.mainText]}>Edit Reading Entry</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <X size={20} color={isDark ? "#a0aec0" : "#718096"} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalForm}>
              <View style={styles.editRowFields}>
                <View style={styles.modalFieldHalf}>
                  <Text style={[styles.modalLabel, currentThemeStyles.mutedLabel]}>Systolic</Text>
                  <TextInput
                    style={[styles.modalInput, currentThemeStyles.innerInputBackground]}
                    value={editSystolic}
                    onChangeText={setEditSystolic}
                  />
                </View>

                <View style={styles.modalFieldHalf}>
                  <Text style={[styles.modalLabel, currentThemeStyles.mutedLabel]}>Diastolic</Text>
                  <TextInput
                    style={[styles.modalInput, currentThemeStyles.innerInputBackground]}
                    value={editDiastolic}
                    onChangeText={setEditDiastolic}
                  />
                </View>
              </View>

              <Text style={[styles.modalLabel, currentThemeStyles.mutedLabel]}>Pulse (BPM)</Text>
              <TextInput
                style={[styles.modalInput, currentThemeStyles.innerInputBackground]}
                value={editPulse}
                onChangeText={setEditPulse}
              />

              <Text style={[styles.modalLabel, currentThemeStyles.mutedLabel]}>Period</Text>
              <View style={[styles.toggleGroup, currentThemeStyles.innerInputBackground]}>
                <TouchableOpacity
                  style={[styles.periodBtn, editPeriod === 'Morning' && styles.periodBtnActive]}
                  onPress={() => setEditPeriod('Morning')}
                >
                  <Text style={[styles.periodBtnText, editPeriod === 'Morning' && styles.periodBtnTextActive, editPeriod !== 'Morning' && currentThemeStyles.mutedLabel]}>Morning (AM)</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.periodBtn, editPeriod === 'Evening' && styles.periodBtnActive]}
                  onPress={() => setEditPeriod('Evening')}
                >
                  <Text style={[styles.periodBtnText, editPeriod === 'Evening' && styles.periodBtnTextActive, editPeriod !== 'Evening' && currentThemeStyles.mutedLabel]}>Evening (PM)</Text>
                </TouchableOpacity>
              </View>

              {/* Edit log calendar trigger */}
              <Text style={[styles.modalLabel, currentThemeStyles.mutedLabel]}>Selected Date</Text>
              <TouchableOpacity style={[styles.calendarSelector, currentThemeStyles.innerInputBackground]} onPress={() => openCalendar('editLog')}>
                <Calendar size={15} color="#dd6b20" style={styles.calendarIcon} />
                <Text style={[styles.calendarSelectorText, currentThemeStyles.mainText]}>{editDate}</Text>
              </TouchableOpacity>

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
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 40,
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 8,
    display: 'flex',
    flexDirection: 'column',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  dashboardContainer: {
    paddingHorizontal: 24,
    marginTop: 16,
    marginBottom: 16,
    display: 'flex',
    flexDirection: 'column',
  },
  cardRow: {
    flexDirection: 'row',
    gap: 12,
    display: 'flex',
    width: '100%',
  },
  statsCard: {
    flex: 1,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  statsCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
    display: 'flex',
  },
  miniCardLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  statsCardValue: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 6,
  },
  statsUnit: {
    fontSize: 11,
    fontWeight: '600',
  },
  periodBreakdownText: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 8,
  },
  categoryBadgeContainer: {
    alignItems: 'flex-start',
    marginTop: 8,
    display: 'flex',
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    display: 'flex',
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  formCard: {
    marginHorizontal: 24,
    padding: 20,
    borderRadius: 22,
    borderWidth: 1,
    marginBottom: 24,
    display: 'flex',
    flexDirection: 'column',
  },
  formTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 16,
  },
  inputGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
    display: 'flex',
  },
  formField: {
    flex: 1,
    gap: 6,
    display: 'flex',
    flexDirection: 'column',
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  formInput: {
    borderWidth: 1,
    borderRadius: 12,
    height: 44,
    paddingHorizontal: 12,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    width: '100%',
  },
  metadataFormRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    display: 'flex',
    width: '100%',
  },
  toggleGroup: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 3,
    display: 'flex',
  },
  periodBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    display: 'flex',
  },
  periodBtnActive: {
    backgroundColor: '#dd6b20',
  },
  periodBtnText: {
    fontSize: 10,
    fontWeight: '700',
  },
  periodBtnTextActive: {
    color: '#ffffff',
  },
  calendarSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    display: 'flex',
  },
  calendarIcon: {
    marginRight: 6,
  },
  calendarSelectorText: {
    fontSize: 11,
    fontWeight: '700',
  },
  submitButton: {
    backgroundColor: '#dd6b20',
    borderRadius: 12,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    display: 'flex',
    width: '100%',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  statusMessage: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 10,
    textAlign: 'center',
  },
  redText: {
    color: '#fc8181',
  },
  greenText: {
    color: '#48bb78',
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '800',
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  listContainer: {
    paddingHorizontal: 24,
    gap: 10,
    display: 'flex',
    flexDirection: 'column',
  },
  logRow: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    display: 'flex',
    width: '100%',
  },
  logMeta: {
    flex: 1.5,
    gap: 4,
    display: 'flex',
    flexDirection: 'column',
  },
  logDate: {
    fontSize: 13,
    fontWeight: '700',
  },
  periodBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    display: 'flex',
  },
  periodBadgeText: {
    fontSize: 9,
    fontWeight: '700',
  },
  logMetrics: {
    flex: 2,
    justifyContent: 'center',
    display: 'flex',
    flexDirection: 'column',
  },
  logValues: {
    fontSize: 15,
    fontWeight: '800',
  },
  logValUnit: {
    fontSize: 10,
    fontWeight: '600',
  },
  logPulse: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  statusWrap: {
    flex: 1.5,
    alignItems: 'center',
    display: 'flex',
  },
  statusIndicatorLabel: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    display: 'flex',
  },
  statusIndicatorLabelText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    display: 'flex',
  },
  actionBtn: {
    padding: 8,
    borderRadius: 10,
    display: 'flex',
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
    display: 'flex',
    flexDirection: 'column',
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 12,
  },
  emptySubText: {
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    boxSizing: 'border-box',
    zIndex: 99999,
  },
  editModalContentBody: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    maxWidth: '450px',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    display: 'flex',
    width: '100%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  modalForm: {
    gap: 14,
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  editRowFields: {
    flexDirection: 'row',
    gap: 12,
    display: 'flex',
    width: '100%',
  },
  modalFieldHalf: {
    flex: 1,
    gap: 6,
    display: 'flex',
    flexDirection: 'column',
  },
  modalLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    fontWeight: '600',
    width: '100%',
    boxSizing: 'border-box',
  },
  modalSaveButton: {
    backgroundColor: '#dd6b20',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginTop: 10,
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
  },
  modalSaveButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  calendarModalContent: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    maxWidth: '380px',
    boxSizing: 'border-box',
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
    paddingHorizontal: 8,
    display: 'flex',
  },
  arrowButton: {
    padding: 8,
    borderRadius: 10,
    display: 'flex',
  },
  calendarMonthTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  weekdaysHeader: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginBottom: 8,
    display: 'flex',
  },
  weekdayText: {
    width: '14%',
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 11,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    display: 'flex',
  },
  calendarDay: {
    width: '14%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginVertical: 2,
    display: 'flex',
  },
  calendarDayEmpty: {
    width: '14%',
    aspectRatio: 1,
    display: 'flex',
  },
  calendarDaySelected: {
    backgroundColor: '#dd6b20',
  },
  calendarDayText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 13,
  },
  calendarDayTextSelected: {
    fontWeight: '800',
  },
  calendarCloseButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'center',
  },
  calendarCloseButtonText: {
    fontWeight: '700',
    fontSize: 13,
  },
});