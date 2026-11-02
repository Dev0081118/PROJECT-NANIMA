/**
 * Screen: Onboarding (Family Orientation & Dialect Setup)
 * Guides family members through understanding the AI recreation,
 * setting up their relationship, and understanding cultural & privacy safeguards.
 */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Typography, Spacing, BorderRadius } from '../../constants/Typography';

const STEPS = [
  {
    title: 'પ્રેમપૂર્વક યાદોનું પુનર્નિર્માણ',
    subtitle: 'A Respectful Cultural Keepsake',
    content:
      'Maa is crafted specifically around the warmth, cadence, and vocabulary of authentic Kathiyawadi Gujarati. It is designed to honour her memory, not replace her reality.',
    icon: '👵',
  },
  {
    title: 'ખાનગી અને સુરક્ષિત પારિવારિક જગ્યા',
    subtitle: 'Strict Privacy & Family Sovereignty',
    content:
      'All uploaded photographs, home audio recordings, and family stories remain strictly within your family vault. No public AI model training or data selling.',
    icon: '🔒',
  },
  {
    title: 'સત્યનિષ્ઠા અને મર્યાદા',
    subtitle: 'Transparent AI Safeguards',
    content:
      'The AI clearly acknowledges when a memory is uncertain rather than inventing details. It reflects her known personality and values with honesty.',
    icon: '🌿',
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.brand}>Maa — Digital Legacy</Text>
          <View style={styles.progressRow}>
            {STEPS.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.progressDot,
                  i === currentStep && styles.progressDotActive,
                  i < currentStep && styles.progressDotCompleted,
                ]}
              />
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.icon}>{step.icon}</Text>
          <Text style={styles.stepTitle}>{step.title}</Text>
          <Text style={styles.stepSubtitle}>{step.subtitle}</Text>
          <Text style={styles.stepDescription}>{step.content}</Text>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleNext}>
            <Text style={styles.primaryButtonText}>
              {currentStep === STEPS.length - 1 ? 'Enter Family Space' : 'Continue'}
            </Text>
          </TouchableOpacity>
          {currentStep > 0 && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setCurrentStep(s => s - 1)}
            >
              <Text style={styles.backButtonText}>← Previous</Text>
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
    padding: Spacing.lg,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  brand: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.primary,
  },
  progressRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginTop: Spacing.md,
  },
  progressDot: {
    width: 28,
    height: 4,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.border,
  },
  progressDotActive: {
    backgroundColor: Colors.primary,
    width: 36,
  },
  progressDotCompleted: {
    backgroundColor: Colors.primaryLight,
  },
  card: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  icon: {
    fontSize: 54,
    marginBottom: Spacing.md,
  },
  stepTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  stepSubtitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.secondary,
    textAlign: 'center',
    marginBottom: Spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  stepDescription: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: Typography.fontSize.base * Typography.lineHeight.relaxed,
  },
  footer: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: Colors.textOnPrimary,
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  backButton: {
    alignItems: 'center',
    padding: Spacing.xs,
  },
  backButtonText: {
    color: Colors.textMuted,
    fontSize: Typography.fontSize.sm,
  },
});
