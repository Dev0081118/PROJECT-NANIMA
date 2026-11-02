/**
 * Screen: Family Memory Vault & Character Building (યાદોનો ખજાનો)
 * Apple-Inspired Quiet Luxury:
 * - Editorial journal aesthetic
 * - Intuitive family memory contribution (Add/Edit/Delete)
 * - Restrained typography and clean segmented filters
 */
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, TextInput, ActivityIndicator, Modal, ScrollView, Alert,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { Typography, Spacing, BorderRadius, Shadow } from '../../constants/Typography';
import { useMemoryStore, Memory } from '../../stores/memory';
import { useAuthStore } from '../../stores/auth';
import { MemoryCard } from '../../components/memory/MemoryCard';
import {
  Plus,
  Search,
  X,
  BookOpen,
} from 'lucide-react-native';

const CATEGORIES = [
  { key: null, label: 'બધી યાદો' },
  { key: 'PERSONALITY', label: 'રસોઈ & સ્વભાવ' },
  { key: 'VALUES', label: 'સંસ્કાર & મૂલ્યો' },
  { key: 'PERSONAL', label: 'વાર્તાઓ & પ્રસંગ' },
  { key: 'BIOGRAPHICAL', label: 'જીવનચરિત્ર' },
] as const;

export default function MemoriesScreen() {
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form fields for adding/editing a memory
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formPhrase, setFormPhrase] = useState('');
  const [formTone, setFormTone] = useState('પ્રેમાળ');
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
    setFormTone('પ્રેમાળ');
    setFormCategory('PERSONALITY');
    setModalVisible(true);
  };

  const openEditModal = (memory: Memory) => {
    setEditingId(memory.id);
    setFormTitle(memory.title);
    setFormContent(memory.content);
    setFormPhrase(memory.characteristicPhrase || '');
    setFormTone(memory.emotionalTone || 'પ્રેમાળ');
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
        sourceDescription: 'પરિવાર સંસ્મરણ',
        impactOnPersona: impact,
        familyApproved: true,
      });
    }

    setModalVisible(false);
  };

  const filteredMemories = memories.filter(m => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      m.title.toLowerCase().includes(q) ||
      m.content.toLowerCase().includes(q) ||
      (m.characteristicPhrase && m.characteristicPhrase.toLowerCase().includes(q))
    );
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header & Action */}
      <View style={styles.header}>
        <View style={styles.headerTitleCol}>
          <Text style={styles.title}>યાદોનો ખજાનો</Text>
          <Text style={styles.subtitle}>
            પરિવારના સંસ્મરણો • {memories.length} સ્મૃતિઓ
          </Text>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={openAddModal}
          activeOpacity={0.8}
        >
          <Plus size={18} color="#FFFFFF" />
          <Text style={styles.addButtonText}>યાદ ઉમેરો</Text>
        </TouchableOpacity>
      </View>

      {/* iOS Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Search size={16} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="યાદો અથવા વાનગીઓ શોધો..."
            placeholderTextColor={Colors.textMuted}
            value={search}
            onChangeText={setSearch}
            clearButtonMode="while-editing"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <X size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Filter Pills */}
      <View style={styles.categoriesSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesRow}
        >
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.key;
            return (
              <TouchableOpacity
                key={cat.label}
                style={[styles.categoryChip, isSelected && styles.categoryChipActive]}
                onPress={() => setCategory(cat.key)}
                activeOpacity={0.7}
              >
                <Text
                  style={[styles.categoryChipText, isSelected && styles.categoryChipTextActive]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Main Memory List */}
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="small" color={Colors.primary} />
          <Text style={styles.loadingText}>યાદો મેળવી રહ્યા છીએ...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredMemories}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <MemoryCard
              memory={item}
              onDelete={() => deleteMemory(item.id)}
              onEdit={openEditModal}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <BookOpen size={36} color={Colors.textMuted} strokeWidth={1.5} />
              <Text style={styles.emptyTitle}>કોઈ યાદ મળી નથી</Text>
              <Text style={styles.emptyText}>
                {search ? 'બીજો શબ્દ શોધો' : 'નવી યાદ ઉમેરવા ઉપરના બટન પર ટેપ કરો.'}
              </Text>
            </View>
          }
        />
      )}

      {/* Add / Edit Memory Modal (iOS Sheet) */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
          >
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setModalVisible(false)} activeOpacity={0.7}>
                <Text style={styles.modalCancel}>રદ કરો</Text>
              </TouchableOpacity>
              <Text style={styles.modalHeaderTitle}>
                {editingId ? 'યાદ સુધારો' : 'નવી સ્મૃતિ ઉમેરો'}
              </Text>
              <TouchableOpacity onPress={handleSaveMemory} activeOpacity={0.7}>
                <Text style={styles.modalSave}>સાચવો</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalBody}
              contentContainerStyle={{ paddingBottom: Spacing['3xl'] }}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.modalHelperText}>
                દાદીમા સાથેનો તમારો અનુભવ, જૂનો પ્રસંગ કે કોઈ વાનગીની રીત ઉમેરો. આ વિગતથી દાદીમાનું વ્યક્તિત્વ વધુ જીવંત બનશે.
              </Text>

              {/* Grouped Form Fields */}
              <View style={styles.formGroup}>
                <View style={styles.formRow}>
                  <Text style={styles.fieldLabel}>શીર્ષક</Text>
                  <TextInput
                    style={styles.inputField}
                    placeholder="ઉદા. દિવાળીના ઘૂઘરા બનાવવાની રીત"
                    placeholderTextColor={Colors.textMuted}
                    value={formTitle}
                    onChangeText={setFormTitle}
                  />
                </View>

                <View style={styles.divider} />

                <View style={styles.formRow}>
                  <Text style={styles.fieldLabel}>અનુભવ / વાર્તા</Text>
                  <TextInput
                    style={[styles.inputField, styles.textArea]}
                    placeholder="પ્રસંગ કે યાદની વિગત લખો..."
                    placeholderTextColor={Colors.textMuted}
                    value={formContent}
                    onChangeText={setFormContent}
                    multiline
                    numberOfLines={4}
                  />
                </View>

                <View style={styles.divider} />

                <View style={styles.formRow}>
                  <Text style={styles.fieldLabel}>યાદગાર કહેવત / તકિયાકલામ</Text>
                  <TextInput
                    style={styles.inputField}
                    placeholder="ઉદા. 'ધીરજના ફળ મીઠા હોય બાપ'"
                    placeholderTextColor={Colors.textMuted}
                    value={formPhrase}
                    onChangeText={setFormPhrase}
                  />
                </View>
              </View>

              {/* Category Picker */}
              <Text style={styles.sectionTitle}>કેટેગરી પસંદ કરો</Text>
              <View style={styles.categoryPickerRow}>
                {CATEGORIES.filter(c => c.key !== null).map((cat) => {
                  const isSelected = formCategory === cat.key;
                  return (
                    <TouchableOpacity
                      key={cat.key}
                      style={[styles.pickerChip, isSelected && styles.pickerChipActive]}
                      onPress={() => setFormCategory(cat.key as Memory['category'])}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[styles.pickerChipText, isSelected && styles.pickerChipTextActive]}
                      >
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.contributorNotice}>
                ઉમેરનાર તરીકે: <Text style={{ fontWeight: '600' }}>{activeMember.name} ({activeMember.kinship})</Text> નોંધાશે.
              </Text>
            </ScrollView>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  headerTitleCol: {
    flex: 1,
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm - 1,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
  },
  searchSection: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.sm + 2,
    height: 38,
    gap: Spacing.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    color: Colors.textPrimary,
    paddingVertical: 0,
  },
  categoriesSection: {
    paddingVertical: Spacing.sm,
  },
  categoriesRow: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.xs,
  },
  categoryChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full,
  },
  categoryChipActive: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.secondary,
  },
  categoryChipText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeight.medium,
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
    fontWeight: Typography.fontWeight.semibold,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing['3xl'],
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  loadingText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: Spacing['3xl'],
    gap: Spacing.xs,
  },
  emptyTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
    marginTop: Spacing.sm,
  },
  emptyText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
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
  modalHeaderTitle: {
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
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  modalHelperText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
    lineHeight: Typography.fontSize.xs * Typography.lineHeight.normal,
    marginBottom: Spacing.md,
  },
  formGroup: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
  },
  formRow: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  fieldLabel: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  inputField: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textPrimary,
    paddingVertical: Platform.OS === 'ios' ? 4 : 2,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.divider,
    marginLeft: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  categoryPickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  pickerChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  pickerChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  pickerChipText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeight.medium,
  },
  pickerChipTextActive: {
    color: '#FFFFFF',
    fontWeight: Typography.fontWeight.semibold,
  },
  contributorNotice: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
  },
});
