import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import { Colors } from '../constants/Colors';
import { PdfService } from '../services/pdfService';

const TYPE_COLORS = {
  exam:       Colors.accent3,
  lecture:    Colors.accent,
  lab:        Colors.accent2,
  assignment: Colors.warn,
  holiday:    Colors.accent4,
  other:      Colors.muted,
};

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

function formatTime(timeStr) {
  if (!timeStr) return '';
  return timeStr.slice(0, 5);
}

export default function ScheduleScreen() {
  const today = new Date();
  const [activeDay, setActiveDay] = useState(2);
  const [events,    setEvents]    = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - 2 + i);
    return {
      letter:  d.toLocaleDateString('en', { weekday: 'short' }).slice(0, 1),
      num:     d.getDate(),
      dateStr: formatDate(d),
      hasDot:  false,
    };
  });

  const selectedDate = days[activeDay]?.dateStr;

  // ── Load events ───────────────────────────────────────────
  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      const uploadList  = await PdfService.listUploads();
      const doneUploads = uploadList.filter(u => u.status === 'done');
      const allEvents   = [];
      for (const upload of doneUploads) {
        const evs = await PdfService.getEvents(upload.id);
        allEvents.push(...evs);
      }
      setEvents(allEvents);
    } catch (err) {
      console.error('[loadEvents]', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadEvents(); }, [loadEvents]);

  // ── Filter for selected day ───────────────────────────────
  const todayEvents = events.filter(
    e => e.event_date?.slice(0, 10) === selectedDate
  );

  // ── Upload PDF ────────────────────────────────────────────
  async function handleUpload() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;

      const file = result.assets[0];
      setUploading(true);
      setUploadMsg('Uploading PDF...');

      const { upload_id } = await PdfService.uploadPdf(file.uri, file.name);
      setUploadMsg('Parsing PDF...');

      await PdfService.pollUntilDone(upload_id, (status) => {
        setUploadMsg(`Status: ${status}...`);
      });

      setUploadMsg('Done! Loading events...');
      await loadEvents();
      setUploading(false);
      setUploadMsg('');
      Alert.alert('Success', 'PDF parsed and events added to your schedule!');
    } catch (err) {
      setUploading(false);
      setUploadMsg('');
      Alert.alert('Error', err.message || 'Failed to upload PDF.');
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <Text style={styles.title}>Schedule</Text>

        {/* Upload status */}
        {!!uploadMsg && (
          <View style={styles.uploadMsgBox}>
            <ActivityIndicator size="small" color={Colors.accent} />
            <Text style={styles.uploadMsgText}>{uploadMsg}</Text>
          </View>
        )}

        {/* Week Strip */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.weekStrip}>
          {days.map((d, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.dayChip, i === activeDay && styles.dayChipActive]}
              onPress={() => setActiveDay(i)}
              activeOpacity={0.7}
            >
              <Text style={[styles.dayLetter, i === activeDay && styles.dayLetterActive]}>{d.letter}</Text>
              <Text style={[styles.dayNum,    i === activeDay && styles.dayNumActive]}>{d.num}</Text>
              {d.hasDot && (
                <View style={[styles.dot, i === activeDay && styles.dotActive]} />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Timetable */}
        <View style={styles.timetable}>
          {loading ? (
            <ActivityIndicator size="large" color={Colors.accent} style={{ marginTop: 40 }} />
          ) : todayEvents.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyIcon}>📭</Text>
              <Text style={styles.emptyText}>No events for this day</Text>
              <Text style={styles.emptyHint}>Upload a PDF from the Profile page</Text>
            </View>
          ) : (
            todayEvents
              .sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''))
              .map((ev, i) => {
                const color = TYPE_COLORS[ev.event_type] || Colors.muted;
                return (
                  <View key={i} style={styles.timeSlot}>
                    <Text style={styles.timeLabel}>
                      {formatTime(ev.start_time) || '--'}
                    </Text>
                    <View style={[styles.classCard, { borderLeftColor: color }]}>
                      <Text style={styles.className}>{ev.title}</Text>
                      {!!ev.venue && (
                        <Text style={styles.classMeta}>📍 {ev.venue}</Text>
                      )}
                      {!!ev.course_code && (
                        <Text style={styles.classMeta}>📚 {ev.course_code}</Text>
                      )}
                      <View style={[styles.badge, { backgroundColor: `${color}22` }]}>
                        <Text style={[styles.badgeText, { color }]}>
                          {ev.event_type || 'other'}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  title: { fontSize: 28, fontWeight: '800', color: Colors.text, padding: 22, paddingBottom: 16 },

  uploadMsgBox: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginHorizontal: 22, marginBottom: 12,
    backgroundColor: Colors.surface, borderRadius: 12,
    padding: 12, borderWidth: 1, borderColor: Colors.border,
  },
  uploadMsgText: { fontSize: 13, color: Colors.muted },

  weekStrip: { paddingHorizontal: 22, gap: 8, paddingBottom: 8 },
  dayChip: {
    alignItems: 'center', gap: 4, paddingVertical: 10, paddingHorizontal: 14,
    borderRadius: 14, borderWidth: 1, borderColor: Colors.border,
    backgroundColor: Colors.surface, minWidth: 52,
  },
  dayChipActive:   { backgroundColor: Colors.accent, borderColor: Colors.accent },
  dayLetter:       { fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, color: Colors.muted },
  dayLetterActive: { color: 'rgba(255,255,255,0.75)' },
  dayNum:          { fontSize: 18, fontWeight: '800', color: Colors.text },
  dayNumActive:    { color: 'white' },
  dot:             { width: 5, height: 5, borderRadius: 3, backgroundColor: Colors.accent3 },
  dotActive:       { backgroundColor: 'white' },

  timetable: { padding: 22, gap: 14 },
  timeSlot:  { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  timeLabel: { fontSize: 11, color: Colors.muted, width: 44, paddingTop: 14 },
  classCard: {
    flex: 1, backgroundColor: Colors.surface2,
    borderRadius: 16, padding: 14, borderLeftWidth: 3,
  },
  className: { fontSize: 14, fontWeight: '600', color: Colors.text, marginBottom: 3 },
  classMeta: { fontSize: 12, color: Colors.muted, marginTop: 2 },
  badge: {
    alignSelf: 'flex-start', marginTop: 8,
    paddingVertical: 3, paddingHorizontal: 8, borderRadius: 99,
  },
  badgeText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },

  emptyBox:  { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyText: { fontSize: 15, color: Colors.muted, fontWeight: '600' },
  emptyHint: { fontSize: 13, color: Colors.muted, marginTop: 6 },
});