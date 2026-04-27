import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Alert,
} from 'react-native';

import {
  Colors,
  Spacing,
  FontSize,
  BorderRadius,
  Categories,
  CategoryId,
  useThemeColors
} from '../theme';
import { useGoalStore } from '../store/useGoalStore';
import { WizardData } from '../types';

interface GoalAddWizardProps {
  navigation: any;
}

const TOTAL_STEPS = 5;

export const GoalAddWizard: React.FC<GoalAddWizardProps> = ({ navigation }) => {
  const Colors = useThemeColors();
  const styles = createStyles(Colors);

  const addGoal = useGoalStore((s) => s.addGoal);
  const [currentStep, setCurrentStep] = useState(0);
  const [wizardData, setWizardData] = useState<WizardData>({
    title: '',
    description: '',
    category: '',
    targetDate: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days default
    steps: [''],
  });

  const [targetDays, setTargetDays] = useState('30');

  const canGoNext = () => {
    switch (currentStep) {
      case 0:
        return wizardData.title.trim().length > 0;
      case 1:
        return wizardData.category !== '';
      case 2:
        return parseInt(targetDays) > 0;
      case 3:
        return wizardData.steps.filter((s) => s.trim()).length > 0;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      navigation.goBack();
    }
  };

  const handleSubmit = () => {
    const filteredSteps = wizardData.steps.filter((s) => s.trim());
    if (filteredSteps.length === 0) {
      Alert.alert('Error', 'Please add at least one step');
      return;
    }

    addGoal({
      title: wizardData.title.trim(),
      description: wizardData.description.trim(),
      category: wizardData.category as CategoryId,
      targetDate: Date.now() + parseInt(targetDays) * 24 * 60 * 60 * 1000,
      stepTitles: filteredSteps,
    });

    navigation.goBack();
  };

  const addStepField = () => {
    setWizardData((prev) => ({ ...prev, steps: [...prev.steps, ''] }));
  };

  const removeStepField = (index: number) => {
    if (wizardData.steps.length <= 1) return;
    setWizardData((prev) => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index),
    }));
  };

  const updateStep = (index: number, value: string) => {
    setWizardData((prev) => ({
      ...prev,
      steps: prev.steps.map((s, i) => (i === index ? value : s)),
    }));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <View  key="step0">
            <Text style={styles.stepEmoji}>✏️</Text>
            <Text style={styles.stepTitle}>What's your goal?</Text>
            <Text style={styles.stepSubtitle}>
              Give your goal a clear, motivating title.
            </Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Learn Spanish"
              placeholderTextColor={Colors.textMuted}
              value={wizardData.title}
              onChangeText={(t) => setWizardData((p) => ({ ...p, title: t }))}
              autoFocus
              maxLength={100}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Add a description (optional)"
              placeholderTextColor={Colors.textMuted}
              value={wizardData.description}
              onChangeText={(t) =>
                setWizardData((p) => ({ ...p, description: t }))
              }
              multiline
              numberOfLines={3}
              maxLength={300}
            />
          </View>
        );

      case 1:
        return (
          <View  key="step1">
            <Text style={styles.stepEmoji}>📂</Text>
            <Text style={styles.stepTitle}>Pick a category</Text>
            <Text style={styles.stepSubtitle}>
              This helps organize your goals.
            </Text>
            <View style={styles.categoryGrid}>
              {Categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryCard,
                    wizardData.category === cat.id && {
                      borderColor: cat.color,
                      backgroundColor: cat.color + '15',
                    },
                  ]}
                  onPress={() =>
                    setWizardData((p) => ({ ...p, category: cat.id }))
                  }
                  activeOpacity={0.7}
                >
                  <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                  <Text
                    style={[
                      styles.categoryLabel,
                      wizardData.category === cat.id && { color: cat.color },
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 2:
        return (
          <View  key="step2">
            <Text style={styles.stepEmoji}>📅</Text>
            <Text style={styles.stepTitle}>Set a deadline</Text>
            <Text style={styles.stepSubtitle}>
              How many days do you want to achieve this?
            </Text>
            <View style={styles.daysInputRow}>
              <TextInput
                style={styles.daysInput}
                value={targetDays}
                onChangeText={setTargetDays}
                keyboardType="number-pad"
                maxLength={4}
              />
              <Text style={styles.daysLabel}>days from now</Text>
            </View>
            <View style={styles.quickDays}>
              {['7', '14', '30', '60', '90'].map((d) => (
                <TouchableOpacity
                  key={d}
                  style={[
                    styles.quickDayBtn,
                    targetDays === d && styles.quickDayBtnActive,
                  ]}
                  onPress={() => setTargetDays(d)}
                >
                  <Text
                    style={[
                      styles.quickDayText,
                      targetDays === d && styles.quickDayTextActive,
                    ]}
                  >
                    {d}d
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 3:
        return (
          <View  key="step3">
            <Text style={styles.stepEmoji}>📝</Text>
            <Text style={styles.stepTitle}>Break it into steps</Text>
            <Text style={styles.stepSubtitle}>
              Add the milestones to reach your goal.
            </Text>
            <ScrollView
              style={styles.stepsScroll}
              showsVerticalScrollIndicator={false}
            >
              {wizardData.steps.map((step, i) => (
                <View
                  key={i}
                  
                  style={styles.stepInputRow}
                >
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{i + 1}</Text>
                  </View>
                  <TextInput
                    style={styles.stepInput}
                    placeholder={`Step ${i + 1}`}
                    placeholderTextColor={Colors.textMuted}
                    value={step}
                    onChangeText={(t) => updateStep(i, t)}
                    maxLength={100}
                  />
                  {wizardData.steps.length > 1 && (
                    <TouchableOpacity
                      style={styles.removeStepBtn}
                      onPress={() => removeStepField(i)}
                    >
                      <Text style={styles.removeStepText}>×</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
              <TouchableOpacity
                style={styles.addStepBtn}
                onPress={addStepField}
              >
                <Text style={styles.addStepText}>+ Add Step</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        );

      case 4:
        return (
          <View  key="step4">
            <Text style={styles.stepEmoji}>✅</Text>
            <Text style={styles.stepTitle}>Review your goal</Text>
            <Text style={styles.stepSubtitle}>
              Everything looks good? Let's go!
            </Text>

            <View style={styles.reviewCard}>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Goal</Text>
                <Text style={styles.reviewValue}>{wizardData.title}</Text>
              </View>
              {wizardData.description ? (
                <View style={styles.reviewRow}>
                  <Text style={styles.reviewLabel}>Description</Text>
                  <Text style={styles.reviewValue} numberOfLines={2}>
                    {wizardData.description}
                  </Text>
                </View>
              ) : null}
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Category</Text>
                <Text style={styles.reviewValue}>
                  {Categories.find((c) => c.id === wizardData.category)?.emoji}{' '}
                  {Categories.find((c) => c.id === wizardData.category)?.label}
                </Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Deadline</Text>
                <Text style={styles.reviewValue}>{targetDays} days</Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Steps</Text>
                <Text style={styles.reviewValue}>
                  {wizardData.steps.filter((s) => s.trim()).length} steps
                </Text>
              </View>
              {wizardData.steps
                .filter((s) => s.trim())
                .map((s, i) => (
                  <Text key={i} style={styles.reviewStep}>
                    {i + 1}. {s}
                  </Text>
                ))}
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      

      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.topTitle}>
          Step {currentStep + 1} of {TOTAL_STEPS}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Progress dots */}
      <View style={styles.progressDots}>
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.progressDot,
              i < currentStep && styles.progressDotDone,
              i === currentStep && styles.progressDotActive,
            ]}
          />
        ))}
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {renderStepContent()}
      </ScrollView>

      {/* Bottom button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.nextBtn, !canGoNext() && styles.nextBtnDisabled]}
          onPress={handleNext}
          disabled={!canGoNext()}
          activeOpacity={0.8}
        >
          <Text style={styles.nextBtnText}>
            {currentStep === TOTAL_STEPS - 1 ? 'Create Goal 🚀' : 'Continue'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const createStyles = (Colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingTop: 56,
    paddingBottom: Spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    color: Colors.text,
    fontSize: 22,
    fontWeight: '600',
  },
  topTitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  progressDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: Spacing.md,
  },
  progressDot: {
    height: 4,
    flex: 1,
    maxWidth: 48,
    borderRadius: 2,
    backgroundColor: Colors.border,
  },
  progressDotDone: {
    backgroundColor: Colors.success,
  },
  progressDotActive: {
    backgroundColor: Colors.primary,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  stepEmoji: {
    fontSize: 48,
    marginBottom: Spacing.base,
  },
  stepTitle: {
    fontSize: FontSize.xxl,
    fontWeight: '900',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  stepSubtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.xxl,
    lineHeight: 22,
  },
  input: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md + 2,
    fontSize: FontSize.base,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  categoryCard: {
    width: '47%',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
  },
  categoryEmoji: {
    fontSize: 32,
    marginBottom: Spacing.sm,
  },
  categoryLabel: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.text,
  },
  daysInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  daysInput: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: Colors.primary,
    textAlign: 'center',
    minWidth: 100,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  daysLabel: {
    fontSize: FontSize.lg,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  quickDays: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  quickDayBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.card,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickDayBtnActive: {
    backgroundColor: Colors.primaryFaded,
    borderColor: Colors.primary,
  },
  quickDayText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  quickDayTextActive: {
    color: Colors.primary,
  },
  stepsScroll: {
    maxHeight: 350,
  },
  stepInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primaryFaded,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.primary,
  },
  stepInput: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  removeStepBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.dangerFaded,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeStepText: {
    color: Colors.danger,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 20,
  },
  addStepBtn: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.base,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  addStepText: {
    color: Colors.primary,
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  reviewCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  reviewRow: {
    marginBottom: Spacing.md,
  },
  reviewLabel: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  reviewValue: {
    fontSize: FontSize.md,
    color: Colors.text,
    fontWeight: '600',
  },
  reviewStep: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: 4,
    paddingLeft: Spacing.sm,
  },
  bottomBar: {
    padding: Spacing.base,
    paddingBottom: Spacing.xxl,
  },
  nextBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.base,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  nextBtnDisabled: {
    opacity: 0.4,
  },
  nextBtnText: {
    color: Colors.white,
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
});
