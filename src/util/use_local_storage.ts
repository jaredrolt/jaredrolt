import { Dispatch, SetStateAction, useEffect, useState } from "react";

export const useLocalStorage = <T>(key: string, defaultValue: T): [T, Dispatch<SetStateAction<T>>] => {
  const [state, setState] = useState<T>(defaultValue);

  useEffect(() => {
    try {
      const serializedState = window.localStorage.getItem(key);
      serializedState && setState(JSON.parse(serializedState));
    } catch {
      console.error(`Failed to hydrate local storage state for: ${key}`);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [state]);

  return [state, setState];
};
