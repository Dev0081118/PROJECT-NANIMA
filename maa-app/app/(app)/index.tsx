/**
 * Screen: Main Conversation (વાતચીત - Baat)
 *
 * Royal heirloom conversational experience with Kathiyawadi Maa.
 * Uses sleek Lucide icons for all UI elements.
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, KeyboardAvoidingView, Platform, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { useConversationStore } from '../../stores/conversation';
import { useAuthStore } from '../../stores/auth';
import { AvatarDisplay } from '../../components/avatar/AvatarDisplay';
import { VoiceButton } from '../../components/conversation/VoiceButton';
import { ConversationBubble } from '../../components/conversation/ConversationBubble';
import { StatusIndicator } from '../../components/conversation/StatusIndicator';
import { audioService } from '../../services/audio';
import {
  Users,
  ChevronDown,
  ScrollText,
  Send,
  Sparkles,
  UtensilsCrossed,
  HeartHandshake,
  Compass,
  Check,
  X,
  MessageSquare,
  AlertCircle,
  UserCheck,
} from 'lucide-react-native';

const QUICK_PROMPTS = [
  { icon: HeartHandshake, text: 'કેમ છો દાદીમા? મજામાં ને?' },
  { icon: UtensilsCrossed, text: 'બાજરાના રોટલાની રીત કહો ને!' },
  { icon: Compass, text: 'ગોંડલના મેળાની જૂની યાદ તાજી કરો' },
  { icon: Sparkles, text: 'જીવનમાં સુખી થવા માટે શીખામણ આપો' },
  { icon: HeartHandshake, text: 'દાદીમા, મને તમારો આશીર્વાદ આપો' },
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
        {/* Top Family Member Identity Bar */}
        <View style={styles.topMemberBar}>
          <TouchableOpacity
            style={styles.memberBadgeButton}
            onPress={() => setShowMemberModal(true)}
            activeOpacity={0.8}
          >
            <View style={styles.memberIconBadge}>
              <Users size={16} color={Colors.primary} />
            </View>
            <View style={styles.memberBadgeTextGroup}>
              <Text style={styles.memberBadgeLabel}>વાત કરનાર સભ્ય</Text>
              <Text style={styles.memberBadgeName} numberOfLines={1}>
                {activeMember.name} • <Text style={styles.memberBadgeKinship}>{activeMember.kinship}</Text>
              </Text>
            </View>
            <ChevronDown size={16} color={Colors.primary} style={{ marginLeft: 4 }} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.transcriptToggle}
            onPress={toggleTranscript}
            activeOpacity={0.7}
          >
            <ScrollText size={16} color={Colors.textSecondary} style={{ marginRight: 5 }} />
            <Text style={styles.transcriptToggleText}>
              {isTranscriptVisible ? 'સંતાડો' : 'વાતો જુઓ'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Scrollable Main Area */}
        <ScrollView
          ref={scrollRef}
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Portrait & Spiritual Presence Frame */}
          <View style={styles.portraitSection}>
            <View style={styles.portraitAuraRing}>
              <AvatarDisplay />
            </View>

            <View style={styles.statusBadgeContainer}>
              <StatusIndicator status={status} />
            </View>

            <Text style={styles.addressTagline}>
              માઁ તમને <Text style={styles.addressNameBold}>"{activeMember.callName}"</Text> કહીને વહાલથી બોલાવે છે
            </Text>
          </View>

          {/* Quick Prompts Carousel */}
          <View style={styles.promptsContainer}>
            <View style={styles.promptsHeaderRow}>
              <Sparkles size={14} color={Colors.textGold} />
              <Text style={styles.promptsHeader}>પૂછવા માટેના પ્રશ્નો (Quick Topics):</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.promptsScroll}
            >
              {QUICK_PROMPTS.map((prompt, index) => {
                const IconComponent = prompt.icon;
                return (
                  <TouchableOpacity
                    key={index}
                    style={styles.promptChip}
                    onPress={() => handleSendPrompt(prompt.text)}
                    disabled={isProcessing}
                    activeOpacity={0.75}
                  >
                    <IconComponent size={14} color={Colors.primary} style={{ marginRight: 6 }} />
                    <Text style={styles.promptChipText}>{prompt.text}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Error Message */}
          {error ? (
            <View style={styles.errorBanner}>
              <AlertCircle size={16} color={Colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Conversation Turns Transcript */}
          {isTranscriptVisible && (
            <View style={styles.transcriptSection}>
              {turns.length === 0 ? (
                <View style={styles.emptyConversationBox}>
                  <View style={styles.emptyIconCircle}>
                    <MessageSquare size={26} color={Colors.secondary} />
                  </View>
                  <Text style={styles.emptyTitle}>વાતચીત શરૂ કરો</Text>
                  <Text style={styles.emptyDesc}>
                    નીચેના માઇક બટન પર ટેપ કરીને બોલો અથવા સંદેશો લખો. દાદીમા સાંભળી રહ્યા છે.
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

        {/* Bottom Interactive Voice & Text Controls */}
        <View style={styles.bottomControlBar}>
          <View style={styles.textInputRow}>
            <TextInput
              style={styles.textInputField}
              placeholder={`દાદીમાને કંઈક પૂછો (${activeMember.name})...`}
              placeholderTextColor={Colors.textMuted}
              value={textInput}
              onChangeText={setTextInput}
              onSubmitEditing={handleSendText}
              returnKeyType="send"
              editable={!isProcessing}
            />
            {textInput.trim().length > 0 ? (
              <TouchableOpacity
                style={styles.sendTextButton}
                onPress={handleSendText}
                disabled={isProcessing}
                activeOpacity={0.8}
              >
                <Send size={15} color="#FFFFFF" />
              </TouchableOpacity>
            ) : null}
          </View>

          <View style={styles.voiceButtonRow}>
            <VoiceButton
              status={status}
              onPress={handleVoicePress}
              disabled={isProcessing}
            />
          </View>
        </View>

        {/* Member Switcher Modal */}
        <Modal
          visible={showMemberModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowMemberModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeaderRow}>
                <Text style={styles.modalTitle}>પરિવારના સભ્ય બદલો</Text>
                <TouchableOpacity onPress={() => setShowMemberModal(false)}>
                  <X size={20} color={Colors.textMuted} />
                </TouchableOpacity>
              </View>
              <Text style={styles.modalSubtitle}>
                દાદીમા સાથે કોણ વાતચીત કરી રહ્યું છે તે પસંદ કરો:
              </Text>

              <ScrollView style={styles.membersList}>
                {familyMembers.map((m) => {
                  const isCurrent = m.id === activeMember.id;
                  return (
                    <TouchableOpacity
                      key={m.id}
                      style={[styles.memberItem, isCurrent && styles.memberItemActive]}
                      onPress={() => {
                        setActiveMember(m.id);
                        setShowMemberModal(false);
                      }}
                      activeOpacity={0.8}
                    >
                      <View style={styles.memberAvatarCircle}>
                        <UserCheck size={20} color={isCurrent ? Colors.primary : Colors.textMuted} />
                      </View>
                      <View style={styles.memberItemInfo}>
                        <Text style={[styles.memberItemName, isCurrent && styles.memberItemNameActive]}>
                          {m.name}
                        </Text>
                        <Text style={styles.memberItemKinship}>{m.kinship}</Text>
                        <Text style={styles.memberItemCall}>સંબોધન: "{m.callName}"</Text>
                      </View>
                      {isCurrent ? <Check size={20} color={Colors.secondary} strokeWidth={2.6} /> : null}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowMemberModal(false)}
              >
                <Text style={styles.modalCloseText}>પૂર્ણ (Done)</Text>
              </TouchableOpacity>
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
  topMemberBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderGold,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  memberBadgeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5EE',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.borderGold,
    maxWidth: '72%',
  },
  memberIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFF4D6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  memberBadgeTextGroup: {
    flexShrink: 1,
  },
  memberBadgeLabel: {
    fontSize: 9,
    color: Colors.textGold,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  memberBadgeName: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  memberBadgeKinship: {
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  transcriptToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#FAF5EE',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  transcriptToggleText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
  },
  portraitSection: {
    alignItems: 'center',
    marginVertical: 10,
  },
  portraitAuraRing: {
    padding: 8,
    borderRadius: 90,
    backgroundColor: '#FFFFFF',
    borderWidth: 2.5,
    borderColor: Colors.borderGold,
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 5,
  },
  statusBadgeContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  addressTagline: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 6,
    textAlign: 'center',
  },
  addressNameBold: {
    fontWeight: '800',
    color: Colors.primary,
  },
  promptsContainer: {
    marginTop: 14,
    marginBottom: 8,
  },
  promptsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  promptsHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  promptsScroll: {
    gap: 8,
    paddingVertical: 2,
  },
  promptChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: Colors.borderGold,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  promptChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FDECEB',
    padding: 10,
    borderRadius: 10,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  errorText: {
    color: Colors.error,
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  transcriptSection: {
    marginTop: 10,
  },
  emptyConversationBox: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.borderGold,
    marginTop: 8,
  },
  emptyIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFF4D6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: 4,
  },
  emptyDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
  },
  bottomControlBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: Colors.borderGold,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 14 : 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  textInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5EE',
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 6 : 2,
    marginBottom: 8,
  },
  textInputField: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
    paddingVertical: 8,
  },
  sendTextButton: {
    backgroundColor: Colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  voiceButtonRow: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(31, 18, 12, 0.6)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    maxHeight: '80%',
    borderWidth: 1.5,
    borderColor: Colors.borderGold,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
  },
  modalSubtitle: {
    fontSize: 13,
    color: Colors.textMuted,
    marginBottom: 16,
  },
  membersList: {
    maxHeight: 280,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#FAF5EE',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  memberItemActive: {
    backgroundColor: '#FFF8E7',
    borderColor: Colors.secondary,
  },
  memberAvatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 12,
  },
  memberItemInfo: {
    flex: 1,
  },
  memberItemName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  memberItemNameActive: {
    color: Colors.primary,
    fontWeight: '800',
  },
  memberItemKinship: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  memberItemCall: {
    fontSize: 11,
    color: Colors.textGold,
    fontStyle: 'italic',
    marginTop: 2,
  },
  modalCloseButton: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  modalCloseText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
