import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
} from 'react-native';

import { useFocusEffect } from '@react-navigation/native';
import { Colors, Spacing, FontSize, BorderRadius, Shadows , useThemeColors} from '../theme';
import { useGoalStore } from '../store/useGoalStore';
import { GoalCard } from '../components/GoalCard';
import { Goal } from '../types';

type Filter = 'all' | 'active' | 'completed';

interface GoalsListScreenProps {
  navigation: any;
}

export const GoalsListScreen: React.FC<GoalsListScreenProps> = ({
  navigation,
}) => {
  const Colors = useThemeColors();
  const styles = createStyles(Colors);

  const goals = useGoalStore((s) => s.goals);
  const [filter, setFilter] = useState<Filter>('all');

  const [, setTick] = React.useState(0);
  useFocusEffect(
    useCallback(() => {
      setTick((t) => t + 1);
    }, []),
  );

  const filteredGoals = goals.filter((g) => {
    if (filter === 'active') return !g.completed;
    if (filter === 'completed') return g.completed;
    return true;
  });

  const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'completed', label: 'Done' },
  ];

  return (
    <View style={styles.container}>
      

      <View style={styles.header}>
        <Text style={styles.title}>My Goals</Text>
        <Text style={styles.count}>{goals.length} total</Text>
      </View>

      {/* Filter tabs */}
      <View style={styles.filterRow}>
        {filters.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterBtn, filter === f.key && styles.filterBtnActive]}
            onPress={() => setFilter(f.key)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.filterText,
                filter === f.key && styles.filterTextActive,
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filteredGoals.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>
            {filter === 'completed' ? '🏆' : '🎯'}
          </Text>
          <Text style={styles.emptyTitle}>
            {filter === 'completed'
              ? 'No completed goals yet'
              : 'No goals yet'}
          </Text>
          <Text style={styles.emptySubtitle}>
            {filter === 'completed'
              ? 'Keep working on your goals!'
              : 'Tap + to create your first goal'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredGoals}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <GoalCard
              goal={item}
              index={index}
              onPress={() =>
                navigation.navigate('GoalDetail', { goalId: item.id })
              }
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('GoalAddWizard')}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const createStyles = (Colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingTop: 56,
    paddingBottom: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '900',
    color: Colors.text,
  },
  count: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  filterRow: {
    flexDirection: 'row',
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.lg,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.full,
    padding: 4,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
  },
  filterBtnActive: {
    backgroundColor: Colors.primary,
  },
  filterText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  filterTextActive: {
    color: Colors.white,
  },
  list: {
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxl,
  },
  emptyEmoji: {
    fontSize: 56,
    marginBottom: Spacing.base,
  },
  emptyTitle: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 100,
    right: Spacing.xl,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.glow,
  },
  fabText: {
    color: Colors.white,
    fontSize: 32,
    fontWeight: '400',
    lineHeight: 34,
  },
});
