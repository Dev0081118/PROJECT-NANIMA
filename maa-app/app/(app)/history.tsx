/**
 * Screen: Conversation History (ઇતિહાસ - Itihaas)
 * Uses sleek Lucide icons for history timeline and actions.
 */
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { apiClient } from '../../services/api';
import {
  History,
  Clock,
  MessageCircle,
  Trash2,
  Calendar,
  Sparkles,
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
      // Default to sample sessions for preview
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <History size={22} color={Colors.primary} />
          <Text style={styles.title}>વાતચીતનો ઇતિહાસ</Text>
        </View>
        <Text style={styles.subtitle}>દાદીમા સાથેના પાછલા સત્રો અને મીઠી યાદો</Text>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>ઇતિહાસ મેળવી રહ્યા છીએ...</Text>
        </View>
      ) : sessions.length === 0 ? (
        <View style={styles.center}>
          <Clock size={40} color={Colors.textMuted} />
          <Text style={styles.emptyTitle}>કોઈ પાછલી વાતચીત નથી</Text>
          <Text style={styles.emptyText}>દાદીમા સાથે વાતચીત શરૂ કરવા માટે 'વાતચીત' ટેબ પર જાઓ!</Text>
        </View>
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={s => s.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.sessionCard}>
              <View style={styles.sessionInfo}>
                <View style={styles.dateRow}>
                  <Calendar size={13} color={Colors.textGold} style={{ marginRight: 5 }} />
                  <Text style={styles.sessionDate}>
                    {new Date(item.started_at).toLocaleDateString('gu-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </Text>
                </View>

                <View style={styles.metaRow}>
                  <MessageCircle size={12} color={Colors.textMuted} style={{ marginRight: 4 }} />
                  <Text style={styles.sessionMeta}>
                    {item.turn_count} વાતો
                  </Text>
                  <Text style={styles.metaDot}>•</Text>
                  <Clock size={12} color={Colors.textMuted} style={{ marginRight: 4 }} />
                  <Text style={styles.sessionMeta}>
                    {item.ended_at
                      ? `${Math.max(1, Math.round((new Date(item.ended_at).getTime() - new Date(item.started_at).getTime()) / 60000))} મિનિટ`
                      : 'ચાલુ સત્ર'}
                  </Text>
                </View>

                {item.summary ? (
                  <View style={styles.summaryBox}>
                    <Sparkles size={12} color={Colors.secondary} style={{ marginRight: 5, marginTop: 2 }} />
                    <Text style={styles.sessionSummary} numberOfLines={2}>
                      {item.summary}
                    </Text>
                  </View>
                ) : null}
              </View>

              <TouchableOpacity
                onPress={() => handleDelete(item.id)}
                style={styles.deleteButton}
                activeOpacity={0.7}
              >
                <Trash2 size={16} color={Colors.error} />
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
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderGold,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.primary,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: Colors.textMuted,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.primary,
    marginTop: 10,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  sessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: Colors.borderGold,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  sessionInfo: {
    flex: 1,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  sessionDate: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metaDot: {
    marginHorizontal: 6,
    color: Colors.border,
    fontSize: 12,
  },
  sessionMeta: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  summaryBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FAF5EE',
    padding: 10,
    borderRadius: 10,
  },
  sessionSummary: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    flex: 1,
  },
  deleteButton: {
    padding: 10,
    marginLeft: 8,
  },
});
