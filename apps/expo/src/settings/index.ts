import AsyncStorage from "@react-native-async-storage/async-storage";

import type { ThemeStoreOption } from "~/stores/theme";

interface ThemeSettings {
  theme: ThemeStoreOption;
}

interface Settings {
  themes: ThemeSettings;
}

const settingsKey = "settings";

const saveSettings = async (settings: Settings) => {
  await AsyncStorage.setItem(settingsKey, JSON.stringify(settings));
};

const loadSettings = async (): Promise<Settings | null> => {
  const json = await AsyncStorage.getItem(settingsKey);
  return json ? (JSON.parse(json) as Settings) : null;
};

export const getTheme = async (): Promise<ThemeStoreOption> => {
  const settings = await loadSettings();
  return settings?.themes?.theme ?? "main";
};

export const saveTheme = async (newTheme: ThemeStoreOption) => {
  const settings = (await loadSettings()) ?? { themes: { theme: newTheme } };
  settings.themes.theme = newTheme;
  await saveSettings(settings);
};
