const STORAGE_KEY = 'forge_v1';
const DEFAULT_STATE = { users: {}, logs: {}, weights: {}, session: null, theme: 'light', accent: '#1e3a8a' };

export const readState = () => {
  try {
    const state = { ...DEFAULT_STATE, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') };
    for (const userLogs of Object.values(state.logs || {})) {
      for (const day of Object.values(userLogs || {})) {
        if (!day || typeof day !== 'object') continue;
        if (Array.isArray(day.waterEntries)) { delete day.water; continue; }
        const legacyGlasses = Number(day.water) || 0;
        day.waterEntries = Array.from({ length: Math.max(0, Math.min(legacyGlasses, 100)) }, (_, index) => ({
          id: `legacy-${index + 1}`,
          ml: 250,
        }));
        delete day.water;
      }
    }
    return state;
  } catch (error) {
    console.error('Unable to read FORGE data from local storage.', error);
    return DEFAULT_STATE;
  }
};

export const saveState = state => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (error) {
    console.error('Unable to save FORGE data to local storage.', error);
    return false;
  }
};
