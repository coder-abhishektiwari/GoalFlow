import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
const uuidv4 = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
import { zustandMMKVStorage } from './storage';
import { Goal, GoalStep, AppSettings, DailyActivity } from '../types';
import { CategoryId } from '../theme';

interface GoalStore {
  // State
  goals: Goal[];
  settings: AppSettings;
  dailyActivities: DailyActivity[];

  // Goal Actions
  addGoal: (data: {
    title: string;
    description: string;
    category: CategoryId;
    targetDate: number;
    stepTitles: string[];
  }) => string; // returns goal id
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;

  // Step Actions
  toggleStep: (goalId: string, stepId: string) => {
    completed: boolean;
    isGoalComplete: boolean;
  };
  addStep: (goalId: string, title: string) => void;
  removeStep: (goalId: string, stepId: string) => void;
  reorderSteps: (goalId: string, steps: GoalStep[]) => void;

  // Settings
  setOnboarded: () => void;
  updateSettings: (updates: Partial<AppSettings>) => void;

  // Computed helpers
  getActiveGoals: () => Goal[];
  getCompletedGoals: () => Goal[];
  getGoalById: (id: string) => Goal | undefined;
  getNextIncompleteStep: () => { goal: Goal; step: GoalStep } | null;
  getCompletionRate: () => number;
  getStreak: () => number;
  getCategoryStats: () => { category: CategoryId; count: number; completed: number }[];
  getWeeklyActivity: () => { day: string; count: number }[];
}

const getTodayString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const useGoalStore = create<GoalStore>()(
  persist(
    (set, get) => ({
      goals: [],
      settings: {
        hasOnboarded: false,
        notificationsEnabled: true,
        dailyReminderTime: '09:00',
      },
      dailyActivities: [],

      // ─── Goal CRUD ───────────────────────────────────────────
      addGoal: (data) => {
        const id = uuidv4();
        const now = Date.now();
        const newGoal: Goal = {
          id,
          title: data.title,
          description: data.description,
          category: data.category,
          targetDate: data.targetDate,
          steps: data.stepTitles.map((title) => ({
            id: uuidv4(),
            title,
            completed: false,
          })),
          createdAt: now,
          updatedAt: now,
          completed: false,
        };
        set((state) => ({ goals: [newGoal, ...state.goals] }));
        return id;
      },

      updateGoal: (id, updates) => {
        set((state) => ({
          goals: state.goals.map((g) =>
            g.id === id ? { ...g, ...updates, updatedAt: Date.now() } : g,
          ),
        }));
      },

      deleteGoal: (id) => {
        set((state) => ({
          goals: state.goals.filter((g) => g.id !== id),
        }));
      },

      // ─── Step Actions ────────────────────────────────────────
      toggleStep: (goalId, stepId) => {
        let stepCompleted = false;
        let isGoalComplete = false;

        set((state) => {
          const goals = state.goals.map((g) => {
            if (g.id !== goalId) return g;
            const steps = g.steps.map((s) => {
              if (s.id !== stepId) return s;
              stepCompleted = !s.completed;
              return {
                ...s,
                completed: stepCompleted,
                completedAt: stepCompleted ? Date.now() : undefined,
              };
            });
            const allDone = steps.every((s) => s.completed);
            isGoalComplete = allDone && steps.length > 0;
            return {
              ...g,
              steps,
              completed: allDone,
              completedAt: allDone ? Date.now() : undefined,
              updatedAt: Date.now(),
            };
          });

          // Track daily activity
          let dailyActivities = [...state.dailyActivities];
          if (stepCompleted) {
            const today = getTodayString();
            const existing = dailyActivities.find((a) => a.date === today);
            if (existing) {
              dailyActivities = dailyActivities.map((a) =>
                a.date === today
                  ? { ...a, stepsCompleted: a.stepsCompleted + 1 }
                  : a,
              );
            } else {
              dailyActivities.push({ date: today, stepsCompleted: 1 });
            }
          }

          return { goals, dailyActivities };
        });

        return { completed: stepCompleted, isGoalComplete };
      },

      addStep: (goalId, title) => {
        set((state) => ({
          goals: state.goals.map((g) =>
            g.id === goalId
              ? {
                  ...g,
                  steps: [
                    ...g.steps,
                    { id: uuidv4(), title, completed: false },
                  ],
                  completed: false,
                  completedAt: undefined,
                  updatedAt: Date.now(),
                }
              : g,
          ),
        }));
      },

      removeStep: (goalId, stepId) => {
        set((state) => ({
          goals: state.goals.map((g) => {
            if (g.id !== goalId) return g;
            const steps = g.steps.filter((s) => s.id !== stepId);
            const allDone = steps.every((s) => s.completed) && steps.length > 0;
            return {
              ...g,
              steps,
              completed: allDone,
              completedAt: allDone ? Date.now() : undefined,
              updatedAt: Date.now(),
            };
          }),
        }));
      },

      reorderSteps: (goalId, steps) => {
        set((state) => ({
          goals: state.goals.map((g) =>
            g.id === goalId ? { ...g, steps, updatedAt: Date.now() } : g,
          ),
        }));
      },

      // ─── Settings ────────────────────────────────────────────
      setOnboarded: () => {
        set((state) => ({
          settings: { ...state.settings, hasOnboarded: true },
        }));
      },

      updateSettings: (updates) => {
        set((state) => ({
          settings: { ...state.settings, ...updates },
        }));
      },

      // ─── Computed Helpers ────────────────────────────────────
      getActiveGoals: () => get().goals.filter((g) => !g.completed),
      getCompletedGoals: () => get().goals.filter((g) => g.completed),

      getGoalById: (id) => get().goals.find((g) => g.id === id),

      getNextIncompleteStep: () => {
        const activeGoals = get()
          .goals.filter((g) => !g.completed)
          .sort((a, b) => a.targetDate - b.targetDate);

        for (const goal of activeGoals) {
          const step = goal.steps.find((s) => !s.completed);
          if (step) return { goal, step };
        }
        return null;
      },

      getCompletionRate: () => {
        const { goals } = get();
        if (goals.length === 0) return 0;
        const totalSteps = goals.reduce((sum, g) => sum + g.steps.length, 0);
        if (totalSteps === 0) return 0;
        const completedSteps = goals.reduce(
          (sum, g) => sum + g.steps.filter((s) => s.completed).length,
          0,
        );
        return Math.round((completedSteps / totalSteps) * 100);
      },

      getStreak: () => {
        const { dailyActivities } = get();
        if (dailyActivities.length === 0) return 0;

        const sorted = [...dailyActivities].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        );

        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < 365; i++) {
          const checkDate = new Date(today);
          checkDate.setDate(checkDate.getDate() - i);
          const dateStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
          const found = sorted.find((a) => a.date === dateStr);
          if (found && found.stepsCompleted > 0) {
            streak++;
          } else if (i > 0) {
            // Allow today to be missing (day not over yet)
            break;
          }
        }
        return streak;
      },

      getCategoryStats: () => {
        const { goals } = get();
        const map = new Map<
          CategoryId,
          { count: number; completed: number }
        >();

        goals.forEach((g) => {
          const existing = map.get(g.category) || { count: 0, completed: 0 };
          existing.count++;
          if (g.completed) existing.completed++;
          map.set(g.category, existing);
        });

        return Array.from(map.entries()).map(([category, stats]) => ({
          category,
          ...stats,
        }));
      },

      getWeeklyActivity: () => {
        const { dailyActivities } = get();
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const result: { day: string; count: number }[] = [];
        const today = new Date();

        for (let i = 6; i >= 0; i--) {
          const d = new Date(today);
          d.setDate(d.getDate() - i);
          const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
          const activity = dailyActivities.find((a) => a.date === dateStr);
          result.push({
            day: days[d.getDay()],
            count: activity?.stepsCompleted || 0,
          });
        }
        return result;
      },
    }),
    {
      name: 'goalflow-store',
      storage: createJSONStorage(() => zustandMMKVStorage),
    },
  ),
);
