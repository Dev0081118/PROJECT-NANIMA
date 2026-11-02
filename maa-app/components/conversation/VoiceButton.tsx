/**
 * VoiceButton — Luxury Royal Microphone Action Button
 *
 * Uses Lucide icons (Mic, Volume2, RotateCw, AlertCircle) with smooth
 * pulsating concentric glow rings and responsive tactile feedback.
 */
import React, { useRef, useEffect } from 'react';
import {
  TouchableOpacity, StyleSheet, Text, Animated, View,
} from 'react-native';
import { Colors } from '../../constants/Colors';
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
  const ringScaleAnim = useRef(new Animated.Value(1)).current;
  const ringOpacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (status === 'listening') {
      Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(scaleAnim, { toValue: 1.08, duration: 600, useNativeDriver: true }),
            Animated.timing(scaleAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.timing(ringScaleAnim, { toValue: 1.45, duration: 900, useNativeDriver: true }),
            Animated.timing(ringScaleAnim, { toValue: 1, duration: 0, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.timing(ringOpacityAnim, { toValue: 0.5, duration: 200, useNativeDriver: true }),
            Animated.timing(ringOpacityAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
          ]),
        ])
      ).start();
    } else if (status === 'speaking') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, { toValue: 1.04, duration: 400, useNativeDriver: true }),
          Animated.timing(scaleAnim, { toValue: 0.98, duration: 400, useNativeDriver: true }),
        ])
      ).start();
    } else {
      scaleAnim.stopAnimation();
      ringScaleAnim.stopAnimation();
      ringOpacityAnim.stopAnimation();
      Animated.timing(scaleAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
      Animated.timing(ringOpacityAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start();
    }
  }, [status]);

  const buttonColor =
    status === 'listening' ? '#235D43' :
    status === 'speaking' ? Colors.primary :
    status === 'processing' ? Colors.secondary :
    status === 'error' ? Colors.error :
    Colors.primary;

  const hintText =
    status === 'listening' ? 'વહાલથી સાંભળી રહ્યા છીએ... ટેપ કરી અટકાવો' :
    status === 'processing' ? 'સ્મૃતિઓ યાદ કરી રહ્યા છે...' :
    status === 'speaking' ? 'માઁ બોલી રહ્યા છે • ટેપ કરી અટકાવો' :
    'માઇક પર ટેપ કરી બોલો અથવા નીચે સંદેશ લખો';

  return (
    <View style={styles.wrapper}>
      {/* Outer pulsating glow ring */}
      <Animated.View
        style={[
          styles.outerRing,
          {
            borderColor: buttonColor,
            opacity: ringOpacityAnim,
            transform: [{ scale: ringScaleAnim }],
          },
        ]}
      />

      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: buttonColor },
            disabled && { opacity: 0.6 },
          ]}
          onPress={onPress}
          disabled={disabled}
          activeOpacity={0.82}
          accessibilityLabel={status === 'listening' ? 'Stop listening' : 'Start voice conversation'}
          accessibilityRole="button"
        >
          {status === 'listening' ? (
            <Square size={28} color="#FFFFFF" fill="#FFFFFF" />
          ) : status === 'speaking' ? (
            <Volume2 size={32} color="#FFFFFF" strokeWidth={2.4} />
          ) : status === 'processing' ? (
            <RotateCw size={28} color="#FFFFFF" strokeWidth={2.4} />
          ) : status === 'error' ? (
            <AlertCircle size={30} color="#FFFFFF" strokeWidth={2.4} />
          ) : (
            <Mic size={32} color="#FFFFFF" strokeWidth={2.4} />
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
    gap: 8,
    position: 'relative',
  },
  outerRing: {
    position: 'absolute',
    top: -4,
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
  },
  button: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: '#FFF8E7',
    shadowColor: Colors.shadowHeavy,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 7,
  },
  hint: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '600',
    textAlign: 'center',
  },
});
