/**
 * AvatarDisplay — Grandmother's Heirloom Portrait Frame
 *
 * Warm royal antique gold framed portrait with soft breathing animation,
 * listening aura, and speaking pulse using Lucide icons and ornamental styling.
 */
import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Animated, Image,
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { useConversationStore, ConversationStatus } from '../../stores/conversation';
import { Sparkles, HeartHandshake, Flame } from 'lucide-react-native';

interface Props {
  conversationStatus?: ConversationStatus;
  portraitUri?: string;
}

export function AvatarDisplay({ conversationStatus: propStatus, portraitUri }: Props) {
  const storeStatus = useConversationStore((s) => s.status);
  const status = propStatus || storeStatus;

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    if (status === 'listening') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.05, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      ).start();
      Animated.timing(glowAnim, { toValue: 0.9, duration: 400, useNativeDriver: true }).start();
    } else if (status === 'speaking') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.03, duration: 350, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 0.98, duration: 350, useNativeDriver: true }),
        ])
      ).start();
      Animated.timing(glowAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    } else {
      pulseAnim.stopAnimation();
      Animated.timing(pulseAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
      Animated.timing(glowAnim, { toValue: 0.4, duration: 300, useNativeDriver: true }).start();
    }
  }, [status]);

  const borderColor =
    status === 'listening' ? '#235D43' :
    status === 'speaking' ? Colors.primary :
    status === 'processing' ? Colors.secondary :
    Colors.borderGold;

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.glowRing,
          { opacity: glowAnim, transform: [{ scale: pulseAnim }] },
        ]}
      />

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
            <View style={styles.flameBadge}>
              <Flame size={20} color={Colors.secondary} />
            </View>
            <View style={styles.heritageIconContainer}>
              <HeartHandshake size={38} color={Colors.primary} strokeWidth={2} />
            </View>
            <View style={styles.titleRow}>
              <Sparkles size={11} color={Colors.textGold} />
              <Text style={styles.placeholderText}>માઁ • સ્મૃતિ સ્વરૂપ</Text>
              <Sparkles size={11} color={Colors.textGold} />
            </View>
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
    width: 170,
    height: 170,
  },
  glowRing: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: '#FFE9A8',
  },
  avatarFrame: {
    width: 154,
    height: 154,
    borderRadius: 77,
    borderWidth: 3.5,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFDF9',
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  portrait: {
    width: '100%',
    height: '100%',
    borderRadius: 77,
  },
  placeholderInner: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    padding: 10,
  },
  flameBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF4D6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.borderGold,
    marginBottom: 4,
  },
  heritageIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  placeholderText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
