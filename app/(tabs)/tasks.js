import { useState } from 'react';
import {
    ScrollView, StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';

const initialTasks = [
  { id: 1, title: 'Assignment 2 – Dynamic Programming', course: 'CSC3534', courseColor: Colors.accent, due: 'May 5', pri: 'High', done: false, type: 'Assignment' },
  { id: 2, title: 'Lab Report – ER Diagram', course: 'CSC3602', courseColor: Colors.accent2, due: 'May 6', pri: 'High', done: false, type: 'Lab' },
  { id: 3, title: 'Watch Lecture Recording Wk12', course: 'MAT3001', courseColor: Colors.warn, due: 'May 7', pri: 'Med', done: true, type: 'Study' },
  { id: 4, title: 'React Mini Project Proposal', course: 'CSC3721', courseColor: Colors.teal, due: 'May 12', pri: 'Med', done: false, type: 'Assignment' },
  { id: 5, title: 'Revise Chapter 5 – Trees', course: 'CSC3534', courseColor: Colors.accent, due: 'May 14', pri: 'Low', done: false, type: 'Study' },
  { id: 6, title: 'FYP Progress Report Draft', course: 'FYP1', courseColor: Colors.accent3, due: 'May 15', pri: 'High', done: false, type: 'FYP' },
];

const filters = ['All', 'Assignment', 'Lab', 'Study', 'FYP'];
const priColors = { High: Colors.accent3, Med: Colors.warn, Low: Colors.accent4 };

export default function TasksScreen() {
  const [filter, setFilter] = useState('All');
  const [tasks, setTasks] = useState(initialTasks);

  const shown = filter === 'All' ? tasks : tasks.filter(t => t.type === filter);
  const toggle = (id) => setTasks(ts => ts.map(t => t.id === id ? { ...t, done: !t.done } : t));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

        <Text style={styles.title}>Tasks</Text>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}>
          {filters.map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.filterChip, filter === f && styles.filterChipActive]}
              onPress={() => setFilter(f)}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Task List */}
        <View style={styles.taskList}>
          {shown.map(t => (
            <TouchableOpacity key={t.id} style={styles.taskCard} activeOpacity={0.8}>
              <TouchableOpacity
                style={[styles.check, t.done && styles.checkDone]}
                onPress={() => toggle(t.id)}
                activeOpacity={0.7}
              >
                {t.done && <Text style={styles.checkMark}>✓</Text>}
              </TouchableOpacity>
              <View style={styles.taskBody}>
                <Text style={[styles.taskTitle, t.done && styles.taskDone]}>{t.title}</Text>
                <View style={styles.taskMeta}>
                  <View style={[styles.courseTag, { backgroundColor: `${t.courseColor}22` }]}>
                    <Text style={[styles.courseTagText, { color: t.courseColor }]}>{t.course}</Text>
                  </View>
                  <Text style={styles.taskDue}>Due {t.due}</Text>
                  <Text style={[styles.taskPri, { color: priColors[t.pri] }]}>{t.pri}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.fab} activeOpacity={0.85}>
        <Text style={styles.fabText}>＋</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  title: { fontSize: 28, fontWeight: '800', color: Colors.text, padding: 22, paddingBottom: 14 },

  filterRow: { paddingHorizontal: 22, gap: 8, paddingBottom: 8 },
  filterChip: {
    paddingVertical: 6, paddingHorizontal: 16, borderRadius: 99,
    borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface,
  },
  filterChipActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  filterText: { fontSize: 12, fontWeight: '500', color: Colors.muted },
  filterTextActive: { color: 'white' },

  taskList: { padding: 22, gap: 10 },
  taskCard: {
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    borderRadius: 18, padding: 16, flexDirection: 'row', gap: 14, alignItems: 'flex-start',
  },
  check: {
    width: 22, height: 22, borderRadius: 8,
    borderWidth: 2, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  checkDone: { backgroundColor: Colors.accent4, borderColor: Colors.accent4 },
  checkMark: { color: Colors.bg, fontSize: 13, fontWeight: '800' },
  taskBody: { flex: 1 },
  taskTitle: { fontSize: 14, fontWeight: '500', color: Colors.text, marginBottom: 6 },
  taskDone: { textDecorationLine: 'line-through', color: Colors.muted },
  taskMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  courseTag: { paddingVertical: 3, paddingHorizontal: 8, borderRadius: 99 },
  courseTagText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  taskDue: { fontSize: 11, color: Colors.muted },
  taskPri: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.6, marginLeft: 'auto' },

  fab: {
    position: 'absolute', bottom: 20, right: 24,
    width: 56, height: 56, borderRadius: 18,
    backgroundColor: Colors.accent,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.accent, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4, shadowRadius: 16, elevation: 10,
  },
  fabText: { color: 'white', fontSize: 28, fontWeight: '300', marginTop: -2 },
});
