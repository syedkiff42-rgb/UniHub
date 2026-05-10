import { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';

function SettingItem({ icon, label, sub, hasToggle, toggleVal, onToggle, danger }) {
  return (
    <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
      <Text style={styles.settingIcon}>{icon}</Text>
      <View style={styles.settingText}>
        <Text style={[styles.settingLabel, danger && { color: Colors.accent3 }]}>{label}</Text>
        {sub ? <Text style={styles.settingSub}>{sub}</Text> : null}
      </View>
      {hasToggle ? (
        <Switch
          value={toggleVal}
          onValueChange={onToggle}
          trackColor={{ false: Colors.border, true: Colors.accent }}
          thumbColor="white"
        />
      ) : (
        <Text style={styles.settingArrow}>›</Text>
      )}
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const [notifs, setNotifs] = useState(true);
  const [clash, setClash] = useState(true);
  const [calSync, setCalSync] = useState(false);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 22, paddingBottom: 30 }}>

        {/* Profile Hero */}
        <View style={styles.profileHero}>
          <View style={styles.heroBanner} />
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>Z</Text>
          </View>
          <Text style={styles.profileName}>Syed Muhammad Zulkifli</Text>
          <Text style={styles.profileId}>52213224368 · BSE · Year 3</Text>
          <View style={styles.profileStats}>
            {[
              { val: '3.62', label: 'GPA', color: Colors.accent },
              { val: '12', label: 'Tasks Done', color: Colors.accent4 },
              { val: '4', label: 'Due Soon', color: Colors.warn },
            ].map((s, i) => (
              <View key={i} style={[styles.pstat, i < 2 && styles.pstatBorder]}>
                <Text style={[styles.pstatVal, { color: s.color }]}>{s.val}</Text>
                <Text style={styles.pstatLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Integrations */}
        <Text style={styles.groupTitle}>Integrations</Text>
        <View style={styles.settingsGroup}>
          <SettingItem icon="📚" label="Moodle LMS" sub="Connected · Last sync 10 min ago" />
          <SettingItem icon="📄" label="PDF Schedule" sub="Upload academic calendar PDF" />
          <SettingItem icon="🗓" label="Google Calendar" sub={calSync ? 'Synced' : 'Not connected'}
            hasToggle toggleVal={calSync} onToggle={() => setCalSync(v => !v)} />
        </View>

        {/* Notifications */}
        <Text style={styles.groupTitle}>Notifications</Text>
        <View style={styles.settingsGroup}>
          <SettingItem icon="🔔" label="Deadline Reminders" sub="Push alerts for upcoming tasks"
            hasToggle toggleVal={notifs} onToggle={() => setNotifs(v => !v)} />
          <SettingItem icon="⚡" label="Clash Alerts" sub="Warn when multiple deadlines clash"
            hasToggle toggleVal={clash} onToggle={() => setClash(v => !v)} />
          <SettingItem icon="⏰" label="Reminder Time" sub="24 hrs before deadline" />
        </View>

        {/* Account */}
        <Text style={styles.groupTitle}>Account</Text>
        <View style={styles.settingsGroup}>
          <SettingItem icon="🎯" label="GPA Target" sub="Currently 3.80" />
          <SettingItem icon="🔒" label="Change Password" sub="Last changed 30 days ago" />
          <SettingItem icon="🚪" label="Log Out" sub="Sign out of UniHub" danger />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },

  profileHero: {
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    borderRadius: 24, marginBottom: 24, alignItems: 'center',
    overflow: 'hidden', paddingBottom: 20,
  },
  heroBanner: {
    height: 70, width: '100%',
    backgroundColor: Colors.accent2, opacity: 0.3,
  },
  profileAvatar: {
    width: 72, height: 72, borderRadius: 22,
    backgroundColor: Colors.accent2,
    alignItems: 'center', justifyContent: 'center',
    marginTop: -36,
    shadowColor: Colors.accent, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3, shadowRadius: 16, elevation: 8,
  },
  profileAvatarText: { fontSize: 28, fontWeight: '800', color: 'white' },
  profileName: { fontSize: 18, fontWeight: '800', color: Colors.text, marginTop: 12 },
  profileId: { fontSize: 12, color: Colors.muted, marginTop: 4 },
  profileStats: { flexDirection: 'row', marginTop: 16, width: '100%' },
  pstat: { flex: 1, alignItems: 'center', paddingVertical: 10 },
  pstatBorder: { borderRightWidth: 1, borderRightColor: Colors.border },
  pstatVal: { fontSize: 20, fontWeight: '800' },
  pstatLabel: { fontSize: 10, color: Colors.muted, textTransform: 'uppercase', letterSpacing: 0.6, marginTop: 2 },

  groupTitle: {
    fontSize: 11, textTransform: 'uppercase', letterSpacing: 1,
    color: Colors.muted, fontWeight: '700', marginBottom: 10,
  },
  settingsGroup: { marginBottom: 24, gap: 8 },
  settingItem: {
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    borderRadius: 14, padding: 14, flexDirection: 'row',
    alignItems: 'center', gap: 14,
  },
  settingIcon: { fontSize: 20, width: 30, textAlign: 'center' },
  settingText: { flex: 1 },
  settingLabel: { fontSize: 14, fontWeight: '500', color: Colors.text },
  settingSub: { fontSize: 12, color: Colors.muted, marginTop: 2 },
  settingArrow: { fontSize: 20, color: Colors.muted },
});
