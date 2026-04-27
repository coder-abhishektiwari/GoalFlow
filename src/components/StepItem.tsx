import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import { Colors, Spacing, FontSize, BorderRadius , useThemeColors} from '../theme';
import { GoalStep } from '../types';

interface StepItemProps {
  step: GoalStep;
  index: number;
  onToggle: () => void;
  onDelete?: () => void;
}

export const StepItem: React.FC<StepItemProps> = ({
  step,
  index,
  onToggle,
  onDelete,
}) => {
  const Colors = useThemeColors();
  const styles = createStyles(Colors);

  return (
    <View >
      <TouchableOpacity
        style={[styles.container, step.completed && styles.completedContainer]}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <View
          style={[styles.checkbox, step.completed && styles.checkedBox]}
        >
          {step.completed && <Text style={styles.checkmark}>✓</Text>}
        </View>

        <Text
          style={[styles.title, step.completed && styles.completedTitle]}
          numberOfLines={2}
        >
          {step.title}
        </Text>

        {onDelete && (
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={onDelete}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.deleteText}>×</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    </View>
  );
};

const createStyles = (Colors: any) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.base,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  completedContainer: {
    borderColor: Colors.successFaded,
    backgroundColor: 'rgba(46, 205, 167, 0.05)',
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: Colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  checkedBox: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  checkmark: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  title: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.text,
    fontWeight: '500',
  },
  completedTitle: {
    color: Colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  deleteBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.dangerFaded,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.sm,
  },
  deleteText: {
    color: Colors.danger,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 20,
  },
});
