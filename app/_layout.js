import { useEffect } from 'react';
import { Tabs, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Text, View, ActivityIndicator } from 'react-native';
import { Colors } from '../constants/Colors';
import { AuthProvider, useAuth } from '../context/AuthContext';

function TabIcon({ emoji, focused }) {
  return (
    <Text style={{ fontSize: focused ? 22 : 20, opacity: focused ? 1 : 0.4 }}>
      {emoji}
    </Text>
  );
}

// ── Auth Guard ────────────────────────────────────────────────
function AuthGuard({ children }) {
  const { user, loading } = useAuth();
  const router   = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;

    const inAuthScreen = segments[0] === 'login';

    if (!user && !inAuthScreen) {
      // Not logged in → go to login
      router.replace('/login');
    } else if (user && inAuthScreen) {
      // Already logged in → go to home
      router.replace('/');
    }
  }, [user, loading, segments]);

  // Show spinner while checking auth
  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );
  }

  return children;
}

// ── Tab Layout ────────────────────────────────────────────────
function TabLayout() {
  const segments = useSegments();
  const isLoginScreen = segments[0] === 'login';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: isLoginScreen ? { display: 'none' } : {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: 70,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarActiveTintColor:   Colors.accent,
        tabBarInactiveTintColor: Colors.muted,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          letterSpacing: 0.5,
          textTransform: 'uppercase',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => <TabIcon emoji="⊞" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: 'Schedule',
          tabBarIcon: ({ focused }) => <TabIcon emoji="📅" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: 'Tasks',
          tabBarIcon: ({ focused }) => <TabIcon emoji="☑" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="gpa"
        options={{
          title: 'GPA',
          tabBarIcon: ({ focused }) => <TabIcon emoji="📊" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => <TabIcon emoji="◎" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="login"
        options={{ href: null }}
      />
    </Tabs>
  );
}

// ── Root Layout ───────────────────────────────────────────────
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor={Colors.bg} />
      <AuthProvider>
        <AuthGuard>
          <TabLayout />
        </AuthGuard>
      </AuthProvider>
    </SafeAreaProvider>
  );
}