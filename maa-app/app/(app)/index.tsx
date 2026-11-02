/**
 * Screen: Main Conversation (વાતચીત)
 * Apple-Inspired Quiet Luxury:
 * - Dignified portrait focal point
 * - Intimate, distraction-free conversation space
 * - Tactile one-handed voice & text interaction
 * - Refined family member switcher
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, KeyboardAvoidingView, Platform, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { Typography, Spacing, BorderRadius, Shadow } from '../../constants/Typography';
import { useConversationStore } from '../../stores/conversation';
import { useAuthStore } from '../../stores/auth';
import { AvatarDisplay } from '../../components/avatar/AvatarDisplay';
import { VoiceButton } from '../../components/conversation/VoiceButton';
import { ConversationBubble } from '../../components/conversation/ConversationBubble';
import { StatusIndicator } from '../../components/conversation/StatusIndicator';
import { audioService } from '../../services/audio';
import {
  ChevronDown,
  MessageSquare,
  Send,
  Check,
  X,
  AlertCircle,
  User,
} from 'lucide-react-native';

const QUICK_PROMPTS = [
  'કેમ છો દાદીમા? મજામાં ને?',
  'બાજરાના રોટલાની રીત કહો ને',
  'ગોંડલના મેળાની જૂની યાદ તાજી કરો',
  'જીવનમાં સુખી થવા માટે શીખામણ આપો',
  'દાદીમા, મને તમારો આશીર્વાદ આપો',
];

export default function ConversationScreen() {
  const [textInput, setTextInput] = useState('');
  const [showMemberModal, setShowMemberModal] = useState(false);
  const scrollRef = useRef<any>(null);

  const {
    sessionId, turns, status, error,
    startSession, sendTextMessage, sendVoiceAudio, interruptSpeaking,
    isTranscriptVisible, toggleTranscript, setError, setStatus,
  } = useConversationStore();

  const { activeMember, familyMembers, setActiveMember } = useAuthStore();

  useEffect(() => {
    if (!sessionId) {
      startSession().catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (turns.length > 0) {
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [turns.length]);

  const handleVoicePress = async () => {
    setError(null);

    if (status === 'speaking') {
      await interruptSpeaking();
      return;
    }

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

  const handleSendPrompt = async (promptText: string) => {
    setError(null);
    try {
      await sendTextMessage(promptText);
    } catch {}
  };

  const handleSendText = async () => {
    const text = textInput.trim();
    if (!text || status === 'processing') return;
    setTextInput('');
    setError(null);
    try {
      await sendTextMessage(text);
    } catch {}
  };

  const isProcessing = status === 'processing' || status === 'connecting';

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        {/* Top Minimal Member Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.memberPill}
            onPress={() => setShowMemberModal(true)}
            activeOpacity={0.7}
          >
            <User size={14} color={Colors.textSecondary} />
            <Text style={styles.memberNameText}>
              {activeMember.name} <Text style={styles.memberKinshipText}>({activeMember.kinship})</Text>
            </Text>
            <ChevronDown size={14} color={Colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.transcriptPill, isTranscriptVisible && styles.transcriptPillActive]}
            onPress={toggleTranscript}
            activeOpacity={0.7}
          >
            <MessageSquare
              size={14}
              color={isTranscriptVisible ? Colors.primary : Colors.textMuted}
            />
            <Text
              style={[
                styles.transcriptPillText,
                isTranscriptVisible && styles.transcriptPillTextActive,
              ]}
            >
              {isTranscriptVisible ? 'સંતાડો' : 'વાતો જુઓ'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Scrollable Conversation Workspace */}
        <ScrollView
          ref={scrollRef}
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Portrait & Spiritual Presence Frame */}
          <View style={styles.portraitSection}>
            <AvatarDisplay />
            <View style={styles.statusRow}>
              <StatusIndicator status={status} />
            </View>
            <Text style={styles.addressTagline}>
              સંબોધન: <Text style={styles.addressNameBold}>«{activeMember.callName}»</Text>
            </Text>
          </View>

          {/* Quick Prompts Carousel */}
          <View style={styles.promptsSection}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.promptsRow}
            >
              {QUICK_PROMPTS.map((prompt, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.promptChip}
                  onPress={() => handleSendPrompt(prompt)}
                  disabled={isProcessing}
                  activeOpacity={0.7}
                >
                  <Text style={styles.promptChipText}>{prompt}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Error Banner */}
          {error ? (
            <View style={styles.errorBanner}>
              <AlertCircle size={15} color={Colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Conversation Turns Transcript */}
          {isTranscriptVisible && (
            <View style={styles.transcriptSection}>
              {turns.length === 0 ? (
                <View style={styles.emptyConversationBox}>
                  <Text style={styles.emptyTitle}>વાતચીત શરૂ કરો</Text>
                  <Text style={styles.emptyDesc}>
                    માઇક બટન દબાવીને બોલો અથવા નીચે સંદેશ લખો.
                  </Text>
                </View>
              ) : (
                turns.map((turn) => (
                  <ConversationBubble key={turn.id} turn={turn} />
                ))
              )}
            </View>
          )}
        </ScrollView>

        {/* Bottom Input & Voice Interaction Bar */}
        <View style={styles.bottomBar}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.inputField}
              placeholder={`સંદેશ લખો (${activeMember.name})...`}
              placeholderTextColor={Colors.textMuted}
              value={textInput}
              onChangeText={setTextInput}
              onSubmitEditing={handleSendText}
              returnKeyType="send"
              editable={!isProcessing}
            />
            {textInput.trim().length > 0 && (
              <TouchableOpacity
                style={styles.sendButton}
                onPress={handleSendText}
                disabled={isProcessing}
                activeOpacity={0.8}
              >
                <Send size={15} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.voiceControl}>
            <VoiceButton
              status={status}
              onPress={handleVoicePress}
              disabled={isProcessing}
            />
          </View>
        </View>

        {/* Member Switcher Modal (iOS Bottom Sheet Style) */}
        <Modal
          visible={showMemberModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowMemberModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.sheetContainer}>
              <View style={styles.sheetHandle} />

              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>કોણ વાતચીત કરે છે?</Text>
                <TouchableOpacity onPress={() => setShowMemberModal(false)} activeOpacity={0.7}>
                  <X size={20} color={Colors.textMuted} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.memberList}>
                {familyMembers.map((m) => {
                  const isCurrent = m.id === activeMember.id;
                  return (
                    <TouchableOpacity
                      key={m.id}
                      style={[styles.memberRow, isCurrent && styles.memberRowActive]}
                      onPress={() => {
                        setActiveMember(m.id);
                        setShowMemberModal(false);
                      }}
                      activeOpacity={0.7}
                    >
                      <View style={styles.memberAvatar}>
                        <Text style={styles.memberInitial}>
                          {m.name.charAt(0)}
                        </Text>
                      </View>

                      <View style={styles.memberDetails}>
                        <Text style={styles.memberName}>{m.name}</Text>
                        <Text style={styles.memberSub}>
                          {m.kinship} • સંબોધન: «{m.callName}»
                        </Text>
                      </View>

                      {isCurrent && (
                        <Check size={18} color={Colors.primary} strokeWidth={2.5} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardContainer: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.divider,
  },
  memberPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full,
    gap: 6,
  },
  memberNameText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
  },
  memberKinshipText: {
    fontWeight: Typography.fontWeight.regular,
    color: Colors.textSecondary,
  },
  transcriptPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  transcriptPillActive: {
    backgroundColor: '#F2F2F7',
  },
  transcriptPillText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
    fontWeight: Typography.fontWeight.medium,
  },
  transcriptPillTextActive: {
    color: Colors.textPrimary,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: Spacing.md,
  },
  portraitSection: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  statusRow: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  addressTagline: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  addressNameBold: {
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
  },
  promptsSection: {
    marginVertical: Spacing.sm,
  },
  promptsRow: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.xs + 2,
  },
  promptChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm - 1,
    borderRadius: BorderRadius.full,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  promptChipText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textPrimary,
    fontWeight: Typography.fontWeight.medium,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF2F2',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#FFD2D2',
    borderRadius: BorderRadius.md,
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.xs,
    padding: Spacing.sm,
    gap: Spacing.xs,
  },
  errorText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.error,
    flex: 1,
  },
  transcriptSection: {
    paddingTop: Spacing.sm,
  },
  emptyConversationBox: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.xl,
  },
  emptyTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  emptyDesc: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  bottomBar: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.divider,
    backgroundColor: Colors.background,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    height: 42,
    marginBottom: Spacing.xs,
  },
  inputField: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    color: Colors.textPrimary,
    paddingVertical: 0,
  },
  sendButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.xs,
  },
  voiceControl: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing['2xl'],
    maxHeight: '65%',
  },
  sheetHandle: {
    width: 36,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#E5E5EA',
    alignSelf: 'center',
    marginBottom: Spacing.sm,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.divider,
  },
  sheetTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
  },
  memberList: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xs,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.divider,
    gap: Spacing.md,
  },
  memberRowActive: {
    backgroundColor: '#FAFAF9',
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberInitial: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
  },
  memberSub: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
