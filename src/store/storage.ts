import { createMMKV } from 'react-native-mmkv';
import { StateStorage } from 'zustand/middleware';

export const mmkvStorage = createMMKV({
  id: 'goalflow-storage',
});

/**
 * Zustand-compatible MMKV storage adapter
 * 10x faster than AsyncStorage
 */
export const zustandMMKVStorage: StateStorage = {
  getItem: (name: string) => {
    const value = mmkvStorage.getString(name);
    return value ?? null;
  },
  setItem: (name: string, value: string) => {
    mmkvStorage.set(name, value);
  },
  removeItem: (name: string) => {
    mmkvStorage.remove(name);
  },
};
