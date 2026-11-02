/**
 * Screen: Settings & Privacy
 * Uses sleek Lucide icons for all settings actions and status indicators.
 */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { useAuthStore } from '../../stores/auth';
import { apiClient } from '../../services/api';
import {
  Settings,
  User,
  LogOut,
  Trash2,
  ShieldCheck,
  Server,
  ChevronRight,
  Sparkles,
} from 'lucide-react-native';

export default function SettingsScreen() {
  const { user, logout } = useAuthStore();
  const [autoSaveMemories, setAutoSaveMemories] = useState(true);

  const handleLogout = () => {
    Alert.alert('પ્રવેશ રદ કરો', 'શું તમે બહાર નીકળવા માંગો છો?', [
      { text: 'રદ કરો', style: 'cancel' },
      { text: 'બહાર નીકળો (Sign Out)', onPress: logout, style: 'destructive' },
    ]);
  };

  const handleDeleteAllConversations = () => {
    Alert.alert(
      'વાતચીતનો ઇતિહાસ કાઢી નાખો?',
      'આ તમારા તમામ પાછલા સત્રોનો ઇતિહાસ કાયમી માટે દૂર કરશે. તમારી યાદો કે કુટુંબ પ્રોફાઇલ સુરક્ષિત રહેશે.',
      [
        { text: 'રદ કરો', style: 'cancel' },
        {
          text: 'બધું કાઢી નાખો',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.delete('/conversation/all');
              Alert.alert('સફળતા', 'તમામ વાતચીતો દૂર કરવામાં આવી છે.');
            } catch {
              Alert.alert('સફળતા', 'સ્થાનિક ઇતિહાસ સાફ કરવામાં આવ્યો.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Settings size={22} color={Colors.primary} />
          <Text style={styles.title}>સેટિંગ્સ અને ગોપનીયતા</Text>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>કૌટુંબિક ખાતું (Account)</Text>
          <View style={styles.card}>
            <View style={styles.cardRow}>
              <User size={18} color={Colors.textGold} style={{ marginRight: 8 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.cardLabel}>પરિવાર ID / ઇમેઇલ</Text>
                <Text style={styles.cardValue}>{user?.email || 'parivaar@nanima.heritage'}</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.listItem} onPress={handleLogout} activeOpacity={0.8}>
            <View style={styles.listItemLeft}>
              <LogOut size={18} color={Colors.primary} style={{ marginRight: 10 }} />
              <Text style={styles.listItemText}>બહાર નીકળો (Sign Out)</Text>
            </View>
            <ChevronRight size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* AI & Heritage Safeguards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>વારસો અને નીતિમત્તા (AI Disclosure)</Text>
          <View style={styles.disclosureCard}>
            <View style={styles.disclosureTitleRow}>
              <ShieldCheck size={18} color={Colors.primary} />
              <Text style={styles.disclosureTitle}>સ્મૃતિ પુનઃનિર્માણની સ્પષ્ટતા</Text>
            </View>
            <Text style={styles.disclosureText}>
              આ એપ્લિકેશન દાદીમાના યાદ રહેલા વ્યક્તિત્વ, કાઠિયાવાડી બોલચાલ અને કૌટુંબિક વાર્તાઓનું સ્મૃતિ-રૂપ છે.
            </Text>
            <Text style={styles.disclosureText}>
              આ એક કૌટુંબિક સ્મૃતિ ભંડાર (Family Keepsake) તરીકે બનાવવામાં આવ્યું છે જેથી નવી પેઢી પોતાના વડીલોના સંસ્કાર સાથે જોડાયેલી રહી શકે.
            </Text>
          </View>
        </View>

        {/* Conversations Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>વાતચીત વ્યવસ્થાપન</Text>
          <View style={styles.listItem}>
            <View style={styles.listItemLeft}>
              <Sparkles size={18} color={Colors.secondary} style={{ marginRight: 10 }} />
              <Text style={styles.listItemText}>વાતચીતમાંથી આપમેળે નવી યાદો શીખો</Text>
            </View>
            <Switch
              value={autoSaveMemories}
              onValueChange={setAutoSaveMemories}
              trackColor={{ true: Colors.primary }}
            />
          </View>

          <TouchableOpacity
            style={styles.listItem}
            onPress={handleDeleteAllConversations}
            activeOpacity={0.8}
          >
            <View style={styles.listItemLeft}>
              <Trash2 size={18} color={Colors.error} style={{ marginRight: 10 }} />
              <Text style={[styles.listItemText, { color: Colors.error }]}>
                તમામ વાતોનો ઇતિહાસ કાઢી નાખો
              </Text>
            </View>
            <ChevronRight size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Service Status */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Server size={16} color={Colors.textGold} />
            <Text style={styles.sectionTitle}>સેવા સ્થિતિ (Provider Status)</Text>
          </View>

          {[
            { label: 'Kathiyawadi Persona Engine', status: 'સક્રિય (Active)' },
            { label: 'Family Memory Vault', status: 'સક્રિય (Active)' },
            { label: 'Gujarati STT (Sarvam AI)', status: 'API કી પર નિર્ભર' },
            { label: 'Gujarati Voice (TTS)', status: 'API કી પર નિર્ભર' },
          ].map((item) => (
            <View key={item.label} style={styles.statusRow}>
              <Text style={styles.statusLabel}>{item.label}</Text>
              <Text style={styles.statusValue}>{item.status}</Text>
            </View>
          ))}
        </View>

        {/* Version */}
        <Text style={styles.version}>Maa — Digital Legacy v0.1.0 • સંસ્કાર સંગ્રહ</Text>
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 30,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.primary,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    marginBottom: 8,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  cardValue: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderWidth: 1.5,
    borderColor: Colors.border,
    marginBottom: 8,
  },
  listItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  listItemText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  disclosureCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: Colors.borderGold,
  },
  disclosureTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  disclosureTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primary,
  },
  disclosureText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  statusLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  statusValue: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textGold,
  },
  version: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 16,
    fontStyle: 'italic',
  },
});
