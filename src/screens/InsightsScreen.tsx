import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  Dimensions,
} from 'react-native';

import { useFocusEffect } from '@react-navigation/native';
import { Colors, Spacing, FontSize, BorderRadius, Shadows, Categories , useThemeColors} from '../theme';
import { useGoalStore } from '../store/useGoalStore';

const { width } = Dimensions.get('window');

interface InsightsScreenProps {
  navigation: any;
}

export const InsightsScreen: React.FC<InsightsScreenProps> = ({ navigation }) => {
  const Colors = useThemeColors();
  const styles = createStyles(Colors);

  const goals = useGoalStore((s) => s.goals);
  const getCompletionRate = useGoalStore((s) => s.getCompletionRate);
  const getStreak = useGoalStore((s) => s.getStreak);
  const getCategoryStats = useGoalStore((s) => s.getCategoryStats);
  const getWeeklyActivity = useGoalStore((s) => s.getWeeklyActivity);

  const [, setTick] = React.useState(0);
  useFocusEffect(
    useCallback(() => {
      setTick((t) => t + 1);
    }, []),
  );

  const completionRate = getCompletionRate();
  const streak = getStreak();
  const categoryStats = getCategoryStats();
  const weeklyActivity = getWeeklyActivity();
  const maxActivity = Math.max(...weeklyActivity.map((w) => w.count), 1);

  const totalGoals = goals.length;
  const completedGoals = goals.filter((g) => g.completed).length;
  const totalSteps = goals.reduce((sum, g) => sum + g.steps.length, 0);
  const completedSteps = goals.reduce(
    (sum, g) => sum + g.steps.filter((s) => s.completed).length,
    0,
  );

  return (
    <View style={styles.container}>
      
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.screenTitle}>Insights</Text>
        <Text style={styles.screenSubtitle}>Your progress at a glance</Text>

        {/* Overview Cards */}
        <View  style={styles.overviewRow}>
          <View style={[styles.overviewCard, { borderLeftColor: Colors.primary }]}>
            <Text style={styles.overviewValue}>{totalGoals}</Text>
            <Text style={styles.overviewLabel}>Total Goals</Text>
          </View>
          <View style={[styles.overviewCard, { borderLeftColor: Colors.success }]}>
            <Text style={[styles.overviewValue, { color: Colors.success }]}>{completedGoals}</Text>
            <Text style={styles.overviewLabel}>Completed</Text>
          </View>
        </View>

        <View  style={styles.overviewRow}>
          <View style={[styles.overviewCard, { borderLeftColor: Colors.info }]}>
            <Text style={[styles.overviewValue, { color: Colors.info }]}>{totalSteps}</Text>
            <Text style={styles.overviewLabel}>Total Steps</Text>
          </View>
          <View style={[styles.overviewCard, { borderLeftColor: Colors.warning }]}>
            <Text style={[styles.overviewValue, { color: Colors.warning }]}>{completedSteps}</Text>
            <Text style={styles.overviewLabel}>Steps Done</Text>
          </View>
        </View>

        {/* Completion Gauge */}
        <View  style={styles.card}>
          <Text style={styles.cardTitle}>Overall Completion</Text>
          <View style={styles.gaugeContainer}>
            <View style={styles.gaugeTrack}>
              <View
                style={[
                  styles.gaugeFill,
                  {
                    width: `${completionRate}%`,
                    backgroundColor:
                      completionRate > 70
                        ? Colors.success
                        : completionRate > 40
                          ? Colors.warning
                          : Colors.primary,
                  },
                ]}
              />
            </View>
            <Text style={styles.gaugePercent}>{completionRate}%</Text>
          </View>
        </View>

        {/* Streak */}
        <View  style={styles.streakCard}>
          <Text style={styles.streakEmoji}>🔥</Text>
          <View>
            <Text style={styles.streakValue}>{streak} Day Streak</Text>
            <Text style={styles.streakLabel}>
              {streak > 0
                ? 'Keep the momentum going!'
                : 'Complete a step to start your streak'}
            </Text>
          </View>
        </View>

        {/* Weekly Activity */}
        <View  style={styles.card}>
          <Text style={styles.cardTitle}>This Week</Text>
          <View style={styles.weekChart}>
            {weeklyActivity.map((w, i) => (
              <View key={i} style={styles.weekBar}>
                <View style={styles.barContainer}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: `${(w.count / maxActivity) * 100}%`,
                        backgroundColor:
                          w.count > 0 ? Colors.primary : Colors.border,
                        minHeight: 4,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.barLabel}>{w.day}</Text>
                <Text style={styles.barValue}>{w.count}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Category Breakdown */}
        {categoryStats.length > 0 && (
          <View  style={styles.card}>
            <Text style={styles.cardTitle}>By Category</Text>
            {categoryStats.map((stat, i) => {
              const cat = Categories.find((c) => c.id === stat.category);
              const pct = stat.count > 0 ? Math.round((stat.completed / stat.count) * 100) : 0;
              return (
                <View key={stat.category} style={styles.categoryRow}>
                  <Text style={styles.categoryEmoji}>{cat?.emoji}</Text>
                  <View style={styles.categoryInfo}>
                    <View style={styles.categoryHeader}>
                      <Text style={styles.categoryName}>{cat?.label}</Text>
                      <Text style={styles.categoryCount}>
                        {stat.completed}/{stat.count}
                      </Text>
                    </View>
                    <View style={styles.categoryBar}>
                      <View
                        style={[
                          styles.categoryBarFill,
                          {
                            width: `${pct}%`,
                            backgroundColor: cat?.color || Colors.primary,
                          },
                        ]}
                      />
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}

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
  scrollContent: {
    paddingTop: 56,
    paddingHorizontal: Spacing.base,
  },
  screenTitle: {
    fontSize: FontSize.xxl,
    fontWeight: '900',
    color: Colors.text,
    paddingHorizontal: Spacing.sm,
  },
  screenSubtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  overviewRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  overviewCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderLeftWidth: 4,
    ...Shadows.sm,
  },
  overviewValue: {
    fontSize: FontSize.xxl,
    fontWeight: '900',
    color: Colors.primary,
    marginBottom: 2,
  },
  overviewLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  cardTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  gaugeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  gaugeTrack: {
    flex: 1,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.border,
    overflow: 'hidden',
  },
  gaugeFill: {
    height: '100%',
    borderRadius: 6,
  },
  gaugePercent: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: Colors.text,
    minWidth: 55,
    textAlign: 'right',
  },
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    gap: Spacing.base,
    ...Shadows.sm,
  },
  streakEmoji: {
    fontSize: 40,
  },
  streakValue: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: Colors.warning,
    marginBottom: 2,
  },
  streakLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  weekChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    gap: Spacing.sm,
  },
  weekBar: {
    flex: 1,
    alignItems: 'center',
  },
  barContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  bar: {
    width: '70%',
    borderRadius: 4,
    minHeight: 4,
  },
  barLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  barValue: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  categoryEmoji: {
    fontSize: 24,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  categoryName: {
    fontSize: FontSize.md,
    color: Colors.text,
    fontWeight: '600',
  },
  categoryCount: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  categoryBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.border,
    overflow: 'hidden',
  },
  categoryBarFill: {
    height: '100%',
    borderRadius: 3,
  },
});
