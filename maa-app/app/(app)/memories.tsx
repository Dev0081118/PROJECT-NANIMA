/**
 * Screen 3: Memory Library
 * Browse, search, approve, and manage family memories.
 */
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, FlatList,
  TouchableOpacity, TextInput, ActivityIndicator,
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography, Spacing, BorderRadius } from '../../constants/Typography';
import { useMemoryStore, Memory } from '../../stores/memory';
import { MemoryCard } from '../../components/memory/MemoryCard';

const CATEGORIES = [
  { key: null, label: 'All' },
  { key: 'BIOGRAPHICAL', label: 'Facts' },
  { key: 'PERSONAL', label: 'Stories' },
  { key: 'PERSONALITY', label: 'Personality' },
  { key: 'VALUES', label: 'Values' },
  { key: 'UNCERTAIN', label: 'Uncertain' },
] as const;

export default function MemoriesScreen() {
  const [search, setSearch] = useState('');
  const { memories, isLoading, selectedCategory, loadMemories, setCategory,
          approveMemory, rejectMemory, deleteMemory } = useMemoryStore();

  useEffect(() => {
    loadMemories(selectedCategory ?? undefined);
  }, [selectedCategory]);

  const filtered = memories.filter(m =>
    !search || m.title.toLowerCase().includes(search.toLowerCase()) ||
    m.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📖 Yaadein (Memories)</Text>
        <TextInput
          style={styles.search}
          value={search}
          onChangeText={setSearch}
          placeholder="Search memories..."
          placeholderTextColor={Colors.textMuted}
        />
      </View>

      {/* Category filter */}
      <View style={styles.categoryRow}>
        <FlatList
          horizontal
          data={CATEGORIES}
          keyExtractor={item => String(item.key)}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryChip,
                selectedCategory === item.key && styles.categoryChipActive,
              ]}
              onPress={() => setCategory(item.key)}
            >
              <Text style={[
                styles.categoryChipText,
                selectedCategory === item.key && styles.categoryChipTextActive,
              ]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.categoryContent}
        />
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.primary} />
          <Text style={styles.loadingText}>Loading memories...</Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>
            {search ? 'No memories match your search.' : 'No memories yet.\nAdd family stories and facts in Setup.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={m => m.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <MemoryCard
              memory={item}
              onApprove={() => approveMemory(item.id)}
              onReject={() => rejectMemory(item.id)}
              onDelete={() => deleteMemory(item.id)}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    padding: Spacing.md,
    paddingTop: Spacing.lg,
    gap: Spacing.sm,
  },
  title: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
  },
  search: {
    backgroundColor: Colors.backgroundCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
  },
  categoryRow: { paddingVertical: Spacing.xs },
  categoryContent: { paddingHorizontal: Spacing.md, gap: Spacing.xs },
  categoryChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.backgroundCard,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryChipText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  categoryChipTextActive: {
    color: Colors.textOnPrimary,
    fontWeight: Typography.fontWeight.semibold,
  },
  listContent: { padding: Spacing.md, gap: Spacing.sm, paddingBottom: Spacing['2xl'] },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  loadingText: { color: Colors.textMuted, marginTop: Spacing.sm },
  emptyText: { color: Colors.textMuted, textAlign: 'center', lineHeight: 22 },
});
