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
  Trash2,
  Edit3,
} from 'lucide-react-native';

const CATEGORY_NAMES: Record<string, string> = {
  BIOGRAPHICAL: 'જીવનચરિત્ર',
  PERSONAL: 'વાર્તા & પ્રસંગ',
  PERSONALITY: 'સ્વભાવ & રસોઈ',
  VALUES: 'સંસ્કાર & મૂલ્યો',
  UNCERTAIN: 'અનિશ્ચિત',
};

interface Props {
  memory: Memory;
  onApprove?: () => void;
  onReject?: () => void;
  onDelete: () => void;
  onEdit?: (memory: Memory) => void;
}

export function MemoryCard({ memory, onDelete, onEdit }: Props) {
  const [expanded, setExpanded] = useState(false);

  const confirmDelete = () => {
    Alert.alert(
      'સ્મૃતિ કાઢી નાખો?',
      `"${memory.title}" કાયમી ધોરણે દૂર થશે.`,
      [
        { text: 'રદ કરો', style: 'cancel' },
        { text: 'કાઢી નાખો', style: 'destructive', onPress: onDelete },
      ]
    );
  };

  const categoryLabel = CATEGORY_NAMES[memory.category] || memory.category;

  return (
    <View style={styles.card}>
      <TouchableOpacity
        onPress={() => setExpanded(v => !v)}
        style={styles.header}
        activeOpacity={0.7}
      >
        <View style={styles.headerContent}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{categoryLabel}</Text>
          </View>
          <Text style={styles.title} numberOfLines={expanded ? undefined : 2}>
            {memory.title}
          </Text>
        </View>

        <View style={styles.headerRight}>
          {expanded ? (
            <ChevronUp size={16} color={Colors.textMuted} />
          ) : (
            <ChevronDown size={16} color={Colors.textMuted} />
          )}
        </View>
      </TouchableOpacity>

      {/* Expanded content */}
      {expanded && (
        <View style={styles.body}>
          <Text style={styles.contentText}>{memory.content}</Text>

          {memory.characteristicPhrase ? (
            <View style={styles.phraseBox}>
              <Text style={styles.phraseLabel}>યાદગાર કહેવત / તકિયાકલામ:</Text>
              <Text style={styles.phraseText}>«{memory.characteristicPhrase}»</Text>
            </View>
          ) : null}

          {memory.sourceDescription ? (
            <Text style={styles.metaText}>સ્ત્રોત: {memory.sourceDescription}</Text>
          ) : null}

          {memory.contributedBy ? (
            <Text style={styles.metaText}>ઉમેરનાર: {memory.contributedBy}</Text>
          ) : null}

          <View style={styles.footerRow}>
            <View style={styles.statusIndicator}>
              <CheckCircle2 size={13} color={Colors.success} />
              <Text style={styles.statusText}>પરિવાર દ્વારા પ્રમાણિત</Text>
            </View>

            <View style={styles.actionButtons}>
              {onEdit && (
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => onEdit(memory)}
                  activeOpacity={0.7}
                >
                  <Edit3 size={15} color={Colors.textSecondary} />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.iconButton}
                onPress={confirmDelete}
                activeOpacity={0.7}
              >
                <Trash2 size={15} color={Colors.error} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.backgroundCard,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm + 2,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  headerContent: {
    flex: 1,
  },
  headerRight: {
    paddingTop: 2,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F2F2F7',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.xs,
  },
  badgeText: {
    fontSize: Typography.fontSize.xs - 1,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.textSecondary,
  },
  title: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
    lineHeight: Typography.fontSize.base * Typography.lineHeight.normal,
  },
  body: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.divider,
    paddingTop: Spacing.sm,
  },
  contentText: {
    fontSize: Typography.fontSize.sm,
    lineHeight: Typography.fontSize.sm * Typography.lineHeight.relaxed,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  phraseBox: {
    backgroundColor: '#F2F2F7',
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  phraseLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
    marginBottom: 2,
  },
  phraseText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.textPrimary,
    fontStyle: 'italic',
  },
  metaText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
    marginBottom: 3,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
    paddingTop: Spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.divider,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.success,
    fontWeight: Typography.fontWeight.medium,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  iconButton: {
    padding: 4,
  },
});
