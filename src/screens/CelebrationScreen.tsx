import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from 'react-native';

import ConfettiCannon from 'react-native-confetti-cannon';
import { Colors, Spacing, FontSize, BorderRadius , useThemeColors} from '../theme';

const { width, height } = Dimensions.get('window');

interface CelebrationScreenProps {
  route: any;
  navigation: any;
}

export const CelebrationScreen: React.FC<CelebrationScreenProps> = ({
  route,
  navigation,
}) => {
  const Colors = useThemeColors();
  const styles = createStyles(Colors);

  const { goalTitle, stepTitle, isGoalComplete } = route.params;
  const confettiRef = useRef<any>(null);

  useEffect(() => {
    // Trigger confetti on mount
    setTimeout(() => {
      confettiRef.current?.start();
    }, 300);
  }, []);

  return (
    <View style={styles.container}>
      

      <ConfettiCannon
        ref={confettiRef}
        count={isGoalComplete ? 200 : 80}
        origin={{ x: width / 2, y: -20 }}
        fadeOut
        autoStart={false}
        explosionSpeed={350}
        fallSpeed={3000}
        colors={[
          Colors.primary,
          Colors.success,
          Colors.warning,
          '#FF6B6B',
          '#A78BFA',
          Colors.info,
        ]}
      />

      <View style={styles.content}>
        <View >
          <Text style={styles.emoji}>
            {isGoalComplete ? '🏆' : '🎉'}
          </Text>
        </View>

        <Text
          
          style={styles.title}
        >
          {isGoalComplete ? 'Goal Completed!' : 'Step Done!'}
        </Text>

        <Text
          
          style={styles.subtitle}
        >
          {isGoalComplete
            ? `You've completed all steps for`
            : 'You completed a step in'}
        </Text>

        <Text
          
          style={styles.goalName}
        >
          {goalTitle}
        </Text>

        {!isGoalComplete && (
          <View
            
            style={styles.stepBadge}
          >
            <Text style={styles.stepBadgeLabel}>Completed Step</Text>
            <Text style={styles.stepBadgeTitle}>{stepTitle}</Text>
          </View>
        )}

        <Text
          
          style={styles.motivation}
        >
          {isGoalComplete
            ? '🌟 Amazing achievement! You proved that consistency wins!'
            : '💪 Every step counts. Keep the momentum going!'}
        </Text>
      </View>

      <View
        
        style={styles.bottom}
      >
        <TouchableOpacity
          style={styles.continueBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Text style={styles.continueBtnText}>Continue →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const createStyles = (Colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxl,
  },
  emoji: {
    fontSize: 80,
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: FontSize.hero,
    fontWeight: '900',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  subtitle: {
    fontSize: FontSize.lg,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  goalName: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  stepBadge: {
    backgroundColor: Colors.successFaded,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.success + '30',
  },
  stepBadgeLabel: {
    fontSize: FontSize.xs,
    color: Colors.success,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  stepBadgeTitle: {
    fontSize: FontSize.md,
    color: Colors.text,
    fontWeight: '600',
  },
  motivation: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  bottom: {
    padding: Spacing.xl,
    paddingBottom: Spacing.xxxl,
  },
  continueBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.base,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  continueBtnText: {
    color: Colors.white,
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
});
