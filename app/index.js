import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';


const deadlines = [
  { course: 'CSC3534 · Algorithms', task: 'Assignment 2 – Dynamic Programming', date: 'May 5', days: 2, color: Colors.accent3 },
  { course: 'CSC3602 · Database', task: 'ERD Submission + Normalization', date: 'May 8', days: 5, color: Colors.warn },
  { course: 'CSC3721 · Web Dev', task: 'React Mini Project', date: 'May 12', days: 9, color: Colors.accent },
  { course: 'MAT3001 · Calculus', task: 'Problem Set 4', date: 'May 16', days: 13, color: Colors.accent4 },
];

const workload = [
  { label: 'Mon', tasks: 3, max: 5, color: Colors.warn },
  { label: 'Tue', tasks: 1, max: 5, color: Colors.accent4 },
  { label: 'Wed', tasks: 5, max: 5, color: Colors.accent3 },
  { label: 'Thu', tasks: 2, max: 5, color: Colors.accent },
  { label: 'Fri', tasks: 4, max: 5, color: Colors.warn },
];

function StatCard({ icon, value, label, color }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={[styles.statVal, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function DeadlineItem({ item }) {
  const daysColor = item.days <= 3 ? Colors.accent3 : item.days <= 7 ? Colors.warn : Colors.accent4;
  return (
    <TouchableOpacity style={styles.deadlineItem} activeOpacity={0.7}>
      <View style={[styles.deadlineDot, { backgroundColor: item.color }]} />
      <View style={styles.deadlineInfo}>
        <Text style={styles.deadlineCourse}>{item.course}</Text>
        <Text style={styles.deadlineTask}>{item.task}</Text>
      </View>
      <View style={styles.deadlineRight}>
        <Text style={[styles.deadlineDate, { color: item.color }]}>{item.date}</Text>
        <Text style={[styles.deadlineDays, { color: daysColor }]}>{item.days}d left</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function DashboardScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greetingSub}>Good morning 👋</Text>
            <Text style={styles.greetingName}>
              Zulkifli <Text style={{ color: Colors.accent }}>·</Text> Week 12
            </Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>Z</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <StatCard icon="📅" value="4" label="Deadlines" color={Colors.accent} />
          <StatCard icon="✅" value="12" label="Completed" color={Colors.accent4} />
          <StatCard icon="📊" value="3.62" label="Curr. GPA" color={Colors.accent2} />
        </View>

        {/* Alert */}
        <View style={styles.alertCard}>
          <Text style={styles.alertIcon}>⚡</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.alertTitle}>Clash Alert – Wednesday</Text>
            <Text style={styles.alertSub}>3 deadlines detected on May 7. Consider early submissions.</Text>
          </View>
        </View>

        {/* Deadlines */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Deadlines</Text>
          <TouchableOpacity><Text style={styles.seeAll}>See all</Text></TouchableOpacity>
        </View>

        {deadlines.map((d, i) => <DeadlineItem key={i} item={d} />)}

        {/* Workload */}
        <View style={styles.workloadCard}>
          <Text style={styles.workloadTitle}>⚖ Weekly Workload</Text>
          {workload.map((w, i) => (
            <View key={i} style={styles.wlRow}>
              <Text style={styles.wlLabel}>{w.label}</Text>
              <View style={styles.wlTrack}>
                <View style={[styles.wlFill, { width: `${(w.tasks / w.max) * 100}%`, backgroundColor: w.color }]} />
              </View>
              <Text style={[styles.wlCount, { color: w.color }]}>{w.tasks}</Text>
            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', padding: 22, paddingBottom: 16,
  },
  greetingSub: { fontSize: 13, color: Colors.muted, marginBottom: 4 },
  greetingName: { fontSize: 22, fontWeight: '800', color: Colors.text },
  avatar: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: Colors.accent2,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 18, fontWeight: '800', color: 'white' },

  statsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 22, marginBottom: 16 },
  statCard: {
    flex: 1, backgroundColor: Colors.surface,
    borderWidth: 1, borderColor: Colors.border,
    borderRadius: 16, padding: 14, gap: 5,
  },
  statIcon: { fontSize: 18 },
  statVal: { fontSize: 20, fontWeight: '800' },
  statLabel: { fontSize: 10, color: Colors.muted, textTransform: 'uppercase', letterSpacing: 0.8 },

  alertCard: {
    marginHorizontal: 22, marginBottom: 16,
    backgroundColor: 'rgba(232,96,76,0.1)',
    borderWidth: 1, borderColor: 'rgba(232,96,76,0.35)',
    borderRadius: 16, padding: 14,
    flexDirection: 'row', gap: 12, alignItems: 'flex-start',
  },
  alertIcon: { fontSize: 22 },
  alertTitle: { fontWeight: '700', fontSize: 14, color: '#ff7a6b', marginBottom: 3 },
  alertSub: { fontSize: 12, color: Colors.muted },

  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 22, marginBottom: 10,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.text },
  seeAll: { fontSize: 12, color: Colors.accent },

  deadlineItem: {
    flexDirection: 'row', alignItems: 'center',
    gap: 12, paddingHorizontal: 22, paddingVertical: 13,
    borderBottomWidth: 1, borderBottomColor: 'rgba(42,48,69,0.5)',
  },
  deadlineDot: { width: 10, height: 10, borderRadius: 5 },
  deadlineInfo: { flex: 1 },
  deadlineCourse: { fontSize: 11, color: Colors.muted, marginBottom: 2 },
  deadlineTask: { fontSize: 14, fontWeight: '500', color: Colors.text },
  deadlineRight: { alignItems: 'flex-end' },
  deadlineDate: { fontSize: 12, fontWeight: '700' },
  deadlineDays: { fontSize: 11, marginTop: 2 },

  workloadCard: {
    margin: 22, backgroundColor: Colors.surface,
    borderWidth: 1, borderColor: Colors.border,
    borderRadius: 20, padding: 18,
  },
  workloadTitle: { fontSize: 14, fontWeight: '700', color: Colors.text, marginBottom: 14 },
  wlRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  wlLabel: { fontSize: 11, color: Colors.muted, width: 30, textAlign: 'right' },
  wlTrack: { flex: 1, height: 6, backgroundColor: Colors.surface2, borderRadius: 99, overflow: 'hidden' },
  wlFill: { height: 6, borderRadius: 99 },
  wlCount: { fontSize: 11, fontWeight: '700', width: 16 },
});
