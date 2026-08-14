const KEYS = {
  ACCESS_TOKEN: 'digilocal_access_token',
  REFRESH_TOKEN: 'digilocal_refresh_token',
  ADMIN_TOKEN: 'digilocal_admin_token',
  USER_ROLE: 'digilocal_user_role',
  USER_DATA: 'digilocal_user_data',
  THEME: 'digilocal_theme_preference',
};

export const storage = {
  getAccessToken: (): string | null => localStorage.getItem(KEYS.ACCESS_TOKEN),
  setAccessToken: (token: string) => localStorage.setItem(KEYS.ACCESS_TOKEN, token),

  getRefreshToken: (): string | null => localStorage.getItem(KEYS.REFRESH_TOKEN),
  setRefreshToken: (token: string) => localStorage.setItem(KEYS.REFRESH_TOKEN, token),

  getAdminToken: (): string | null => localStorage.getItem(KEYS.ADMIN_TOKEN),
  setAdminToken: (token: string) => localStorage.setItem(KEYS.ADMIN_TOKEN, token),

  getUserRole: (): string | null => localStorage.getItem(KEYS.USER_ROLE),
  setUserRole: (role: string) => localStorage.setItem(KEYS.USER_ROLE, role),

  getUserData: <T>(): T | null => {
    const raw = localStorage.getItem(KEYS.USER_DATA);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },
  setUserData: <T>(data: T) => localStorage.setItem(KEYS.USER_DATA, JSON.stringify(data)),

  getTheme: (): 'light' | 'dark' => (localStorage.getItem(KEYS.THEME) as 'light' | 'dark') || 'dark',
  setTheme: (theme: 'light' | 'dark') => localStorage.setItem(KEYS.THEME, theme),

  clearAuth: () => {
    localStorage.removeItem(KEYS.ACCESS_TOKEN);
    localStorage.removeItem(KEYS.REFRESH_TOKEN);
    localStorage.removeItem(KEYS.ADMIN_TOKEN);
    localStorage.removeItem(KEYS.USER_ROLE);
    localStorage.removeItem(KEYS.USER_DATA);
  },
};
