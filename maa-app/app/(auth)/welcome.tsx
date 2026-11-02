import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { useAuthStore } from '../../stores/auth';
import {
  Flame,
  Sparkles,
  ArrowRight,
  User,
  Mail,
  Lock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  BookOpen,
} from 'lucide-react-native';

type Tab = 'login' | 'register' | 'about';

const KINSHIP_OPTIONS = [
  { label: 'પૌત્ર (Grandson)', value: 'પૌત્ર (Grandson)', call: 'દિકરા' },
  { label: 'દીકરો (Son)', value: 'દીકરો (Son)', call: 'ભાઈ' },
  { label: 'પૌત્રી (Granddaughter)', value: 'પૌત્રી (Granddaughter)', call: 'દિકરી' },
  { label: 'પુત્રવધૂ (Daughter-in-law)', value: 'પુત્રવધૂ (Daughter-in-law)', call: 'વહુ બેટા' },
  { label: 'દીકરી (Daughter)', value: 'દીકરી (Daughter)', call: 'બેટા' },
];

export default function WelcomeScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [memberName, setMemberName] = useState('દિવ્યરાજ');
  const [familyName, setFamilyName] = useState('રાણા પરિવાર (Rana Family)');
  const [selectedKinship, setSelectedKinship] = useState(KINSHIP_OPTIONS[0]);
  const [formError, setFormError] = useState('');

  const { login, register, isLoading, enterDemoMode } = useAuthStore();

  const handleLogin = async () => {
    setFormError('');
    const inputEmail = email.trim() || 'parivaar@nanima.heritage';
    const inputPass = password || 'parivaar123';
    try {
      await login(inputEmail, inputPass);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'પ્રવેશ નિષ્ફળ રહ્યો.';
      setFormError(msg);
    }
  };

  const handleRegister = async () => {
    setFormError('');
    const inputEmail = email.trim() || `${memberName.toLowerCase() || 'member'}@nanima.heritage`;
    const inputPass = password || 'parivaar123';

    try {
      await register(
        inputEmail,
        inputPass,
        familyName.trim() || 'આપણો પરિવાર',
        memberName.trim() || 'દિવ્યરાજ',
        selectedKinship.value
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'નોંધણી નિષ્ફળ રહી.';
      setFormError(msg);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Top Auspicious Inscription */}
          <View style={styles.auspiciousBanner}>
            <Text style={styles.auspiciousText}>॥ શ્રી ગણેશાય નમઃ ॥</Text>
          </View>

          {/* Heirloom Hero Card */}
          <View style={styles.heroCard}>
            <View style={styles.diyaGlowCircle}>
              <Flame size={32} color={Colors.secondary} />
            </View>
            <Text style={styles.appTitle}>માઁ</Text>
            <Text style={styles.appSubtitle}>અમર સ્મૃતિ • કૌટુંબિક ખજાનો</Text>
            <View style={styles.ornamentDivider}>
              <View style={styles.dividerLine} />
              <Sparkles size={14} color={Colors.secondary} style={{ marginHorizontal: 8 }} />
              <View style={styles.dividerLine} />
            </View>
            <Text style={styles.heroPoem}>
              "દાદીમાનો વહાલ, કાઠિયાવાડી મીઠી વાતો અને જીવનના સંસ્કાર — હંમેશા આપણી સાથે."
            </Text>
          </View>

          {/* Quick Vault Shortcut for Instant Family Access */}
          <TouchableOpacity
            style={styles.quickVaultButton}
            onPress={enterDemoMode}
            activeOpacity={0.88}
          >
            <View style={styles.quickVaultRow}>
              <View style={styles.quickVaultIconBadge}>
                <Sparkles size={20} color="#F3E5AB" />
              </View>
              <View style={styles.quickVaultTextGroup}>
                <Text style={styles.quickVaultTitle}>સીધા પરિવાર ખજાનામાં પ્રવેશો</Text>
                <Text style={styles.quickVaultDesc}>
                  વાર્તાઓ, ચરિત્ર નિર્માણ અને વાતચીત જોવા ૧-ટેપ કરો
                </Text>
              </View>
              <ArrowRight size={20} color="#F3E5AB" strokeWidth={2.5} />
            </View>
          </TouchableOpacity>

          {/* Tab Selector */}
          <View style={styles.tabBar}>
            <TouchableOpacity
              style={[styles.tabItem, activeTab === 'login' && styles.tabItemActive]}
              onPress={() => { setActiveTab('login'); setFormError(''); }}
            >
              <Text style={[styles.tabText, activeTab === 'login' && styles.tabTextActive]}>
                પરિવાર પ્રવેશ
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabItem, activeTab === 'register' && styles.tabItemActive]}
              onPress={() => { setActiveTab('register'); setFormError(''); }}
            >
              <Text style={[styles.tabText, activeTab === 'register' && styles.tabTextActive]}>
                નવું સભ્ય નોંધણી
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabItem, activeTab === 'about' && styles.tabItemActive]}
              onPress={() => { setActiveTab('about'); setFormError(''); }}
            >
              <Text style={[styles.tabText, activeTab === 'about' && styles.tabTextActive]}>
                માર્ગદર્શન
              </Text>
            </TouchableOpacity>
          </View>

          {formError ? (
            <View style={styles.errorContainer}>
              <AlertCircle size={18} color={Colors.error} />
              <Text style={styles.errorText}>{formError}</Text>
            </View>
          ) : null}

          {/* LOGIN TAB */}
          {activeTab === 'login' && (
            <View style={styles.formCard}>
              <Text style={styles.formHeaderTitle}>કૌટુંબિક ખાતામાં પ્રવેશ</Text>
              <Text style={styles.formHeaderDesc}>
                તમારું ઇમેઇલ અથવા સભ્ય નામ અને પાસવર્ડ દાખલ કરો:
              </Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>ઇમેઇલ અથવા સભ્ય ID</Text>
                <View style={styles.inputFieldContainer}>
                  <Mail size={18} color={Colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInputWithIcon}
                    placeholder="divyaraj@nanima.heritage"
                    placeholderTextColor={Colors.textMuted}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>પાસવર્ડ / કુટુંબ PIN</Text>
                <View style={styles.inputFieldContainer}>
                  <Lock size={18} color={Colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInputWithIcon}
                    placeholder="••••••••"
                    placeholderTextColor={Colors.textMuted}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                  />
                </View>
              </View>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleLogin}
                disabled={isLoading}
                activeOpacity={0.85}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.actionButtonText}>પ્રવેશ કરો (Open Vault)</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* REGISTER TAB */}
          {activeTab === 'register' && (
            <View style={styles.formCard}>
              <Text style={styles.formHeaderTitle}>નવા સભ્યનું જોડાણ</Text>
              <Text style={styles.formHeaderDesc}>
                દાદીમા સાથે તમારી વ્યક્તિગત ઓળખ અને સગપણ નક્કી કરો:
              </Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>તમારું નામ (Your Name)</Text>
                <View style={styles.inputFieldContainer}>
                  <User size={18} color={Colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInputWithIcon}
                    placeholder="દા.ત. દિવ્યરાજ, જયદીપ, અલ્પા"
                    placeholderTextColor={Colors.textMuted}
                    value={memberName}
                    onChangeText={setMemberName}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>દાદીમા સાથે સંબંધ (Kinship)</Text>
                <View style={styles.kinshipPillContainer}>
                  {KINSHIP_OPTIONS.map((k) => {
                    const isSelected = selectedKinship.value === k.value;
                    return (
                      <TouchableOpacity
                        key={k.value}
                        style={[styles.kinshipPill, isSelected && styles.kinshipPillSelected]}
                        onPress={() => setSelectedKinship(k)}
                        activeOpacity={0.8}
                      >
                        {isSelected && <CheckCircle2 size={13} color="#FFFFFF" style={{ marginRight: 4 }} />}
                        <Text style={[styles.kinshipPillText, isSelected && styles.kinshipPillTextSelected]}>
                          {k.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                <Text style={styles.kinshipPreviewHint}>
                  માઁ તમને <Text style={styles.bold}>"{selectedKinship.call} {memberName || 'ભાઈ'}"</Text> કહીને બોલાવશે.
                </Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>પરિવારનું નામ (Household)</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="રાણા પરિવાર (Rana Family)"
                  placeholderTextColor={Colors.textMuted}
                  value={familyName}
                  onChangeText={setFamilyName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>ઇમેઇલ</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="divyaraj@gmail.com"
                  placeholderTextColor={Colors.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>પાસવર્ડ</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="ઓછામાં ઓછા ૮ અક્ષર"
                  placeholderTextColor={Colors.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleRegister}
                disabled={isLoading}
                activeOpacity={0.85}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.actionButtonText}>પરિવારમાં નોંધણી કરો</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* ABOUT & ETHICAL DISCLOSURE TAB */}
          {activeTab === 'about' && (
            <View style={styles.aboutCard}>
              <View style={styles.aboutHeaderRow}>
                <BookOpen size={20} color={Colors.primary} />
                <Text style={styles.aboutHeader}>આ એપ્લિકેશન વિશે</Text>
              </View>
              <Text style={styles.aboutParagraph}>
                આ એપ્લિકેશન દાદીમાની યાદો, કૌટુંબિક કથાઓ, કાઠિયાવાડી ભાષાશૈલી અને એમની લાક્ષણિક વાતોને સાચવી રાખવા માટેનો એક ખાનગી કૌટુંબિક ખજાનો છે.
              </Text>

              <View style={styles.goldInfoBox}>
                <View style={styles.goldInfoTitleRow}>
                  <ShieldCheck size={18} color={Colors.textGold} />
                  <Text style={styles.goldInfoTitle}>ગોપનીયતા અને સંસ્કાર સુરક્ષા</Text>
                </View>
                <Text style={styles.goldInfoText}>
                  • પરિવારના દરેક સભ્યની વાતચીત એકદમ ખાનગી (Private) રહેશે.
                </Text>
                <Text style={styles.goldInfoText}>
                  • તમામ સભ્યો દાદીમાની યાદો, વાનગીઓ અને વાર્તાઓ ઉમેરી શકે છે જે ચરિત્ર નિર્માણમાં મદદરૂપ બને છે.
                </Text>
                <Text style={styles.goldInfoText}>
                  • આ આર્ટિફિશિયલ ઇન્ટેલિજન્સ આધારિત સ્મૃતિ-પુનઃનિર્માણ છે, જે કુટુંબના વારસાને જીવંત રાખવા બનાવાયું છે.
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.actionButton, { marginTop: 16 }]}
                onPress={enterDemoMode}
              >
                <Text style={styles.actionButtonText}>આગળ વધો (Start Experience)</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.footerSpace} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  auspiciousBanner: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  auspiciousText: {
    fontSize: 13,
    color: Colors.textGold,
    fontWeight: '700',
    letterSpacing: 2,
  },
  heroCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderGold,
    shadowColor: Colors.shadowHeavy,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
    marginTop: 6,
    marginBottom: 16,
  },
  diyaGlowCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FFF4D6',
    borderWidth: 2,
    borderColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  appTitle: {
    fontSize: 38,
    fontWeight: '900',
    color: Colors.primary,
    letterSpacing: 1,
  },
  appSubtitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginTop: 2,
    letterSpacing: 0.5,
  },
  ornamentDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '60%',
    marginVertical: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.borderGold,
  },
  heroPoem: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
    fontStyle: 'italic',
  },
  quickVaultButton: {
    backgroundColor: '#731828',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#731828',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  quickVaultRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickVaultIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  quickVaultTextGroup: {
    flex: 1,
  },
  quickVaultTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFF8E7',
  },
  quickVaultDesc: {
    fontSize: 12,
    color: '#E8C766',
    marginTop: 2,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#EFE6DC',
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 11,
  },
  tabItemActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  tabTextActive: {
    color: Colors.primary,
    fontWeight: '800',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FDECEB',
    padding: 12,
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  errorText: {
    color: Colors.error,
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  formCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  formHeaderTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: 4,
  },
  formHeaderDesc: {
    fontSize: 13,
    color: Colors.textMuted,
    marginBottom: 16,
    lineHeight: 18,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  inputFieldContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5EE',
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  textInputWithIcon: {
    flex: 1,
    paddingVertical: 11,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  textInput: {
    backgroundColor: '#FAF5EE',
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  kinshipPillContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 4,
  },
  kinshipPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5ECE3',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  kinshipPillSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  kinshipPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  kinshipPillTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  kinshipPreviewHint: {
    fontSize: 12,
    color: Colors.textGold,
    marginTop: 6,
    fontStyle: 'italic',
  },
  actionButton: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  aboutCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.borderGold,
  },
  aboutHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 10,
  },
  aboutHeader: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
  },
  aboutParagraph: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 14,
  },
  goldInfoBox: {
    backgroundColor: '#FFF8E7',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.borderGold,
    gap: 8,
  },
  goldInfoTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  goldInfoTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textGold,
  },
  goldInfoText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
  },
  bold: {
    fontWeight: '800',
    color: Colors.primary,
  },
  footerSpace: {
    height: 30,
  },
});
