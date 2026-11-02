import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert,
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography, Spacing, BorderRadius } from '../../constants/Typography';
import { Memory } from '../../stores/memory';

const CATEGORY_LABELS: Record<string, string> = {
  BIOGRAPHICAL: '📋 Fact',
  PERSONAL: '💬 Story',
  PERSONALITY: '🌟 Trait',
  VALUES: '💡 Value',
  UNCERTAIN: '❓ Uncertain',
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
      'Delete Memory?',
      `"${memory.title}" will be permanently deleted and removed from AI context.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: onDelete },
      ]
    );
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <TouchableOpacity onPress={() => setExpanded(v => !v)} style={styles.header}>
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
        <Text style={styles.expand}>{expanded ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {/* Expanded content */}
      {expanded && (
        <>
          <Text style={styles.content}>{memory.content}</Text>

          {memory.transcriptExcerpt && (
            <View style={styles.transcriptBox}>
              <Text style={styles.transcriptLabel}>Source transcript:</Text>
              <Text style={styles.transcriptText} numberOfLines={3}>
                "{memory.transcriptExcerpt}"
              </Text>
            </View>
          )}

          {memory.sourceDescription && (
            <Text style={styles.source}>Source: {memory.sourceDescription}</Text>
          )}

          {/* Status + Actions */}
          <View style={styles.footer}>
            <View style={styles.statusRow}>
              {memory.familyApproved ? (
                <Text style={styles.approved}>✅ Approved for AI</Text>
              ) : (
                <Text style={styles.pending}>⏳ Awaiting approval</Text>
              )}
              {memory.verificationStatus === 'REJECTED' && (
                <Text style={styles.rejected}>❌ Rejected</Text>
              )}
              {memory.category === 'UNCERTAIN' && (
                <Text style={styles.uncertainLabel}>⚠️ Not shown in AI context automatically</Text>
              )}
            </View>

            <View style={styles.actions}>
              {!memory.familyApproved && memory.verificationStatus !== 'REJECTED' && (
                <TouchableOpacity style={styles.approveBtn} onPress={onApprove}>
                  <Text style={styles.approveBtnText}>Approve</Text>
                </TouchableOpacity>
              )}
              {memory.familyApproved && (
                <TouchableOpacity style={styles.rejectBtn} onPress={onReject}>
                  <Text style={styles.rejectBtnText}>Revoke</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.deleteBtn} onPress={confirmDelete}>
                <Text style={styles.deleteBtnText}>Delete</Text>
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
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: { flex: 1, gap: 4 },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: BorderRadius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
  },
  title: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.textPrimary,
    flex: 1,
  },
  expand: { color: Colors.textMuted, fontSize: 12, marginLeft: Spacing.xs },
  content: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginTop: Spacing.sm,
  },
  transcriptBox: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    marginTop: Spacing.sm,
    borderLeftWidth: 2,
    borderLeftColor: Colors.secondary,
  },
  transcriptLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
    marginBottom: 2,
  },
  transcriptText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 19,
  },
  source: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
  },
  footer: { marginTop: Spacing.md, gap: Spacing.xs },
  statusRow: { gap: 4 },
  approved: { fontSize: Typography.fontSize.xs, color: Colors.verified },
  pending: { fontSize: Typography.fontSize.xs, color: Colors.pending },
  rejected: { fontSize: Typography.fontSize.xs, color: Colors.rejected },
  uncertainLabel: { fontSize: Typography.fontSize.xs, color: Colors.uncertain },
  actions: { flexDirection: 'row', gap: Spacing.xs, marginTop: 4 },
  approveBtn: {
    backgroundColor: Colors.success + '22',
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  approveBtnText: { fontSize: Typography.fontSize.xs, color: Colors.success, fontWeight: '600' },
  rejectBtn: {
    backgroundColor: Colors.warning + '22',
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  rejectBtnText: { fontSize: Typography.fontSize.xs, color: Colors.warning, fontWeight: '600' },
  deleteBtn: {
    backgroundColor: Colors.error + '18',
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  deleteBtnText: { fontSize: Typography.fontSize.xs, color: Colors.error, fontWeight: '600' },
});
