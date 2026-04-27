import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from 'react-native';

import { useFocusEffect } from '@react-navigation/native';
import { Colors, Spacing, FontSize, BorderRadius, Shadows, Categories , useThemeColors} from '../theme';
import { useGoalStore } from '../store/useGoalStore';
import { CurrentStepCard } from '../components/CurrentStepCard';
import { GoalCard } from '../components/GoalCard';

const { width } = Dimensions.get('window');

interface HomeScreenProps {
  navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const Colors = useThemeColors();
  const styles = createStyles(Colors);

  const goals = useGoalStore((s) => s.goals);
  const getNextIncompleteStep = useGoalStore((s) => s.getNextIncompleteStep);
  const getCompletionRate = useGoalStore((s) => s.getCompletionRate);
  const getStreak = useGoalStore((s) => s.getStreak);
  const toggleStep = useGoalStore((s) => s.toggleStep);

  // Force re-render on focus
  const [, setTick] = React.useState(0);
  useFocusEffect(
    useCallback(() => {
      setTick((t) => t + 1);
    }, []),
  );

  const nextStep = getNextIncompleteStep();
  const completionRate = getCompletionRate();
  const streak = getStreak();
  const activeGoals = goals.filter((g) => !g.completed);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getDateString = () => {
    const d = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    };
    return d.toLocaleDateString('en-US', options);
  };

  const handleStepComplete = () => {
    if (!nextStep) return;
    const result = toggleStep(nextStep.goal.id, nextStep.step.id);
    if (result.completed) {
      navigation.navigate('Celebration', {
        goalTitle: nextStep.goal.title,
        stepTitle: nextStep.step.title,
        isGoalComplete: result.isGoalComplete,
      });
    }
  };

  return (
    <View style={styles.container}>
      
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View  style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()} 👋</Text>
            <Text style={styles.date}>{getDateString()}</Text>
          </View>
        </View>

        {/* Quick Stats */}
        <View  style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{activeGoals.length}</Text>
            <Text style={styles.statLabel}>Active Goals</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: Colors.success }]}>
              {completionRate}%
            </Text>
            <Text style={styles.statLabel}>Completion</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: Colors.warning }]}>
              {streak}
            </Text>
            <Text style={styles.statLabel}>Day Streak 🔥</Text>
          </View>
        </View>

        {/* Current Step Card */}
        {nextStep ? (
          <View style={styles.section}>
            <CurrentStepCard
              goal={nextStep.goal}
              step={nextStep.step}
              onPress={() =>
                navigation.navigate('GoalDetail', { goalId: nextStep.goal.id })
              }
              onComplete={handleStepComplete}
            />
          </View>
        ) : goals.length > 0 ? (
          <View  style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>🎉</Text>
            <Text style={styles.emptyTitle}>All Steps Done!</Text>
            <Text style={styles.emptySubtitle}>
              You've completed all your steps. Add a new goal to keep going!
            </Text>
          </View>
        ) : (
          <View  style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>🚀</Text>
            <Text style={styles.emptyTitle}>Start Your Journey</Text>
            <Text style={styles.emptySubtitle}>
              Create your first goal and break it into achievable steps.
            </Text>
            <TouchableOpacity
              style={styles.addGoalBtn}
              onPress={() => navigation.navigate('GoalAddWizard')}
              activeOpacity={0.8}
            >
              <Text style={styles.addGoalBtnText}>+ Create Goal</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Active Goals */}
        {activeGoals.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Active Goals</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('GoalsList')}
              >
                <Text style={styles.seeAll}>See All →</Text>
              </TouchableOpacity>
            </View>
            {activeGoals.slice(0, 3).map((goal, i) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                index={i}
                onPress={() =>
                  navigation.navigate('GoalDetail', { goalId: goal.id })
                }
              />
            ))}
          </View>
        )}

        {/* Bottom spacer for tab bar */}
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
  },
  header: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  greeting: {
    fontSize: FontSize.xxl,
    fontWeight: '900',
    color: Colors.text,
    marginBottom: 4,
  },
  date: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: Spacing.base,
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    ...Shadows.sm,
  },
  statValue: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
  },
  seeAll: {
    fontSize: FontSize.sm,
    color: Colors.primaryLight,
    fontWeight: '600',
  },
  emptyCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    marginHorizontal: Spacing.base,
    padding: Spacing.xxl,
    alignItems: 'center',
    marginBottom: Spacing.xl,
    ...Shadows.card,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: Spacing.base,
  },
  emptyTitle: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  addGoalBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xxl,
    borderRadius: BorderRadius.full,
  },
  addGoalBtnText: {
    color: Colors.white,
    fontSize: FontSize.md,
    fontWeight: '700',
  },
});
