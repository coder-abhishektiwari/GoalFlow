import { CategoryId } from '../theme';

export interface GoalStep {
  id: string;
  title: string;
  completed: boolean;
  completedAt?: number; // timestamp
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  category: CategoryId;
  targetDate: number; // timestamp
  steps: GoalStep[];
  createdAt: number;
  updatedAt: number;
  completed: boolean;
  completedAt?: number;
}

export interface WizardData {
  title: string;
  description: string;
  category: CategoryId | '';
  targetDate: number;
  steps: string[]; // step titles during creation
}

export interface DailyActivity {
  date: string; // YYYY-MM-DD
  stepsCompleted: number;
}

export interface AppSettings {
  hasOnboarded: boolean;
  notificationsEnabled: boolean;
  dailyReminderTime: string; // HH:mm
}
