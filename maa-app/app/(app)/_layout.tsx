import { Redirect, Tabs } from 'expo-router';
import { useAuthStore } from '../../stores/auth';
import { Colors } from '../../constants/Colors';
import { View, Text, StyleSheet, Platform } from 'react-native';
import {
  MessageCircleHeart,
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
          borderTopColor: Colors.borderGold,
          borderTopWidth: 1.5,
          height: Platform.OS === 'ios' ? 84 : 70,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          paddingTop: 8,
          shadowColor: Colors.shadowHeavy,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.08,
          shadowRadius: 10,
          elevation: 6,
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
              <MessageCircleHeart
                size={23}
                color={focused ? Colors.primary : Colors.textMuted}
                strokeWidth={focused ? 2.4 : 1.8}
              />
              <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
                વાતચીત
              </Text>
              {focused && <View style={styles.activeDot} />}
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
                size={23}
                color={focused ? Colors.primary : Colors.textMuted}
                strokeWidth={focused ? 2.4 : 1.8}
              />
              <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
                યાદો
              </Text>
              {focused && <View style={styles.activeDot} />}
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
                size={23}
                color={focused ? Colors.primary : Colors.textMuted}
                strokeWidth={focused ? 2.4 : 1.8}
              />
              <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
                ઇતિહાસ
              </Text>
              {focused && <View style={styles.activeDot} />}
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
                size={23}
                color={focused ? Colors.primary : Colors.textMuted}
                strokeWidth={focused ? 2.4 : 1.8}
              />
              <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
                પરિવાર
              </Text>
              {focused && <View style={styles.activeDot} />}
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
                size={23}
                color={focused ? Colors.primary : Colors.textMuted}
                strokeWidth={focused ? 2.4 : 1.8}
              />
              <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
                સેટિંગ્સ
              </Text>
              {focused && <View style={styles.activeDot} />}
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
    height: 48,
    position: 'relative',
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 4,
    color: Colors.textMuted,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  tabLabelActive: {
    color: Colors.primary,
    fontWeight: '800',
  },
  activeDot: {
    position: 'absolute',
    bottom: -6,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary,
  },
});
