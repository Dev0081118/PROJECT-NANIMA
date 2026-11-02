/**
 * Screen: Conversation History (ઇતિહાસ)
 * Apple-Inspired Quiet Luxury:
 * - Apple Mail / Messages chronological list
 * - Clean timestamps, turn counts, and concise summaries
 * - Subtle swipe or tap-to-delete action
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
import {
  Trash2,
  MessageCircle,
  ChevronRight,
} from 'lucide-react-native';

interface Session {
  id: string;
  started_at: string;
  ended_at?: string;
  summary?: string;
  turn_count: number;
}

const SAMPLE_PAST_SESSIONS: Session[] = [
  {
    id: 'sample-session-1',
    started_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    ended_at: new Date(Date.now() - 86400000 * 2 + 1000 * 60 * 12).toISOString(),
    summary: 'દિવાળીના ઘૂઘરા અને ગોંડલના મેળા વિશે મીઠી વાતો થઈ. દાદીમાએ ખૂબ આશીર્વાદ આપ્યા.',
    turn_count: 8,
  },
  {
    id: 'sample-session-2',
    started_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    ended_at: new Date(Date.now() - 86400000 * 5 + 1000 * 60 * 8).toISOString(),
    summary: 'બાજરાના રોટલા અને સંસારમાં ધીરજ રાખવાની કૌટુંબિક શીખામણ.',
    turn_count: 6,
  },
];

export default function HistoryScreen() {
  const [sessions, setSessions] = useState<Session[]>(SAMPLE_PAST_SESSIONS);
  const [isLoading, setIsLoading] = useState(false);

  const loadSessions = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get<{ sessions: Session[] }>('/conversation/history');
      if (response?.sessions && response.sessions.length > 0) {
        setSessions(response.sessions);
      }
    } catch {
      // Default to sample sessions
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadSessions(); }, []);

  const handleDelete = (sessionId: string) => {
    Alert.alert(
      'વાતચીત કાઢી નાખો?',
      'આ સત્રનો ઇતિહાસ કાયમી ધોરણે દૂર થશે.',
      [
        { text: 'રદ કરો', style: 'cancel' },
        {
          text: 'કાઢી નાખો',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.delete(`/conversation/${sessionId}`);
            } catch {}
            setSessions(prev => prev.filter(s => s.id !== sessionId));
          },
        },
      ]
    );
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('gu-IN', {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>વાતચીતનો ઇતિહાસ</Text>
        <Text style={styles.subtitle}>
          દાદીમા સાથેના પાછલા સત્રો • {sessions.length} વાર્તાલાપ
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="small" color={Colors.primary} />
          <Text style={styles.loadingText}>ઇતિહાસ મેળવી રહ્યા છીએ...</Text>
        </View>
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardDatePill}>
                  <Text style={styles.cardDate}>{formatDate(item.started_at)}</Text>
                </View>
                <View style={styles.cardRightGroup}>
                  <Text style={styles.turnCount}>{item.turn_count} વાતો</Text>
                  <TouchableOpacity
                    onPress={() => handleDelete(item.id)}
                    style={styles.deleteButton}
                    activeOpacity={0.7}
                  >
                    <Trash2 size={15} color={Colors.textMuted} />
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={styles.summaryText} numberOfLines={3}>
                {item.summary || 'દાદીમા સાથે આત્મીય વાતચીત થઈ.'}
              </Text>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MessageCircle size={36} color={Colors.textMuted} strokeWidth={1.5} />
              <Text style={styles.emptyTitle}>કોઈ ઇતિહાસ નથી</Text>
              <Text style={styles.emptyText}>
                દાદીમા સાથે નવી વાતચીત શરૂ કરો.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  title: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing['3xl'],
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm + 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs + 2,
  },
  cardDatePill: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  cardDate: {
    fontSize: Typography.fontSize.xs - 1,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
  },
  cardRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  turnCount: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
  },
  deleteButton: {
    padding: 2,
  },
  summaryText: {
    fontSize: Typography.fontSize.sm,
    lineHeight: Typography.fontSize.sm * Typography.lineHeight.relaxed,
    color: Colors.textSecondary,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  loadingText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: Spacing['3xl'],
    gap: Spacing.xs,
  },
  emptyTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
    marginTop: Spacing.sm,
  },
  emptyText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
  },
});
