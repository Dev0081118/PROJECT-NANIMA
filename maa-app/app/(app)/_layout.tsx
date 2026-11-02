import { Redirect, Tabs } from 'expo-router';
import { useAuthStore } from '../../stores/auth';
import { Colors } from '../../constants/Colors';
import { View, Text, StyleSheet, Platform } from 'react-native';
import {
  MessageCircle,
  BookOpen,
  History,
  Users,
  Settings,
} from 'lucide-react-native';

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
          backgroundColor: '#FFFFFF',
          borderTopColor: Colors.divider,
          borderTopWidth: StyleSheet.hairlineWidth,
          height: Platform.OS === 'ios' ? 86 : 68,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          paddingTop: 8,
          elevation: 0,
          shadowOpacity: 0,
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
            <View style={styles.tabItem}>
              <MessageCircle
                size={22}
                color={focused ? Colors.primary : Colors.textMuted}
                strokeWidth={focused ? 2.2 : 1.6}
              />
              <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
                વાતચીત
              </Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="memories"
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.tabItem}>
              <BookOpen
                size={22}
                color={focused ? Colors.primary : Colors.textMuted}
                strokeWidth={focused ? 2.2 : 1.6}
              />
              <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
                યાદો
              </Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.tabItem}>
              <History
                size={22}
                color={focused ? Colors.primary : Colors.textMuted}
                strokeWidth={focused ? 2.2 : 1.6}
              />
              <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
                ઇતિહાસ
              </Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="setup"
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.tabItem}>
              <Users
                size={22}
                color={focused ? Colors.primary : Colors.textMuted}
                strokeWidth={focused ? 2.2 : 1.6}
              />
              <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
                પરિવાર
              </Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.tabItem}>
              <Settings
                size={22}
                color={focused ? Colors.primary : Colors.textMuted}
                strokeWidth={focused ? 2.2 : 1.6}
              />
              <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
                સેટિંગ્સ
              </Text>
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 4,
    gap: 3,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '400',
    color: Colors.textMuted,
  },
  tabLabelActive: {
    fontWeight: '600',
    color: Colors.primary,
  },
});
