/**
 * Screen: Family Character Building & Memory Vault (યાદોનો ખજાનો - Yaadein)
 *
 * Collaborative family repository using sleek Lucide icons for all UI elements.
 */
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, TextInput, ActivityIndicator, Modal, ScrollView, Alert,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { useMemoryStore, Memory } from '../../stores/memory';
import { useAuthStore } from '../../stores/auth';
import {
  BookOpen,
  Plus,
  Search,
  Sparkles,
  UtensilsCrossed,
  HeartHandshake,
  Compass,
  Scroll,
  Quote,
  UserCheck,
  ShieldCheck,
  Edit3,
  Trash2,
  X,
  FileQuestion,
} from 'lucide-react-native';

const CATEGORIES = [
  { key: null, label: 'બધી યાદો (All)', icon: Sparkles },
  { key: 'PERSONALITY', label: 'રસોઈ & વાનગી (Food & Traits)', icon: UtensilsCrossed },
  { key: 'VALUES', label: 'સંસ્કાર & મૂલ્યો (Values)', icon: HeartHandshake },
  { key: 'PERSONAL', label: 'વાર્તાઓ & મેળાઓ (Stories)', icon: Compass },
  { key: 'BIOGRAPHICAL', label: 'જીવનચરિત્ર (Life Facts)', icon: Scroll },
] as const;

export default function MemoriesScreen() {
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form fields for adding/editing a memory
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formPhrase, setFormPhrase] = useState('');
  const [formTone, setFormTone] = useState('પ્રેમાળ (Loving)');
  const [formCategory, setFormCategory] = useState<Memory['category']>('PERSONALITY');

  const {
    memories, isLoading, selectedCategory,
    loadMemories, setCategory, createMemory, updateMemory, deleteMemory,
  } = useMemoryStore();

  const { activeMember } = useAuthStore();

  useEffect(() => {
    loadMemories(selectedCategory ?? undefined);
  }, [selectedCategory]);

  const openAddModal = () => {
    setEditingId(null);
    setFormTitle('');
    setFormContent('');
    setFormPhrase('');
    setFormTone('પ્રેમાળ (Loving)');
    setFormCategory('PERSONALITY');
    setModalVisible(true);
  };

  const openEditModal = (memory: Memory) => {
    setEditingId(memory.id);
    setFormTitle(memory.title);
    setFormContent(memory.content);
    setFormPhrase(memory.characteristicPhrase || '');
    setFormTone(memory.emotionalTone || 'પ્રેમાળ (Loving)');
    setFormCategory(memory.category);
    setModalVisible(true);
  };

  const handleSaveMemory = async () => {
    if (!formTitle.trim() || !formContent.trim()) {
      Alert.alert('અધૂરી વિગત', 'કૃપા કરીને શીર્ષક અને અનુભવની વિગત લખો.');
      return;
    }

    const contributor = `${activeMember.name} (${activeMember.kinship})`;
    const impact = formPhrase.trim()
      ? `માઁ વાતચીતમાં આ પ્રસંગ અને કહેવત ("${formPhrase.trim()}") નો ઉપયોગ કરશે.`
      : 'આ પ્રસંગથી માઁ ના સ્મૃતિ ભંડારમાં વધારો થયો.';

    if (editingId) {
      await updateMemory(editingId, {
        title: formTitle.trim(),
        content: formContent.trim(),
        characteristicPhrase: formPhrase.trim() || undefined,
        emotionalTone: formTone.trim() || undefined,
        category: formCategory,
        impactOnPersona: impact,
      });
    } else {
      await createMemory({
        title: formTitle.trim(),
        content: formContent.trim(),
        characteristicPhrase: formPhrase.trim() || undefined,
        emotionalTone: formTone.trim() || undefined,
        category: formCategory,
        contributedBy: contributor,
        impactOnPersona: impact,
        sourceDescription: `${activeMember.name} દ્વારા કૌટુંબિક નોંધ`,
        familyApproved: true,
      });
    }

    setModalVisible(false);
  };

  const handleDeletePrompt = (id: string, title: string) => {
    Alert.alert(
      'સ્મૃતિ કાઢી નાખો',
      `શું તમે "${title}" ને ખજાનામાંથી કાઢી નાખવા માંગો છો?`,
      [
        { text: 'રદ કરો', style: 'cancel' },
        {
          text: 'કાઢી નાખો',
          style: 'destructive',
          onPress: () => deleteMemory(id),
        },
      ]
    );
  };

  const filtered = memories.filter((m) => {
    const q = search.toLowerCase();
    return (
      !search ||
      m.title.toLowerCase().includes(q) ||
      m.content.toLowerCase().includes(q) ||
      m.contributedBy?.toLowerCase().includes(q) ||
      m.characteristicPhrase?.toLowerCase().includes(q)
    );
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.titleGroup}>
            <View style={styles.titleWithIcon}>
              <BookOpen size={22} color={Colors.primary} />
              <Text style={styles.headerTitle}>યાદોનો ખજાનો</Text>
            </View>
            <Text style={styles.headerSubtitle}>
              ચરિત્ર નિર્માણ સંગ્રહ • {memories.length} કૌટુંબિક સ્મૃતિઓ
            </Text>
          </View>

          <TouchableOpacity
            style={styles.addStoryButton}
            onPress={openAddModal}
            activeOpacity={0.8}
          >
            <Plus size={15} color="#FFFFFF" strokeWidth={2.6} style={{ marginRight: 4 }} />
            <Text style={styles.addStoryButtonText}>નવી યાદ ઉમેરો</Text>
          </TouchableOpacity>
        </View>

        {/* Search Field */}
        <View style={styles.searchRow}>
          <Search size={16} color={Colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="યાદો, વાનગી કે કહેવત શોધો..."
            placeholderTextColor={Colors.textMuted}
          />
        </View>
      </View>

      {/* Category Filter Carousel */}
      <View style={styles.categoryContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryContent}
        >
          {CATEGORIES.map((item) => {
            const isActive = selectedCategory === item.key;
            const CategoryIcon = item.icon;
            return (
              <TouchableOpacity
                key={String(item.key)}
                style={[styles.categoryChip, isActive && styles.categoryChipActive]}
                onPress={() => setCategory(item.key)}
                activeOpacity={0.8}
              >
                <CategoryIcon
                  size={13}
                  color={isActive ? '#FFFFFF' : Colors.primary}
                  style={{ marginRight: 6 }}
                />
                <Text style={[styles.categoryChipText, isActive && styles.categoryChipTextActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Main List */}
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>યાદો મેળવી રહ્યા છીએ...</Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.centerContainer}>
          <FileQuestion size={40} color={Colors.textMuted} />
          <Text style={styles.emptyTitle}>કોઈ સ્મૃતિ મળી નથી</Text>
          <Text style={styles.emptyDesc}>
            {search
              ? 'તમારા શોધ શબ્દ મુજબ કોઈ સ્મૃતિ નથી.'
              : 'કુટુંબના કોઈપણ સભ્ય ઉપર "+ નવી યાદ ઉમેરો" પર ટેપ કરી દાદીમાના અનુભવો ઉમેરી શકે છે.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.card}>
              {/* Card Header */}
              <View style={styles.cardHeader}>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>{item.category}</Text>
                </View>
                <View style={styles.cardActionRow}>
                  <TouchableOpacity
                    style={styles.cardIconBtn}
                    onPress={() => openEditModal(item)}
                  >
                    <Edit3 size={15} color={Colors.primary} style={{ marginRight: 3 }} />
                    <Text style={styles.cardIconText}>સુધારો</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cardIconBtn}
                    onPress={() => handleDeletePrompt(item.id, item.title)}
                  >
                    <Trash2 size={16} color={Colors.error} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Title & Contributor Attribution */}
              <Text style={styles.cardTitle}>{item.title}</Text>
              {item.contributedBy ? (
                <View style={styles.contributorRow}>
                  <UserCheck size={13} color={Colors.textGold} style={{ marginRight: 4 }} />
                  <Text style={styles.cardContributor}>
                    ઉમેરનાર: <Text style={styles.contributorName}>{item.contributedBy}</Text>
                  </Text>
                </View>
              ) : null}

              {/* Story Content */}
              <Text style={styles.cardContent}>{item.content}</Text>

              {/* Characteristic Phrase (દાદીમાના શબ્દો) */}
              {item.characteristicPhrase ? (
                <View style={styles.phraseBox}>
                  <View style={styles.phraseHeaderRow}>
                    <Quote size={13} color={Colors.textGold} style={{ marginRight: 4 }} />
                    <Text style={styles.phraseLabel}>દાદીમાના શબ્દો / કહેવત:</Text>
                  </View>
                  <Text style={styles.phraseText}>"{item.characteristicPhrase}"</Text>
                </View>
              ) : null}

              {/* Persona Impact Box */}
              {item.impactOnPersona ? (
                <View style={styles.impactBox}>
                  <Sparkles size={13} color={Colors.secondary} style={{ marginRight: 5 }} />
                  <Text style={styles.impactText}>{item.impactOnPersona}</Text>
                </View>
              ) : null}

              {/* Verified Pill */}
              <View style={styles.cardFooter}>
                <View style={styles.verifiedBadge}>
                  <ShieldCheck size={13} color={Colors.success} style={{ marginRight: 4 }} />
                  <Text style={styles.verifiedText}>કુટુંબ દ્વારા મંજૂર (Verified)</Text>
                </View>
                {item.emotionalTone ? (
                  <Text style={styles.toneText}>સ્વભાવ: {item.emotionalTone}</Text>
                ) : null}
              </View>
            </View>
          )}
        />
      )}

      {/* Add / Edit Memory Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalKeyboard}
          >
            <View style={styles.modalCard}>
              <View style={styles.modalHeaderRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Sparkles size={18} color={Colors.primary} />
                  <Text style={styles.modalHeaderTitle}>
                    {editingId ? 'સ્મૃતિમાં સુધારો કરો' : 'નવી યાદ ઉમેરો (ચરિત્ર નિર્માણ)'}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <X size={20} color={Colors.textMuted} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScroll}>
                <Text style={styles.modalHelperText}>
                  દાદીમાનો આ પ્રસંગ કે કહેવત વાતચીત વખતે એમની યાદશક્તિ અને સ્વભાવમાં ઉમેરાશે.
                </Text>

                <View style={styles.modalInputGroup}>
                  <Text style={styles.modalInputLabel}>પ્રસંગનું શીર્ષક (Title)</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="દા.ત. દિવાળીના ઘૂઘરા અને હસવાની રીત"
                    placeholderTextColor={Colors.textMuted}
                    value={formTitle}
                    onChangeText={setFormTitle}
                  />
                </View>

                <View style={styles.modalInputGroup}>
                  <Text style={styles.modalInputLabel}>કેટેગરી પસંદ કરો</Text>
                  <View style={styles.categoryPickerRow}>
                    {(['PERSONALITY', 'VALUES', 'PERSONAL', 'BIOGRAPHICAL'] as const).map((cat) => (
                      <TouchableOpacity
                        key={cat}
                        style={[
                          styles.categoryPickerItem,
                          formCategory === cat && styles.categoryPickerItemActive,
                        ]}
                        onPress={() => setFormCategory(cat)}
                      >
                        <Text
                          style={[
                            styles.categoryPickerText,
                            formCategory === cat && styles.categoryPickerTextActive,
                          ]}
                        >
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.modalInputGroup}>
                  <Text style={styles.modalInputLabel}>વિગતવાર વાત / અનુભવ (Story / Details)</Text>
                  <TextInput
                    style={[styles.modalInput, styles.modalTextArea]}
                    placeholder="દાદીમા તે સમયે શું કરતા, કેવો વ્યવહાર કરતા અને શીખામણ આપતા..."
                    placeholderTextColor={Colors.textMuted}
                    value={formContent}
                    onChangeText={setFormContent}
                    multiline
                    numberOfLines={4}
                  />
                </View>

                <View style={styles.modalInputGroup}>
                  <Text style={styles.modalInputLabel}>દાદીમાના પ્રિય શબ્દો / કહેવત (Signature Quote)</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="દા.ત. ભાણિયા, ખાવામાં કોઈ દી સંકોચ ન રખાય!"
                    placeholderTextColor={Colors.textMuted}
                    value={formPhrase}
                    onChangeText={setFormPhrase}
                  />
                </View>

                <View style={styles.modalInputGroup}>
                  <Text style={styles.modalInputLabel}>સ્વભાવ / લાગણી (Emotional Tone)</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="પ્રેમાળ, રમૂજી, આધ્યાત્મિક, શિસ્તબદ્ધ..."
                    placeholderTextColor={Colors.textMuted}
                    value={formTone}
                    onChangeText={setFormTone}
                  />
                </View>

                <Text style={styles.contributorNotice}>
                  આ સ્મૃતિ <Text style={styles.bold}>{activeMember.name} ({activeMember.kinship})</Text> તરીકે સાચવવામાં આવશે.
                </Text>

                <TouchableOpacity
                  style={styles.saveMemoryButton}
                  onPress={handleSaveMemory}
                  activeOpacity={0.85}
                >
                  <Text style={styles.saveMemoryButtonText}>
                    {editingId ? 'ફેરફાર સાચવો' : 'ખજાનામાં ઉમેરો (Save Memory)'}
                  </Text>
                </TouchableOpacity>

                <View style={{ height: 20 }} />
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
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
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderGold,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  titleGroup: {
    flex: 1,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.primary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  addStoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  addStoryButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5EE',
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 14,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  categoryContainer: {
    paddingVertical: 10,
    backgroundColor: Colors.background,
  },
  categoryContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: Colors.borderGold,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  categoryBadge: {
    backgroundColor: '#FAF5EE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textGold,
    textTransform: 'uppercase',
  },
  cardActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardIconBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  cardIconText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  contributorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardContributor: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  contributorName: {
    color: Colors.textGold,
    fontWeight: '700',
  },
  cardContent: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 21,
    marginBottom: 10,
  },
  phraseBox: {
    backgroundColor: '#FFF8E7',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.borderGold,
    marginBottom: 8,
  },
  phraseHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  phraseLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textGold,
  },
  phraseText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
    fontStyle: 'italic',
  },
  impactBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5ECE3',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    marginBottom: 10,
  },
  impactText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#FAF5EE',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E7F2EB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.success,
  },
  toneText: {
    fontSize: 11,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: Colors.textMuted,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
    marginTop: 8,
    marginBottom: 6,
  },
  emptyDesc: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(31, 18, 12, 0.65)',
    justifyContent: 'flex-end',
  },
  modalKeyboard: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    maxHeight: '90%',
    borderWidth: 1.5,
    borderColor: Colors.borderGold,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  modalHeaderTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
  },
  modalScroll: {
    marginBottom: 10,
  },
  modalHelperText: {
    fontSize: 13,
    color: Colors.textMuted,
    marginBottom: 16,
    lineHeight: 18,
  },
  modalInputGroup: {
    marginBottom: 14,
  },
  modalInputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  modalInput: {
    backgroundColor: '#FAF5EE',
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  modalTextArea: {
    height: 90,
    textAlignVertical: 'top',
  },
  categoryPickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryPickerItem: {
    backgroundColor: '#F5ECE3',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryPickerItemActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryPickerText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  categoryPickerTextActive: {
    color: '#FFFFFF',
  },
  contributorNotice: {
    fontSize: 12,
    color: Colors.textGold,
    marginTop: 6,
    marginBottom: 16,
    textAlign: 'center',
  },
  bold: {
    fontWeight: '800',
    color: Colors.primary,
  },
  saveMemoryButton: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  saveMemoryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
