/**
 * VoiceButton — Apple-Inspired Tactile Audio Control
 *
 * Clean, minimalist circular control with subtle feedback:
 * - Idle / Ready: Deep charcoal (#1C1C1E) with white Mic
 * - Listening: Muted sage (#4A6B5D) with recording pulse
 * - Speaking: Charcoal with Volume2 / Square to pause
 * - Error: Restrained muted red
 */
import React, { useRef, useEffect } from 'react';
import {
  TouchableOpacity, StyleSheet, Text, Animated, View,
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography, Spacing } from '../../constants/Typography';
import {
  Mic,
  Volume2,
  RotateCw,
  AlertCircle,
  Square,
} from 'lucide-react-native';

type Status = 'idle' | 'connecting' | 'ready' | 'listening' | 'processing' | 'speaking' | 'error';

interface Props {
  status: Status;
  onPress: () => void;
  disabled?: boolean;
}

export function VoiceButton({ status, onPress, disabled }: Props) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const auraAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (status === 'listening') {
      Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(scaleAnim, { toValue: 1.05, duration: 600, useNativeDriver: true }),
            Animated.timing(scaleAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.timing(auraAnim, { toValue: 0.35, duration: 600, useNativeDriver: true }),
            Animated.timing(auraAnim, { toValue: 0.1, duration: 600, useNativeDriver: true }),
          ]),
        ])
      ).start();
    } else {
      scaleAnim.stopAnimation();
      auraAnim.stopAnimation();
      Animated.timing(scaleAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
      Animated.timing(auraAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start();
    }
  }, [status]);

  const buttonColor =
    status === 'listening' ? Colors.secondary :
    status === 'speaking' ? Colors.primary :
    status === 'processing' ? Colors.textSecondary :
    status === 'error' ? Colors.error :
    Colors.primary;

  const hintText =
    status === 'listening' ? 'સાંભળી રહ્યા છીએ • ટેપ કરી પૂર્ણ કરો' :
    status === 'processing' ? 'યાદ કરી રહ્યા છે...' :
    status === 'speaking' ? 'માઁ બોલી રહ્યા છે • ટેપ કરી અટકાવો' :
    'બોલવા માટે માઇક દબાવો';

  return (
    <View style={styles.wrapper}>
      {/* Subtle listening ring */}
      <Animated.View
        style={[
          styles.listeningAura,
          {
            borderColor: buttonColor,
            opacity: auraAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      />

      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: buttonColor },
            disabled && { opacity: 0.5 },
          ]}
          onPress={onPress}
          disabled={disabled || status === 'processing'}
          activeOpacity={0.8}
        >
          {status === 'listening' && <Square size={20} color="#FFFFFF" fill="#FFFFFF" />}
          {status === 'speaking' && <Square size={20} color="#FFFFFF" fill="#FFFFFF" />}
          {status === 'processing' && <RotateCw size={22} color="#FFFFFF" />}
          {status === 'error' && <AlertCircle size={22} color="#FFFFFF" />}
          {(status === 'ready' || status === 'idle' || status === 'connecting') && (
            <Mic size={24} color="#FFFFFF" strokeWidth={2} />
          )}
        </TouchableOpacity>
      </Animated.View>

      <Text style={styles.hint}>{hintText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xs,
  },
  listeningAura: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    top: 0,
  },
  button: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  hint: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
    marginTop: Spacing.sm,
    fontWeight: Typography.fontWeight.medium,
  },
});
