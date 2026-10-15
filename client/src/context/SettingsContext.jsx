import { createContext, useContext, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage.js';

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useLocalStorage('spendwise_settings', {
    name: 'User',
    currency: 'INR',
  });

  const value = useMemo(
    () => ({
      ...settings,
      update: (patch) => setSettings((s) => ({ ...s, ...patch })),
    }),
    [settings, setSettings]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export const useSettings = () => useContext(SettingsContext);
