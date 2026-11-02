import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert,
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography, Spacing, BorderRadius } from '../../constants/Typography';
import { Memory } from '../../stores/memory';
import {
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  Trash2,
} from 'lucide-react-native';

const CATEGORY_LABELS: Record<string, string> = {
  BIOGRAPHICAL: 'જીવનચરિત્ર (Fact)',
  PERSONAL: 'વાર્તા (Story)',
  PERSONALITY: 'સ્વભાવ (Trait)',
  VALUES: 'મૂલ્યો (Value)',
  UNCERTAIN: 'અનિશ્ચિત (Uncertain)',
};

const CATEGORY_COLORS: Record<string, string> = {
  BIOGRAPHICAL: Colors.info,
  PERSONAL: Colors.primary,
  PERSONALITY: Colors.secondary,
  VALUES: Colors.success,
  UNCERTAIN: Colors.textMuted,
};

interface Props {
  memory: Memory;
  onApprove: () => void;
  onReject: () => void;
  onDelete: () => void;
}

export function MemoryCard({ memory, onApprove, onReject, onDelete }: Props) {
  const [expanded, setExpanded] = useState(false);

  const confirmDelete = () => {
    Alert.alert(
      'સ્મૃતિ કાઢી નાખો?',
      `"${memory.title}" ને કાયમી માટે દૂર કરવામાં આવશે.`,
      [
        { text: 'રદ કરો', style: 'cancel' },
        { text: 'કાઢી નાખો', style: 'destructive', onPress: onDelete },
      ]
    );
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <TouchableOpacity onPress={() => setExpanded(v => !v)} style={styles.header} activeOpacity={0.8}>
        <View style={styles.headerLeft}>
          <View style={[styles.badge, { backgroundColor: CATEGORY_COLORS[memory.category] + '22' }]}>
            <Text style={[styles.badgeText, { color: CATEGORY_COLORS[memory.category] }]}>
              {CATEGORY_LABELS[memory.category] || memory.category}
            </Text>
          </View>
          <Text style={styles.title} numberOfLines={expanded ? undefined : 1}>
            {memory.title}
          </Text>
        </View>
        {expanded ? (
          <ChevronUp size={18} color={Colors.textMuted} />
        ) : (
          <ChevronDown size={18} color={Colors.textMuted} />
        )}
      </TouchableOpacity>

      {/* Expanded content */}
      {expanded && (
        <>
          <Text style={styles.content}>{memory.content}</Text>

          {memory.transcriptExcerpt && (
            <View style={styles.transcriptBox}>
              <Text style={styles.transcriptLabel}>સંદર્ભ નોંધ:</Text>
              <Text style={styles.transcriptText} numberOfLines={3}>
                "{memory.transcriptExcerpt}"
              </Text>
            </View>
          )}

          {memory.sourceDescription && (
            <Text style={styles.source}>સ્ત્રોત: {memory.sourceDescription}</Text>
          )}

          {/* Status + Actions */}
          <View style={styles.footer}>
            <View style={styles.statusRow}>
              {memory.familyApproved ? (
                <View style={styles.approvedRow}>
                  <CheckCircle2 size={13} color={Colors.success} style={{ marginRight: 4 }} />
                  <Text style={styles.approved}>પરિવાર દ્વારા મંજૂર (Approved)</Text>
                </View>
              ) : (
                <View style={styles.pendingRow}>
                  <Clock size={13} color={Colors.secondary} style={{ marginRight: 4 }} />
                  <Text style={styles.pending}>ચકાસણી બાકી</Text>
                </View>
              )}
              {memory.verificationStatus === 'REJECTED' && (
                <View style={styles.rejectedRow}>
                  <XCircle size={13} color={Colors.error} style={{ marginRight: 4 }} />
                  <Text style={styles.rejected}>અસ્વીકાર</Text>
                </View>
              )}
              {memory.category === 'UNCERTAIN' && (
                <View style={styles.uncertainRow}>
                  <AlertTriangle size={13} color={Colors.uncertain} style={{ marginRight: 4 }} />
                  <Text style={styles.uncertainLabel}>ચકાસણી વગર વાપરવામાં આવશે નહીં</Text>
                </View>
              )}
            </View>

            <View style={styles.actions}>
              {!memory.familyApproved && memory.verificationStatus !== 'REJECTED' && (
                <TouchableOpacity style={styles.approveBtn} onPress={onApprove}>
                  <Text style={styles.approveBtnText}>મંજૂર કરો</Text>
                </TouchableOpacity>
              )}
              {memory.familyApproved && (
                <TouchableOpacity style={styles.rejectBtn} onPress={onReject}>
                  <Text style={styles.rejectBtnText}>રદ કરો</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.deleteBtn} onPress={confirmDelete}>
                <Trash2 size={15} color={Colors.error} />
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: Colors.borderGold,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
    flex: 1,
  },
  content: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 21,
    marginTop: 12,
    marginBottom: 8,
  },
  transcriptBox: {
    backgroundColor: '#FFF8E7',
    borderRadius: 10,
    padding: 10,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: Colors.borderGold,
  },
  transcriptLabel: {
    fontSize: 11,
    color: Colors.textGold,
    fontWeight: '700',
    marginBottom: 2,
  },
  transcriptText: {
    fontSize: 13,
    color: Colors.primary,
    fontStyle: 'italic',
  },
  source: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 4,
  },
  footer: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusRow: {
    flex: 1,
    gap: 4,
  },
  approvedRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  approved: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.success,
  },
  pendingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pending: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.secondary,
  },
  rejectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rejected: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.error,
  },
  uncertainRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  uncertainLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  approveBtn: {
    backgroundColor: Colors.success,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  approveBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  rejectBtn: {
    backgroundColor: '#FAF5EE',
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  rejectBtnText: {
    color: Colors.textMuted,
    fontSize: 12,
  },
  deleteBtn: {
    padding: 6,
  },
});
