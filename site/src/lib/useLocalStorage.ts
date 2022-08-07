import { Dispatch, SetStateAction, useEffect, useState } from 'react';

export function getStorageValue<T>(key: string, defaultValue: T): T {
  // getting stored value
  if (typeof window === 'undefined') {
    return defaultValue;
  }

  const saved = localStorage.getItem(key);
  const initial = saved !== null ? JSON.parse(saved) : defaultValue;
  return initial;
}

export const useLocalStorage = <T>(
  key: string,
  defaultValue: T
): [T, Dispatch<SetStateAction<T>>] => {
  const [value, setValue] = useState<T>(() => {
    return getStorageValue(key, defaultValue);
  });

  useEffect(() => {
    // storing input name
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
};
