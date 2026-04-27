import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Colors , useThemeColors} from '../theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ProgressRingProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  bgColor?: string;
  children?: React.ReactNode;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = 120,
  strokeWidth = 10,
  color,
  bgColor,
  children,
}) => {
  const Colors = useThemeColors();
  const styles = createStyles(Colors);
  const resolvedColor = color || Colors.primary;
  const resolvedBgColor = bgColor || Colors.card;

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const animatedValue = useRef(new Animated.Value(circumference)).current;

  useEffect(() => {
    const prog = Math.min(Math.max(progress, 0), 100);
    const target = circumference - (circumference * prog) / 100;
    
    Animated.timing(animatedValue, {
      toValue: target,
      duration: 800,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      useNativeDriver: true,
    }).start();
  }, [progress, circumference, animatedValue]);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={resolvedBgColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={resolvedColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={animatedValue}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      {children && <View style={styles.childContainer}>{children}</View>}
    </View>
  );
};

const createStyles = (Colors: any) => StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  childContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
