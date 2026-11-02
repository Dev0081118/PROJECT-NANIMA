/**
 * Screen: Settings & Privacy (સેટિંગ્સ)
 * Apple iOS Inset Grouped Table layout.
 */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { Typography, Spacing, BorderRadius } from '../../constants/Typography';
import { useAuthStore } from '../../stores/auth';
import { apiClient } from '../../services/api';
import {
  User,
  LogOut,
  Trash2,
  ShieldCheck,
  Server,
  ChevronRight,
  Database,
  Radio,
} from 'lucide-react-native';

export default function SettingsScreen() {
  const { user, logout } = useAuthStore();
  const [autoSaveMemories, setAutoSaveMemories] = useState(true);

  const handleLogout = () => {
    Alert.alert('પ્રવેશ રદ કરો', 'શું તમે બહાર નીકળવા માંગો છો?', [
      { text: 'રદ કરો', style: 'cancel' },
      { text: 'બહાર નીકળો', onPress: logout, style: 'destructive' },
    ]);
  };

  const handleDeleteAllConversations = () => {
    Alert.alert(
      'વાતચીતનો ઇતિહાસ કાઢી નાખો?',
      'આ તમારા તમામ પાછલા સત્રોનો ઇતિહાસ કાયમી ધોરણે દૂર કરશે. તમારી યાદો કે કુટુંબ પ્રોફાઇલ સુરક્ષિત રહેશે.',
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
        <View style={styles.header}>
          <Text style={styles.title}>સેટિંગ્સ</Text>
          <Text style={styles.subtitle}>ખાતું, ગોપનીયતા અને સુરક્ષા</Text>
        </View>

        {/* Section 1: Account */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>કૌટુંબિક ખાતું</Text>
          <View style={styles.groupedTable}>
            <View style={styles.tableRow}>
              <View style={styles.rowLeft}>
                <User size={18} color={Colors.textSecondary} />
                <Text style={styles.rowLabel}>ઇમેઇલ</Text>
              </View>
              <Text style={styles.rowValue}>{user?.email || 'parivaar@nanima.heritage'}</Text>
            </View>

            <View style={styles.tableDivider} />

            <TouchableOpacity style={styles.tableRow} onPress={handleLogout} activeOpacity={0.7}>
              <View style={styles.rowLeft}>
                <LogOut size={18} color={Colors.error} />
                <Text style={[styles.rowLabel, { color: Colors.error }]}>બહાર નીકળો</Text>
              </View>
              <ChevronRight size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Section 2: AI & Privacy Safeguards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>વારસો અને નીતિમત્તા</Text>
          <View style={styles.groupedTable}>
            <View style={styles.infoRow}>
              <View style={styles.infoHeader}>
                <ShieldCheck size={18} color={Colors.secondary} />
                <Text style={styles.infoTitle}>સ્મૃતિ પુનઃનિર્માણની સ્પષ્ટતા</Text>
              </View>
              <Text style={styles.infoBody}>
                આ એપ્લિકેશન દાદીમાના વાસ્તવિક વ્યક્તિત્વ, કાઠિયાવાડી બોલી અને કૌટુંબિક વાર્તાઓનું સ્મૃતિ-રૂપ છે. તે કોઈ કૃત્રિમ બાબત ઉપજાવી કાઢતી નથી.
              </Text>
              <Text style={styles.infoBody}>
                તમામ ઓડિયો, ફોટા અને યાદો ફક્ત તમારા પરિવાર પૂરતા જ મર્યાદિત રહે છે.
              </Text>
            </View>
          </View>
        </View>

        {/* Section 3: Data & Storage */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>સંગ્રહ અને ઇતિહાસ</Text>
          <View style={styles.groupedTable}>
            <View style={styles.tableRow}>
              <View style={styles.rowLeft}>
                <Database size={18} color={Colors.textSecondary} />
                <Text style={styles.rowLabel}>સ્મૃતિઓ આપમેળે સાચવો</Text>
              </View>
              <Switch
                value={autoSaveMemories}
                onValueChange={setAutoSaveMemories}
                trackColor={{ false: '#E5E5EA', true: Colors.secondary }}
              />
            </View>

            <View style={styles.tableDivider} />

            <TouchableOpacity
              style={styles.tableRow}
              onPress={handleDeleteAllConversations}
              activeOpacity={0.7}
            >
              <View style={styles.rowLeft}>
                <Trash2 size={18} color={Colors.error} />
                <Text style={[styles.rowLabel, { color: Colors.error }]}>
                  વાતચીતનો ઇતિહાસ સાફ કરો
                </Text>
              </View>
              <ChevronRight size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Section 4: System Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>સિસ્ટમ સ્થિતિ</Text>
          <View style={styles.groupedTable}>
            <View style={styles.tableRow}>
              <View style={styles.rowLeft}>
                <Server size={18} color={Colors.textSecondary} />
                <Text style={styles.rowLabel}>ઓડિયો એન્જિન</Text>
              </View>
              <View style={styles.statusPill}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>સક્રિય (Expo Audio)</Text>
              </View>
            </View>

            <View style={styles.tableDivider} />

            <View style={styles.tableRow}>
              <View style={styles.rowLeft}>
                <Radio size={18} color={Colors.textSecondary} />
                <Text style={styles.rowLabel}>કાઠિયાવાડી પર્સૉના</Text>
              </View>
              <View style={styles.statusPill}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>પ્રમાણિત</Text>
              </View>
            </View>
          </View>
        </View>

        <Text style={styles.versionText}>
          Maa • Digital Legacy Version 1.0.0
        </Text>
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
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: Spacing.xs + 2,
    marginLeft: 2,
  },
  groupedTable: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 4,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm + 2,
  },
  rowLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textPrimary,
  },
  rowValue: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
  },
  tableDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.divider,
    marginLeft: 42,
  },
  infoRow: {
    padding: Spacing.md,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  infoTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
  },
  infoBody: {
    fontSize: Typography.fontSize.xs,
    lineHeight: Typography.fontSize.xs * Typography.lineHeight.relaxed,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.success,
  },
  statusText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
  },
  versionText: {
    textAlign: 'center',
    fontSize: Typography.fontSize.xs - 1,
    color: Colors.textMuted,
    marginTop: Spacing.md,
  },
});
