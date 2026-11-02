import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography, Spacing, BorderRadius } from '../../constants/Typography';
import {
  CheckCircle2,
  Volume2,
  RotateCw,
  AlertCircle,
  Radio,
} from 'lucide-react-native';

type Status = 'idle' | 'connecting' | 'ready' | 'listening' | 'processing' | 'speaking' | 'error';

export function StatusIndicator({ status }: { status: Status }) {
  const color =
    status === 'listening' ? Colors.secondary :
    status === 'speaking' ? Colors.primary :
    status === 'ready' ? Colors.success :
    status === 'processing' ? Colors.textSecondary :
    status === 'error' ? Colors.error :
    Colors.textMuted;

  const label =
    status === 'connecting' ? 'જોડાણ ચાલુ છે...' :
    status === 'ready' ? 'સાંભળવા તૈયાર' :
    status === 'listening' ? 'સાંભળે છે...' :
    status === 'processing' ? 'યાદ કરી રહ્યા છે...' :
    status === 'speaking' ? 'માઁ બોલી રહ્યા છે' :
    status === 'error' ? 'ફરી પ્રયાસ કરો' :
    'તૈયાર';

  const StatusIcon =
    status === 'listening' ? Radio :
    status === 'speaking' ? Volume2 :
    status === 'processing' ? RotateCw :
    status === 'error' ? AlertCircle :
    CheckCircle2;

  return (
    <View style={styles.pill}>
      <StatusIcon size={12} color={color} strokeWidth={2.2} />
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },
  text: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
  },
});
