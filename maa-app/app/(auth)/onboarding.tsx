/**
 * Screen: Onboarding (Family Orientation & Dialect Setup)
 * Apple Setup Assistant design: content over containers, quiet luxury typography.
 */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Typography, Spacing, BorderRadius } from '../../constants/Typography';
import { Heart, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react-native';

const STEPS = [
  {
    title: 'પ્રેમપૂર્વક યાદોનું પુનર્નિર્માણ',
    subtitle: 'A Respectful Cultural Keepsake',
    content:
      'Maa is crafted around the warmth, cadence, and vocabulary of authentic Kathiyawadi Gujarati. It is designed to honour her memory and keep her voice close to heart.',
    icon: Heart,
  },
  {
    title: 'ખાનગી અને સુરક્ષિત પારિવારિક જગ્યા',
    subtitle: 'Strict Privacy & Family Sovereignty',
    content:
      'All uploaded photographs, home audio recordings, and family stories remain strictly within your family vault. No public AI model training or data selling.',
    icon: ShieldCheck,
  },
  {
    title: 'સત્યનિષ્ઠા અને મર્યાદા',
    subtitle: 'Transparent AI Safeguards',
    content:
      'The AI clearly acknowledges when a memory is uncertain rather than inventing details. It reflects her known personality and values with honesty.',
    icon: Sparkles,
  },
];

export default function OnboardingScreen() {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(s => s + 1);
    } else {
      router.replace('/(app)');
    }
  };

  const step = STEPS[currentStep];
  const IconComponent = step.icon;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Top Progress Indicator */}
        <View style={styles.header}>
          <Text style={styles.brand}>Maa • Digital Legacy</Text>
          <View style={styles.progressRow}>
            {STEPS.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.progressBar,
                  i <= currentStep && styles.progressBarActive,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Central Editorial Content */}
        <View style={styles.centerContent}>
          <View style={styles.iconCircle}>
            <IconComponent size={32} color={Colors.primary} strokeWidth={1.8} />
          </View>
          <Text style={styles.stepTitle}>{step.title}</Text>
          <Text style={styles.stepSubtitle}>{step.subtitle}</Text>
          <Text style={styles.stepDescription}>{step.content}</Text>
        </View>

        {/* Action Controls */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleNext} activeOpacity={0.85}>
            <Text style={styles.primaryButtonText}>
              {currentStep === STEPS.length - 1 ? 'પરિવારમાં પ્રવેશો' : 'આગળ વધો'}
            </Text>
            <ArrowRight size={18} color="#FFFFFF" />
          </TouchableOpacity>
          {currentStep > 0 && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setCurrentStep(s => s - 1)}
              activeOpacity={0.7}
            >
              <Text style={styles.backButtonText}>પાછળ</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    gap: Spacing.md,
  },
  brand: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textSecondary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  progressRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    width: '100%',
    paddingHorizontal: Spacing.md,
  },
  progressBar: {
    flex: 1,
    height: 3,
    backgroundColor: '#E5E5EA',
    borderRadius: 2,
  },
  progressBarActive: {
    backgroundColor: Colors.primary,
  },
  centerContent: {
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  stepTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.4,
    marginBottom: Spacing.xs,
  },
  stepSubtitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  stepDescription: {
    fontSize: Typography.fontSize.base,
    lineHeight: Typography.fontSize.base * Typography.lineHeight.relaxed,
    color: Colors.textSecondary,
    textAlign: 'center',
    maxWidth: 320,
  },
  footer: {
    gap: Spacing.sm,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  backButtonText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textMuted,
    fontWeight: Typography.fontWeight.medium,
  },
});
