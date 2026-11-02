/**
 * Screen 5: Conversation History
 */
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { Typography, Spacing, BorderRadius } from '../../constants/Typography';
import { apiClient } from '../../services/api';

interface Session {
  id: string;
  started_at: string;
  ended_at?: string;
  summary?: string;
  turn_count: number;
}

export default function HistoryScreen() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadSessions = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get<{ sessions: Session[] }>('/conversation/history');
      setSessions(response.sessions);
    } catch {
      // Handle gracefully
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadSessions(); }, []);

  const handleDelete = (sessionId: string) => {
    Alert.alert(
      'Delete Conversation?',
      'This will permanently delete this conversation and all its transcripts. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.delete(`/conversation/${sessionId}`);
              setSessions(prev => prev.filter(s => s.id !== sessionId));
            } catch {
              Alert.alert('Error', 'Failed to delete. Please try again.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🕐 Itihaas (History)</Text>
        <Text style={styles.subtitle}>Your past conversations</Text>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.primary} />
        </View>
      ) : sessions.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No conversations yet.{'\n'}Start chatting with Maa!</Text>
        </View>
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={s => s.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.sessionCard}>
              <View style={styles.sessionInfo}>
                <Text style={styles.sessionDate}>
                  {new Date(item.started_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </Text>
                <Text style={styles.sessionMeta}>
                  {item.turn_count} messages ·{' '}
                  {item.ended_at
                    ? `${Math.round((new Date(item.ended_at).getTime() - new Date(item.started_at).getTime()) / 60000)} min`
                    : 'In progress'}
                </Text>
                {item.summary && (
                  <Text style={styles.sessionSummary} numberOfLines={2}>
                    {item.summary}
                  </Text>
                )}
              </View>
              <TouchableOpacity
                onPress={() => handleDelete(item.id)}
                style={styles.deleteButton}
              >
                <Text style={styles.deleteText}>🗑</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    padding: Spacing.md,
    paddingTop: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textMuted,
    marginTop: 2,
  },
  listContent: { padding: Spacing.md, gap: Spacing.sm },
  sessionCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sessionInfo: { flex: 1 },
  sessionDate: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
  },
  sessionMeta: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  sessionSummary: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    lineHeight: 20,
  },
  deleteButton: {
    padding: Spacing.sm,
  },
  deleteText: { fontSize: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: Colors.textMuted, textAlign: 'center', lineHeight: 24 },
});
