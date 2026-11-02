import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography, Spacing, BorderRadius } from '../../constants/Typography';
import { ConversationTurn } from '../../stores/conversation';
import { BookOpen } from 'lucide-react-native';

interface Props {
  turn: ConversationTurn;
}

export function ConversationBubble({ turn }: Props) {
  const isUser = turn.role === 'USER';

  return (
    <View style={[styles.row, isUser ? styles.rowUser : styles.rowAssistant]}>
      <View
        style={[
          styles.bubble,
          isUser ? styles.bubbleUser : styles.bubbleAssistant,
        ]}
      >
        {/* Subtle Header */}
        <Text style={[styles.senderLabel, isUser ? styles.senderLabelUser : styles.senderLabelMaa]}>
          {isUser ? (turn.memberName || 'તમે') : 'માઁ'}
        </Text>

        <Text style={[styles.text, isUser ? styles.textUser : styles.textAssistant]}>
          {turn.text}
        </Text>

        {!isUser && turn.memoriesUsed && turn.memoriesUsed > 0 ? (
          <View style={styles.memoryFootnote}>
            <BookOpen size={11} color={Colors.textMuted} style={{ marginRight: 4 }} />
            <Text style={styles.memoryFootnoteText}>
              {turn.memoriesUsed} સ્મૃતિઓ આધારિત ({turn.memoriesUsed} memories recalled)
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginBottom: Spacing.sm + 4,
    paddingHorizontal: Spacing.md,
  },
  rowUser: {
    justifyContent: 'flex-end',
  },
  rowAssistant: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '82%',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.lg,
  },
  bubbleUser: {
    backgroundColor: Colors.userBubble,
    borderBottomRightRadius: BorderRadius.xs,
  },
  bubbleAssistant: {
    backgroundColor: Colors.assistantBubble,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    borderBottomLeftRadius: BorderRadius.xs,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  senderLabel: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    marginBottom: 3,
  },
  senderLabelUser: {
    color: '#A1A1A6',
    textAlign: 'right',
  },
  senderLabelMaa: {
    color: Colors.textSecondary,
  },
  text: {
    fontSize: Typography.fontSize.md,
    lineHeight: Typography.fontSize.md * Typography.lineHeight.relaxed,
  },
  textUser: {
    color: '#FFFFFF',
  },
  textAssistant: {
    color: Colors.textPrimary,
  },
  memoryFootnote: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs + 2,
    paddingTop: Spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.divider,
  },
  memoryFootnoteText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
  },
});
