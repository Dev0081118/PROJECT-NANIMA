/**
 * Screen: Family Household Hub & Character Ingestion (પરિવાર - Setup)
 *
 * Manage all household members using sleek Lucide icons.
 */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, TextInput, Alert, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { useAuthStore } from '../../stores/auth';
import { useMemoryStore } from '../../stores/memory';
import {
  Users,
  UserPlus,
  CheckCircle2,
  Quote,
  FileText,
  Sparkles,
  X,
  User,
  Heart,
  Crown,
  Smile,
  ShieldCheck,
} from 'lucide-react-native';

const KINSHIP_SUGGESTIONS = [
  { label: 'પૌત્ર (Grandson)', call: 'દિકરા' },
  { label: 'દીકરો (Son)', call: 'ભાઈ' },
  { label: 'પૌત્રી (Granddaughter)', call: 'દિકરી' },
  { label: 'પુત્રવધૂ (Daughter-in-law)', call: 'વહુ બેટા' },
  { label: 'દીકરી (Daughter)', call: 'બેટા' },
  { label: 'જમાઈ (Son-in-law)', call: 'જમાઈરાજ' },
  { label: 'ભાણેજ (Nephew)', call: 'ભાણિયા' },
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
        {/* Header Banner */}
        <View style={styles.headerCard}>
          <View style={styles.headerTitleRow}>
            <Users size={24} color={Colors.primary} />
            <Text style={styles.headerTitle}>
              {user?.familyName || 'રાણા પરિવાર (Rana Household)'}
            </Text>
          </View>
          <Text style={styles.headerDesc}>
            દરેક સભ્ય પોતાની ઓળખ સાથે દાદીમા સાથે અંગત વાતચીત કરી શકે છે અને સ્મૃતિઓ ઉમેરી શકે છે.
          </Text>
        </View>

        {/* Family Members Section */}
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={styles.sectionTitle}>કુટુંબના સભ્યો ({familyMembers.length})</Text>
            <Text style={styles.sectionSubtitle}>
              વાત કરવા માટે સભ્ય પર ટેપ કરો
            </Text>
          </View>

          <TouchableOpacity
            style={styles.addMemberBtn}
            onPress={() => setShowAddMemberModal(true)}
            activeOpacity={0.8}
          >
            <UserPlus size={14} color="#FFFFFF" strokeWidth={2.4} style={{ marginRight: 4 }} />
            <Text style={styles.addMemberBtnText}>સભ્ય ઉમેરો</Text>
          </TouchableOpacity>
        </View>

        {/* Member Cards */}
        <View style={styles.membersGrid}>
          {familyMembers.map((m) => {
            const isActive = m.id === activeMember.id;
            return (
              <TouchableOpacity
                key={m.id}
                style={[styles.memberCard, isActive && styles.memberCardActive]}
                onPress={() => setActiveMember(m.id)}
                activeOpacity={0.85}
              >
                <View style={styles.memberCardTop}>
                  <View style={[styles.avatarCircle, isActive && styles.avatarCircleActive]}>
                    <User size={22} color={isActive ? Colors.primary : Colors.textMuted} />
                  </View>
                  {isActive && (
                    <View style={styles.activeSpeakerBadge}>
                      <CheckCircle2 size={13} color={Colors.success} style={{ marginRight: 4 }} />
                      <Text style={styles.activeSpeakerText}>હાલમાં સક્રિય</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.memberCardName}>{m.name}</Text>
                <Text style={styles.memberCardKinship}>{m.kinship}</Text>

                <View style={styles.memberCallBox}>
                  <Quote size={12} color={Colors.textGold} style={{ marginRight: 4 }} />
                  <Text style={styles.memberCallLabel}>માઁ નું સંબોધન:</Text>
                  <Text style={styles.memberCallValue}>"{m.callName}"</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Transcript / Story Ingestion Section */}
        <View style={styles.ingestCard}>
          <View style={styles.ingestHeaderRow}>
            <View style={styles.ingestIconCircle}>
              <FileText size={22} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.ingestTitle}>જૂની વાતો / કેસેટ નોંધ ઉમેરો</Text>
              <Text style={styles.ingestSubtitle}>
                દાદીમાના ભૂતકાળના પ્રસંગો કે વાતો અહીં લખો — AI આપમેળે વ્યક્તિત્વમાં વણી લેશે.
              </Text>
            </View>
          </View>

          <TextInput
            style={styles.ingestTopicInput}
            placeholder="પ્રસંગનું નામ (દા.ત. ગોંડલના ઘરની રીતભાત)"
            placeholderTextColor={Colors.textMuted}
            value={transcriptTopic}
            onChangeText={setTranscriptTopic}
          />

          <TextInput
            style={styles.ingestTextInput}
            placeholder="દાદીમા શું કહેતા હતા, કેવો પ્રસંગ બન્યો હતો..."
            placeholderTextColor={Colors.textMuted}
            value={transcriptText}
            onChangeText={setTranscriptText}
            multiline
            numberOfLines={4}
          />

          {ingestSuccess ? (
            <View style={styles.successPill}>
              <ShieldCheck size={14} color={Colors.success} style={{ marginRight: 4 }} />
              <Text style={styles.successPillText}>સ્મૃતિ ખજાનામાં સફળતાપૂર્વક ઉમેરાઈ ગઈ!</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={styles.ingestSaveButton}
            onPress={handleIngestNotes}
            activeOpacity={0.85}
          >
            <Sparkles size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.ingestSaveButtonText}>
              યાદ સાચવો ({activeMember.name} તરીકે)
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Add Member Modal */}
      <Modal
        visible={showAddMemberModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAddMemberModal(false)}
      >
        <SafeAreaView style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <UserPlus size={20} color={Colors.primary} />
                <Text style={styles.modalHeaderTitle}>નવો પરિવાર સભ્ય ઉમેરો</Text>
              </View>
              <TouchableOpacity onPress={() => setShowAddMemberModal(false)}>
                <X size={20} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalInputLabel}>સભ્યનું નામ (Name)</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="દા.ત. અલ્પા, જયદીપ, કાવ્યા"
                placeholderTextColor={Colors.textMuted}
                value={newMemberName}
                onChangeText={setNewMemberName}
              />

              <Text style={styles.modalInputLabel}>દાદીમા સાથે સગપણ (Kinship)</Text>
              <View style={styles.kinshipSelectionContainer}>
                {KINSHIP_SUGGESTIONS.map((k) => {
                  const isSelected = newMemberKinship === k.label;
                  return (
                    <TouchableOpacity
                      key={k.label}
                      style={[styles.kinshipChip, isSelected && styles.kinshipChipActive]}
                      onPress={() => {
                        setNewMemberKinship(k.label);
                        setNewMemberCall(k.call);
                      }}
                    >
                      <Text style={[styles.kinshipChipText, isSelected && styles.kinshipChipTextActive]}>
                        {k.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.modalInputLabel}>માઁ નું સંબોધન (Call Name Prefix)</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="દિકરા, ભાઈ, વહુ બેટા, દીકરી..."
                placeholderTextColor={Colors.textMuted}
                value={newMemberCall}
                onChangeText={setNewMemberCall}
              />

              <TouchableOpacity
                style={styles.saveMemberBtn}
                onPress={handleAddMember}
                activeOpacity={0.85}
              >
                <Text style={styles.saveMemberBtnText}>પરિવારમાં સામેલ કરો</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
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
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 30,
  },
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1.5,
    borderColor: Colors.borderGold,
    marginBottom: 20,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.primary,
  },
  headerDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 1,
  },
  addMemberBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
  },
  addMemberBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  membersGrid: {
    gap: 12,
    marginBottom: 24,
  },
  memberCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  memberCardActive: {
    borderColor: Colors.secondary,
    backgroundColor: '#FFFDF7',
    borderWidth: 2,
  },
  memberCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FAF5EE',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatarCircleActive: {
    backgroundColor: '#FFF4D6',
    borderColor: Colors.borderGold,
  },
  activeSpeakerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E7F2EB',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeSpeakerText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.success,
  },
  memberCardName: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  memberCardKinship: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginTop: 1,
  },
  memberCallBox: {
    backgroundColor: '#FAF5EE',
    padding: 8,
    borderRadius: 10,
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberCallLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '700',
    marginRight: 4,
  },
  memberCallValue: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primary,
    fontStyle: 'italic',
  },
  ingestCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1.5,
    borderColor: Colors.borderGold,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  ingestHeaderRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  ingestIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF4D6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.borderGold,
  },
  ingestTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primary,
  },
  ingestSubtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 16,
    marginTop: 2,
  },
  ingestTopicInput: {
    backgroundColor: '#FAF5EE',
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 9,
    fontSize: 14,
    color: Colors.textPrimary,
    marginBottom: 10,
  },
  ingestTextInput: {
    backgroundColor: '#FAF5EE',
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.textPrimary,
    height: 80,
    textAlignVertical: 'top',
    marginBottom: 10,
  },
  successPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E7F2EB',
    padding: 8,
    borderRadius: 10,
    marginBottom: 10,
  },
  successPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.success,
  },
  ingestSaveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 12,
  },
  ingestSaveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(31, 18, 12, 0.65)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    maxHeight: '88%',
    borderWidth: 1.5,
    borderColor: Colors.borderGold,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  modalHeaderTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
  },
  modalInputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 6,
    marginTop: 8,
  },
  modalInput: {
    backgroundColor: '#FAF5EE',
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  kinshipSelectionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 4,
  },
  kinshipChip: {
    backgroundColor: '#F5ECE3',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  kinshipChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  kinshipChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  kinshipChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  saveMemberBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 20,
  },
  saveMemberBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
