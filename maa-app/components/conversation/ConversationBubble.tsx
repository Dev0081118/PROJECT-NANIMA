import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography, Spacing, BorderRadius } from '../../constants/Typography';
import { ConversationTurn } from '../../stores/conversation';

interface Props {
  turn: ConversationTurn;
}

export function ConversationBubble({ turn }: Props) {
  const isUser = turn.role === 'USER';

  return (
    <View style={[styles.row, isUser ? styles.rowUser : styles.rowAssistant]}>
      {!isUser && <Text style={styles.avatar}>👵</Text>}
      <View style={[
        styles.bubble,
        isUser ? styles.bubbleUser : styles.bubbleAssistant,
      ]}>
        <Text style={[styles.text, isUser && styles.textUser]}>
          {turn.text}
        </Text>
        {!isUser && turn.confidenceLevel && (
          <Text style={styles.confidence}>
            {turn.confidenceLevel === 'LOW' ? '⚠️ ' : ''}
            {turn.memoriesUsed ? `${turn.memoriesUsed} memories recalled` : ''}
          </Text>
        )}
      </View>
      {isUser && <Text style={styles.avatar}>👤</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
    gap: Spacing.xs,
    alignItems: 'flex-end',
  },
  rowUser: { justifyContent: 'flex-end' },
  rowAssistant: { justifyContent: 'flex-start' },
  avatar: { fontSize: 20, marginBottom: 4 },
  bubble: {
    maxWidth: '78%',
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm,
  },
  bubbleUser: {
    backgroundColor: Colors.userBubble,
    borderBottomRightRadius: 4,
  },
  bubbleAssistant: {
    backgroundColor: Colors.assistantBubble,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  text: {
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
    lineHeight: Typography.fontSize.base * Typography.lineHeight.relaxed,
  },
  textUser: {
    textAlign: 'right',
  },
  confidence: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
    marginTop: 4,
  },
});
