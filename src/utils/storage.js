export const getEntries = () => {
  try {
    return JSON.parse(localStorage.getItem('kokoro_entries') || '[]');
  } catch {
    return [];
  }
};

export const saveEntry = (entry) => {
  const entries = getEntries();
  const todayStr = new Date().toDateString();
  const idx = entries.findIndex(e => new Date(e.date).toDateString() === todayStr);
  const newEntry = { ...entry, date: new Date().toISOString(), id: Date.now() };
  if (idx >= 0) entries[idx] = newEntry;
  else entries.push(newEntry);
  localStorage.setItem('kokoro_entries', JSON.stringify(entries));
  return newEntry;
};

export const getTodayEntry = () => {
  const todayStr = new Date().toDateString();
  return getEntries().find(e => new Date(e.date).toDateString() === todayStr) || null;
};

export const getSettings = () => {
  try {
    return JSON.parse(localStorage.getItem('kokoro_settings') || '{}');
  } catch {
    return {};
  }
};

export const saveSettings = (settings) => {
  localStorage.setItem('kokoro_settings', JSON.stringify(settings));
};

const DEFAULT_SETTINGS = {
  name: '',
  notificationTime: '21:00',
  notificationEnabled: false,
};

export const getSettingsWithDefaults = () => ({
  ...DEFAULT_SETTINGS,
  ...getSettings(),
});
