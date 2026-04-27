import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

import { Colors, Spacing, FontSize, BorderRadius, Shadows, Categories , useThemeColors} from '../theme';
import { Goal, GoalStep } from '../types';

const { width } = Dimensions.get('window');

interface CurrentStepCardProps {
  goal: Goal;
  step: GoalStep;
  onPress: () => void;
  onComplete: () => void;
}

export const CurrentStepCard: React.FC<CurrentStepCardProps> = ({
  goal,
  step,
  onPress,
  onComplete,
}) => {
  const Colors = useThemeColors();
  const styles = createStyles(Colors);

  const category = Categories.find((c) => c.id === goal.category);
  const completedSteps = goal.steps.filter((s) => s.completed).length;
  const totalSteps = goal.steps.length;
  const stepIndex = goal.steps.findIndex((s) => s.id === step.id);

  return (
    <View >
      <TouchableOpacity
        style={styles.card}
        onPress={onPress}
        activeOpacity={0.8}
      >
        {/* Gradient-like header */}
        <View style={[styles.header, { backgroundColor: category?.color || Colors.primary }]}>
          <View style={styles.headerTop}>
            <Text style={styles.headerLabel}>CURRENT STEP</Text>
            <Text style={styles.stepCount}>
              Step {stepIndex + 1} of {totalSteps}
            </Text>
          </View>
          <Text style={styles.goalTitle} numberOfLines={1}>
            {goal.title}
          </Text>
        </View>

        {/* Step content */}
        <View style={styles.body}>
          <View style={styles.stepRow}>
            <View style={styles.stepDot} />
            <Text style={styles.stepTitle} numberOfLines={2}>
              {step.title}
            </Text>
          </View>

          {/* Progress dots */}
          <View style={styles.dotsRow}>
            {goal.steps.map((s, i) => (
              <View
                key={s.id}
                style={[
                  styles.dot,
                  s.completed && styles.dotCompleted,
                  s.id === step.id && styles.dotActive,
                ]}
              />
            ))}
          </View>

          {/* Complete button */}
          <TouchableOpacity
            style={styles.completeBtn}
            onPress={onComplete}
            activeOpacity={0.8}
          >
            <Text style={styles.completeBtnText}>Mark Complete ✓</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const createStyles = (Colors: any) => StyleSheet.create({
  card: {
    marginHorizontal: Spacing.base,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    backgroundColor: Colors.card,
    ...Shadows.glow,
  },
  header: {
    padding: Spacing.lg,
    paddingBottom: Spacing.base,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  headerLabel: {
    fontSize: FontSize.xs,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 1.5,
  },
  stepCount: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
  },
  goalTitle: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: Colors.white,
  },
  body: {
    padding: Spacing.lg,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
    marginRight: Spacing.md,
  },
  stepTitle: {
    flex: 1,
    fontSize: FontSize.lg,
    color: Colors.text,
    fontWeight: '600',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: Spacing.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  dotCompleted: {
    backgroundColor: Colors.success,
  },
  dotActive: {
    backgroundColor: Colors.primary,
    width: 20,
    borderRadius: 4,
  },
  completeBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  completeBtnText: {
    color: Colors.white,
    fontSize: FontSize.md,
    fontWeight: '700',
  },
});
