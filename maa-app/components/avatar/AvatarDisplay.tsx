/**
 * AvatarDisplay — Grandmother's Portrait Presentation
 *
 * Apple Quiet Luxury:
 * - Natural, dignified portrait framing with subtle hairline border.
 * - Restrained listening/speaking indicator ring.
 * - No ornamental flames, sparkles, or fake visualizers.
 */
import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Animated, Image,
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { useConversationStore, ConversationStatus } from '../../stores/conversation';
import { Typography } from '../../constants/Typography';

interface Props {
  conversationStatus?: ConversationStatus;
  portraitUri?: string;
}

export function AvatarDisplay({ conversationStatus: propStatus, portraitUri }: Props) {
  const storeStatus = useConversationStore((s) => s.status);
  const status = propStatus || storeStatus;

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const ringAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (status === 'listening') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.02, duration: 900, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
        ])
      ).start();
      Animated.timing(ringAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    } else if (status === 'speaking') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.015, duration: 450, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 0.99, duration: 450, useNativeDriver: true }),
        ])
      ).start();
      Animated.timing(ringAnim, { toValue: 0.8, duration: 300, useNativeDriver: true }).start();
    } else {
      pulseAnim.stopAnimation();
      ringAnim.stopAnimation();
      Animated.timing(pulseAnim, { toValue: 1, duration: 250, useNativeDriver: true }).start();
      Animated.timing(ringAnim, { toValue: 0, duration: 250, useNativeDriver: true }).start();
    }
  }, [status]);

  const activeColor =
    status === 'listening' ? Colors.secondary :
    status === 'speaking' ? Colors.primary :
    Colors.border;

  return (
    <View style={styles.container}>
      {/* Subtle outer breathing aura when active */}
      <Animated.View
        style={[
          styles.ambientRing,
          {
            borderColor: activeColor,
            opacity: ringAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.45],
            }),
            transform: [{ scale: pulseAnim }],
          },
        ]}
      />

      <Animated.View
        style={[
          styles.portraitFrame,
          {
            transform: [{ scale: pulseAnim }],
            borderColor: status === 'idle' ? Colors.border : activeColor,
          },
        ]}
      >
        {portraitUri ? (
          <Image source={{ uri: portraitUri }} style={styles.portrait} resizeMode="cover" />
        ) : (
          <View style={styles.placeholderContainer}>
            <Text style={styles.monogram}>માઁ</Text>
            <Text style={styles.placeholderSub}>સ્મૃતિ સ્વરૂપ</Text>
          </View>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: 140,
    height: 140,
  },
  ambientRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1.5,
  },
  portraitFrame: {
    width: 124,
    height: 124,
    borderRadius: 62,
    borderWidth: 1,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  portrait: {
    width: '100%',
    height: '100%',
  },
  placeholderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  monogram: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
  },
  placeholderSub: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
});
