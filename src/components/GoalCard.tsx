import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

import { Colors, Spacing, FontSize, BorderRadius, Shadows, Categories , useThemeColors} from '../theme';
import { Goal } from '../types';

const { width } = Dimensions.get('window');

interface GoalCardProps {
  goal: Goal;
  onPress: () => void;
  index?: number;
}

export const GoalCard: React.FC<GoalCardProps> = ({ goal, onPress, index = 0 }) => {
  const Colors = useThemeColors();
  const styles = createStyles(Colors);

  const category = Categories.find((c) => c.id === goal.category);
  const totalSteps = goal.steps.length;
  const completedSteps = goal.steps.filter((s) => s.completed).length;
  const progress = totalSteps > 0 ? completedSteps / totalSteps : 0;

  const daysLeft = Math.max(
    0,
    Math.ceil((goal.targetDate - Date.now()) / (1000 * 60 * 60 * 24)),
  );

  return (
    <View >
      <TouchableOpacity
        style={styles.card}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {/* Category stripe */}
        <View
          style={[
            styles.categoryStripe,
            { backgroundColor: category?.color || Colors.primary },
          ]}
        />

        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.emoji}>{category?.emoji || '🎯'}</Text>
            <View style={styles.headerText}>
              <Text style={styles.title} numberOfLines={1}>
                {goal.title}
              </Text>
              <Text style={styles.category}>{category?.label || 'Goal'}</Text>
            </View>
            {goal.completed ? (
              <View style={styles.completedBadge}>
                <Text style={styles.completedText}>✓</Text>
              </View>
            ) : (
              <Text style={styles.daysLeft}>
                {daysLeft}d
              </Text>
            )}
          </View>

          {/* Progress bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBg}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${progress * 100}%`,
                    backgroundColor: goal.completed
                      ? Colors.success
                      : category?.color || Colors.primary,
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {completedSteps}/{totalSteps}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const createStyles = (Colors: any) => StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.md,
    overflow: 'hidden',
    ...Shadows.card,
  },
  categoryStripe: {
    width: 5,
  },
  content: {
    flex: 1,
    padding: Spacing.base,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  emoji: {
    fontSize: 28,
    marginRight: Spacing.md,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  category: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  daysLeft: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  completedBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: FontSize.md,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  progressBg: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.border,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontWeight: '600',
    minWidth: 30,
    textAlign: 'right',
  },
});
