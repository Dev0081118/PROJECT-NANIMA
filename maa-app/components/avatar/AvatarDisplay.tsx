/**
 * AvatarDisplay — shows grandmother's portrait with animated states.
 *
 * M1: Static portrait placeholder with subtle idle animation.
 * M4: Will integrate talking avatar provider when consent confirmed.
 *
 * The avatar placeholder shows a warm framed circle that pulses
 * subtly when listening and glows when speaking.
 * A real photograph will replace the placeholder once uploaded.
 */
import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Animated, Image,
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { BorderRadius } from '../../constants/Typography';

type ConversationStatus = 'idle' | 'connecting' | 'ready' | 'listening' | 'processing' | 'speaking' | 'error';

interface Props {
  conversationStatus: ConversationStatus;
  portraitUri?: string;
}

export function AvatarDisplay({ conversationStatus, portraitUri }: Props) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (conversationStatus === 'listening') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.04, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    } else if (conversationStatus === 'speaking') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.02, duration: 400, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 0.98, duration: 400, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      Animated.timing(pulseAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    }
  }, [conversationStatus]);

  const borderColor =
    conversationStatus === 'listening' ? Colors.listeningIndicator :
    conversationStatus === 'speaking' ? Colors.speakingIndicator :
    conversationStatus === 'processing' ? Colors.secondary :
    Colors.border;

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.avatarFrame,
          { borderColor, transform: [{ scale: pulseAnim }] },
        ]}
      >
        {portraitUri ? (
          <Image source={{ uri: portraitUri }} style={styles.portrait} />
        ) : (
          <View style={styles.placeholderInner}>
            <Text style={styles.placeholderEmoji}>👵</Text>
            <Text style={styles.placeholderText}>Maa</Text>
          </View>
        )}
      </Animated.View>

      {/* Status caption */}
      <Text style={styles.statusCaption}>
        {conversationStatus === 'listening' ? '• સાંભળે છે... (Listening)' :
         conversationStatus === 'speaking' ? '• બોલે છે... (Speaking)' :
         conversationStatus === 'processing' ? '• વિચારે છે... (Thinking)' :
         conversationStatus === 'connecting' ? 'Connecting...' :
         conversationStatus === 'error' ? '⚠️ Connection issue' :
         'Tap microphone to start'}
      </Text>

      {/* M4 placeholder notice */}
      {!portraitUri && (
        <View style={styles.m4Notice}>
          <Text style={styles.m4NoticeText}>
            📷 Upload a photograph in Setup to display her portrait here.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  avatarFrame: {
    width: 160,
    height: 160,
    borderRadius: BorderRadius.full,
    borderWidth: 3,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.backgroundCard,
  },
  portrait: {
    width: '100%',
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  placeholderInner: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  placeholderEmoji: {
    fontSize: 64,
  },
  placeholderText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
    fontWeight: '600',
  },
  statusCaption: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 8,
    fontStyle: 'italic',
  },
  m4Notice: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 8,
    padding: 8,
    marginTop: 8,
    maxWidth: 260,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  m4NoticeText: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 16,
  },
});
