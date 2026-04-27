import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  StatusBar,
} from 'react-native';

import { Colors, Spacing, FontSize, BorderRadius , useThemeColors} from '../theme';
import { useGoalStore } from '../store/useGoalStore';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    emoji: '🎯',
    title: 'Welcome to\nGoalFlow',
    subtitle:
      'Break down your goals into simple, achievable steps. One step at a time.',
    color: Colors.primary,
  },
  {
    emoji: '📋',
    title: 'Step by Step\nProgress',
    subtitle:
      'Create goals with clear milestones. Track your journey with beautiful progress visualizations.',
    color: '#2ECDA7',
  },
  {
    emoji: '🎉',
    title: 'Celebrate\nEvery Win',
    subtitle:
      'Get rewarded with celebrations for every step you complete. Small wins lead to big achievements.',
    color: '#FFD93D',
  },
];

interface OnboardingScreenProps {
  navigation: any;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  navigation,
}) => {
  const Colors = useThemeColors();
  const styles = createStyles(Colors);

  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const setOnboarded = useGoalStore((s) => s.setOnboarded);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      handleFinish();
    }
  };

  const handleSkip = () => {
    handleFinish();
  };

  const handleFinish = () => {
    setOnboarded();
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  }).current;

  const renderSlide = ({ item, index }: { item: typeof slides[0]; index: number }) => (
    <View style={[styles.slide, { width }]}>
      <View >
        <View style={[styles.emojiCircle, { backgroundColor: item.color + '20' }]}>
          <Text style={styles.emoji}>{item.emoji}</Text>
        </View>
      </View>
      <Text
        
        style={styles.title}
      >
        {item.title}
      </Text>
      <Text
        
        style={styles.subtitle}
      >
        {item.subtitle}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      

      {/* Skip button */}
      {currentIndex < slides.length - 1 && (
        <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}

      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        keyExtractor={(_, i) => i.toString()}
      />

      {/* Bottom section */}
      <View style={styles.bottom}>
        {/* Dots */}
        <View style={styles.dots}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === currentIndex && styles.dotActive,
              ]}
            />
          ))}
        </View>

        {/* Next / Get Started button */}
        <TouchableOpacity
          style={[
            styles.nextBtn,
            currentIndex === slides.length - 1 && styles.getStartedBtn,
          ]}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Text style={styles.nextBtnText}>
            {currentIndex === slides.length - 1 ? 'Get Started 🚀' : 'Next'}
          </Text>
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
  skipBtn: {
    position: 'absolute',
    top: 56,
    right: Spacing.xl,
    zIndex: 10,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.base,
  },
  skipText: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxl,
  },
  emojiCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xxl,
  },
  emoji: {
    fontSize: 56,
  },
  title: {
    fontSize: FontSize.hero,
    fontWeight: '900',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.base,
    lineHeight: 44,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  bottom: {
    paddingHorizontal: Spacing.xxl,
    paddingBottom: Spacing.xxxl,
    alignItems: 'center',
  },
  dots: {
    flexDirection: 'row',
    marginBottom: Spacing.xl,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  dotActive: {
    backgroundColor: Colors.primary,
    width: 24,
  },
  nextBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.xxxl,
    borderRadius: BorderRadius.full,
    width: '100%',
    alignItems: 'center',
  },
  getStartedBtn: {
    backgroundColor: Colors.success,
  },
  nextBtnText: {
    color: Colors.white,
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
});
