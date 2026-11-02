/**
 * VoiceButton — large accessible microphone button.
 *
 * M1: Shows state, triggers text input fallback.
 * M3: Will connect to real microphone + VAD.
 */
import React, { useRef, useEffect } from 'react';
import {
  TouchableOpacity, StyleSheet, Text, Animated, View,
} from 'react-native';
import { Colors } from '../../constants/Colors';

type Status = 'idle' | 'connecting' | 'ready' | 'listening' | 'processing' | 'speaking' | 'error';

interface Props {
  status: Status;
  onPress: () => void;
}

export function VoiceButton({ status, onPress }: Props) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (status === 'listening') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, { toValue: 1.1, duration: 600, useNativeDriver: true }),
          Animated.timing(scaleAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    } else {
      scaleAnim.stopAnimation();
      Animated.timing(scaleAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    }
  }, [status]);

  const buttonColor =
    status === 'listening' ? Colors.listeningIndicator :
    status === 'speaking' ? Colors.speakingIndicator :
    status === 'processing' ? Colors.secondary :
    status === 'error' ? Colors.error :
    Colors.primary;

  const icon =
    status === 'listening' ? '🎙' :
    status === 'speaking' ? '🔊' :
    status === 'processing' ? '⏳' :
    status === 'error' ? '⚠️' :
    '🎤';

  return (
    <View style={styles.wrapper}>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: buttonColor }]}
          onPress={onPress}
          activeOpacity={0.8}
          accessibilityLabel={status === 'listening' ? 'Stop listening' : 'Start voice conversation'}
          accessibilityRole="button"
        >
          <Text style={styles.icon}>{icon}</Text>
        </TouchableOpacity>
      </Animated.View>
      <Text style={styles.hint}>
        {status === 'listening' ? 'Listening...' :
         status === 'processing' ? 'Processing...' :
         status === 'speaking' ? 'Maa is speaking' :
         'Tap to talk · Type below'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center', gap: 8 },
  button: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  icon: { fontSize: 32 },
  hint: {
    fontSize: 11,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
});
