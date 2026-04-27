import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FontSize, Spacing, BorderRadius, useThemeColors } from '../theme';
import { useGoalStore } from '../store/useGoalStore';

// Screens
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { GoalsListScreen } from '../screens/GoalsListScreen';
import { GoalAddWizard } from '../screens/GoalAddWizard';
import { GoalDetailScreen } from '../screens/GoalDetailScreen';
import { InsightsScreen } from '../screens/InsightsScreen';
import { CelebrationScreen } from '../screens/CelebrationScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const tabIcons: Record<string, { active: string; inactive: string }> = {
  Home: { active: '🏠', inactive: '🏠' },
  Goals: { active: '🎯', inactive: '🎯' },
  Insights: { active: '📊', inactive: '📊' },
  Settings: { active: '⚙️', inactive: '⚙️' },
};

function TabNavigator() {
  const Colors = useThemeColors();
  const styles = getStyles(Colors);
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: 80,
          paddingBottom: 20,
          paddingTop: 10,
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarIcon: ({ focused }) => {
          const icon = tabIcons[route.name];
          return (
            <View style={focused ? styles.activeTab : styles.inactiveTab}>
              <Text style={{ fontSize: 24, paddingBottom: 2 }}>
                {focused ? icon?.active : icon?.inactive}
              </Text>
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Goals" component={GoalsListScreen} />
      <Tab.Screen name="Insights" component={InsightsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export const AppNavigator: React.FC = () => {
  const Colors = useThemeColors();
  const hasOnboarded = useGoalStore((s) => s.settings.hasOnboarded);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.background },
          animation: 'slide_from_right',
        }}
      >
        {!hasOnboarded ? (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={TabNavigator} />
            <Stack.Screen
              name="GoalAddWizard"
              component={GoalAddWizard}
              options={{ animation: 'slide_from_bottom' }}
            />
            <Stack.Screen name="GoalDetail" component={GoalDetailScreen} />
            <Stack.Screen
              name="Celebration"
              component={CelebrationScreen}
              options={{ animation: 'fade' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const getStyles = (Colors: any) => StyleSheet.create({
  activeTab: {
    backgroundColor: Colors.primaryFaded,
    borderRadius: 20,
    width: 56,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  inactiveTab: {
    width: 56,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  }
});
