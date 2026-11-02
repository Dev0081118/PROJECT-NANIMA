/**
 * Screen 4: Main Conversation
 *
 * The heart of the app. Shows the grandmother's portrait (or avatar when available),
 * a voice/text input, and the conversation transcript.
 *
 * Current state (M1): Text-based conversation with portrait placeholder.
 * M3: Voice input + TTS playback.
 * M4: Connected talking avatar.
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView, TextInput,
  TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography, Spacing, BorderRadius } from '../../constants/Typography';
import { useConversationStore } from '../../stores/conversation';
import { AvatarDisplay } from '../../components/avatar/AvatarDisplay';
import { VoiceButton } from '../../components/conversation/VoiceButton';
import { ConversationBubble } from '../../components/conversation/ConversationBubble';
import { StatusIndicator } from '../../components/conversation/StatusIndicator';
import { audioService } from '../../services/audio';

export default function ConversationScreen() {
  const [textInput, setTextInput] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);
  const scrollRef = useRef<any>(null);

  const {
    sessionId, turns, status, error,
    startSession, sendTextMessage, sendVoiceAudio, interruptSpeaking,
    endSession, isTranscriptVisible, toggleTranscript, setError, setStatus,
  } = useConversationStore();

  useEffect(() => {
    if (!sessionId) {
      startSession().catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (turns.length > 0) {
      scrollRef.current?.scrollToEnd({ animated: true });
    }
  }, [turns.length]);

  const handleVoicePress = async () => {
    setError(null);

    // If currently speaking, interrupt playback immediately
    if (status === 'speaking') {
      await interruptSpeaking();
      return;
    }

    // If currently listening, stop recording and send to AI voice pipeline
    if (status === 'listening') {
      try {
        const result = await audioService.stopRecording();
        if (result && result.base64) {
          await sendVoiceAudio(result.base64);
        } else {
          setStatus('ready');
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Error capturing audio.';
        setError(msg);
        setStatus('ready');
      }
      return;
    }

    // Otherwise (ready or idle), start recording
    if (status === 'ready' || status === 'idle' || status === 'error') {
      try {
        await audioService.startRecording();
        setStatus('listening');
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Microphone permission required.';
        setError(msg);
        setStatus('error');
      }
    }
  };

  const handleSendText = async () => {
    const text = textInput.trim();
    if (!text || status === 'processing') return;
    setTextInput('');
    setError(null);
    try {
      await sendTextMessage(text);
    } catch {
      // Error already set in store
    }
  };

  const isProcessing = status === 'processing' || status === 'connecting';

  return (
    <SafeAreaView style={styles.container}>
      {/* Avatar / Portrait area */}
      <View style={styles.avatarSection}>
        <AvatarDisplay conversationStatus={status} />
        <StatusIndicator status={status} />
      </View>

      {/* Transcript (collapsible) */}
      {isTranscriptVisible && (
        <ScrollView
          ref={scrollRef}
          style={styles.transcriptArea}
          contentContainerStyle={styles.transcriptContent}
        >
          {turns.length === 0 ? (
            <Text style={styles.emptyTranscript}>
              શરૂ કરવા માઈક દબાવો અથવા નીચે મેસેજ લખો — Start speaking or type a message below.
            </Text>
          ) : (
            turns.map((turn, i) => (
              <ConversationBubble key={turn.id || i} turn={turn} />
            ))
          )}
          {status === 'processing' && (
            <View style={styles.thinkingBubble}>
              <ActivityIndicator size="small" color={Colors.primary} />
              <Text style={styles.thinkingText}>...</Text>
            </View>
          )}
        </ScrollView>
      )}

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => setError(null)}>
            <Text style={styles.errorDismiss}>✕</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Controls */}
      <View style={styles.controls}>
        {/* Top row: transcript toggle + end session */}
        <View style={styles.controlsTop}>
          <TouchableOpacity onPress={toggleTranscript} style={styles.controlChip}>
            <Text style={styles.controlChipText}>
              {isTranscriptVisible ? 'Hide Transcript' : 'Show Transcript'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowTextInput(v => !v)}
            style={styles.controlChip}
          >
            <Text style={styles.controlChipText}>⌨️ Type</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={endSession} style={[styles.controlChip, styles.endChip]}>
            <Text style={styles.endChipText}>End</Text>
          </TouchableOpacity>
        </View>

        {/* Voice button: Tap to record / Tap to finish / Tap to interrupt */}
        <VoiceButton status={status} onPress={handleVoicePress} />

        {/* Text input (fallback + primary for M1) */}
        {showTextInput && (
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <View style={styles.textInputRow}>
              <TextInput
                style={styles.textInput}
                value={textInput}
                onChangeText={setTextInput}
                placeholder="Type your message in Gujarati..."
                placeholderTextColor={Colors.textMuted}
                multiline
                maxLength={500}
                editable={!isProcessing}
                returnKeyType="send"
                onSubmitEditing={handleSendText}
              />
              <TouchableOpacity
                style={[styles.sendButton, (!textInput.trim() || isProcessing) && styles.sendDisabled]}
                onPress={handleSendText}
                disabled={!textInput.trim() || isProcessing}
              >
                {isProcessing
                  ? <ActivityIndicator size="small" color={Colors.textOnPrimary} />
                  : <Text style={styles.sendButtonText}>→</Text>
                }
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  avatarSection: {
    alignItems: 'center',
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    flex: 0,
  },
  transcriptArea: {
    flex: 1,
    backgroundColor: Colors.backgroundCard,
    marginHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  transcriptContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  emptyTranscript: {
    textAlign: 'center',
    color: Colors.textMuted,
    fontSize: Typography.fontSize.sm,
    fontStyle: 'italic',
    marginTop: Spacing.lg,
  },
  thinkingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    gap: Spacing.xs,
  },
  thinkingText: {
    color: Colors.textMuted,
    fontSize: Typography.fontSize.md,
  },
  controls: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    paddingTop: Spacing.sm,
    gap: Spacing.sm,
  },
  controlsTop: {
    flexDirection: 'row',
    gap: Spacing.xs,
    justifyContent: 'center',
  },
  controlChip: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  controlChipText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
  },
  endChip: {
    borderColor: Colors.error,
  },
  endChipText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.error,
  },
  errorBanner: {
    flexDirection: 'row',
    backgroundColor: '#FEF0F0',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.xs,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  errorText: {
    color: Colors.error,
    fontSize: Typography.fontSize.sm,
    flex: 1,
  },
  errorDismiss: {
    color: Colors.error,
    fontSize: Typography.fontSize.base,
    paddingLeft: Spacing.sm,
  },
  textInputRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    backgroundColor: Colors.backgroundCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
    maxHeight: 120,
  },
  sendButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendDisabled: { opacity: 0.5 },
  sendButtonText: {
    color: Colors.textOnPrimary,
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
  },
});
