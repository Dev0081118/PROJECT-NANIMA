import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';

type Status = 'idle' | 'connecting' | 'ready' | 'listening' | 'processing' | 'speaking' | 'error';

export function StatusIndicator({ status }: { status: Status }) {
  const color =
    status === 'listening' ? Colors.listeningIndicator :
    status === 'speaking' ? Colors.speakingIndicator :
    status === 'ready' ? Colors.success :
    status === 'error' ? Colors.error :
    Colors.textMuted;

  const label =
    status === 'connecting' ? 'Connecting' :
    status === 'ready' ? 'Ready' :
    status === 'listening' ? 'Listening' :
    status === 'processing' ? 'Thinking' :
    status === 'speaking' ? 'Speaking' :
    status === 'error' ? 'Error' :
    'Offline';

  return (
    <View style={styles.row}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontSize: 11,
    fontWeight: '500',
  },
});
