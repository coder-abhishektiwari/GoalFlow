import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  TextInput,
} from 'react-native';

import {
  Colors,
  Spacing,
  FontSize,
  BorderRadius,
  Shadows,
  Categories,
  useThemeColors
} from '../theme';
import { useGoalStore } from '../store/useGoalStore';
import { ProgressRing } from '../components/ProgressRing';
import { StepItem } from '../components/StepItem';

interface GoalDetailScreenProps {
  route: any;
  navigation: any;
}

export const GoalDetailScreen: React.FC<GoalDetailScreenProps> = ({
  route,
  navigation,
}) => {
  const Colors = useThemeColors();
  const styles = createStyles(Colors);

  const { goalId } = route.params;
  const goal = useGoalStore((s) => s.getGoalById(goalId));
  const toggleStep = useGoalStore((s) => s.toggleStep);
  const deleteGoal = useGoalStore((s) => s.deleteGoal);
  const addStep = useGoalStore((s) => s.addStep);
  const removeStep = useGoalStore((s) => s.removeStep);

  const [newStepTitle, setNewStepTitle] = useState('');
  const [showAddStep, setShowAddStep] = useState(false);

  if (!goal) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Goal not found</Text>
      </View>
    );
  }

  const category = Categories.find((c) => c.id === goal.category);
  const totalSteps = goal.steps.length;
  const completedSteps = goal.steps.filter((s) => s.completed).length;
  const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  const daysLeft = Math.max(
    0,
    Math.ceil((goal.targetDate - Date.now()) / (1000 * 60 * 60 * 24)),
  );

  const handleToggleStep = (stepId: string) => {
    const result = toggleStep(goalId, stepId);
    const stepTitle = goal.steps.find((s) => s.id === stepId)?.title || '';
    if (result.completed) {
      navigation.navigate('Celebration', {
        goalTitle: goal.title,
        stepTitle,
        isGoalComplete: result.isGoalComplete,
      });
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Goal', `Are you sure you want to delete "${goal.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteGoal(goalId);
          navigation.goBack();
        },
      },
    ]);
  };

  const handleAddStep = () => {
    if (newStepTitle.trim()) {
      addStep(goalId, newStepTitle.trim());
      setNewStepTitle('');
      setShowAddStep(false);
    }
  };

  return (
    <View style={styles.container}>
      

      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.topTitle}>Goal Details</Text>
        <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
          <Text style={styles.deleteText}>🗑️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero section */}
        <View  style={styles.heroSection}>
          <ProgressRing
            progress={progress}
            size={140}
            strokeWidth={12}
            color={goal.completed ? Colors.success : (category?.color || Colors.primary)}
          >
            <Text style={styles.progressPercent}>{progress}%</Text>
          </ProgressRing>

          <View style={styles.heroInfo}>
            <Text style={styles.goalEmoji}>{category?.emoji || '🎯'}</Text>
            <Text style={styles.goalTitle}>{goal.title}</Text>
            {goal.description ? (
              <Text style={styles.goalDescription}>{goal.description}</Text>
            ) : null}
          </View>
        </View>

        {/* Stats row */}
        <View  style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{completedSteps}/{totalSteps}</Text>
            <Text style={styles.statLabel}>Steps Done</Text>
          </View>
          <View style={[styles.statDivider]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, daysLeft < 7 ? { color: Colors.danger } : {}]}>
              {daysLeft}
            </Text>
            <Text style={styles.statLabel}>Days Left</Text>
          </View>
          <View style={[styles.statDivider]} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{category?.label}</Text>
            <Text style={styles.statLabel}>Category</Text>
          </View>
        </View>

        {/* Completed badge */}
        {goal.completed && (
          <View  style={styles.completedBanner}>
            <Text style={styles.completedBannerText}>🎉 Goal Completed!</Text>
          </View>
        )}

        {/* Steps section */}
        <View style={styles.stepsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Steps</Text>
            <TouchableOpacity
              onPress={() => setShowAddStep(!showAddStep)}
              style={styles.addStepToggle}
            >
              <Text style={styles.addStepToggleText}>
                {showAddStep ? '✕' : '+ Add'}
              </Text>
            </TouchableOpacity>
          </View>

          {showAddStep && (
            <View  style={styles.addStepRow}>
              <TextInput
                style={styles.addStepInput}
                placeholder="New step title..."
                placeholderTextColor={Colors.textMuted}
                value={newStepTitle}
                onChangeText={setNewStepTitle}
                autoFocus
                onSubmitEditing={handleAddStep}
              />
              <TouchableOpacity
                style={styles.addStepConfirmBtn}
                onPress={handleAddStep}
              >
                <Text style={styles.addStepConfirmText}>✓</Text>
              </TouchableOpacity>
            </View>
          )}

          {goal.steps.map((step, i) => (
            <StepItem
              key={step.id}
              step={step}
              index={i}
              onToggle={() => handleToggleStep(step.id)}
              onDelete={() => removeStep(goalId, step.id)}
            />
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
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
    fontSize: FontSize.lg,
    color: Colors.text,
    fontWeight: '700',
  },
  deleteBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.dangerFaded,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteText: {
    fontSize: 18,
  },
  errorText: {
    color: Colors.danger,
    fontSize: FontSize.lg,
    textAlign: 'center',
    marginTop: 100,
  },
  scrollContent: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  progressPercent: {
    fontSize: FontSize.xxl,
    fontWeight: '900',
    color: Colors.text,
  },
  heroInfo: {
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  goalEmoji: {
    fontSize: 36,
    marginBottom: Spacing.sm,
  },
  goalTitle: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  goalDescription: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    ...Shadows.sm,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
  },
  statValue: {
    fontSize: FontSize.lg,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  completedBanner: {
    backgroundColor: Colors.successFaded,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.success + '30',
  },
  completedBannerText: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.success,
  },
  stepsSection: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
  },
  addStepToggle: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primaryFaded,
  },
  addStepToggleText: {
    color: Colors.primary,
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  addStepRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  addStepInput: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  addStepConfirmBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addStepConfirmText: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: '700',
  },
});
