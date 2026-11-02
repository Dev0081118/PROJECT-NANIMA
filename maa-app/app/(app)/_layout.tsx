import { Redirect, Tabs } from 'expo-router';
import { useAuthStore } from '../../stores/auth';
import { Colors } from '../../constants/Colors';
import { View, Text, StyleSheet } from 'react-native';

function TabIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  return (
    <View style={styles.tabIcon}>
      <Text style={styles.tabEmoji}>{emoji}</Text>
      <Text style={[styles.tabLabel, focused && styles.tabLabelFocused]}>{label}</Text>
    </View>
  );
}

export default function AppLayout() {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/welcome" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.backgroundCard,
          borderTopColor: Colors.border,
          height: 70,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🙏" label="Baat" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="memories"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="📖" label="Yaadein" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🕐" label="Itihaas" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="setup"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🖼" label="Setup" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="⚙️" label="Settings" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIcon: { alignItems: 'center', paddingTop: 6 },
  tabEmoji: { fontSize: 22 },
  tabLabel: {
    fontSize: 10,
    marginTop: 2,
    color: Colors.textMuted,
  },
  tabLabelFocused: {
    color: Colors.primary,
    fontWeight: '600',
  },
});
