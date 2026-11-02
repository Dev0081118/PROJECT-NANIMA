import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { Typography, Spacing, BorderRadius, Shadow } from '../../constants/Typography';
import { useAuthStore } from '../../stores/auth';
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Users,
  Lock,
} from 'lucide-react-native';

type Tab = 'login' | 'register' | 'about';

const KINSHIP_OPTIONS = [
  { label: 'પૌત્ર (Grandson)', value: 'પૌત્ર', call: 'દિકરા' },
  { label: 'દીકરો (Son)', value: 'દીકરો', call: 'ભાઈ' },
  { label: 'પૌત્રી (Granddaughter)', value: 'પૌત્રી', call: 'દિકરી' },
  { label: 'પુત્રવધૂ (Daughter-in-law)', value: 'પુત્રવધૂ', call: 'વહુ બેટા' },
  { label: 'દીકરી (Daughter)', value: 'દીકરી', call: 'બેટા' },
];

export default function WelcomeScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [memberName, setMemberName] = useState('દિવ્યરાજ');
  const [familyName, setFamilyName] = useState('રાણા પરિવાર');
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
          keyboardShouldPersistTaps="handled"
        >
          {/* Header & Typography Presentation */}
          <View style={styles.header}>
            <Text style={styles.brandTitle}>Maa</Text>
            <Text style={styles.brandSubtitle}>Digital Legacy • અમર સ્મૃતિ</Text>
            <Text style={styles.brandDescription}>
              કાઠિયાવાડી દાદીમાના અવાજ, વહાલ અને કૌટુંબિક સંસ્કારોનું શાશ્વત સંરક્ષણ.
            </Text>
          </View>

          {/* iOS Segmented Control */}
          <View style={styles.segmentedControl}>
            <TouchableOpacity
              style={[styles.segment, activeTab === 'login' && styles.segmentActive]}
              onPress={() => { setActiveTab('login'); setFormError(''); }}
              activeOpacity={0.8}
            >
              <Text style={[styles.segmentText, activeTab === 'login' && styles.segmentTextActive]}>
                પ્રવેશ
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.segment, activeTab === 'register' && styles.segmentActive]}
              onPress={() => { setActiveTab('register'); setFormError(''); }}
              activeOpacity={0.8}
            >
              <Text style={[styles.segmentText, activeTab === 'register' && styles.segmentTextActive]}>
                નવું સભ્ય
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.segment, activeTab === 'about' && styles.segmentActive]}
              onPress={() => { setActiveTab('about'); setFormError(''); }}
              activeOpacity={0.8}
            >
              <Text style={[styles.segmentText, activeTab === 'about' && styles.segmentTextActive]}>
                પરિચય
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form Error Notice */}
          {formError ? (
            <View style={styles.errorBanner}>
              <AlertCircle size={16} color={Colors.error} />
              <Text style={styles.errorText}>{formError}</Text>
            </View>
          ) : null}

          {/* Tab 1: Login */}
          {activeTab === 'login' && (
            <View style={styles.formContainer}>
              <View style={styles.groupedFields}>
                <View style={styles.inputRow}>
                  <Text style={styles.inputLabel}>ઇમેઇલ</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="parivaar@nanima.heritage"
                    placeholderTextColor={Colors.textMuted}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                <View style={styles.divider} />

                <View style={styles.inputRow}>
                  <Text style={styles.inputLabel}>પાસવર્ડ</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="••••••••"
                    placeholderTextColor={Colors.textMuted}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                  />
                </View>
              </View>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleLogin}
                disabled={isLoading}
                activeOpacity={0.85}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.primaryButtonText}>પરિવાર પ્રવેશ</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Tab 2: Register */}
          {activeTab === 'register' && (
            <View style={styles.formContainer}>
              <View style={styles.groupedFields}>
                <View style={styles.inputRow}>
                  <Text style={styles.inputLabel}>પરિવારનું નામ</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="ઉદા. રાણા પરિવાર"
                    placeholderTextColor={Colors.textMuted}
                    value={familyName}
                    onChangeText={setFamilyName}
                  />
                </View>

                <View style={styles.divider} />

                <View style={styles.inputRow}>
                  <Text style={styles.inputLabel}>તમારું નામ</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="ઉદા. દિવ્યરાજ"
                    placeholderTextColor={Colors.textMuted}
                    value={memberName}
                    onChangeText={setMemberName}
                  />
                </View>

                <View style={styles.divider} />

                <View style={styles.inputRow}>
                  <Text style={styles.inputLabel}>ઇમેઇલ</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="divyaraj@nanima.heritage"
                    placeholderTextColor={Colors.textMuted}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.divider} />

                <View style={styles.inputRow}>
                  <Text style={styles.inputLabel}>પાસવર્ડ</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="નવો પાસવર્ડ બનાવો"
                    placeholderTextColor={Colors.textMuted}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                  />
                </View>
              </View>

              {/* Kinship Selection */}
              <View style={styles.kinshipSection}>
                <Text style={styles.sectionCaption}>દાદીમા સાથે તમારો સંબંધ:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.kinshipPills}>
                  {KINSHIP_OPTIONS.map((k) => {
                    const isSelected = selectedKinship.value === k.value;
                    return (
                      <TouchableOpacity
                        key={k.value}
                        style={[styles.kinshipPill, isSelected && styles.kinshipPillActive]}
                        onPress={() => setSelectedKinship(k)}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.kinshipPillText, isSelected && styles.kinshipPillTextActive]}>
                          {k.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleRegister}
                disabled={isLoading}
                activeOpacity={0.85}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.primaryButtonText}>નોંધણી પૂર્ણ કરો</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Tab 3: About / Privacy */}
          {activeTab === 'about' && (
            <View style={styles.aboutContainer}>
              <View style={styles.groupedFields}>
                <View style={styles.aboutRow}>
                  <ShieldCheck size={20} color={Colors.secondary} style={styles.aboutIcon} />
                  <View style={styles.aboutTextCol}>
                    <Text style={styles.aboutHeading}>સંપૂર્ણ પારિવારિક ગોપનીયતા</Text>
                    <Text style={styles.aboutDesc}>
                      દાદીમાના ઓડિયો, વાર્તાઓ અને ફોટા ફક્ત તમારા પરિવાર સુધી જ સીમિત રહે છે.
                    </Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.aboutRow}>
                  <BookOpen size={20} color={Colors.secondary} style={styles.aboutIcon} />
                  <View style={styles.aboutTextCol}>
                    <Text style={styles.aboutHeading}>પ્રમાણિક સ્મૃતિ પુનઃનિર્માણ</Text>
                    <Text style={styles.aboutDesc}>
                      દાદીમાનો જાણીતો કાઠિયાવાડી લહેકો અને સાચી યાદો. અજ્ઞાત વિગતો જાતે ઉપજાવી કાઢવામાં આવતી નથી.
                    </Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.aboutRow}>
                  <Users size={20} color={Colors.secondary} style={styles.aboutIcon} />
                  <View style={styles.aboutTextCol}>
                    <Text style={styles.aboutHeading}>સહિયારું ચરિત્ર નિર્માણ</Text>
                    <Text style={styles.aboutDesc}>
                      પરિવારના દરેક સભ્યો પોતાના સંસ્મરણો અને અનુભવો ઉમેરી શકે છે.
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Quick Vault Shortcut (Apple subtle secondary) */}
          <View style={styles.vaultAccessSection}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={enterDemoMode}
              activeOpacity={0.7}
            >
              <Text style={styles.secondaryButtonText}>સીધા પરિવાર ખજાનામાં પ્રવેશો</Text>
              <ArrowRight size={16} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
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
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing['3xl'],
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
    marginTop: Spacing.md,
  },
  brandTitle: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  brandDescription: {
    fontSize: Typography.fontSize.sm,
    lineHeight: Typography.fontSize.sm * Typography.lineHeight.relaxed,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Spacing.sm,
    maxWidth: 320,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#EBEBEF',
    borderRadius: BorderRadius.md,
    padding: 3,
    marginBottom: Spacing.lg,
  },
  segment: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.sm,
  },
  segmentActive: {
    backgroundColor: '#FFFFFF',
    ...Shadow.sm,
  },
  segmentText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.regular,
    color: Colors.textSecondary,
  },
  segmentTextActive: {
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF2F2',
    borderColor: '#FFD2D2',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  errorText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.error,
    flex: 1,
  },
  formContainer: {
    gap: Spacing.md,
  },
  groupedFields: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  inputRow: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
  },
  inputLabel: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.textSecondary,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  textInput: {
    fontSize: Typography.fontSize.md,
    color: Colors.textPrimary,
    paddingVertical: Platform.OS === 'ios' ? 4 : 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.divider,
    marginLeft: Spacing.md,
  },
  kinshipSection: {
    marginTop: Spacing.xs,
  },
  sectionCaption: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    marginLeft: 2,
    fontWeight: Typography.fontWeight.medium,
  },
  kinshipPills: {
    flexDirection: 'row',
    gap: Spacing.xs,
    paddingBottom: Spacing.xs,
  },
  kinshipPill: {
    backgroundColor: Colors.backgroundCard,
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
    fontWeight: Typography.fontWeight.medium,
  },
  kinshipPillTextActive: {
    color: '#FFFFFF',
    fontWeight: Typography.fontWeight.semibold,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
    ...Shadow.sm,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  aboutContainer: {
    gap: Spacing.md,
  },
  aboutRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.md,
    gap: Spacing.md,
  },
  aboutIcon: {
    marginTop: 2,
  },
  aboutTextCol: {
    flex: 1,
  },
  aboutHeading: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  aboutDesc: {
    fontSize: Typography.fontSize.sm,
    lineHeight: Typography.fontSize.sm * Typography.lineHeight.relaxed,
    color: Colors.textSecondary,
  },
  vaultAccessSection: {
    marginTop: Spacing.xl,
    alignItems: 'center',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  secondaryButtonText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeight.medium,
  },
});
