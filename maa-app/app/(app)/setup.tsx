/**
 * Screen: Family Household Hub & Character Ingestion (પરિવાર)
 * Apple-Inspired Quiet Luxury:
 * - Apple Family Sharing / Contacts aesthetic
 * - Multi-member profile switching for customized kinship
 * - Collaborative story and voice ingestion
 */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, TextInput, Alert, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { Typography, Spacing, BorderRadius } from '../../constants/Typography';
import { useAuthStore } from '../../stores/auth';
import { useMemoryStore } from '../../stores/memory';
import {
  UserPlus,
  CheckCircle2,
  FileText,
  X,
  User,
  ChevronRight,
} from 'lucide-react-native';

const KINSHIP_SUGGESTIONS = [
  { label: 'પૌત્ર', call: 'દિકરા' },
  { label: 'દીકરો', call: 'ભાઈ' },
  { label: 'પૌત્રી', call: 'દિકરી' },
  { label: 'પુત્રવધૂ', call: 'વહુ બેટા' },
  { label: 'દીકરી', call: 'બેટા' },
  { label: 'જમાઈ', call: 'જમાઈરાજ' },
  { label: 'ભાણેજ', call: 'ભાણિયા' },
];

export default function SetupScreen() {
  const {
    familyMembers, activeMember, setActiveMember,
    addFamilyMember, user,
  } = useAuthStore();

  const { createMemory } = useMemoryStore();

  // Add Member Modal State
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberKinship, setNewMemberKinship] = useState(KINSHIP_SUGGESTIONS[0].label);
  const [newMemberCall, setNewMemberCall] = useState(KINSHIP_SUGGESTIONS[0].call);

  // Fast Transcript Ingestion State
  const [transcriptText, setTranscriptText] = useState('');
  const [transcriptTopic, setTranscriptTopic] = useState('');
  const [ingestSuccess, setIngestSuccess] = useState(false);

  const handleAddMember = () => {
    if (!newMemberName.trim()) {
      Alert.alert('અધૂરી વિગત', 'કૃપા કરીને સભ્યનું નામ લખો.');
      return;
    }

    addFamilyMember({
      name: newMemberName.trim(),
      kinship: newMemberKinship,
      callName: `${newMemberCall} ${newMemberName.trim()}`,
      avatarEmoji: '👤',
      notes: 'કૌટુંબિક સભ્ય',
    });

    setNewMemberName('');
    setShowAddMemberModal(false);
    Alert.alert('સફળતા', `${newMemberName} પરિવાર મંડળમાં ઉમેરાઈ ગયા છે!`);
  };

  const handleIngestNotes = async () => {
    if (!transcriptText.trim()) {
      Alert.alert('અધૂરી વિગત', 'કૃપા કરીને જૂની વાત કે પ્રસંગની વિગત લખો.');
      return;
    }

    const title = transcriptTopic.trim() || 'કૌટુંબિક વાતચીતમાંથી નોંધેલી યાદ';
    await createMemory({
      title,
      content: transcriptText.trim(),
      category: 'PERSONAL',
      contributedBy: `${activeMember.name} (${activeMember.kinship})`,
      sourceDescription: 'પરિવાર ડાયરી નોંધ',
      impactOnPersona: 'માઁ વાતચીતમાં આ કૌટુંબિક પ્રસંગનો ઉલ્લેખ કરશે.',
      familyApproved: true,
    });

    setTranscriptText('');
    setTranscriptTopic('');
    setIngestSuccess(true);
    setTimeout(() => setIngestSuccess(false), 4000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>પરિવાર</Text>
          <Text style={styles.subtitle}>
            {user?.familyName || 'રાણા પરિવાર'} • {familyMembers.length} સભ્યો
          </Text>
        </View>

        {/* Section 1: Household Members (iOS Inset Grouped Table) */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>કુટુંબના સભ્યો</Text>
            <TouchableOpacity
              onPress={() => setShowAddMemberModal(true)}
              activeOpacity={0.7}
              style={styles.headerAction}
            >
              <UserPlus size={15} color={Colors.primary} />
              <Text style={styles.headerActionText}>સભ્ય ઉમેરો</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.groupedTable}>
            {familyMembers.map((m, index) => {
              const isActive = m.id === activeMember.id;
              const isLast = index === familyMembers.length - 1;

              return (
                <View key={m.id}>
                  <TouchableOpacity
                    style={[styles.memberRow, isActive && styles.memberRowActive]}
                    onPress={() => setActiveMember(m.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.memberAvatar}>
                      <Text style={styles.memberInitial}>
                        {m.name.charAt(0)}
                      </Text>
                    </View>

                    <View style={styles.memberInfo}>
                      <View style={styles.memberNameRow}>
                        <Text style={styles.memberName}>{m.name}</Text>
                        {isActive && (
                          <View style={styles.activePill}>
                            <Text style={styles.activePillText}>સક્રિય</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.memberSub}>
                        {m.kinship} • સંબોધન: «{m.callName}»
                      </Text>
                    </View>

                    {isActive ? (
                      <CheckCircle2 size={18} color={Colors.success} />
                    ) : (
                      <ChevronRight size={18} color={Colors.textMuted} />
                    )}
                  </TouchableOpacity>

                  {!isLast && <View style={styles.tableDivider} />}
                </View>
              );
            })}
          </View>
        </View>

        {/* Section 2: Character Ingestion (Apple Inset Card) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ચરિત્ર નિર્માણ & સ્મૃતિ નોંધ</Text>
          <Text style={styles.sectionHint}>
            દાદીમાના જૂના ઓડિયો, કૌટુંબિક પ્રસંગો કે વાર્તાઓ અહીં નોંધો:
          </Text>

          <View style={styles.groupedTable}>
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>પ્રસંગ કે શીર્ષક</Text>
              <TextInput
                style={styles.textInput}
                placeholder="ઉદા. ગોંડલ મેળાની વાર્તા"
                placeholderTextColor={Colors.textMuted}
                value={transcriptTopic}
                onChangeText={setTranscriptTopic}
              />
            </View>

            <View style={styles.tableDivider} />

            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>વાતચીત કે સંસ્મરણની વિગત</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="દાદીમા શું કહેતા હતા, તેમની સાથે શું બન્યું હતું તે અહીં લખો..."
                placeholderTextColor={Colors.textMuted}
                value={transcriptText}
                onChangeText={setTranscriptText}
                multiline
                numberOfLines={4}
              />
            </View>
          </View>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleIngestNotes}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryButtonText}>સ્મૃતિ સાચવો</Text>
          </TouchableOpacity>

          {ingestSuccess && (
            <View style={styles.successBanner}>
              <CheckCircle2 size={16} color={Colors.success} />
              <Text style={styles.successText}>
                સ્મૃતિ સફળતાપૂર્વક સાચવી લેવાઈ છે!
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add Member Modal (iOS Sheet) */}
      <Modal
        visible={showAddMemberModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddMemberModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddMemberModal(false)} activeOpacity={0.7}>
              <Text style={styles.modalCancel}>રદ કરો</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>નવું સભ્ય ઉમેરો</Text>
            <TouchableOpacity onPress={handleAddMember} activeOpacity={0.7}>
              <Text style={styles.modalSave}>ઉમેરો</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            <View style={styles.groupedTable}>
              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>સભ્યનું નામ</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="ઉદા. જયરાજ"
                  placeholderTextColor={Colors.textMuted}
                  value={newMemberName}
                  onChangeText={setNewMemberName}
                />
              </View>

              <View style={styles.tableDivider} />

              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>દાદીમા શું કહીને બોલાવે?</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="ઉદા. દિકરા"
                  placeholderTextColor={Colors.textMuted}
                  value={newMemberCall}
                  onChangeText={setNewMemberCall}
                />
              </View>
            </View>

            <Text style={[styles.sectionTitle, { marginTop: Spacing.lg }]}>
              સંબંધ પસંદ કરો:
            </Text>
            <View style={styles.kinshipPills}>
              {KINSHIP_SUGGESTIONS.map((k) => {
                const isSelected = newMemberKinship === k.label;
                return (
                  <TouchableOpacity
                    key={k.label}
                    style={[styles.kinshipPill, isSelected && styles.kinshipPillActive]}
                    onPress={() => {
                      setNewMemberKinship(k.label);
                      setNewMemberCall(k.call);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.kinshipPillText, isSelected && styles.kinshipPillTextActive]}>
                      {k.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing['3xl'],
  },
  header: {
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs + 2,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  sectionHint: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
    marginBottom: Spacing.sm,
  },
  headerAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerActionText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.primary,
  },
  groupedTable: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 4,
    gap: Spacing.md,
  },
  memberRowActive: {
    backgroundColor: '#F9F9FB',
  },
  memberAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberInitial: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.primary,
  },
  memberInfo: {
    flex: 1,
  },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  memberName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
  },
  activePill: {
    backgroundColor: '#EBF7EE',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: BorderRadius.full,
  },
  activePillText: {
    fontSize: Typography.fontSize.xs - 2,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.success,
  },
  memberSub: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  tableDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.divider,
    marginLeft: 56,
  },
  inputRow: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  inputLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginBottom: 4,
    fontWeight: Typography.fontWeight.medium,
  },
  textInput: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textPrimary,
    paddingVertical: 4,
  },
  textArea: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.md,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
    justifyContent: 'center',
  },
  successText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.success,
    fontWeight: Typography.fontWeight.medium,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.divider,
    backgroundColor: '#FFFFFF',
  },
  modalCancel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  modalTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
  },
  modalSave: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.primary,
  },
  modalBody: {
    flex: 1,
    padding: Spacing.lg,
  },
  kinshipPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  kinshipPill: {
    backgroundColor: '#FFFFFF',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  kinshipPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  kinshipPillText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
  },
  kinshipPillTextActive: {
    color: '#FFFFFF',
    fontWeight: Typography.fontWeight.semibold,
  },
});
