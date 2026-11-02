import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';
import { ConversationTurn } from '../../stores/conversation';
import { Sparkles, HeartHandshake, User } from 'lucide-react-native';

interface Props {
  turn: ConversationTurn;
}

export function ConversationBubble({ turn }: Props) {
  const isUser = turn.role === 'USER';

  return (
    <View style={[styles.row, isUser ? styles.rowUser : styles.rowAssistant]}>
      {!isUser && (
        <View style={styles.maaAvatarCircle}>
          <HeartHandshake size={18} color={Colors.primary} strokeWidth={2.2} />
        </View>
      )}

      <View
        style={[
          styles.bubble,
          isUser ? styles.bubbleUser : styles.bubbleAssistant,
        ]}
      >
        {/* Header label for persona/member attribution */}
        <View style={styles.bubbleHeaderRow}>
          <Text style={[styles.senderLabel, isUser ? styles.senderLabelUser : styles.senderLabelMaa]}>
            {isUser ? (turn.memberName ? `${turn.memberName}` : 'તમે (You)') : 'માઁ (Maa)'}
          </Text>
          {!isUser && <Sparkles size={11} color={Colors.textGold} />}
        </View>

        <Text style={[styles.text, isUser ? styles.textUser : styles.textAssistant]}>
          {turn.text}
        </Text>

        {!isUser && turn.memoriesUsed && turn.memoriesUsed > 0 ? (
          <View style={styles.memoryTag}>
            <Sparkles size={11} color={Colors.textGold} style={{ marginRight: 4 }} />
            <Text style={styles.memoryTagText}>
              {turn.memoriesUsed} કૌટુંબિક સ્મૃતિઓ આધારિત ({turn.memoriesUsed} memories recalled)
            </Text>
          </View>
        ) : null}
      </View>

      {isUser && (
        <View style={styles.userAvatarCircle}>
          <User size={18} color={Colors.primary} strokeWidth={2.2} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginBottom: 14,
    gap: 8,
    alignItems: 'flex-start',
  },
  rowUser: {
    justifyContent: 'flex-end',
  },
  rowAssistant: {
    justifyContent: 'flex-start',
  },
  maaAvatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF4D6',
    borderWidth: 1.5,
    borderColor: Colors.borderGold,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  userAvatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FAF5EE',
    borderWidth: 1.5,
    borderColor: Colors.borderGold,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  bubbleUser: {
    backgroundColor: '#731828',
    borderBottomRightRadius: 4,
  },
  bubbleAssistant: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    borderWidth: 1.5,
    borderColor: Colors.borderGold,
  },
  bubbleHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 4,
  },
  senderLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  senderLabelUser: {
    color: '#F3E5AB',
  },
  senderLabelMaa: {
    color: Colors.primary,
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
  },
  textUser: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  textAssistant: {
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  memoryTag: {
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F5ECE3',
    flexDirection: 'row',
    alignItems: 'center',
  },
  memoryTagText: {
    fontSize: 11,
    color: Colors.textGold,
    fontWeight: '700',
    fontStyle: 'italic',
  },
});
