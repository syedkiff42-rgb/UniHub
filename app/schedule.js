import { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';

const schedule = [
  { time: '8:00', name: 'Data Structures & Algorithms', meta: 'DK3, Block B · Lect. Rahman', color: Colors.accent, type: 'Lecture' },
  { time: '10:00', name: 'Database Systems', meta: 'Lab 2, IT Block · Lect. Hamidah', color: Colors.accent2, type: 'Lab' },
  { time: '12:00', name: 'Lunch Break', meta: 'Cafeteria Level 2', color: Colors.accent4, type: 'Break' },
  { time: '14:00', name: 'Web Technologies', meta: 'DK1, Block A · Lect. Azrai', color: Colors.warn, type: 'Lecture' },
  { time: '16:00', name: 'FYP Consultation', meta: 'Room 4.22 · Lect. Azrai', color: Colors.accent3, type: 'FYP' },
];

export default function ScheduleScreen() {
  const today = new Date();
  const [activeDay, setActiveDay] = useState(2);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - 2 + i);
    return {
      letter: d.toLocaleDateString('en', { weekday: 'short' }).slice(0, 1),
      num: d.getDate(),
      hasDot: [0, 2, 4].includes(i),
    };
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>

        <Text style={styles.title}>Schedule</Text>

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
              <Text style={[styles.dayNum, i === activeDay && styles.dayNumActive]}>{d.num}</Text>
              {d.hasDot && (
                <View style={[styles.dot, i === activeDay && styles.dotActive]} />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Timetable */}
        <View style={styles.timetable}>
          {schedule.map((s, i) => (
            <View key={i} style={styles.timeSlot}>
              <Text style={styles.timeLabel}>{s.time}</Text>
              <View style={[styles.classCard, { borderLeftColor: s.color }]}>
                <Text style={styles.className}>{s.name}</Text>
                <Text style={styles.classMeta}>{s.meta}</Text>
                <View style={[styles.badge, { backgroundColor: `${s.color}22` }]}>
                  <Text style={[styles.badgeText, { color: s.color }]}>{s.type}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  title: { fontSize: 28, fontWeight: '800', color: Colors.text, padding: 22, paddingBottom: 16 },

  weekStrip: { paddingHorizontal: 22, gap: 8, paddingBottom: 8 },
  dayChip: {
    alignItems: 'center', gap: 4, paddingVertical: 10, paddingHorizontal: 14,
    borderRadius: 14, borderWidth: 1, borderColor: Colors.border,
    backgroundColor: Colors.surface, minWidth: 52,
  },
  dayChipActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  dayLetter: { fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, color: Colors.muted },
  dayLetterActive: { color: 'rgba(255,255,255,0.75)' },
  dayNum: { fontSize: 18, fontWeight: '800', color: Colors.text },
  dayNumActive: { color: 'white' },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: Colors.accent3 },
  dotActive: { backgroundColor: 'white' },

  timetable: { padding: 22, gap: 14 },
  timeSlot: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  timeLabel: { fontSize: 11, color: Colors.muted, width: 44, paddingTop: 14 },
  classCard: {
    flex: 1, backgroundColor: Colors.surface2,
    borderRadius: 16, padding: 14,
    borderLeftWidth: 3,
  },
  className: { fontSize: 14, fontWeight: '600', color: Colors.text, marginBottom: 3 },
  classMeta: { fontSize: 12, color: Colors.muted },
  badge: {
    alignSelf: 'flex-start', marginTop: 8,
    paddingVertical: 3, paddingHorizontal: 8, borderRadius: 99,
  },
  badgeText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
});
