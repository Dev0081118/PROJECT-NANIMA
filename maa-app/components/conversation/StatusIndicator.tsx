import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';
import {
  CheckCircle2,
  Volume2,
  RotateCw,
  AlertCircle,
  Sparkles,
  Radio,
} from 'lucide-react-native';

type Status = 'idle' | 'connecting' | 'ready' | 'listening' | 'processing' | 'speaking' | 'error';

export function StatusIndicator({ status }: { status: Status }) {
  const color =
    status === 'listening' ? '#235D43' :
    status === 'speaking' ? Colors.primary :
    status === 'ready' ? Colors.success :
    status === 'processing' ? Colors.secondary :
    status === 'error' ? Colors.error :
    Colors.textMuted;

  const label =
    status === 'connecting' ? 'જોડાણ થઈ રહ્યું છે...' :
    status === 'ready' ? 'સાંભળવા તૈયાર છે' :
    status === 'listening' ? 'વહાલથી સાંભળે છે...' :
    status === 'processing' ? 'યાદો વિચારે છે...' :
    status === 'speaking' ? 'આશીર્વાદ અને વાતો કહી રહ્યા છે...' :
    status === 'error' ? 'ફરીથી પ્રયાસ કરો' :
    'શાંતિથી બેઠા છે';

  const StatusIcon =
    status === 'listening' ? Radio :
    status === 'speaking' ? Volume2 :
    status === 'processing' ? RotateCw :
    status === 'error' ? AlertCircle :
    status === 'ready' ? CheckCircle2 :
    Sparkles;

  return (
    <View style={styles.pill}>
      <StatusIcon size={14} color={color} strokeWidth={2.4} />
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.borderGold,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  text: {
    fontSize: 12,
    fontWeight: '800',
  },
});
