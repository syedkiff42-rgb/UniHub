import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';

const { width } = Dimensions.get('window');

const courses = [
  { name: 'Data Structures & Algorithms', code: 'CSC3534', pct: 78, grade: 'A−', color: Colors.accent },
  { name: 'Database Systems', code: 'CSC3602', pct: 85, grade: 'A', color: Colors.accent2 },
  { name: 'Web Technologies', code: 'CSC3721', pct: 72, grade: 'B+', color: Colors.teal },
  { name: 'Calculus II', code: 'MAT3001', pct: 65, grade: 'B', color: Colors.warn },
];

export default function GPAScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>

        <Text style={styles.title}>GPA Tracker</Text>

        {/* Hero Card */}
        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>Current Cumulative GPA</Text>
          <Text style={styles.heroValue}>3.62</Text>
          <Text style={styles.heroSub}>↑ +0.12 from last semester</Text>
          <View style={styles.heroRow}>
            {[
              { label: 'Target GPA', val: '3.80' },
              { label: 'Needed', val: '+0.18' },
              { label: 'Credits', val: '86' },
            ].map((item, i) => (
              <View key={i} style={styles.heroMini}>
                <Text style={styles.heroMiniLabel}>{item.label}</Text>
                <Text style={styles.heroMiniVal}>{item.val}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Current Courses</Text>
          <TouchableOpacity><Text style={styles.seeAll}>+ Add marks</Text></TouchableOpacity>
        </View>

        {/* Course Cards */}
        <View style={styles.courseList}>
          {courses.map((c, i) => (
            <View key={i} style={styles.courseCard}>
              <View style={styles.courseTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.courseName}>{c.name}</Text>
                  <Text style={styles.courseCode}>{c.code}</Text>
                </View>
                <Text style={[styles.courseGrade, { color: c.color }]}>{c.grade}</Text>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${c.pct}%`, backgroundColor: c.color }]} />
              </View>
              <Text style={styles.progressPct}>{c.pct}% — {100 - c.pct}% remaining to full marks</Text>
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

  heroCard: {
    marginHorizontal: 22, marginBottom: 16,
    borderRadius: 24, padding: 24,
    backgroundColor: Colors.accent2,
    overflow: 'hidden',
  },
  heroLabel: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 6 },
  heroValue: { fontSize: 60, fontWeight: '800', color: 'white', lineHeight: 68 },
  heroSub: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 6 },
  heroRow: { flexDirection: 'row', gap: 10, marginTop: 18 },
  heroMini: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12, padding: 10,
  },
  heroMiniLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginBottom: 3 },
  heroMiniVal: { fontSize: 18, fontWeight: '800', color: 'white' },

  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 22, marginBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.text },
  seeAll: { fontSize: 12, color: Colors.accent },

  courseList: { paddingHorizontal: 22, gap: 10 },
  courseCard: {
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    borderRadius: 18, padding: 16,
  },
  courseTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  courseName: { fontSize: 14, fontWeight: '600', color: Colors.text },
  courseCode: { fontSize: 11, color: Colors.muted, marginTop: 2 },
  courseGrade: { fontSize: 26, fontWeight: '800' },
  progressTrack: {
    height: 6, backgroundColor: Colors.surface2,
    borderRadius: 99, overflow: 'hidden',
  },
  progressFill: { height: 6, borderRadius: 99 },
  progressPct: { fontSize: 11, color: Colors.muted, marginTop: 6 },
});
